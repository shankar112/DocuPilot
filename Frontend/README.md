# DocuPilot Frontend

React + Vite frontend for DocuPilot. This app provides the chat UI, sends user questions to the FastAPI backend, renders model responses, and syncs chat history through the backend history endpoints.

## Stack

- React `19`
- Vite `8`
- Tailwind CSS `4`
- lucide-react icons
- react-markdown for rendering assistant messages

## Main Files

```text
Frontend/
+-- src/
|   +-- App.jsx                     # New/Old UI mode toggle
|   +-- main.jsx                    # React entry point
|   +-- components/
|   |   +-- ChatWindow.jsx          # Current chat UI
|   |   +-- OldChatWindow.jsx       # Preserved older UI
|   |   +-- MessageList.jsx
|   |   +-- MessageItem.jsx
|   |   +-- InputBar.jsx
|   +-- hooks/
|   |   +-- useChat.js              # Message state, loading/error state, API calls
|   |   +-- useSessionStorage.js    # Persists UI mode
|   +-- services/
|   |   +-- api.js                  # Backend API client
+-- package.json
+-- .env.example
```

## API Integration

The API base URL comes from:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If `VITE_API_BASE_URL` is not set, the frontend falls back to:

```text
https://docupilot-1.onrender.com
```

Used endpoints:

- `GET /api/health`
- `POST /api/ask`
- `GET /api/history`
- `POST /api/history`

`POST /api/ask` sends:

```json
{
  "question": "User question",
  "history": [
    {
      "role": "user",
      "text": "Previous user message"
    },
    {
      "role": "model",
      "text": "Previous model message"
    }
  ]
}
```

## Running Locally

Install dependencies:

```bash
npm install
```

Create local env file:

```bash
copy .env.example .env
```

Start the dev server:

```bash
npm run dev
```

The Vite dev server usually runs at:

```text
http://localhost:5173
```

Make sure the backend is running at the URL configured in `VITE_API_BASE_URL`.

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build production assets
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

There is currently no frontend test script configured.

## Usage

The app opens to the current chat interface. Ask a question about the indexed HR policy document and the frontend will send it to the backend.

The top-right toggle switches between:

- `New`: current React chat interface
- `Old`: preserved older chat UI

The selected UI mode is stored in `sessionStorage` under:

```text
docupilot-ui-mode
```

Chat messages are loaded from and saved to the backend via `/api/history`.
