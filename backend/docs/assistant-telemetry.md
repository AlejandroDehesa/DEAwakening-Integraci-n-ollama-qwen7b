# Assistant Telemetry (Phase 5.5)

## Purpose
Provide practical product visibility with minimum data and without blocking assistant UX.

## What is stored
### `assistant_interactions`
- `created_at`
- `interaction_type` (`assistant-response`)
- `session_id` (optional)
- `language`
- `page_context`
- `page_slug`
- `message_hash` (SHA-256, no raw message)
- `message_length`
- `answer_length`
- `page_intent`
- `confidence`
- `knowledge_site_status`
- `knowledge_documents_status`
- `recommended_event_slug`
- `suggested_actions_json` (sanitized and capped)
- `related_links_json` (sanitized and capped)
- `response_time_ms`

### `assistant_clicks`
- `created_at`
- `interaction_id` (optional relation to assistant response)
- `session_id` (optional)
- `language`
- `page_context`
- `page_slug`
- `source` (`hero|widget`)
- `click_type`
- `action_type`
- `label`
- `target`
- `page_intent`
- `recommended_event_slug`

## What is NOT stored
- Full user message text
- Full conversation history
- IP or device fingerprinting
- Personal profile attributes

## Noise reduction rules
- Suggested/related actions are deduplicated and capped before persistence.
- Quick action tracking uses stable IDs (`qa:<id>`) instead of endpoint URLs.
- Tracking payload validation rejects malformed targets.

## Endpoints
- `POST /api/assistant/track-click`
  - quick action target: `qa:<id>`
  - other click types: route (`/...`) or external URL
- `GET /api/admin/assistant/insights?days=30&limit=200&includeRecent=true`
  - protected by `x-admin-key`
  - returns compact aggregates + optional recent samples

## Interpreting insights quickly
- `usage.byIntent` -> what users ask for most
- `usage.byPageContext` -> where assistant is used most
- `usage.byKnowledgeStatus.documents` -> document layer health
- `actions.suggested.topTargets` -> what assistant proposes most
- `actions.clicks.topTargets` -> what users click most
- `conversion.rates` -> conversion quality by route category
- `recommendations` -> event recommendation impact

## Runtime flags
- `ASSISTANT_TRACKING_ENABLED=true|false`
- `ASSISTANT_FORCE_TRACKING_ERROR=true|false`
- `ASSISTANT_FORCE_DOCUMENT_ERROR=true|false`
