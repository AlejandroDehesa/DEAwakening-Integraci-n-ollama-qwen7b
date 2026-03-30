# Assistant Materials - Operational Guide

## Folder
Store assistant knowledge files in:

`backend/knowledge/documents`

Subfolders are supported.

## Allowed formats
- `.md`
- `.txt`
- `.json`

## Recommended metadata
### Markdown front matter
```md
---
id: finding-resosense-es
title: Notas del libro
language: es
tags: libro, resosense, david
pageContexts: book,home
---
Contenido...
```

### JSON format
```json
{
  "id": "dea-guide-en",
  "title": "Guide",
  "language": "en",
  "tags": ["guide", "events"],
  "pageContexts": ["home", "events"],
  "content": "Main text..."
}
```

## Quality rules
- Keep one topic per document.
- Write factual, practical, non-redundant text.
- Add language-specific versions when possible (`en`, `es`, `de`).
- Prefer explicit `tags` and `pageContexts`.
- Avoid repeating the same material with different filenames.

## Common mistakes to avoid
- Missing `id` or duplicated `id` in same language.
- Very short content (weak retrieval quality).
- No `tags` and no `pageContexts`.
- Mixing unrelated topics in one file.

## Validation and checks
- Preview retrieval quality:
  - `npm run assistant:docs:preview`
- Validate materials consistency:
  - `npm run assistant:materials:validate`

## Fallback behavior
If documents fail to load or parse:
- assistant continues with site knowledge
- backend logs warning
- `knowledgeStatus.documents` becomes `unavailable`
