const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://docupilot-1.onrender.com';

export const api = {
  async health() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (!response.ok) throw new Error('Health check failed');
      return await response.json();
    } catch (error) {
      console.error('API Health Error:', error);
      throw error;
    }
  },

  async ask(question, history = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question, 
          history: history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            text: msg.text
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get answer from AI');
      }

      return await response.json();
    } catch (error) {
      console.error('API Ask Error:', error);
      throw error;
    }
  },

  async getHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return await response.json();
    } catch (error) {
      console.error('API Get History Error:', error);
      throw error;
    }
  },

  async saveHistory(messages) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            text: msg.text
          }))
        }),
      });
      if (!response.ok) throw new Error('Failed to save history');
      return await response.json();
    } catch (error) {
      console.error('API Save History Error:', error);
      throw error;
    }
  }
};
