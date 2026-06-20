const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY");
}
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    const models = data.models
      .filter(m => m.supportedGenerationMethods.includes('generateContent'))
      .map(m => m.name);
    console.log("Supported Models:", models.join(', '));
  })
  .catch(console.error);
