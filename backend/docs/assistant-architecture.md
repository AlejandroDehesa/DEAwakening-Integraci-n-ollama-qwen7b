# DEAwakening Assistant - Architecture (Phase 3.5 + Phase 4)

## Scope
- Consolidate the current assistant without rewriting the project.
- Keep current Express + SQLite architecture.
- Keep AssistantHero and global AssistantWidget behavior.
- Add a modular document-knowledge layer with clean fallback.

## Final responsibility split
### Backend (source of assistant intelligence)
- Validate payload and enforce contract shape.
- Build site knowledge from current content/events/contact services.
- Load and retrieve relevant document knowledge.
- Orchestrate prompt context.
- Normalize model output into stable assistant actions/links/recommendation.

### Frontend (presentation and UX)
- Render assistant response clearly.
- Send language + page context + page slug.
- Handle loading/error states and minor defensive sanitization.
- Do not invent fallback business actions.

## Backend flow
1. `POST /api/assistant/chat` enters through route/controller.
2. `assistantService` validates body.
3. `assistantKnowledgeOrchestrator` builds:
   - `siteKnowledge` (existing source of truth)
   - `documentKnowledge` (retrieved snippets from materials folder)
4. `promptBuilder` composes strict JSON prompt.
5. OpenAI call is executed with timeout.
6. `promptBuilder.parseAssistantOutput` normalizes:
   - `pageIntent`
   - `suggestedActions`
   - `relatedLinks`
   - `recommendedEventSlug`
   - `confidence`
7. Controller returns envelope `{ success, data, error }`.

## Knowledge layers
### Site knowledge (base, always present if backend is healthy)
- content sections
- events (including event-detail context)
- contact info
- navigation labels
- current page context summary

### Document knowledge (expanded, optional, fallback-safe)
- Source folder: `backend/knowledge/documents`
- Supported formats: `.md`, `.txt`, `.json`
- Retrieval: lightweight keyword scoring by query + language + page context
- If retrieval layer fails:
  - assistant still runs with site knowledge
  - logs warning
  - returns `knowledgeStatus.documents = "unavailable"`

## Contract simplification notes
- Canonical fields:
  - `answer`
  - `language`
  - `pageIntent`
  - `confidence`
  - `suggestedActions`
  - `relatedLinks`
  - `recommendedEventSlug`
- Compatibility:
  - `intent` remains as deprecated alias of `pageIntent`
  - `suggestedCtas` removed from backend output to reduce duplication noise

## Error handling (controlled)
- Missing `OPENAI_API_KEY`: `503`
- Missing `OPENAI_MODEL`: `503`
- Provider timeout: `504`
- Provider/network error: `502`
- Malformed provider output: `502`
- Knowledge build failure: `500`
- Invalid request body: `400`

## Logging
Controller logs include:
- language
- pageContext
- message length
- pageIntent
- document knowledge status
- duration

## Environment variables
```env
PORT=5000
ADMIN_KEY=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TIMEOUT_MS=15000
ASSISTANT_DOCUMENTS_DIR=./knowledge/documents
```

## Material ingestion
- Add curated materials into `backend/knowledge/documents`.
- Recommended metadata in markdown front matter:
  - `id`
  - `title`
  - `language` (`en|es|de`)
  - `tags` (comma-separated)
  - `pageContexts` (comma-separated)

## Verification commands
- Assistant smoke:
  - `npm run assistant:smoke`
- Document retrieval preview:
  - `npm run assistant:docs:preview`
