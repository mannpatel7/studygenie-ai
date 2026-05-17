const axios = require('axios');

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3-8b-instruct';

const generateAIResponse = async (prompt) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    throw new Error('Failed to generate AI response');
  }
};

const generateChatResponse = async (message, context = null) => {
  try {
    const systemPrompt = context
      ? `You are a helpful study assistant. Answer questions based ONLY on the provided context. If the answer is not found in the context, reply with "Not found in provided document". Explain clearly and simply, use examples when needed. Context: ${context.slice(0, 3000)}`
      : `You are a helpful study assistant. Answer questions clearly and simply, use examples when needed.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    throw new Error('Failed to generate chat response');
  }
};

module.exports = { generateAIResponse, generateChatResponse };