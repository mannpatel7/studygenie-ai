import fetch from "node-fetch";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3-8b-instruct";

export const generateSummary = async (text) => {
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
          role: "user",
          content: `Summarize this in bullet points:\n${text.slice(0, 3000)}`,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!data.choices) {
    console.log(data);
    throw new Error("AI failed");
  }

  return data.choices[0].message.content;
};

export const generateFlashcards = async (text) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "user",
          content: `Create flashcards (question-answer pairs) from this text:\n${text.slice(0, 3000)}\n\nFormat:
Q: question
A: answer`,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!data.choices) {
    console.log(data);
    throw new Error("Flashcard generation failed");
  }

  return data.choices[0].message.content;
};

export const generateQuiz = async (text) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "user",
          content: `
Convert the following text into a quiz.

Return ONLY valid JSON. No explanation.

Format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correct": 0
  }
]

Rules:
- 10 questions
- 4 options each
- correct = index (0-3)
- Do NOT add any extra text

Text:
${text.slice(0, 3000)}
          `,
        },
      ],
    }),
  });

  const data = await response.json();

  return data.choices[0].message.content;
};