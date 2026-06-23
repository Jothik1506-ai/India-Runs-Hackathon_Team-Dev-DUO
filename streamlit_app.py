"""
APTIV — Redrob Hackathon Candidate Ranker · Streamlit Sandbox
Upload a candidates.jsonl sample and get a ranked CSV back in seconds.
"""

import csv
import io
import json
import sys
import time

import streamlit as st

# ── Import ranking logic from rank.py ────────────────────────────────────────
sys.path.insert(0, ".")
from rank import rank_candidates as _rank_jsonl, is_honeypot, is_pure_consulting, is_pure_academia

st.set_page_config(
    page_title="APTIV · Redrob Ranker",
    page_icon="🧬",
    layout="wide",
)

# ── Header ────────────────────────────────────────────────────────────────────
st.markdown("""
<h1 style='margin-bottom:0'>🧬 APTIV — Intelligent Candidate Ranker</h1>
<p style='color:#888;margin-top:4px'>Redrob Hackathon · India Runs Data & AI Challenge · Team Dev DUO</p>
""", unsafe_allow_html=True)

st.markdown("---")

col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("""
    ### How it works
    Upload a `candidates.jsonl` file (one JSON candidate per line) and the ranker will:

    1. **Disqualify** honeypots, all-consulting, and pure-academia profiles
    2. **Score** each candidate across 5 weighted components
    3. **Rank** and return the top candidates as a downloadable CSV

    | Component | Weight | Signal |
    |---|---|---|
    | Skill relevance | 35% | AI/ML/NLP/Search/VectorDB taxonomy + trust multiplier |
    | Experience fit | 20% | Optimal window: 5–9 years |
    | Behavioral signals | 20% | GitHub activity, interview rate, assessments |
    | Availability | 15% | Notice period, open-to-work, response rate |
    | Location | 10% | Tier-1 India cities preferred |
    """)

with col2:
    st.markdown("""
    ### Disqualifiers
    Applied before scoring:

    - **Honeypot** — `expert`/`advanced` skill with 0 months use
    - **All-consulting** — entire career at Big-IT services firms only
    - **Pure academia** — only university/research roles, no industry experience

    ### Links
    - [Live Dashboard](https://india-runs-hackathon-team-dev-duo.vercel.app/)
    - [GitHub Repo](https://github.com/Jothik1506-ai/India-Runs-Hackathon_Team-Dev-DUO)
    """)

st.markdown("---")

# ── File uploader ─────────────────────────────────────────────────────────────
st.subheader("Upload candidates.jsonl")

uploaded = st.file_uploader(
    "Choose a .jsonl file (any size — the full 100K dataset works too)",
    type=["jsonl", "json"],
    help="Each line must be a valid JSON object matching the Redrob candidate schema.",
)

top_n = st.slider("Number of top candidates to rank", min_value=10, max_value=100, value=100, step=10)

if uploaded:
    run_btn = st.button("Run Ranker", type="primary")

    if run_btn:
        # Write upload to a temp buffer and pass to ranker
        content = uploaded.read().decode("utf-8")
        lines = [l.strip() for l in content.splitlines() if l.strip()]
        total = len(lines)

        st.info(f"Read **{total:,}** candidate lines. Running pipeline…")
        progress = st.progress(0, text="Disqualifying and scoring…")

        # Score inline (re-use rank.py logic via a StringIO-compatible path)
        import pathlib, tempfile, os

        with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False, encoding="utf-8") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        start = time.time()
        try:
            rows = _rank_jsonl(pathlib.Path(tmp_path), top_n=top_n)
        finally:
            os.unlink(tmp_path)

        elapsed = time.time() - start
        progress.progress(1.0, text="Done!")

        st.success(f"Ranked **{len(rows)}** candidates in **{elapsed:.1f}s**")

        # ── Results table ─────────────────────────────────────────────────────
        st.subheader("Ranked Results")

        import pandas as pd
        df = pd.DataFrame(rows)
        df["score"] = df["score"].map(lambda x: f"{x:.4f}")
        st.dataframe(df, use_container_width=True, height=420)

        # ── Download ──────────────────────────────────────────────────────────
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=["candidate_id", "rank", "score", "reasoning"])
        writer.writeheader()
        writer.writerows(rows)

        st.download_button(
            label="Download submission.csv",
            data=buf.getvalue().encode("utf-8"),
            file_name="submission.csv",
            mime="text/csv",
        )

        # ── Stats ─────────────────────────────────────────────────────────────
        st.markdown("---")
        st.subheader("Pipeline stats")

        disq = 0
        honeypots = 0
        consulting = 0
        academia = 0
        for line in lines:
            try:
                c = json.loads(line)
            except Exception:
                continue
            skills = c.get("skills") or []
            career = c.get("career_history") or []
            if is_honeypot(skills):
                honeypots += 1
                disq += 1
            elif is_pure_consulting(career):
                consulting += 1
                disq += 1
            elif is_pure_academia(career):
                academia += 1
                disq += 1

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Total candidates", f"{total:,}")
        c2.metric("Disqualified", f"{disq:,}", delta=f"-{disq/total*100:.1f}%", delta_color="inverse")
        c3.metric("Eligible", f"{total - disq:,}")
        c4.metric("Ranked output", f"{len(rows)}")

        with st.expander("Disqualification breakdown"):
            st.markdown(f"- **Honeypots** (expert skill, 0 months use): **{honeypots}**")
            st.markdown(f"- **All-consulting** (100% Big-IT services career): **{consulting}**")
            st.markdown(f"- **Pure academia** (no industry roles): **{academia}**")

else:
    st.info("Upload a `candidates.jsonl` file above to get started. You can use the sample from the challenge dataset or the full 100K file.")

    # Show a sample of what the output looks like
    with st.expander("See sample output format"):
        st.code("""candidate_id,rank,score,reasoning
CAND_0018499,1,1.0,Senior Machine Learning Engineer | 11 AI core skills | 7.2 yrs exp | 15d notice | 0.61 response rate.
CAND_0027691,2,0.9919,Strong 8-skill AI/NLP match; 6.5 yrs as NLP Engineer; 15d notice; loc: Pune, Maharashtra.
CAND_0011687,3,0.9838,Based in Indore. 9 AI/ML skills aligned; 7.8 yrs exp; 15d notice period.
""", language="csv")

st.markdown("---")
st.caption("APTIV · Team Dev DUO · Redrob Hackathon 2025 · [vercel deployment](https://india-runs-hackathon-team-dev-duo.vercel.app/)")
