const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const FALLBACK_ERROR_MESSAGE = 'Sorry, I could not get an answer right now. Please try again in a moment.';
const EMPTY_ANSWER_MESSAGE = 'Sorry, I did not receive a usable answer. Please try asking again.';

class ApiError extends Error {
  constructor(message = FALLBACK_ERROR_MESSAGE) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse API response:', error);
    throw new ApiError(FALLBACK_ERROR_MESSAGE);
  }
}

function ensureAnswer(data) {
  const answer = typeof data?.answer === 'string' ? data.answer.trim() : '';
  if (!answer) {
    throw new ApiError(EMPTY_ANSWER_MESSAGE);
  }

  return {
    ...data,
    answer
  };
}

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
        await parseJsonResponse(response).catch(() => null);
        throw new ApiError(FALLBACK_ERROR_MESSAGE);
      }

      const data = await parseJsonResponse(response);
      return ensureAnswer(data);
    } catch (error) {
      console.error('API Ask Error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(FALLBACK_ERROR_MESSAGE);
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
