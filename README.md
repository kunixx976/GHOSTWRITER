# 👻 Academic Ghostwriter

**High-Fidelity Study Extraction Engine**

Academic Ghostwriter is a premium, AI intelligence platform designed to deconstruct lecture noise, dense PDFs, and complex presentations into structural clarity. Built with a multimodal agentic core (Gemini 2.0 Flash & GPT-4o), it provides near-instant synthesis with a high-end, cinematic user experience and a brutalist-glass aesthetic.

---

## ✨ Key Features

- **🚀 Multimodal Intelligence**: Process PDFs, PowerPoint slides, Word documents, and lecture recordings (MP3/MP4) via Gemini's multimodal window.
- **🧠 Autonomous Agent Core**: Deploy a multi-agent stack featuring the **Archivist** (Indexing), **Listener** (Parsing), and **Ghostwriter** (Synthesis) to reconstruct knowledge.
- **📊 Logic Decompiler**: Automatically decompile technical complexity into visual Mermaid.js diagrams and atomic knowledge fragments.
- **🎯 Exam Predictor**: Integrated probability analysis to extract high-probability patterns and calculate exam likelihood from source material.
- **📅 Productivity Suite**: A complete Notion-inspired academic workspace:
  - **The Atomic Vault**: A modular repository combining verified knowledge blocks and Quick Notes for rapid capture.
  - **Task Board**: Manage your study workflow with a tactile Kanban interface.
  - **Calendar**: Synchronize your academic schedule with intelligent deadline tracking.
  - **Study Plan**: Generate automated, exam-focused preparation timelines.
- **🎓 Interactive Learning**:
  - **Simulation Lab & Smart Flashcards**: AI examiner, mocks, mark schemes, and rapid revision via auto-generated study cards.
  - **Visual Mapping**: Interactive Dependency Matrix and Knowledge Graph combined.
- **💎 Ultra-Premium Design**:
  - Kinetic Bento-grid layouts and cinematic Three.js Nebula scenes.
  - Glassmorphic components with real-time backdrop blurs and particle trails.
  - High-fidelity System Status matrix with live latency and node metrics.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **AI Engine**: [OpenAI GPT-4o](https://openai.com/), [LangChain](https://www.langchain.com/)
- **Database**: [Prisma](https://www.prisma.io/) with [Supabase](https://supabase.com/)
- **Visuals**: [Three.js](https://threejs.org/) (React Three Fiber), [Mermaid.js](https://mermaid.js.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Parsing**: [OfficeParser](https://www.npmjs.com/package/officeparser), [PDF-Parse](https://www.npmjs.com/package/pdf-parse)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kunixx976/GHOSTWRITER.git
cd GHOSTWRITER
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

---

## 📂 Project Structure

- `app/workflow-assistant/`: Custom study extraction and synthesis engine.
- `app/predictor/`: AI-powered exam probability and pattern analysis.
- `app/decompiler/`: Logic deconstruction and Mermaid diagram generation.
- `app/knowledge-graph/`: Visual mapping combining dependency matrices and knowledge graphs.
- `app/vault/`: The Atomic Vault, combining modular blocks and quick notes.
- `app/dashboard/`: Centralized control hub for academic metrics and agents.
- `app/tasks/`: Notion-like task board for workflow management.
- `app/simulation-lab/`: AI examiner, mock interviews, and mark schemes.
- `app/study-plan/`: Automated preparation timeline generator.
- `src/components/`: Modular UI units (Three.js scenes, Bento cards, System Status matrix).

---

## 🎨 Design Philosophy

Academic Ghostwriter follows a **"Brutalist-Glass"** aesthetic—fusing sharp, bold typography with soft, translucent materials and vibrant neon accents. Every interaction is designed to feel tactile, responsive, and "alive," aiming to turn the friction of studying into a high-fidelity cinematic experience.

---

*“Distilling lecture noise into exam-day clarity with structural intelligence.”*

