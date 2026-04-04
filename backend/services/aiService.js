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
          role: "system",
          content: `You are an expert educational summarizer. Create clear, concise summaries that help students understand and retain information. Follow these guidelines:
- Focus on the most important concepts and key takeaways
- Use simple, clear language accessible to students
- Highlight definitions of new terms
- Show relationships between concepts
- Organize information logically
- Be concise but comprehensive`,
        },
        {
          role: "user",
          content: `Summarize the following text for a student studying this topic. Provide:
1. Main concepts (2-3 bullet points maximum)
2. Key definitions (if any technical terms)
3. Key relationships or cause-effect
4. Practical applications (if relevant)

Keep it concise and focused on what students need to know.

Text to summarize:
${text.slice(0, 3000)}`,
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

export const generateStudyPlan = async (syllabusText, examDate, hoursPerDay) => {
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
          content: `You are an expert study planner for students preparing for exams. Create clear, actionable 7-day study plans with focused daily tasks and consistent daily study hours.`,
        },
        {
          role: "user",
          content: `Use the following syllabus content to make a practical 7-day study plan for an upcoming exam on ${examDate}. The student can study ${hoursPerDay} hours per day. Return ONLY valid JSON with this structure:
{
  "plan": [
    {
      "day": "Monday",
      "tasks": ["task 1", "task 2"],
      "hours": 3
    }
  ]
}
Use Monday through Sunday for the day names. Do not add any markdown, explanation, or extra text.

Syllabus content:
${syllabusText.slice(0, 3000)}`,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!data.choices) {
    console.log(data);
    throw new Error("Study plan generation failed");
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
          role: "system",
          content: `You are an expert flashcard creator for students. Create high-quality flashcards that help with spaced repetition learning. Guidelines:
- Each card should focus on ONE concept
- Questions should be specific and clear
- Answers should be concise but complete
- Mix question types: definitions, concepts, applications, relationships
- Ensure cards are at appropriate difficulty level
- Avoid trick questions
- Make questions naturally phrased
- Order cards from easier to harder concepts`,
        },
        {
          role: "user",
          content: `Create 8-10 effective study flashcards from this text. For each card, provide:
- Clear question that tests understanding
- Concise answer with key information
- Focus on important concepts students need to know

Format each card as:
Q: [question]
A: [answer]

Separate cards with a blank line.

Make cards that test:
- Definitions and terms
- Key concepts
- Relationships between ideas
- Practical applications

Text:
${text.slice(0, 3000)}`,
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