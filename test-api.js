const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY");
}
fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    instances: [{ prompt: "A cat" }],
    parameters: { sampleCount: 1 }
  })
}).then(async r => {
  console.log("Status:", r.status);
  const text = await r.text();
  console.log("Text:", text);
}).catch(console.error);
