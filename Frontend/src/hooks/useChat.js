import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await api.getHistory();
        if (history && history.messages) {
          // Add IDs to messages if they don't have them
          const messagesWithIds = history.messages.map((msg, index) => ({
            ...msg,
            id: msg.id || `hist-${index}`,
            role: msg.role,
            text: msg.text,
            timestamp: msg.timestamp || new Date().toISOString()
          }));
          setMessages(messagesWithIds);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
        // Fallback to empty if failed
      } finally {
        setIsInitializing(false);
      }
    };
    loadHistory();
  }, []);

  // Sync with backend on change
  useEffect(() => {
    if (!isInitializing) {
      api.saveHistory(messages).catch(err => console.error('Failed to sync history:', err));
    }
  }, [messages, isInitializing]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      
      (async () => {
        setIsLoading(true);
        setError(null);

        try {
          const historyForApi = prev.map(msg => ({ 
            role: msg.role, 
            text: msg.text 
          }));
          
          const response = await api.ask(text.trim(), historyForApi);
          
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: response.answer,
            timestamp: new Date().toISOString()
          };

          setMessages(current => [...current, aiMessage]);
        } catch (err) {
          setError(err.message || 'Something went wrong. Please try again.');
        } finally {
          setIsLoading(false);
        }
      })();

      return newMessages;
    });
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isInitializing,
    error,
    sendMessage,
    clearChat
  };
}
