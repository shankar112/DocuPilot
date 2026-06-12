import { ChatWindow } from './components/ChatWindow'
import { OldChatWindow } from './components/OldChatWindow'
import { useSessionStorage } from './hooks/useSessionStorage'

function App() {
  const [uiMode, setUiMode] = useSessionStorage('docupilot-ui-mode', 'new')
  const isOldUi = uiMode === 'old'

  return (
    <div className={isOldUi ? 'min-h-screen bg-[#212121]' : 'min-h-screen bg-white'}>
      <div className="fixed right-4 top-4 z-50 rounded-full border border-black/10 bg-white/95 p-1 shadow-lg shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
        <div className="flex h-10 items-center gap-1">
          <button
            type="button"
            onClick={() => setUiMode('new')}
            className={`h-8 rounded-full px-4 text-xs font-bold transition ${
              !isOldUi
                ? 'bg-primary text-white shadow-sm'
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10'
            }`}
            aria-pressed={!isOldUi}
          >
            New
          </button>
          <button
            type="button"
            onClick={() => setUiMode('old')}
            className={`h-8 rounded-full px-4 text-xs font-bold transition ${
              isOldUi
                ? 'bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10'
            }`}
            aria-pressed={isOldUi}
          >
            Old
          </button>
        </div>
      </div>

      {isOldUi ? <OldChatWindow /> : <ChatWindow />}
    </div>
  )
}

export default App
