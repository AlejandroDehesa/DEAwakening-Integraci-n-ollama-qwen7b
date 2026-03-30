# Assistant Telemetry (Phase 5)

## Purpose
Provide practical product visibility without building heavy analytics infrastructure.

## What is stored
### `assistant_interactions`
- `created_at`
- `interaction_type` (`assistant-response`)
- `session_id` (optional)
- `language`
- `page_context`
- `page_slug`
- `message_hash` (SHA-256, no raw user text)
- `message_length`
- `answer_length`
- `page_intent`
- `confidence`
- `knowledge_site_status`
- `knowledge_documents_status`
- `recommended_event_slug`
- `suggested_actions_json`
- `related_links_json`
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
- Full raw user message text.
- Full conversation history.
- Personal profile information.
- IP/device fingerprinting.
- Sensitive free-form payloads beyond action labels/targets.

## Privacy decisions
- We store hash + length of user message instead of full text.
- We keep tracking payload narrow and product-oriented.
- Tracking failures never block assistant responses.

## Endpoints
- `POST /api/assistant/track-click`
  - public assistant event endpoint (frontend reports CTA clicks)
- `GET /api/admin/assistant/insights?days=30&limit=200`
  - protected by `x-admin-key` middleware
  - returns aggregated + recent telemetry summary

## Runtime flags
- `ASSISTANT_TRACKING_ENABLED=true|false`
- `ASSISTANT_FORCE_TRACKING_ERROR=true|false` (test fallback behavior)
