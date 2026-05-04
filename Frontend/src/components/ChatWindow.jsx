import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { ErrorDisplay } from './UI/ErrorDisplay';
import { Trash2 } from 'lucide-react';

export function ChatWindow() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">DocuPilot</h1>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">AI Assistant Online</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={clearChat}
          className="group flex items-center gap-2 rounded-xl px-3 py-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
          title="Clear conversation"
        >
          <span className="hidden sm:inline text-xs font-medium">Clear Chat</span>
          <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </header>

      {/* Error Banner */}
      <ErrorDisplay error={error} />

      {/* Message Area */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input Area */}
      <InputBar onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}
