# APTIV — AI-Powered Talent Intelligence Platform

**Redrob Hackathon Submission · India Runs Data & AI Challenge**  
Team: **Dev DUO**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://india-runs-hackathon-team-dev-duo.vercel.app/)
[![Streamlit Sandbox](https://img.shields.io/badge/Ranker%20Sandbox-Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://india-runs-hackathonteam-dev-duo.streamlit.app/)

> **Dashboard:** [https://india-runs-hackathon-team-dev-duo.vercel.app/](https://india-runs-hackathon-team-dev-duo.vercel.app/)  
> **Ranker Sandbox:** [https://india-runs-hackathonteam-dev-duo.streamlit.app/](https://india-runs-hackathonteam-dev-duo.streamlit.app/)

---

## What is APTIV?

APTIV is an AI-powered Talent Intelligence Platform built on top of the Redrob candidate dataset. It goes beyond traditional ATS keyword matching by using **Career DNA profiling**, **Learning Velocity scoring**, and **Future Readiness signals** to surface the best candidates for AI/ML roles.

The platform has two layers:

| Layer | What it does |
|---|---|
| **Python ranking pipeline** (`rank.py`) | Scores and ranks 100K candidates in ~60s on CPU — no GPU, no network calls |
| **APTIV React Dashboard** | Visualises ranked candidates with Career DNA radar charts, evidence panels, and AI-generated roadmaps |

---

## Ranking Pipeline

### How candidates are scored

Five weighted components combine into a composite score:

| Component | Weight | Signal |
|---|---|---|
| Skill relevance | 35% | AI/ML/NLP/Search/VectorDB taxonomy — endorsement + duration trust multiplier to catch keyword stuffers |
| Experience fit | 20% | 5–9 years is the optimal window; penalties for under/over |
| Behavioral signals | 20% | GitHub activity, interview completion rate, skill assessment scores |
| Availability | 15% | Notice period (sub-30d preferred), open-to-work flag, recruiter response rate |
| Location | 10% | Tier-1 India cities (Noida, Pune, Bangalore, Hyderabad, Delhi, Mumbai) |

### Disqualification rules

Applied before scoring — a disqualified candidate never enters the ranked pool:

1. **Honeypot detection** — `expert` or `advanced` proficiency with `0` months duration is an immediate filter
2. **All-consulting disqualifier** — candidates whose entire career history is at Big-IT services firms (TCS, Infosys, Wipro, Accenture, Cognizant, Capgemini, etc.) are excluded
3. **Pure academia** — candidates with only university / research-institute roles and no industry experience are filtered out

---

## Setup

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+
- The dataset file: `candidates.jsonl` (from the challenge portal)

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Place the dataset

Put the dataset in the expected location relative to the project root:

```
[PUB] India_runs_data_and_ai_challenge/
  [PUB] India_runs_data_and_ai_challenge/
    India_runs_data_and_ai_challenge/
      candidates.jsonl
```

---

## Running the ranking pipeline

### Generate `submission.csv`

```bash
python rank.py
```

Reads `candidates.jsonl`, applies disqualification rules, scores all eligible candidates, and writes the top-100 ranked submission:

```
Reading candidates.jsonl …
  processed 10,000 lines …
  …
Read 100,000 candidates; disqualified 14,476; eligible 85,524
Top 100 candidates ranked.
Submission written to submission.csv
```

You can also point to a custom path:

```bash
python rank.py --candidates path/to/candidates.jsonl --out my_submission.csv
```

### Validate the submission

```bash
python "[PUB] India_runs_data_and_ai_challenge/[PUB] India_runs_data_and_ai_challenge/India_runs_data_and_ai_challenge/validate_submission.py" submission.csv
# Submission is valid.
```

### Sync top candidates into the dashboard

```bash
python sync_candidates.py --top 20
```

This streams `candidates.jsonl`, finds the top-20 ranked candidates, derives all Career DNA dimensions, tags, roadmaps, and evidence bundles from their Redrob signals, and overwrites `src/data/mockCandidates.ts` with real data.

---

## Running the dashboard locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The dashboard shows the real top-ranked candidates with:
- **Career DNA Radar** — 6-dimension profile (Builder, Innovator, Researcher, Leader, Collaborator, ProblemSolver)
- **DNA Evidence Panel** — explainable signal-level breakdown per dimension
- **AIVA Recruiter Assistant** — AI chat grounded on candidate profiles
- **AIVA Career Coach** — candidate-facing roadmap and profile audit

### Production build

```bash
npm run build
```

Output goes to `dist/`.

---

## Project structure

```
├── rank.py                  # Hackathon ranking pipeline (stdlib-only, no GPU)
├── sync_candidates.py       # Converts ranked candidates → TypeScript mock data
├── submission.csv           # Final ranked top-100 (validator-approved)
├── submission_metadata.yaml # Hackathon portal metadata
├── src/
│   ├── App.tsx              # Root — tab navigation, candidate state, upload handler
│   ├── components/
│   │   ├── RecruiterDashboard.tsx  # Ranked candidate list, DNA radar/evidence toggle
│   │   ├── AIChatTab.tsx           # AIVA Recruiter Assistant
│   │   ├── SourcesTab.tsx          # AIVA Sources Workspace (grounded RAG chat)
│   │   ├── CandidateCoach.tsx      # AIVA Career Coach
│   │   ├── RadarChart.tsx          # SVG Career DNA radar chart
│   │   └── DNAEvidencePanel.tsx    # Career DNA Engine 2.0 evidence panel
│   ├── data/
│   │   └── mockCandidates.ts       # Real top-ranked candidates (auto-generated)
│   └── utils/
│       ├── ragEngine.ts            # TF-based in-memory RAG index
│       └── dnaEngine.ts            # Career DNA Engine 2.0 scoring
└── public/
    └── aiva-logo*.png              # AIVA brand assets
```

---

## Tech stack

- **React 19 + TypeScript** (strict mode)
- **Vite** — bundler and dev server
- **Custom CSS** — glassmorphism design system with dark/light theme via CSS variables
- **PDF.js + Mammoth** — client-side document parsing
- **Python 3** (stdlib-only) — ranking pipeline, zero external dependencies

---

## Team

**Dev DUO** · [vanamjothik@gmail.com](mailto:vanamjothik@gmail.com)
