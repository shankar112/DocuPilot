# UI Contracts: React Components

## `MessageItem`
- `role`: `"user" | "model"` (Required)
- `text`: `string` (Required)
- `isLatest`: `boolean` (Optional, for auto-scroll ref attachment)

## `InputBar`
- `onSend`: `(message: string) => void` (Required)
- `disabled`: `boolean` (Required)
- `value`: `string` (Required)
- `onChange`: `(value: string) => void` (Required)

## `ChatWindow`
- `messages`: `Message[]` (Required)
- `isLoading`: `boolean` (Required)
- `error`: `string | null` (Optional)
- `onRetry`: `() => void` (Optional)
