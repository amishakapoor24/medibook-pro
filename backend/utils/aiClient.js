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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS) || 30000);

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 2500,
        messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`AI provider returned ${response.status}:`, responseText.slice(0, 300));
      if (response.status === 429) {
        throw new AIError("The AI is busy right now. Please try again in a minute.", 429);
      }
      if ([400, 401, 403, 404].includes(response.status)) {
        throw new AIError("The AI service is not set up correctly.", 502);
      }
      throw new AIError("The AI service is temporarily unavailable.", 502);
    }

    const data = await response.json().catch(() => null);
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string") throw new AIError("The AI did not return an answer. Please try again.", 502);
    return text;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AIError("The AI took too long to answer. Please try again.", 504);
    }
    if (error instanceof AIError) throw error;
    throw new AIError("The AI service is temporarily unavailable.", 502);
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { askAI, AIError };