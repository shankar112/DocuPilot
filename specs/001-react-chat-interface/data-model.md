# Data Model: React Chat Interface

## Entities

### Message
Represents a single message in the chat history.
- `id`: `string` (UUID or timestamp-based)
- `role`: `"user" | "model"`
- `text`: `string` (Markdown content)
- `timestamp`: `number` (Epoch time)

### ConversationState
The global state managed by the `useChat` hook.
- `chatHistory`: `Message[]` (Max 50 items)
- `isLoading`: `boolean`
- `error`: `string | null`
- `currentInput`: `string`

## State Transitions

### `SEND_MESSAGE`
1. Push `user` message to `chatHistory`.
2. Set `isLoading` to `true`.
3. Set `error` to `null`.
4. Trigger API request.

### `RECEIVE_RESPONSE`
1. Push `model` message to `chatHistory`.
2. Set `isLoading` to `false`.

### `HANDLE_ERROR`
1. Set `isLoading` to `false`.
2. Set `error` to informative string.
3. (Do NOT push failed message to history).

## Persistence Schema
- **Key**: `docupilot_chat_history`
- **Format**: JSON-stringified `Message[]`
- **Cleanup**: On initialization, slice to the last 50 items if exceeded.
