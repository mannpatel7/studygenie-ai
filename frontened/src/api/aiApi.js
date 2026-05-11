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
};