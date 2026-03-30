# DEAwakening Assistant - Phase 1 Backend Core

## Scope
- Add a minimal and stable backend entry point for IA chat.
- Keep Express as the main server and SQLite as the source of truth.
- Reuse existing content/events/contact services.
- Return a strict, structured response for frontend integration.

## New files
- `backend/routes/assistantRoutes.js`
- `backend/controllers/assistantController.js`
- `backend/services/assistantService.js`
- `backend/services/siteKnowledgeService.js`
- `backend/services/promptBuilder.js`
- `backend/docs/assistant-contract.json`
- `backend/docs/assistant-architecture.md`

## Modified files
- `backend/app.js`
  - Registers `app.use("/api/assistant", assistantRoutes)`.
- `backend/.env.example`
  - Adds `OPENAI_API_KEY` and `OPENAI_MODEL`.

## API contract
- Endpoint: `POST /api/assistant/chat`
- Request and response schema: `backend/docs/assistant-contract.json`
- Response envelope remains consistent with current backend style:
  - `{ success, data, error }`

## Data flow
1. Client sends `message`, `language`, optional `sessionId`, `pageContext`, `pageSlug`.
2. `assistantController` validates payload explicitly.
3. `assistantService`:
   - loads knowledge from SQLite-backed services via `siteKnowledgeService`
   - builds prompts using `promptBuilder`
   - calls OpenAI Chat Completions
   - validates and normalizes structured output
4. Controller returns:
   - `answer`
   - `language`
   - `intent`
   - `suggestedCtas[]`
   - `recommendedEventSlug`

## Decisions and reasons
- No heavy frameworks (LangChain, agent frameworks) to keep maintenance simple.
- No RAG/vector store in this phase to reduce complexity and risk.
- No silent fallback on provider/output errors:
  - missing env vars -> explicit `503`
  - provider errors / invalid model JSON -> explicit `502`
- Language handling reuses existing `normalizeLanguage` helper.
- Knowledge source is only existing system data:
  - content sections
  - events
  - contact info

## What is intentionally out of scope (this phase)
- No voice
- No streaming
- No conversation persistence
- No admin changes
- No frontend UI implementation (only backend contract ready)

## Environment variables
Add to `backend/.env`:

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
```

## Quick test
From `backend/`:

```bash
curl -X POST http://localhost:5000/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Quiero conocer a David\",\"language\":\"es\",\"pageContext\":\"about\"}"
```

Expected response shape:

```json
{
  "success": true,
  "data": {
    "answer": "...",
    "language": "es",
    "intent": "about_david",
    "suggestedCtas": [],
    "recommendedEventSlug": null
  },
  "error": null
}
```
