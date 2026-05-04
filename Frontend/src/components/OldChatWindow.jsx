import ReactMarkdown from 'react-markdown';
import { useEffect, useRef, useState } from 'react';
import { Database, Menu, MoreHorizontal, PanelLeft, Plus, Search, Send, SquarePen, Trash2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';

function OldMessage({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-[30px] bg-[#303030] px-6 py-4 text-left text-[17px] font-medium leading-8 text-zinc-50 sm:max-w-[70%]">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-left">
      <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-sm font-black text-[#212121]">
        AI
      </div>
      <div className="min-w-0 flex-1 text-[17px] font-medium leading-9 text-zinc-100">
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </div>
    </div>
  );
}

function OldTypingIndicator() {
  return (
    <div className="flex gap-4 text-left">
      <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-sm font-black text-[#212121]">
        AI
      </div>
      <div className="flex items-center gap-3 text-[17px] font-semibold text-zinc-300">
        <span>AI is thinking</span>
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-400" />
        </span>
      </div>
    </div>
  );
}

function OldInput({ onSendMessage, isLoading }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`;
  }, [text]);

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form
      onSubmit={submit}
      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#212121] via-[#212121] to-[#212121]/70 px-4 pb-5 pt-6 sm:px-6"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-[28px] bg-[#303030] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_60px_rgba(0,0,0,0.34)]">
          <div className="flex items-end gap-2">
            <button type="button" className="mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-zinc-300 transition hover:bg-white/10" aria-label="Attach file">
              <Plus size={24} />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  submit(event);
                }
              }}
              placeholder="Ask anything"
              className="max-h-48 min-h-12 flex-1 resize-none bg-transparent px-2 py-3 text-[17px] font-medium leading-7 text-zinc-50 outline-none placeholder:text-zinc-400 disabled:opacity-60"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-zinc-100 text-[#212121] transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-400"
              aria-label="Send message"
              title="Send"
            >
              <Send size={22} />
            </button>
          </div>
        </div>
        <p className="mt-3 text-center text-sm font-medium text-zinc-400">
          DocuPilot can make mistakes. Check source context for important information.
        </p>
      </div>
    </form>
  );
}

export function OldChatWindow() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#212121] text-zinc-100">
      <aside className="hidden w-[260px] shrink-0 flex-col bg-[#171717] text-zinc-100 md:flex">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-black text-[#171717]">DP</div>
            <div className="text-left">
              <h1 className="text-sm font-bold leading-4 text-zinc-100">DocuPilot</h1>
              <p className="text-xs font-medium text-zinc-400">Enterprise RAG</p>
            </div>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg text-zinc-300 transition hover:bg-white/10" aria-label="Toggle sidebar">
            <PanelLeft size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <button onClick={clearChat} className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-semibold text-zinc-100 transition hover:bg-white/10">
            <SquarePen size={20} />
            New chat
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-semibold text-zinc-100 transition hover:bg-white/10">
            <Search size={20} />
            Search chats
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-semibold text-zinc-100 transition hover:bg-white/10">
            <Database size={20} />
            Knowledge base
          </button>

          <div className="mt-7 text-left">
            <p className="px-3 text-sm font-semibold text-zinc-500">Project</p>
            <div className="mt-2 space-y-1">
              <div className="rounded-xl bg-white/10 px-3 py-3 text-[15px] font-semibold text-zinc-100">HR Policy Handbook</div>
              <div className="rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-400">Source-grounded Q&A</div>
              <div className="rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-400">Chroma document index</div>
            </div>
          </div>
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[#212121]">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 pr-36 sm:px-6 sm:pr-40">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-xl text-zinc-300 transition hover:bg-white/10 md:hidden" aria-label="Open sidebar">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xl font-semibold text-zinc-100">
              DocuPilot
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Online
            </div>
            <button onClick={clearChat} className="grid h-10 w-10 place-items-center rounded-xl text-zinc-300 transition hover:bg-white/10" aria-label="Clear chat" title="Clear chat">
              <Trash2 size={20} />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-xl text-zinc-300 transition hover:bg-white/10" aria-label="More options">
              <MoreHorizontal size={24} />
            </button>
          </div>
        </header>

        {error && (
          <div className="mx-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-200 sm:mx-6">
            {error}
          </div>
        )}

        <section className="relative flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 pb-40 pt-7 sm:px-6">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
              {messages.length === 0 && (
                <div className="flex min-h-[42vh] flex-col items-center justify-center text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-xl font-black text-[#212121] shadow-sm">AI</div>
                  <h2 className="mt-5 text-4xl font-semibold tracking-normal text-zinc-50">How can I help?</h2>
                  <p className="mt-3 max-w-xl text-base font-medium leading-7 text-zinc-400">
                    Ask questions about your indexed enterprise documents.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <OldMessage key={message.id} message={message} />
              ))}

              {isLoading && <OldTypingIndicator />}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          <OldInput onSendMessage={sendMessage} isLoading={isLoading} />
        </section>
      </main>
    </div>
  );
}
