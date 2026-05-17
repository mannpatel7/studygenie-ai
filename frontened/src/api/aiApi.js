import api from './axios';

export const aiApi = {
  // Generate summary
  generateSummary: async (data) => {
    try {
      const response = await api.post('/api/ai/summary', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate summary';
    }
  },

  // Generate flashcards
  generateFlashcards: async (data) => {
    try {
      const response = await api.post('/api/ai/flashcards', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate flashcards';
    }
  },

  // Generate quiz
  generateQuiz: async (data) => {
    try {
      const response = await api.post('/api/ai/quiz', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate quiz';
    }
  },

  // Generate study plan
  generateStudyPlan: async (data) => {
    try {
      const response = await api.post('/api/ai/study-plan', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate study plan';
    }
  },

  // Chat with AI
  chatWithAI: async (data) => {
    try {
      const response = await api.post('/api/ai/chat', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to chat with AI';
    }
  },

  // Generate multiple content types from PDF
  generateContent: async (file, contentTypes, metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('contentTypes', JSON.stringify(contentTypes));

      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await api.post('/api/ai/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate content';
    }
  },
};