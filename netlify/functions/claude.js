exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
  }

  try {
    const body = JSON.parse(event.body);

    // Groq uses OpenAI-compatible API — system prompt goes in messages array
    const messages = [
      { role: "system", content: body.system },
      ...body.messages
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        temperature: 0.7,
        messages
      })
    });

    const data = await response.json();

    // Normalize Groq response to match the shape the frontend expects
    // Frontend reads: data.content[0].text
    const text = data.choices?.[0]?.message?.content || "";
    const normalized = {
      content: [{ type: "text", text }]
    };

    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
