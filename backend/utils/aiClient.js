class AIError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "AIError";
    this.statusCode = statusCode;
  }
}

const askAI = async ({ system, prompt }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new AIError("AI service is not configured.", 503);

  const isGroqKey = apiKey.startsWith("gsk_");
  const baseUrl = process.env.OPENAI_BASE_URL || (isGroqKey ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions");
  const model = process.env.OPENAI_MODEL || (isGroqKey ? "llama-3.1-8b-instant" : "gpt-4o-mini");

  let response;
  try {
    response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      }),
    });
  } catch {
    throw new AIError("The AI service is temporarily unavailable.", 502);
  }

  if (!response.ok) {
    throw new AIError("The AI service is temporarily unavailable.", 502);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new AIError("The AI did not return an answer. Please try again.", 502);
  return text;
};

module.exports = { askAI, AIError };