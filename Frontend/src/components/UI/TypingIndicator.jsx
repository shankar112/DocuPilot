export function TypingIndicator() {
  return (
    <div className="flex w-full mb-6 justify-start animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 py-1">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></div>
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]"></div>
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}
