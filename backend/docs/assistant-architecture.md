# DEAwakening Assistant - Architecture (Phase 1.5 + Frontend v1)

## Scope
- Harden existing assistant backend (no rewrite).
- Keep Express + SQLite + current project structure.
- Add first frontend assistant UI integrated into current layout.
- Keep implementation simple, maintainable and production-small ready.

## Backend flow
1. `POST /api/assistant/chat` enters through `assistantRoutes`.
2. `assistantController` validates input and logs request summary.
3. `assistantService`:
   - validates payload with strict rules
   - builds site knowledge from existing services (`content/events/contact`)
   - builds prompt with language + page context
   - calls OpenAI with timeout
   - parses and normalizes model output into stable JSON
4. Controller returns standard envelope:
   - `{ success, data, error }`

## Output contract
Primary assistant fields:
- `answer`
- `language`
- `pageIntent`
- `confidence`
- `suggestedActions[]`
- `relatedLinks[]`

Backward-compatible aliases:
- `intent` (alias of `pageIntent`)
- `suggestedCtas` (alias of `suggestedActions`)
- `recommendedEventSlug`

Contract source:
- `backend/docs/assistant-contract.json`

## Error handling (controlled)
- Missing `OPENAI_API_KEY`: `503`
- Missing `OPENAI_MODEL`: `503`
- Provider timeout: `504`
- Provider/network error: `502`
- Malformed provider output: `502`
- Knowledge build failure: `500`
- Invalid request body: `400`

All errors are returned in envelope format without stack traces in API responses.

## Logging (minimal and useful)
Controller logs:
- language
- pageContext
- message length
- success/failure
- error code/status
- operation duration (ms)

## Site knowledge design
Knowledge is built only from existing project data:
- content sections
- events list + selected event context
- contact info
- navigation map (from `ui.navbar`)
- current page context summary

No RAG/vector store in this phase.

## Frontend integration (v1)
Assistant UI is isolated in its own component/service:
- launcher button (floating)
- open/close panel
- short message history
- loading/error states
- context-aware request payload (`language`, `pageContext`, `pageSlug`)
- suggested actions + related links rendering

No changes to existing page business logic were required.

## Environment variables
Add to `backend/.env`:

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TIMEOUT_MS=15000
```

## Smoke tests
Script:
- `npm run assistant:smoke`

Covers:
- valid ES
- valid EN
- valid with pageContext
- invalid body (`400`)
- API key failure probe (`503` when expected)

Use:
- `ASSISTANT_BASE_URL` to target another backend URL
- `ASSISTANT_EXPECT_MISSING_KEY=true` when testing missing API key scenario
