# Note Sphere

[![BuildWithAI](https://img.shields.io/badge/BuildWithAI-%23BuildWithAI-0078D4?style=for-the-badge&logo=google&logoColor=white)](https://events.withgoogle.com/build-with-ai/)
[![Gemini](https://img.shields.io/badge/Gemini-API-0ea5e9?style=for-the-badge&logo=google&logoColor=white)](https://developers.generativeai.google/)
[![Google Developers](https://img.shields.io/badge/Google%20for%20Developers-Developer%20Tools-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Platform-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com)
[![Major League Hacking](https://img.shields.io/badge/Major%20League%20Hacking-MLH-DC2626?style=for-the-badge&logo=mlh&logoColor=white)](https://mlh.io)

Note Sphere is an AI-native study and collaboration platform designed to help students turn scattered notes, documents, and routines into structured knowledge. It combines multimodal note processing, an AI study companion, knowledge graph exploration, semester planning, task management, and sharing tools in one workspace.

This project was built for Build With AI Hack Days @DIU, a fast-paced in-person mini hackathon powered by Google for Developers, Gemini, and .XYZ, organized by Machine Learning Bangladesh with support from Major League Hacking (MLH), in collaboration with the Department of Information Technology & Management (ITM), Daffodil International University.

Note Sphere was one of the winners at the event and received Google Swag Kits.

## What It Does

- Upload notes, images, PDFs, and other study material for AI-assisted processing.
- Chat with your notes to extract answers, summaries, and study guidance.
- Generate preparation summaries, quizzes, and high-yield review content.
- Organize semesters, tasks, and study plans in a single dashboard.
- Explore relationships between notes with a knowledge graph view.
- Share notes and collaborate in dedicated rooms.
- Use the Holmes Scanner for quick, detective-style academic scanning workflows.

## Tech Stack

- React 19 + TypeScript
- Vite
- Express server with Gemini API integration
- Tailwind CSS v4
- Motion, Lucide, D3 force graph, react-dropzone, and jsPDF

## Repository Safety

- Secrets are kept out of the repository through `.gitignore`, including `.env` files and build outputs.
- Generated artifacts such as `dist/`, `build/`, and `node_modules/` are ignored.
- A sample environment file is included as [.env.example](.env.example).

## Getting Started

### Prerequisites

- Node.js 18 or newer
- A Gemini API key

### Install

```bash
npm install
```

### Environment Variables

Create a local environment file and add your key:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

You can use [.env.example](.env.example) as the starting point.

### Run Locally

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Start the Production Server

```bash
npm run start
```

### Type Check

```bash
npm run lint
```

## Project Structure

- `src/` contains the React application and UI components.
- `server.ts` hosts the Gemini-powered API endpoints.
- `index.html` sets the browser tab title and app shell.

## Screenshots

Below are representative screens from Note Sphere. Click any image to view the full-resolution version in the repository.

- Dashboard

	![Dashboard](public/screenshots/1_Dashboard.png)

- Create Note

	![Create Note](public/screenshots/2_Create Note.png)

- Semester Management

	![Semester Management](public/screenshots/3_Semester Management.png)

- Tasks Manager

	![Tasks Manager](public/screenshots/4_Tasks Manager.png)

- My Notes

	![My Notes](public/screenshots/5_My Notes.png)

- Preparation Mode

	![Preparation Mode](public/screenshots/6_Prep Mode.png)

- Sharing Room

	![Sharing Room](public/screenshots/7_Sharing Room.png)

- AI Study Toolkit

	![AI Study Toolkit](public/screenshots/8_AI Study Toolkit.png)

- Ask Your Notes

	![Ask Your Notes](public/screenshots/9_Ask Your Notes.png)

- Knowledge Graph

	![Knowledge Graph](public/screenshots/10_Knowledge Graph.png)

- Trash Bin

	![Trash Bin](public/screenshots/11_Trash Bin.png)

- Holmes Scanner

	![Holmes Scanner](public/screenshots/12_Holmes Scanner.png)


## Developed By

Supan Roy

contact@supanroy.com

## License

This project is released under the MIT License — see the [LICENSE](LICENSE) file for details.
