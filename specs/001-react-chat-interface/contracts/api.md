# API Contract: DocuPilot Chat

## POST `/api/ask`

### Request Body
```json
{
  "question": "string",
  "history": [
    {
      "role": "user | model",
      "text": "string"
    }
  ]
}
```

### Response Body (Success)
```json
{
  "answer": "string",
  "source_context": "string"
}
```

### Response Body (Error)
```json
{
  "detail": "string"
}
```

## GET `/api/health`

### Response Body
```json
{
  "status": "ok | offline"
}
```
