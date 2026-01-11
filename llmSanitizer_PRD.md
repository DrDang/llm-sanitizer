Here is a comprehensive Product Requirements Document (PRD) for your text sanitization tool.

# Product Requirements Document (PRD): "LLM Sanitizer"

## 1. Introduction

**Product Name:** LLM Sanitizer (Working Title)
**Version:** 1.0
**Status:** Draft
**Platform:** Desktop (MacOS & Windows)

### 1.1 Executive Summary

"LLM Sanitizer" is a cross-platform desktop utility designed to act as a privacy layer between users and public Large Language Models (LLMs). It allows users to "mask" sensitive terms (PII, proprietary code names, internal jargon) with placeholders before sending text to an LLM for processing (e.g., grammar checks, formatting). Once the LLM returns the processed text, the tool reverses the operation, restoring the original sensitive terms.

### 1.2 Problem Statement

Professionals often want to leverage powerful public LLMs (like ChatGPT or Claude) for editing or refactoring but cannot do so because of data privacy policies regarding proprietary information or PII (Personally Identifiable Information).

---

## 2. User Personas & Stories

### 2.1 Target Audience

* **Systems Engineers/Developers:** Need to format requirements or code snippets without leaking project code names or specific IP.
* **Legal/HR:** Need to polish sensitive emails or documents without exposing real names or financial figures.

### 2.2 User Stories

* **Story 1 (Configuration):** As a user, I want to define a list of "Sensitive Terms" (e.g., "Project Apollo", "John Doe") so the tool knows what to hide.
* **Story 2 (Sanitization):** As a user, I want to paste raw text and click "Sanitize" to generate a version where my sensitive terms are replaced by safe placeholders (e.g., `[PROJECT_A]`, `[PERSON_1]`).
* **Story 3 (Restoration):** As a user, I want to paste the LLM-generated response back into the tool and click "Desanitize" to see the final text with my original terms restored.
* **Story 4 (Persistence):** As a user, I want my list of sensitive terms to be saved locally so I don't have to re-enter them every session.

---

## 3. Functional Requirements

### 3.1 Dictionary Management (The "Vault")

* **REQ-1.0:** Users must be able to add, edit, and delete sensitive Key-Value pairs.
* *Input:* The sensitive word (e.g., "Project X").
* *Output:* The placeholder label (Optional: Auto-generated vs. User-defined).


* **REQ-1.1:** The tool must support "Categories" or "Profiles" (e.g., switching between "Work Project A" and "Personal Finance" dictionaries).
* **REQ-1.2:** [Nice to Have] Regex support for patterns (e.g., automatically detecting emails or SSNs).

### 3.2 The Sanitization Engine (Forward Pass)

* **REQ-2.0:** The tool must accept raw text input.
* **REQ-2.1:** The tool must scan the input against the active Dictionary.
* **REQ-2.2:** Detected sensitive words must be replaced with unique, robust placeholders.
* *Constraint:* Placeholders must be distinct enough that an LLM treats them as proper nouns/variables and does not translate them.
* *Example:* `{{REF_ID_892}}` or `[SECRET_VAR_1]`.


* **REQ-2.3:** The tool must store a temporary "Session Map" linking the generated placeholders in the current text to the original values.

### 3.3 The Desanitization Engine (Reverse Pass)

* **REQ-3.0:** The tool must accept processed text input (the text returned from the LLM).
* **REQ-3.1:** The tool must scan for the specific placeholders used in the Sanitization phase.
* **REQ-3.2:** The tool must replace the placeholders with the original sensitive values using the "Session Map."
* **REQ-3.3:** If a placeholder is missing (hallucinated away by the LLM) or altered, the tool should alert the user or attempt a fuzzy match.

### 3.4 User Interface

* **REQ-4.0:** **Dual-Pane Layout (or Tabbed):**
* *Pane A (Source):* Input for Raw Text -> Button: "Sanitize & Copy".
* *Pane B (Result):* Input for LLM Output -> Button: "Desanitize".


* **REQ-4.1:** One-click "Copy to Clipboard" buttons for all output fields.

---

## 4. Technical Constraints & Non-Functional Requirements

### 4.1 Security & Privacy

* **NFR-1.0:** **Local Processing Only.** No text, dictionaries, or mapping data shall ever leave the user's machine. The tool must work offline.
* **NFR-1.1:** Application state (dictionaries) must be stored in a local, encrypted file (optional but recommended) or standard JSON config file.

### 4.2 Compatibility

* **NFR-2.0:** Application must run as a native executable on MacOS (Apple Silicon & Intel) and Windows 10/11.
* *Recommended Stack:* **Electron**, **Tauri** (Rust based, smaller binary), or **Flutter**.



### 4.3 Robustness

* **NFR-3.0:** **Placeholder Resilience.** The placeholders chosen must be resilient to LLM formatting changes.
* *Risk:* LLM might change `[ID_1]` to `(ID 1)`.
* *Mitigation:* Use highly distinct tokens (e.g., `__SEC_01__`) and ensure the Desanitizer uses Regex to find them even if whitespace is added.



---

## 5. Proposed Workflow (Step-by-Step)

| Step | User Action | System Action |
| --- | --- | --- |
| **1** | **Setup** | User enters "Project Orion" into the "Sensitive Words" list. |
| **2** | **Input** | User pastes: *"The timeline for Project Orion is delayed."* |
| **3** | **Sanitize** | System generates mapping: `Project Orion` = `{{PROJ_01}}`. <br>

<br> Output: *"The timeline for {{PROJ_01}} is delayed."* |
| **4** | **External** | User pastes output into ChatGPT: *"Fix grammar: The timeline for {{PROJ_01}} is delayed."* |
| **5** | **Process** | ChatGPT returns: *"The {{PROJ_01}} timeline has been delayed."* |
| **6** | **Desanitize** | User pastes this back into the tool. |
| **7** | **Final** | System detects `{{PROJ_01}}` and restores value. <br>

<br> Final Output: *"The Project Orion timeline has been delayed."* |