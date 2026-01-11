# LLM Sanitizer

A privacy-focused desktop application that acts as a protective layer between you and public LLMs. Mask sensitive information before sending text to ChatGPT, Claude, or other LLMs, then restore it after processing.

## Features

- **Dictionary Management (The Vault)**: Store and manage sensitive terms with custom placeholders
- **Sanitization**: Replace sensitive terms with robust placeholders before LLM processing
- **Desanitization**: Restore original sensitive terms from LLM responses
- **Local-First**: All processing happens on your machine - no data leaves your device
- **Offline-Ready**: Works completely offline for maximum privacy

## Prerequisites

- **Node.js** (v16 or higher)
  - **macOS**: Install via [Homebrew](https://brew.sh/) with `brew install node`, or download from [nodejs.org](https://nodejs.org/)
  - **Windows 11**: Download the installer from [nodejs.org](https://nodejs.org/) and run it

## Run Locally

### macOS (Apple Silicon & Intel)

1. Open Terminal

2. Navigate to the UI directory:
   ```bash
   cd llm-sanitizer_UI
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

### Windows 11

1. Open Command Prompt or PowerShell

2. Navigate to the UI directory:
   ```cmd
   cd llm-sanitizer_UI
   ```

3. Install dependencies:
   ```cmd
   npm install
   ```

4. Run the development server:
   ```cmd
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

## Build for Production

### macOS
```bash
npm run build
```

### Windows 11
```cmd
npm run build
```

The built files will be in the `dist` directory.

## How It Works

1. **Configure your dictionary** - Add sensitive terms and their placeholders in the Vault
2. **Sanitize** - Paste your text and click "Sanitize & Copy" to replace sensitive terms
3. **Use with LLM** - Paste the sanitized text into ChatGPT, Claude, or any LLM
4. **Desanitize** - Copy the LLM response back and click "Desanitize" to restore original terms

## Project Documentation

- [Product Requirements Document](../llmSanitizer_PRD.md)
- [Development Guidelines](../CLAUDE.md)
