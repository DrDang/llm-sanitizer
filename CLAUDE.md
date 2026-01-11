# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LLM Sanitizer** is a cross-platform desktop application that acts as a privacy layer between users and public LLMs. It masks sensitive terms (PII, proprietary code names) with placeholders before sending text to LLMs, then restores the original terms after processing.

**Status:** Early stage - PRD exists but implementation not yet started.

**Target Platforms:** MacOS (Apple Silicon & Intel) and Windows 10/11

**Recommended Tech Stack Options:**
- Electron (cross-platform, JavaScript/TypeScript)
- Tauri (Rust-based, smaller binary, better performance)
- Flutter (Dart-based, modern UI)

## Core Architecture

The application is built around three main components:

### 1. Dictionary Management ("The Vault")
Manages sensitive key-value pairs that need to be masked:
- Store/edit/delete sensitive terms and their placeholders
- Support multiple profiles/categories (e.g., "Work Project A", "Personal Finance")
- Persist locally in encrypted or JSON format
- Future: Regex pattern support for auto-detecting PII (emails, SSNs)

### 2. Sanitization Engine (Forward Pass)
Converts sensitive text to safe text:
- Accepts raw text input
- Scans against active dictionary
- Replaces sensitive terms with robust placeholders (e.g., `{{REF_ID_892}}`, `__SEC_01__`)
- Creates temporary "Session Map" linking placeholders to originals
- **Critical:** Placeholders must be resilient to LLM formatting changes

### 3. Desanitization Engine (Reverse Pass)
Restores original sensitive terms:
- Accepts LLM-processed text
- Finds placeholders using Session Map
- Replaces placeholders with original values
- Handles edge cases: missing/altered placeholders (fuzzy matching)

## Key Design Constraints

### Security & Privacy (Non-Negotiable)
- **All processing must be local** - no data leaves the user's machine
- Must work completely offline
- Dictionary storage should be encrypted (optional but recommended)

### Placeholder Resilience
Placeholders must survive LLM transformations. Consider:
- LLMs might change `[ID_1]` to `(ID 1)` or `ID 1`
- Use highly distinct tokens: `{{PROJ_01}}`, `__SEC_01__`, `[SECRET_VAR_1]`
- Desanitizer should use flexible regex to find altered placeholders

### UI Requirements
Dual-pane or tabbed layout:
- **Pane A (Source):** Raw text input → "Sanitize & Copy" button
- **Pane B (Result):** LLM output input → "Desanitize" button
- One-click clipboard operations for all output fields

## Typical Workflow

1. User configures sensitive terms in Dictionary (e.g., "Project Orion")
2. User pastes raw text: "The timeline for Project Orion is delayed."
3. System sanitizes → "The timeline for {{PROJ_01}} is delayed."
4. User copies sanitized text to LLM (ChatGPT/Claude)
5. LLM returns processed text: "The {{PROJ_01}} timeline has been delayed."
6. User pastes back into tool and clicks "Desanitize"
7. System restores → "The Project Orion timeline has been delayed."

## Implementation Priorities

When building this application, implement in this order:

1. **Dictionary Management UI** - Users need to configure terms first
2. **Sanitization Engine** - Core forward pass functionality
3. **Session Map Storage** - Temporary mapping for current session
4. **Desanitization Engine** - Reverse pass with placeholder detection
5. **Multi-Profile Support** - Allow switching between different dictionaries
6. **Fuzzy Matching** - Handle altered/hallucinated placeholders
7. **Regex Pattern Support** - Auto-detect PII patterns

## Reference Documents

- **llmSanitizer_PRD.md** - Complete product requirements and user stories
