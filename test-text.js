const prompt = "Respond with a JSON object containing the keys 'title' and 'score'";
fetch('https://text.pollinations.ai/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: "system", content: "You are a JSON generating API. Respond ONLY with raw JSON. No markdown." },
      { role: "user", content: prompt }
    ],
    jsonMode: true
  })
}).then(r=>r.text()).then(console.log).catch(console.error);
