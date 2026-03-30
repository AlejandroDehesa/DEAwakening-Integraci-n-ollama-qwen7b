# Assistant Materials - Practical Guide

## Purpose
This file explains how to add real project materials to the assistant without introducing heavy infrastructure.

## Folder
Place materials in:

`backend/knowledge/documents`

## Supported formats
- `.md`
- `.txt`
- `.json`

## Markdown format (recommended)
Use optional front matter:

```md
---
id: unique-id
title: Human title
language: es
tags: filosofia, guia, david
pageContexts: home,about
---
Main content...
```

## JSON format
```json
{
  "id": "book-notes-es",
  "title": "Notas libro",
  "language": "es",
  "tags": ["libro", "resosense"],
  "pageContexts": ["book", "home"],
  "content": "Texto principal..."
}
```

## Quality rules for materials
- Keep each document focused on one topic.
- Prefer clear facts over marketing noise.
- Keep language-specific versions when possible.
- Avoid duplicate copies of the same text.

## How retrieval works
- The system scores documents by:
  - user query terms
  - language match
  - pageContext match
  - title/tags relevance
- Top snippets are sent to the prompt.

## Fallback behavior
If material loading or retrieval fails:
- assistant still answers using site knowledge
- backend logs the issue
- response includes `knowledgeStatus.documents = "unavailable"`

## Quick checks
Run:

```bash
npm run assistant:docs:preview
```

Then test assistant endpoint normally:

```bash
npm run assistant:smoke
```
