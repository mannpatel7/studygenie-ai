import api from './axios';

export const pdfApi = {
  // Upload PDF and extract text
  uploadPDF: async (file) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await api.post('/api/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to upload PDF';
    }
  },
};