"""
APTIV — Redrob Hackathon Candidate Ranker · Streamlit Sandbox
Upload a candidates.jsonl sample and get a ranked CSV back in seconds.
"""

import csv
import io
import json
import os
import pathlib
import sys
import tempfile
import time

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, ".")
from rank import is_honeypot, is_pure_academia, is_pure_consulting
from rank import rank_candidates as _rank_jsonl

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="APTIV · Candidate Ranker",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Global CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
/* ── Base & fonts ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

/* ── Dark background ── */
.stApp {
    background: #0a0d14;
}

/* ── Hide Streamlit chrome ── */
#MainMenu, footer, header { visibility: hidden; }
.block-container { padding-top: 1.5rem; padding-bottom: 2rem; }

/* ── Glassmorphism card ── */
.glass-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(12px);
    margin-bottom: 1rem;
}

/* ── Hero ── */
.hero-title {
    font-size: 2.6rem;
    font-weight: 700;
    background: linear-gradient(135deg, #00D4AA 0%, #7C3AED 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
    margin: 0;
}
.hero-sub {
    color: #6b7280;
    font-size: 1rem;
    margin-top: 0.4rem;
    font-weight: 400;
}
.hero-badges { display: flex; gap: 0.6rem; margin-top: 1.2rem; flex-wrap: wrap; }
.badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
}
.badge:hover { opacity: 0.8; }
.badge-vercel { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: #fff; }
.badge-streamlit { background: rgba(255,75,75,0.15); border: 1px solid rgba(255,75,75,0.3); color: #FF4B4B; }
.badge-github { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); color: #a78bfa; }

/* ── Score pill ── */
.score-pill {
    display: inline-block;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
}
.score-high   { background: rgba(0,212,170,0.15); color: #00D4AA; border: 1px solid rgba(0,212,170,0.3); }
.score-medium { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
.score-low    { background: rgba(239,68,68,0.15);  color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }

/* ── Rank badge ── */
.rank-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 2rem; height: 2rem;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 700;
}
.rank-gold   { background: linear-gradient(135deg,#f59e0b,#d97706); color:#fff; }
.rank-silver { background: linear-gradient(135deg,#9ca3af,#6b7280); color:#fff; }
.rank-bronze { background: linear-gradient(135deg,#b45309,#92400e); color:#fff; }
.rank-std    { background: rgba(255,255,255,0.08); color: #9ca3af; }

/* ── Candidate card ── */
.cand-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 1.1rem 1.3rem;
    margin-bottom: 0.65rem;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
    overflow: hidden;
}
.cand-card::before {
    content: '';
    position: absolute; top: 0; left: 0;
    width: 3px; height: 100%;
    background: linear-gradient(180deg,#00D4AA,#7C3AED);
    border-radius: 3px 0 0 3px;
}
.cand-card:hover {
    border-color: rgba(0,212,170,0.25);
    background: rgba(0,212,170,0.04);
}
.cand-name { font-weight: 600; font-size: 0.95rem; color: #f3f4f6; margin: 0; }
.cand-title { color: #6b7280; font-size: 0.8rem; margin: 0.15rem 0 0.6rem 0; }
.cand-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #9ca3af; flex-wrap: wrap; }
.cand-meta span { display: flex; align-items: center; gap: 0.25rem; }
.skill-pill {
    display: inline-block;
    background: rgba(124,58,237,0.12);
    border: 1px solid rgba(124,58,237,0.25);
    color: #a78bfa;
    border-radius: 6px;
    padding: 0.15rem 0.55rem;
    font-size: 0.7rem;
    font-weight: 500;
    margin: 0.1rem;
}

/* ── Section header ── */
.section-header {
    font-size: 1.15rem;
    font-weight: 600;
    color: #e5e7eb;
    margin: 1.5rem 0 0.8rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.section-header::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin-left: 0.5rem;
}

/* ── Metric card ── */
.metric-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 1.2rem 1.4rem;
    text-align: center;
}
.metric-value { font-size: 2rem; font-weight: 700; color: #f3f4f6; margin: 0; line-height: 1; }
.metric-label { font-size: 0.75rem; color: #6b7280; margin-top: 0.3rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
.metric-delta { font-size: 0.78rem; margin-top: 0.2rem; font-weight: 600; }
.delta-red   { color: #ef4444; }
.delta-green { color: #00D4AA; }

/* ── Weight bar ── */
.weight-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.55rem; }
.weight-label { font-size: 0.78rem; color: #9ca3af; width: 130px; flex-shrink: 0; }
.weight-bar-bg { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.weight-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg,#00D4AA,#7C3AED); }
.weight-pct { font-size: 0.75rem; color: #00D4AA; font-weight: 600; width: 32px; text-align: right; }

/* ── Divider ── */
.divider { height: 1px; background: rgba(255,255,255,0.07); margin: 1.5rem 0; }

/* ── Upload zone hint ── */
.upload-hint {
    text-align: center;
    padding: 2rem 1rem;
    color: #4b5563;
    font-size: 0.85rem;
}
.upload-hint-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

/* ── Reasoning text ── */
.reasoning-text { font-size: 0.78rem; color: #6b7280; font-style: italic; margin-top: 0.4rem; }

/* ── Streamlit override: sidebar ── */
[data-testid="stSidebar"] {
    background: #0d1017;
    border-right: 1px solid rgba(255,255,255,0.06);
}
[data-testid="stSidebar"] .block-container { padding-top: 1.5rem; }

/* ── Button ── */
.stButton > button {
    background: linear-gradient(135deg, #00D4AA, #7C3AED) !important;
    color: white !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    padding: 0.55rem 2rem !important;
    font-size: 0.9rem !important;
    width: 100%;
    transition: opacity 0.2s !important;
}
.stButton > button:hover { opacity: 0.88 !important; }

/* ── Download button ── */
.stDownloadButton > button {
    background: rgba(0,212,170,0.1) !important;
    border: 1px solid rgba(0,212,170,0.35) !important;
    color: #00D4AA !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    width: 100% !important;
}

/* ── Progress bar ── */
.stProgress > div > div { background: linear-gradient(90deg,#00D4AA,#7C3AED) !important; }

/* ── Slider ── */
.stSlider [data-baseweb="slider"] { padding: 0 0.25rem; }
</style>
""", unsafe_allow_html=True)


# ── Helpers ───────────────────────────────────────────────────────────────────

def score_color_class(score: float) -> str:
    if score >= 0.75: return "score-high"
    if score >= 0.45: return "score-medium"
    return "score-low"


def rank_badge_class(rank: int) -> str:
    if rank == 1: return "rank-gold"
    if rank == 2: return "rank-silver"
    if rank == 3: return "rank-bronze"
    return "rank-std"


def skill_pills_html(skills: list, max_show: int = 6) -> str:
    shown = skills[:max_show]
    html = "".join(f'<span class="skill-pill">{s}</span>' for s in shown)
    if len(skills) > max_show:
        html += f'<span class="skill-pill">+{len(skills)-max_show} more</span>'
    return html


def score_bar_html(score: float) -> str:
    pct = int(score * 100)
    color = "#00D4AA" if pct >= 75 else "#fbbf24" if pct >= 45 else "#ef4444"
    return f"""
    <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
            <div style="width:{pct}%;height:100%;background:{color};border-radius:3px"></div>
        </div>
        <span style="font-size:0.72rem;color:{color};font-weight:700;width:36px">{score:.3f}</span>
    </div>"""


# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown("""
    <div style="text-align:center;padding-bottom:1.2rem;border-bottom:1px solid rgba(255,255,255,0.07)">
        <div style="font-size:1.6rem;font-weight:800;background:linear-gradient(135deg,#00D4AA,#7C3AED);
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
            APTIV
        </div>
        <div style="font-size:0.7rem;color:#4b5563;letter-spacing:0.1em;text-transform:uppercase;margin-top:2px">
            AI Talent Intelligence
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<div style='height:1rem'></div>", unsafe_allow_html=True)
    st.markdown("<div style='font-size:0.7rem;color:#4b5563;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;margin-bottom:0.6rem'>PIPELINE CONTROLS</div>", unsafe_allow_html=True)

    uploaded = st.file_uploader(
        "candidates.jsonl",
        type=["jsonl", "json"],
        help="Upload the Redrob candidates dataset. Each line = one candidate JSON.",
        label_visibility="visible",
    )

    top_n = st.slider("Top N to rank", min_value=10, max_value=100, value=100, step=10)

    run_btn = st.button("Run Ranker", disabled=uploaded is None)

    st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
    st.markdown("<div style='font-size:0.7rem;color:#4b5563;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;margin-bottom:0.8rem'>SCORING WEIGHTS</div>", unsafe_allow_html=True)

    weights = [
        ("Skill Relevance", 35),
        ("Experience Fit", 20),
        ("Behavioral", 20),
        ("Availability", 15),
        ("Location", 10),
    ]
    for label, pct in weights:
        st.markdown(f"""
        <div class="weight-row">
            <span class="weight-label">{label}</span>
            <div class="weight-bar-bg"><div class="weight-bar-fill" style="width:{pct*2.86:.0f}%"></div></div>
            <span class="weight-pct">{pct}%</span>
        </div>""", unsafe_allow_html=True)

    st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
    st.markdown("""
    <div style='font-size:0.7rem;color:#4b5563;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;margin-bottom:0.8rem'>LINKS</div>
    <div style='display:flex;flex-direction:column;gap:0.4rem'>
        <a href='https://india-runs-hackathon-team-dev-duo.vercel.app/' target='_blank'
           style='font-size:0.78rem;color:#00D4AA;text-decoration:none;display:flex;align-items:center;gap:0.4rem'>
           ↗ Live Dashboard (Vercel)
        </a>
        <a href='https://github.com/Jothik1506-ai/India-Runs-Hackathon_Team-Dev-DUO' target='_blank'
           style='font-size:0.78rem;color:#a78bfa;text-decoration:none;display:flex;align-items:center;gap:0.4rem'>
           ↗ GitHub Repository
        </a>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<div style='height:2rem'></div>", unsafe_allow_html=True)
    st.markdown("<div style='font-size:0.68rem;color:#374151;text-align:center'>Team Dev DUO · India Runs 2025</div>", unsafe_allow_html=True)


# ── Hero ──────────────────────────────────────────────────────────────────────

st.markdown("""
<div class="glass-card" style="padding:2rem 2.5rem">
    <p class="hero-title">🧬 APTIV Candidate Ranker</p>
    <p class="hero-sub">Redrob Hackathon · India Runs Data & AI Challenge · Team Dev DUO</p>
    <div class="hero-badges">
        <a class="badge badge-vercel" href="https://india-runs-hackathon-team-dev-duo.vercel.app/" target="_blank">
            ▲ Live Dashboard
        </a>
        <a class="badge badge-streamlit" href="https://india-runs-hackathonteam-dev-duo.streamlit.app/" target="_blank">
            ● Streamlit Sandbox
        </a>
        <a class="badge badge-github" href="https://github.com/Jothik1506-ai/India-Runs-Hackathon_Team-Dev-DUO" target="_blank">
            ⌥ GitHub Repo
        </a>
    </div>
</div>
""", unsafe_allow_html=True)


# ── Feature overview (shown before upload) ────────────────────────────────────

if not uploaded:
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
        <div class="glass-card">
            <div style="font-size:1.6rem;margin-bottom:0.6rem">⚡</div>
            <div style="font-weight:600;color:#f3f4f6;margin-bottom:0.4rem">Fast Pipeline</div>
            <div style="font-size:0.82rem;color:#6b7280;line-height:1.6">
                Ranks 100K candidates in under 60 seconds on CPU.
                No GPU, no network calls, no external dependencies beyond stdlib.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="glass-card">
            <div style="font-size:1.6rem;margin-bottom:0.6rem">🛡️</div>
            <div style="font-weight:600;color:#f3f4f6;margin-bottom:0.4rem">Smart Filters</div>
            <div style="font-size:0.82rem;color:#6b7280;line-height:1.6">
                Honeypot detection, consulting-firm disqualifier, and pure-academia
                filter remove low-signal candidates before scoring begins.
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown("""
        <div class="glass-card">
            <div style="font-size:1.6rem;margin-bottom:0.6rem">🎯</div>
            <div style="font-weight:600;color:#f3f4f6;margin-bottom:0.4rem">Explainable Ranking</div>
            <div style="font-size:0.82rem;color:#6b7280;line-height:1.6">
                Every candidate gets a natural-language reasoning string.
                5-component weighted scoring with trust multipliers on skills.
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("""
    <div class="glass-card" style="margin-top:0.5rem">
        <div class="upload-hint">
            <div class="upload-hint-icon">📂</div>
            <div style="color:#e5e7eb;font-weight:600;margin-bottom:0.3rem">Upload candidates.jsonl to get started</div>
            <div>Use the file uploader in the sidebar. You can use <code style="color:#00D4AA">sample_candidates_test.jsonl</code>
            from the repo for a quick test, or upload the full 100K dataset.</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    with st.expander("See sample output format"):
        st.code("""candidate_id,rank,score,reasoning
CAND_0018499,1,1.0000,Senior Machine Learning Engineer | 11 AI core skills | 7.2 yrs exp | 15d notice | 0.61 response rate.
CAND_0027691,2,0.9919,Strong 8-skill AI/NLP match; 6.5 yrs as NLP Engineer; 15d notice; loc: Pune, Maharashtra.
CAND_0011687,3,0.9838,Based in Indore, Madhya Pradesh. 9 AI/ML skills aligned; 7.8 yrs exp; 15d notice period.
CAND_0041669,4,0.9758,Recommendation Systems Engineer | 8 AI core skills | 8.0 yrs exp | 60d notice | 0.77 response rate.
""", language="csv")


# ── Run pipeline ──────────────────────────────────────────────────────────────

if uploaded and run_btn:
    content = uploaded.read().decode("utf-8")
    lines = [l.strip() for l in content.splitlines() if l.strip()]
    total = len(lines)

    with st.spinner("Running APTIV ranking pipeline…"):
        progress_bar = st.progress(0, text=f"Processing {total:,} candidates…")

        with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False, encoding="utf-8") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        start = time.time()
        try:
            rows = _rank_jsonl(pathlib.Path(tmp_path), top_n=top_n)
        finally:
            os.unlink(tmp_path)

        elapsed = time.time() - start
        progress_bar.progress(1.0, text="Pipeline complete!")

    # ── Count disqualifications ───────────────────────────────────────────────
    honeypots = consulting = academia = 0
    candidates_data: dict[str, dict] = {}

    for line in lines:
        try:
            c = json.loads(line)
        except Exception:
            continue
        cid = c.get("candidate_id", "")
        candidates_data[cid] = c
        skills = c.get("skills") or []
        career = c.get("career_history") or []
        if is_honeypot(skills):
            honeypots += 1
        elif is_pure_consulting(career):
            consulting += 1
        elif is_pure_academia(career):
            academia += 1

    disq = honeypots + consulting + academia
    eligible = total - disq

    # ── Metrics row ──────────────────────────────────────────────────────────
    st.markdown("<div class='section-header'>📊 Pipeline Results</div>", unsafe_allow_html=True)

    m1, m2, m3, m4, m5 = st.columns(5)
    metrics = [
        (m1, f"{total:,}", "Total Candidates", None, None),
        (m2, f"{disq:,}", "Disqualified", f"−{disq/total*100:.1f}%", "delta-red"),
        (m3, f"{eligible:,}", "Eligible", f"+{eligible/total*100:.1f}%", "delta-green"),
        (m4, f"{len(rows)}", "Ranked Output", None, None),
        (m5, f"{elapsed:.1f}s", "Runtime", None, None),
    ]
    for col, val, label, delta, delta_cls in metrics:
        with col:
            delta_html = f'<div class="metric-delta {delta_cls}">{delta}</div>' if delta else ""
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-value">{val}</div>
                <div class="metric-label">{label}</div>
                {delta_html}
            </div>""", unsafe_allow_html=True)

    st.markdown("<div style='height:1rem'></div>", unsafe_allow_html=True)

    # ── Charts row ────────────────────────────────────────────────────────────
    chart_col1, chart_col2 = st.columns([1.4, 1])

    with chart_col1:
        st.markdown("<div class='section-header'>📈 Score Distribution</div>", unsafe_allow_html=True)
        df_scores = pd.DataFrame(rows)
        fig_hist = px.histogram(
            df_scores, x="score", nbins=20,
            color_discrete_sequence=["#00D4AA"],
            labels={"score": "Score", "count": "Candidates"},
        )
        fig_hist.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(255,255,255,0.02)",
            font=dict(color="#9ca3af", family="Inter", size=11),
            margin=dict(l=0, r=0, t=10, b=0),
            height=240,
            bargap=0.06,
            xaxis=dict(gridcolor="rgba(255,255,255,0.05)", zerolinecolor="rgba(255,255,255,0.05)"),
            yaxis=dict(gridcolor="rgba(255,255,255,0.05)", zerolinecolor="rgba(255,255,255,0.05)"),
        )
        fig_hist.update_traces(marker_line_color="rgba(0,0,0,0)")
        st.plotly_chart(fig_hist, use_container_width=True, config={"displayModeBar": False})

    with chart_col2:
        st.markdown("<div class='section-header'>🚫 Disqualification Split</div>", unsafe_allow_html=True)
        fig_pie = go.Figure(go.Pie(
            labels=["Eligible", "Honeypots", "All-Consulting", "Pure Academia"],
            values=[eligible, honeypots, consulting, academia],
            hole=0.62,
            marker=dict(colors=["#00D4AA", "#ef4444", "#f59e0b", "#8b5cf6"]),
            textinfo="percent",
            textfont=dict(size=11, color="#fff"),
        ))
        fig_pie.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#9ca3af", family="Inter", size=11),
            margin=dict(l=0, r=0, t=10, b=0),
            height=240,
            showlegend=True,
            legend=dict(
                font=dict(size=10, color="#6b7280"),
                bgcolor="rgba(0,0,0,0)",
                x=0.65, y=0.5,
            ),
        )
        fig_pie.add_annotation(
            text=f"<b>{eligible}</b><br><span style='font-size:10px'>eligible</span>",
            x=0.28, y=0.5, showarrow=False,
            font=dict(size=13, color="#f3f4f6"),
        )
        st.plotly_chart(fig_pie, use_container_width=True, config={"displayModeBar": False})

    # ── Top candidate cards ───────────────────────────────────────────────────
    st.markdown("<div class='section-header'>🏆 Top Ranked Candidates</div>", unsafe_allow_html=True)

    top_display = rows[:10]
    for item in top_display:
        rank = item["rank"]
        cid = item["candidate_id"]
        score = float(item["score"])
        reasoning = item["reasoning"]

        c = candidates_data.get(cid, {})
        profile = c.get("profile", {})
        signals = c.get("redrob_signals", {})
        skills = c.get("skills", [])

        name = profile.get("anonymized_name", cid)
        title = profile.get("current_title", "—")
        company = profile.get("current_company", "—")
        location = profile.get("location", "—")
        yoe = profile.get("years_of_experience", 0)
        notice = signals.get("notice_period_days", "—")
        response_rate = signals.get("recruiter_response_rate", 0)
        github = signals.get("github_activity_score", -1)

        top_skills = [s["name"] for s in skills if s.get("proficiency") in ("advanced", "expert")][:6]
        if not top_skills:
            top_skills = [s["name"] for s in skills[:4]]

        rb_cls = rank_badge_class(rank)
        sc_cls = score_color_class(score)
        bar_html = score_bar_html(score)
        pills_html = skill_pills_html(top_skills)

        github_html = f'<span>⚡ GitHub {int(github)}</span>' if github >= 0 else ''

        st.markdown(f"""
        <div class="cand-card">
            <div style="display:flex;align-items:flex-start;gap:1rem">
                <div class="rank-badge {rb_cls}">#{rank}</div>
                <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
                        <div>
                            <p class="cand-name">{name}</p>
                            <p class="cand-title">{title} · {company}</p>
                        </div>
                        <div style="min-width:140px">{bar_html}</div>
                    </div>
                    <div class="cand-meta">
                        <span>📍 {location}</span>
                        <span>🕐 {yoe:.1f} yrs</span>
                        <span>📅 {notice}d notice</span>
                        <span>💬 {response_rate:.0%} response</span>
                        {github_html}
                    </div>
                    <div style="margin-top:0.55rem">{pills_html}</div>
                    <p class="reasoning-text">"{reasoning}"</p>
                </div>
            </div>
        </div>""", unsafe_allow_html=True)

    # ── Full ranked table ──────────────────────────────────────────────────────
    st.markdown("<div class='section-header'>📋 Full Ranked Table</div>", unsafe_allow_html=True)

    df_display = pd.DataFrame(rows)
    df_display["score"] = df_display["score"].astype(float).map(lambda x: f"{x:.4f}")
    st.dataframe(
        df_display,
        use_container_width=True,
        height=380,
        column_config={
            "candidate_id": st.column_config.TextColumn("Candidate ID", width="small"),
            "rank": st.column_config.NumberColumn("Rank", width="small"),
            "score": st.column_config.TextColumn("Score", width="small"),
            "reasoning": st.column_config.TextColumn("Reasoning", width="large"),
        },
        hide_index=True,
    )

    # ── Download ───────────────────────────────────────────────────────────────
    st.markdown("<div style='height:0.5rem'></div>", unsafe_allow_html=True)
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=["candidate_id", "rank", "score", "reasoning"])
    writer.writeheader()
    writer.writerows(rows)

    dl_col, _ = st.columns([1, 2])
    with dl_col:
        st.download_button(
            label="⬇  Download submission.csv",
            data=buf.getvalue().encode("utf-8"),
            file_name="submission.csv",
            mime="text/csv",
        )

elif uploaded and not run_btn:
    st.markdown(f"""
    <div class="glass-card" style="text-align:center;padding:2rem">
        <div style="font-size:2rem;margin-bottom:0.5rem">📂</div>
        <div style="font-weight:600;color:#e5e7eb;margin-bottom:0.3rem">{uploaded.name} ready</div>
        <div style="font-size:0.82rem;color:#6b7280">Click <strong>Run Ranker</strong> in the sidebar to start the pipeline.</div>
    </div>
    """, unsafe_allow_html=True)
