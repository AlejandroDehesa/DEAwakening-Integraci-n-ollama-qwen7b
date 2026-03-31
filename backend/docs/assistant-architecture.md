# DEAwakening Assistant - Architecture (Phase 4.5 + 5 + 5.5)

## Scope
- Harden retrieval/document layer and contract stability.
- Keep existing assistant UX (Home hero + global widget).
- Add practical telemetry with minimal persistence and no heavy analytics stack.

## Responsibility split
### Backend (canonical logic)
- Input validation.
- Site knowledge assembly.
- Document loading + retrieval scoring.
- Prompt orchestration + output normalization.
- CTA/action recommendation logic.
- Interaction and click telemetry persistence.

### Frontend (UX + lightweight reporting)
- Render response structure.
- Defensive sanitization only.
- Navigation behavior.
- Non-blocking click reporting.

## Chat flow
1. `POST /api/assistant/chat`
2. Validate request payload.
3. Build knowledge:
   - `siteKnowledge` (existing source of truth)
   - `documentKnowledge` (retrieved snippets)
4. Build prompt and call provider.
5. Normalize model output to canonical contract.
6. Try to persist interaction telemetry.
7. Return structured envelope.

## Document layer hardening
- Supported materials: `.md`, `.txt`, `.json`
- Recursive file scan with fingerprint cache.
- Metadata normalization:
  - `id`, `title`, `language`, `tags`, `pageContexts`
- Duplicate handling by `(language,id)` with deterministic keep rule.
- Retrieval scoring balances:
  - term matches in body/title/tags
  - language priority
  - pageContext match
  - pageSlug hints
  - term coverage
- Snippet deduplication by semantic key.

### Fallback behavior
- If document layer fails, assistant still works using site knowledge.
- Response includes `knowledgeStatus.documents = "unavailable"`.
- Warn-level backend log is emitted.

## Contract
Canonical:
- `contractVersion`
- `answer`
- `language`
- `pageIntent`
- `confidence`
- `suggestedActions`
- `relatedLinks`
- `recommendedEventSlug`
- `knowledgeStatus`
- `interactionId`

Legacy:
- `intent` (alias of `pageIntent`)

## Telemetry (Phase 5 + 5.5)
### Stored interaction
- metadata only (no raw full message)
- SHA-256 message hash + message length
- intent/confidence/knowledge status
- suggested/related action payloads (deduplicated + capped)
- recommendation and response timing

### Stored click
- source (`hero|widget`)
- click type + target + label
- language/context/intent metadata
- optional relation to `interactionId`
- quick-action target uses stable format: `qa:<id>`

### Endpoints
- `POST /api/assistant/track-click`
- `GET /api/admin/assistant/insights?days=30&limit=200&includeRecent=true`

## Runtime flags
```env
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT_MS=15000
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=DEAwakening
ASSISTANT_DOCUMENTS_DIR=./knowledge/documents
ASSISTANT_FORCE_DOCUMENT_ERROR=false
ASSISTANT_TRACKING_ENABLED=true
ASSISTANT_FORCE_TRACKING_ERROR=false
```

## Verification scripts
- `npm run assistant:docs:preview`
- `npm run assistant:materials:validate`
- `npm run assistant:phase-check`
