import { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './UI/TypingIndicator';

export function MessageList({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200">
      <div className="mx-auto max-w-3xl">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 rounded-full bg-primary/5 p-4 text-primary">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900">How can I help you today?</h2>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              I can answer questions about the Enterprise HR Policy Handbook, calculate dates, and more.
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        {isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
}
