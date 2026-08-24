# ⚡ Ghostwriter: AI-Augmented Technical Intelligence & Newsletter Ghostwriting

> **Transform multi-channel raw tech signals into executive-ready newsletters complete with real-time Google Search grounding, interactive Mermaid architecture diagrams, dynamic charts, audio briefings, and Google Workspace integration.**

---

## 🌟 Overview

**Ghostwriter** is an elite AI-powered technical intelligence and newsletter creation platform. Designed for CTOs, lead architects, engineering managers, and technical writers, Ghostwriter automates the discovery, verification, architectural diagramming, and publishing workflow for high-signal tech watch reports.

### ✨ Key Features

- **Multi-Source Ingestion & Social Media Hub**: Ingest raw text, markdown, RSS links, or live feeds from **X/Twitter**, **Reddit**, **Hacker News**, and **GitHub Trending**.
- **Real-Time Google Search Grounding**: Corroborates breaking news, library version releases, and CVE benchmarks against live web sources using Gemini's native search grounding tools.
- **Automated Architectural Diagrams**: Generates clean, declarative **Mermaid.js** flowcharts, sequence diagrams, and system architecture maps directly inside the synthesis.
- **Dynamic Data & Benchmark Visualizations**: Renders interactive **Recharts** charts for adoption rates, latency benchmarks, and performance metrics.
- **Audio Briefings (TTS)**: Built-in narrated audio briefings with playback speed control and section navigation.
- **Firebase Firestore Persistence**: Real-time cloud synchronization for newsletter editions, drafts, and telemetry metrics with user-isolated security rules.
- **Google Workspace Ecosystem**:
  - 📄 Direct export to **Google Docs** & **Google Drive**.
  - 📅 Cadence scheduling via **Google Calendar**.
  - 📥 Custom Drive file importer.
- **Multi-Format Export Suite**: Export instantly to **HTML**, **PDF**, **Markdown**, **Word (.docx)**, **CSV**, and raw text.
- **Keyword Density & Signal Radar**: Visualizes trending keywords, topic clusters, and signal weights across ingested sources.

---

## 🛠️ Architecture & Tech Stack

```mermaid
graph TD
    A[Raw Feeds: X, Reddit, RSS, Docs, Web] --> B[Express & Node.js Backend API]
    B --> C[Gemini 2.5/3.7 Engine + Google Search Grounding]
    C --> D[Structured Technical Synthesis & Mermaid Architecture]
    D --> E[React 18 Frontend + Tailwind CSS]
    E --> F[Firebase Firestore + Google Auth]
    E --> G[Google Workspace: Drive, Docs, Calendar]
    E --> H[Multi-Format Exporters: PDF, DOCX, HTML, MD]
Core Stack
Frontend: React 18, TypeScript, Tailwind CSS, Vite, Framer Motion (motion/react), Lucide React.
Visuals & Charts: Mermaid.js, Recharts, Canvas Confetti.
AI & Grounding: @google/genai (Gemini 2.5 Flash / Gemini 3.7 Flash) with Google Search Tool Grounding.
Backend: Node.js, Express, RESTful /api endpoints.
Database & Auth: Firebase Firestore, Firebase Authentication (Google OAuth 2.0).
Document Generation: docx, jspdf, html2canvas.
🚀 Getting Started
Prerequisites
Node.js (v18+ or v20+)
npm or pnpm
Google Gemini API Key
Firebase Project with Firestore and Google Authentication enabled
Installation
Clone the repository:
code
Bash
git clone https://github.com/your-username/ghostwriter-tech-watch.git
cd ghostwriter-tech-watch
Install dependencies:
code
Bash
npm install
Configure Environment Variables:
Create a .env file in the root directory:
code
Env
GEMINI_API_KEY=your_gemini_api_key_here
Start the Development Server:
code
Bash
npm run dev
Open http://localhost:3000 in your browser.
Build for Production:
code
Bash
npm run build
npm start
🔒 Security & Firestore Rules
User data and newsletters are partitioned by authenticated UID:
code
JavaScript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

code
Code
