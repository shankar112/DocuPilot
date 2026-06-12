import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../services/api';

const DEFAULT_CHAT_ERROR = 'Sorry, I could not get an answer right now. Please try again in a moment.';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const activeRequestId = useRef(0);
  const messagesRef = useRef([]);
  const isSendingRef = useRef(false);

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
    messagesRef.current = messages;

    if (!isInitializing) {
      api.saveHistory(messages).catch(err => console.error('Failed to sync history:', err));
    }
  }, [messages, isInitializing]);

  const sendMessage = useCallback(async (text) => {
    const trimmedText = text.trim();
    if (!trimmedText || isSendingRef.current) return;
    isSendingRef.current = true;

    const historyForApi = messagesRef.current.map(msg => ({
      role: msg.role,
      text: msg.text
    }));

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmedText,
      timestamp: new Date().toISOString()
    };
    const requestId = activeRequestId.current + 1;
    activeRequestId.current = requestId;
    const isCurrentRequest = () => activeRequestId.current === requestId;

    setIsLoading(true);
    setError(null);
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await api.ask(trimmedText, historyForApi);

      const aiMessage = {
        id: `${Date.now()}-model`,
        role: 'model',
        text: response.answer,
        timestamp: new Date().toISOString()
      };

      if (isCurrentRequest()) {
        setMessages(current => [...current, aiMessage]);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      if (isCurrentRequest()) {
        setError(err.message || DEFAULT_CHAT_ERROR);
      }
    } finally {
      if (isCurrentRequest()) {
        isSendingRef.current = false;
        setIsLoading(false);
      }
    }
  }, []);

  const clearChat = useCallback(() => {
    activeRequestId.current += 1;
    isSendingRef.current = false;
    setMessages([]);
    setError(null);
    setIsLoading(false);
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
