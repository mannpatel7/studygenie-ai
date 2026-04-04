import fetch from "node-fetch";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3-8b-instruct";

export const generateChatResponse = async (message, context = null) => {
  let systemPrompt = `You are a friendly and helpful study tutor. Your role is to:
- Explain concepts clearly and simply
- Use examples when helpful
- Be encouraging and patient
- Provide study tips and strategies
- Help students understand difficult topics`;

  let userMessage = message;

  // If context is provided, modify the system prompt to use only that context
  if (context) {
    // Limit context size to 3000 characters
    const limitedContext = context.slice(0, 3000);
    systemPrompt += `\n\nIMPORTANT: You will be provided with reference text/material. Answer ONLY based on this provided text. If the answer cannot be found in the provided text, respond with: "Not found in provided document"\n\nProvided Material:\n${limitedContext}`;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("API Response Error:", data);
      throw new Error("Failed to generate chat response");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Chat Service Error:", error);
    throw error;
  }
};
