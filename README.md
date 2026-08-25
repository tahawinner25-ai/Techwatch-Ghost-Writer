# ⚡ TechWatch Ghostwriter AI

> **The Technical Intelligence Agent turning raw web signals into elite engineering newsletters & architecture briefs.**  
> Powered by **Google Gemini 2.5/3.7 Flash**, **Google Search Grounding**, **React 18**, **Node.js/Express**, and **Firebase Firestore**.

---

## 🎯 Problem & Solution

- **The Problem:** Tech Leads, CTOs, and Staff Engineers spend 5 to 10 hours every week scanning X (Twitter), Hacker News, GitHub Trending, and Reddit for tech radar updates, struggling to extract structured architectural insights for their teams.
- **The Ghostwriter Solution:** An end-to-end AI engineering pipeline that ingests raw feeds or unstructured notes, fact-checks and corroborates with the live web using **Google Search Grounding**, generates **declarative Mermaid.js architecture diagrams**, compiles **comparative Recharts benchmark curves**, persists editions to **Firebase Firestore**, and enables 1-click exports to **Google Workspace** (Google Docs, Drive, and Google Calendar).

---

## 🌟 Key Features

1. **🧠 Anti-Slop Editorial Synthesis (Gemini 2.5 / 3.7 Flash):**
   - Extracts top 3 high-impact innovations with real operational impact, concrete metrics, and source links.
   - Persona-tailored audience tones (*CTO & Decision Makers*, *Tech Leads & Architects*, *Senior Developers*).
2. **🔍 Real-Time Fact-Checking & Google Search Grounding:**
   - Verifies announcements and benchmark claims against live web sources to eliminate AI hallucinations.
3. **📊 Dynamic Architecture Diagrams & Interactive Benchmarks:**
   - Auto-generates declarative Mermaid.js flowcharts and system architecture maps.
   - Interactive metric comparison charts powered by Recharts (latency, throughput, memory).
4. **🎙️ Executive Audio Briefing (Text-to-Speech):**
   - In-app voice synthesis player to listen to the briefing on the go.
5. **☁️ Cloud Persistence & Google Workspace Workflow:**
   - Real-time cloud sync with **Firebase Firestore** with full history edition retrieval.
   - 1-click export to **Google Docs** and downloadable production assets (Responsive HTML email, Markdown).
   - Automated dispatch scheduling into **Google Calendar**.

---

## 🛠️ Technical Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Mermaid.js, Recharts, Motion.
- **Backend & APIs:** Node.js, Express, Google Gen AI SDK (`@google/genai`).
- **Google AI Models:** `gemini-2.5-flash`, `gemini-3.7-flash`, Google Search Grounding Tool.
- **Database & Auth:** Firebase Authentication, Cloud Firestore.

---

## 🚀 Quickstart & NPM Run Commands

### 1. Prerequisites
- **Node.js** (v18+ or v20+ recommended)
- **NPM** (v9+ or v10+)
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/techwatch-ghostwriter.git
cd techwatch-ghostwriter
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### 4. Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the full-stack Express server with Vite middleware on `http://localhost:3000` |
| `npm run build` | Builds the client-side SPA (`dist/`) and bundles the server with `esbuild` (`dist/server.cjs`) |
| `npm run start` | Runs the compiled production server (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) to ensure zero errors |
| `npm run clean` | Cleans up previous build artifacts (`dist/`) |

---

## 🧪 STEP-BY-STEP REAL TEST INSTRUCTIONS

Follow these scenarios to test and demonstrate the application:

### 📋 Scenario 1: Feed Ingestion & AI Synthesis with Search Grounding
1. Sign in with your Google account (or continue with local session).
2. In the left panel **"Raw Signals & Ingestion"**, pick one of two options:
   - **Option A (Instant Demo Preset):** Click *"🚀 R&D Demo Ingestion"* to load realistic technical updates (e.g., PostgreSQL 17, Bun runtime benchmarks, kernel security patches).
   - **Option B (Custom Raw Notes):** Paste your own unstructured raw bullet points or links.
3. Select your target persona (e.g., **"CTO & Executive Decision Makers"** or **"Tech Leads & Architects"**).
4. Click **"⚡ Generate Technical Newsletter"**.
5. **Expected Outcome:**
   - Real-time generation of the editorial section and the 3 key innovations with architecture impact and grounded web sources.
   - Green Google Search Grounding verification badge appears.

---

### 📊 Scenario 2: Testing Mermaid Diagrams & Benchmark Charts
1. Scroll down to the **"Architecture & Benchmark Visualizations"** section.
2. **Mermaid Flowchart:**
   - Inspect the automatically rendered system architecture diagram.
   - Click *"Expand / Zoom Diagram"* to explore interactive nodes.
3. **Recharts Benchmark:**
   - Hover over the comparative performance bars/lines to inspect throughput, latency, or memory metrics.

---

### 🎙️ Scenario 3: Testing Executive Audio Briefing (TTS)
1. Locate the **"Executive Audio Briefing"** card at the top of the preview pane.
2. Click **"▶️ Play Briefing"**.
3. **Expected Outcome:** In-browser audio playback reads the editorial synthesis and key takeaway with a synchronized progress bar.

---

### 💾 Scenario 4: Testing Firestore Persistence & History
1. Click **"💾 Save Edition to Cloud History"**.
2. Click the **"📚 Edition History"** icon in the navigation bar.
3. **Expected Outcome:** The edition appears with its date, title, and evaluation score. Click on any past entry to reload it instantly.

---

### 📤 Scenario 5: Testing Google Workspace Exports
1. Click **"📤 Export / Dispatch"**:
   - **Google Docs Test:** Click *"Copy & Open in Google Docs"*. The formatted content is copied to your clipboard and a fresh Google Docs tab opens for 1-click paste (`Ctrl+V` / `Cmd+V`).
   - **Responsive HTML Test:** Click *"Download HTML Email"* to obtain a production-ready responsive email template for Substack, Mailchimp, or SendGrid.
   - **Google Calendar Scheduling:** Click *"Schedule in Google Calendar"*, pick an upcoming dispatch date, and confirm. The calendar event is generated with the structured agenda pre-filled.

---

## 🔒 Security & Architecture Standards

- **Server-Side AI Proxying:** All Gemini API calls and Search Grounding tools execute exclusively within Node.js routes (`/api/generate-newsletter`). No API keys or tokens are ever exposed to client browsers.
- **Firestore Security Rules:** Access is restricted to authenticated users with tenant isolation enforced per `userId`.

---

## 📄 License
Released under the MIT License.
