import DOMPurify from "dompurify";

export interface CleanerOptions {
  preserveClasses: boolean;
}

export function cleanHtml(rawHtml: string, options: CleanerOptions): string {
  if (typeof window === "undefined") {
    return rawHtml; // SSR fallback
  }

  // 1. Initial purification with DOMPurify
  // This removes scripts, styles, forms, iframes, etc.
  const purified = DOMPurify.sanitize(rawHtml, {
    FORBID_TAGS: ['style', 'script', 'iframe', 'noscript', 'svg', 'canvas', 'form', 'button', 'input'],
    FORBID_ATTR: options.preserveClasses ? ['style', 'id', 'on*'] : ['style', 'id', 'class', 'on*'],
    ALLOW_DATA_ATTR: false, // removes data-*
  });

  // 2. Parse into a DOM tree for structural manipulation
  const parser = new DOMParser();
  const doc = parser.parseFromString(purified, "text/html");
  const body = doc.body;

  // 3. Remove comments
  const removeComments = (node: Node) => {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];
      if (child.nodeType === Node.COMMENT_NODE) {
        node.removeChild(child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        removeComments(child);
      }
    }
  };
  removeComments(body);

  // 4. Remove Aria and Role attributes, and specific junk classes if preserveClasses is true but we still want to clean WP/Elementor
  const elements = body.querySelectorAll("*");
  elements.forEach((el) => {
    // Remove aria-* and role
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith("aria-") || attr.name === "role") {
        el.removeAttribute(attr.name);
      }
    });

    if (options.preserveClasses) {
      // Remove specific WordPress and Elementor classes even if preserveClasses is on
      const classNames = el.className.split(" ");
      const cleanedClasses = classNames.filter(
        (c) =>
          !c.startsWith("wp-block-") &&
          !c.startsWith("elementor-") &&
          !c.startsWith("e-con-") &&
          !["alignwide", "alignfull", "has-background", "has-text-color"].includes(c)
      );
      if (cleanedClasses.length > 0) {
        el.className = cleanedClasses.join(" ");
      } else {
        el.removeAttribute("class");
      }
    }
  });

  // 5. Remove empty elements (p, div, span)
  const emptyTags = ["p", "div", "span"];
  let removedEmpty = true;
  while (removedEmpty) {
    removedEmpty = false;
    const allElements = body.querySelectorAll(emptyTags.join(","));
    allElements.forEach((el) => {
      if (el.innerHTML.trim() === "" && !el.querySelector("img")) {
        el.remove();
        removedEmpty = true;
      }
    });
  }

  // 6. Fix structure: Ensure only one H1, normalize others
  const h1s = body.querySelectorAll("h1");
  if (h1s.length > 1) {
    for (let i = 1; i < h1s.length; i++) {
      const h2 = doc.createElement("h2");
      h2.innerHTML = h1s[i].innerHTML;
      h1s[i].parentNode?.replaceChild(h2, h1s[i]);
    }
  }

  // 7. Add missing alt tags to images
  const images = body.querySelectorAll("img");
  images.forEach((img) => {
    if (!img.getAttribute("alt") || img.getAttribute("alt")?.trim() === "") {
      img.setAttribute("alt", "Feature image placeholder");
    }
  });

  return body.innerHTML;
}
