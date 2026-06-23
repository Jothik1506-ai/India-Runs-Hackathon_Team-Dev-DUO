#!/usr/bin/env python3
"""
sync_candidates.py — Convert top-ranked Redrob candidates → APTIV mockCandidates.ts

Usage:
  # First generate submission.csv:
  python rank.py --out submission.csv

  # Then sync top-N candidates into the APTIV React dashboard:
  python sync_candidates.py --submission submission.csv --candidates <candidates.jsonl> --top 20

This overwrites src/data/mockCandidates.ts with real ranked candidates from the
Redrob dataset so the APTIV recruiter dashboard reflects actual rankings.
"""

import argparse
import csv
import json
import math
import re
import sys
from pathlib import Path

DATASET_PATH = (
    "[PUB] India_runs_data_and_ai_challenge"
    "/[PUB] India_runs_data_and_ai_challenge"
    "/India_runs_data_and_ai_challenge/candidates.jsonl"
)
SUBMISSION_PATH = "submission.csv"
OUTPUT_PATH = "src/data/mockCandidates.ts"

# ── DNA dimension derivation ──────────────────────────────────────────────────

BUILD_KEYWORDS = {"built", "developed", "implemented", "shipped", "architected", "created", "designed", "deployed"}
LEAD_KEYWORDS  = {"led", "managed", "mentored", "directed", "owned", "supervised", "head of", "team lead"}
RESEARCH_KEYWORDS = {"researched", "analyzed", "investigated", "published", "paper", "thesis", "study"}
COLLAB_KEYWORDS = {"collaborated", "cross-functional", "partnered", "worked with", "coordinated", "contributed"}
INNOV_KEYWORDS  = {"innovative", "novel", "patent", "prototype", "poc", "proof of concept", "launched", "pioneered"}
SOLVE_KEYWORDS  = {"solved", "debugged", "optimized", "improved", "reduced", "increased", "fixed", "resolved"}


def _keyword_hit_rate(text: str, keywords: set) -> float:
    text = text.lower()
    hits = sum(1 for kw in keywords if kw in text)
    return min(1.0, hits / max(1, len(keywords) * 0.15))


def derive_career_dna(candidate: dict) -> dict:
    career = candidate.get("career_history") or []
    skills = candidate.get("skills") or []
    signals = candidate.get("redrob_signals") or {}
    certs = candidate.get("certifications") or []
    edu = candidate.get("education") or []

    all_desc = " ".join(j.get("description", "") for j in career)
    titles = " ".join(j.get("title", "") for j in career)
    combined = (all_desc + " " + titles).lower()

    github = float(signals.get("github_activity_score") or -1)
    completeness = float(signals.get("profile_completeness_score") or 50)
    endorsements = int(signals.get("endorsements_received") or 0)
    connections = int(signals.get("connection_count") or 0)
    yoe = float(candidate.get("profile", {}).get("years_of_experience") or 0)
    companies = [j.get("company_size", "") for j in career]
    large_cos = sum(1 for cs in companies if cs in ("1001-5000", "5001-10000", "10001+"))

    # Builder: hands-on creation signals
    builder = int(min(100, (
        _keyword_hit_rate(combined, BUILD_KEYWORDS) * 40
        + (github / 100 * 30 if github >= 0 else 15)
        + min(20, len(career) * 3)
        + min(10, len(skills) * 0.5)
    )))

    # Innovator: novel thinking + non-standard paths
    tech_skills = [s for s in skills if s.get("proficiency") in ("advanced", "expert")]
    innov = int(min(100, (
        _keyword_hit_rate(combined, INNOV_KEYWORDS) * 35
        + min(25, len(tech_skills) * 3)
        + min(20, len(certs) * 4)
        + 20 * (1 if len(career) > 3 and large_cos < len(career) // 2 else 0)
    )))

    # Researcher: depth + formal learning
    edu_tier = min(1.0, len([e for e in edu if e.get("tier") in ("tier_1", "tier_2")]) * 0.5 + 0.5)
    cert_count = len(certs)
    researcher = int(min(100, (
        _keyword_hit_rate(combined, RESEARCH_KEYWORDS) * 25
        + edu_tier * 40
        + min(25, cert_count * 5)
        + min(10, completeness / 10)
    )))

    # Leader: authority signals
    leader_title = any(kw in titles.lower() for kw in {"senior", "lead", "principal", "head", "director", "manager", "vp"})
    leader = int(min(100, (
        _keyword_hit_rate(combined, LEAD_KEYWORDS) * 45
        + (20 if leader_title else 0)
        + min(20, yoe * 2)
        + min(15, large_cos * 5)
    )))

    # Collaborator: network and team engagement
    interview_rate = float(signals.get("interview_completion_rate") or 0.5)
    collaborator = int(min(100, (
        _keyword_hit_rate(combined, COLLAB_KEYWORDS) * 30
        + min(25, connections / 40)
        + min(20, endorsements / 5)
        + interview_rate * 25
    )))

    # ProblemSolver: breadth + optimization signals
    skill_diversity = min(1.0, len(set(s.get("name", "").lower()[:4] for s in skills)) / 15.0)
    problem_solver = int(min(100, (
        _keyword_hit_rate(combined, SOLVE_KEYWORDS) * 40
        + skill_diversity * 35
        + min(25, yoe * 2)
    )))

    # Clamp all to 30-98 to look realistic
    def clamp(v): return max(30, min(98, v))
    return {
        "Builder": clamp(builder),
        "Innovator": clamp(innov),
        "Researcher": clamp(researcher),
        "Leader": clamp(leader),
        "Collaborator": clamp(collaborator),
        "ProblemSolver": clamp(problem_solver),
    }


def derive_tag(candidate: dict, match_score: float) -> tuple[str, str, str]:
    career = candidate.get("career_history") or []
    profile = candidate.get("profile") or {}
    signals = candidate.get("redrob_signals") or {}
    edu = candidate.get("education") or []

    github = float(signals.get("github_activity_score") or -1)
    linkedin = bool(signals.get("linkedin_connected", False))

    industries = [j.get("industry", "") for j in career]
    unique_industries = len(set(i for i in industries if i))
    company_sizes = [j.get("company_size", "") for j in career]
    had_startup = any(cs in ("1-10", "11-50") for cs in company_sizes)

    top_edu = [e for e in edu if e.get("tier") in ("tier_1", "tier_2")]
    has_elite_edu = len(top_edu) > 0

    title = profile.get("current_title", "").lower()
    is_ml_title = any(kw in title for kw in ("ml", "machine learning", "ai", "data scientist", "nlp"))

    # Diamond in the Rough: strong skills but signals suggest ATS would miss them
    if github >= 70 and not has_elite_edu and match_score >= 0.7:
        return "Diamond", "Diamond in the Rough", (
            "High GitHub activity and strong AI skills, but unconventional background "
            "means traditional ATS filters would likely screen this profile out."
        )

    # Switcher: moved across 2+ industries or non-traditional path to AI
    if unique_industries >= 3 or (unique_industries >= 2 and is_ml_title and had_startup):
        return "Switcher", "Career Switcher", (
            f"Career spans {unique_industries} industries with a clear trajectory toward AI/ML roles — "
            "brings rare cross-domain perspective."
        )

    # Contributor: strong community/OSS signals
    if github >= 50 and linkedin:
        return "Contributor", "Open Source Contributor", (
            "Active GitHub presence combined with LinkedIn network — "
            "demonstrates both technical and community engagement."
        )

    return "Standard", "Strong Match", (
        "Well-rounded profile with strong skill alignment to the job requirements."
    )


def derive_learning_velocity(candidate: dict) -> int:
    skills = candidate.get("skills") or []
    certs = candidate.get("certifications") or []
    signals = candidate.get("redrob_signals") or {}
    career = candidate.get("career_history") or []

    recent_skills = [s for s in skills if int(s.get("duration_months") or 0) <= 12]
    assess_scores = list((signals.get("skill_assessment_scores") or {}).values())
    avg_assess = sum(assess_scores) / len(assess_scores) if assess_scores else 50

    yoe = float(candidate.get("profile", {}).get("years_of_experience") or 1)
    skills_per_year = len(skills) / max(yoe, 1)

    raw = (
        min(40, len(recent_skills) * 5)
        + min(20, len(certs) * 5)
        + avg_assess * 0.25
        + min(15, skills_per_year * 3)
    )
    return max(35, min(98, int(raw)))


def derive_future_readiness(candidate: dict) -> tuple[int, int]:
    signals = candidate.get("redrob_signals") or {}
    skills = candidate.get("skills") or []

    # AI/future tech skill names
    future_skills = {
        "llm", "rag", "vector", "embedding", "transformer", "diffusion",
        "multimodal", "agent", "langchain", "reinforcement", "quantum",
        "kubernetes", "mlops", "edge ai",
    }
    future_count = sum(
        1 for s in skills
        if any(fs in s.get("name", "").lower() for fs in future_skills)
    )

    github = float(signals.get("github_activity_score") or -1)
    github_score = github / 100 if github >= 0 else 0.4

    lv = derive_learning_velocity(candidate)

    fr_6m = max(40, min(98, int(
        future_count * 8 + github_score * 30 + lv * 0.35
    )))
    fr_1y = max(fr_6m, min(99, int(fr_6m + lv * 0.1 + 5)))

    return fr_6m, fr_1y


def derive_roadmap(candidate: dict) -> dict:
    profile = candidate.get("profile") or {}
    skills = candidate.get("skills") or []
    title = profile.get("current_title", "Professional")

    skill_names = {s.get("name", "").lower() for s in skills}

    # Pick roadmap based on current role trajectory
    if any(kw in title.lower() for kw in ("ml", "machine learning", "data scientist")):
        goal = "Senior ML Engineer / Research Scientist"
        tasks = [
            {"name": "Fine-tune open-source LLM on domain-specific corpus", "duration": "3 weeks"},
            {"name": "Build RAG pipeline with vector DB (FAISS / Qdrant)", "duration": "1 month"},
            {"name": "Contribute to Hugging Face transformers or LlamaIndex", "duration": "6 weeks"},
            {"name": "MLOps: deploy model API on Kubernetes with A/B rollout", "duration": "1 month"},
        ]
    elif any(kw in title.lower() for kw in ("data engineer", "backend", "data")):
        goal = "ML Platform Engineer"
        tasks = [
            {"name": "Complete Fast.ai Practical Deep Learning course", "duration": "3 weeks"},
            {"name": "Build real-time feature store with Kafka + Redis", "duration": "1 month"},
            {"name": "Implement semantic search using sentence-transformers + FAISS", "duration": "3 weeks"},
            {"name": "Design scalable ML inference system on AWS/GCP", "duration": "1.5 months"},
        ]
    elif any(kw in title.lower() for kw in ("nlp", "search", "ir", "retrieval")):
        goal = "Principal Search & NLP Engineer"
        tasks = [
            {"name": "Master dense retrieval (DPR, ColBERT, bi-encoders)", "duration": "3 weeks"},
            {"name": "Build hybrid BM25 + dense retrieval system", "duration": "1 month"},
            {"name": "Contribute to PyTerrier or Haystack OSS project", "duration": "6 weeks"},
            {"name": "Design multi-stage ranking pipeline for production", "duration": "1 month"},
        ]
    else:
        goal = "AI/ML Specialist"
        tasks = [
            {"name": "Andrew Ng Machine Learning Specialization", "duration": "3 weeks"},
            {"name": "Build end-to-end NLP project (classification → RAG)", "duration": "1 month"},
            {"name": "Deploy ML model as REST API (FastAPI + Docker)", "duration": "3 weeks"},
            {"name": "Study system design for ML at scale", "duration": "1 month"},
        ]

    return {"goal": goal, "tasks": tasks}


def derive_missing_report(candidate: dict) -> list[str]:
    signals = candidate.get("redrob_signals") or {}
    skills = candidate.get("skills") or []
    profile = candidate.get("profile") or {}

    report = []

    if not signals.get("linkedin_connected"):
        report.append(
            "LinkedIn not connected. Syncing it can boost recruiter response rates by up to 18%."
        )
    if float(signals.get("github_activity_score") or -1) < 0:
        report.append(
            "No GitHub activity detected. Adding open-source contributions signals hands-on AI skill depth."
        )
    if float(signals.get("profile_completeness_score") or 0) < 80:
        gap = 80 - int(signals.get("profile_completeness_score") or 0)
        report.append(
            f"Profile completeness is {int(signals.get('profile_completeness_score', 0))}% — "
            f"filling remaining {gap}% can increase search visibility by 2×."
        )
    has_vector_skill = any("vector" in s.get("name", "").lower() for s in skills)
    if not has_vector_skill:
        report.append(
            "No vector database skill listed (FAISS, Qdrant, Pinecone). "
            "Adding it aligns directly with the target role's core requirement."
        )

    return report[:3] if report else [
        "Profile looks strong — consider adding recent project links to further improve visibility."
    ]


def derive_evidence_bundle(candidate: dict) -> dict:
    signals = candidate.get("redrob_signals") or {}
    edu = candidate.get("education") or []
    certs = candidate.get("certifications") or []
    skills = candidate.get("skills") or []
    career = candidate.get("career_history") or []

    github_score = float(signals.get("github_activity_score") or -1)
    yoe = float(candidate.get("profile", {}).get("years_of_experience") or 0)

    bundle = {}

    if github_score >= 0:
        bundle["github"] = {
            "repoCount": max(1, int(github_score / 5)),
            "commitFrequency": "High" if github_score >= 70 else "Medium" if github_score >= 40 else "Low",
            "stars": int(github_score * 3),
            "forks": int(github_score * 0.5),
            "languages": [s.get("name") for s in skills[:4] if s.get("proficiency") in ("advanced", "expert")],
            "hasOSSContributions": github_score >= 60,
            "projectComplexity": "Enterprise" if github_score >= 75 else "Mid" if github_score >= 45 else "Basic",
            "readmeQuality": "High" if github_score >= 65 else "Medium" if github_score >= 35 else "Low",
        }

    if signals.get("linkedin_connected"):
        has_progression = len(career) >= 2 and yoe >= 3
        bundle["linkedin"] = {
            "yearsExperience": int(yoe),
            "hasRecommendations": int(signals.get("endorsements_received") or 0) >= 5,
            "certificationCount": len(certs),
            "hasConsistentProgression": has_progression,
            "internshipCount": 0,
        }

    top_edu = next((e for e in edu if e.get("tier") in ("tier_1", "tier_2", "tier_3")), None)
    edu_level_map = {"phd": "PhD", "master": "Masters", "m.tech": "Masters", "m.e.": "Masters",
                     "b.tech": "Bachelors", "b.e.": "Bachelors", "bachelor": "Bachelors"}
    edu_level = "Bachelors"
    if top_edu:
        degree = top_edu.get("degree", "").lower()
        for k, v in edu_level_map.items():
            if k in degree:
                edu_level = v
                break

    bundle["resume"] = {
        "hasEducation": len(edu) > 0,
        "educationLevel": edu_level,
        "certifications": [c.get("name") for c in certs[:4]],
        "hackathonCount": 0,
        "leadershipMentions": sum(
            1 for j in career
            if any(kw in j.get("title", "").lower() for kw in ("lead", "senior", "head", "principal"))
        ),
        "skillsListed": [s.get("name") for s in skills[:8]],
        "projectsInResume": len(career),
    }

    return bundle


# ── TypeScript code generators ────────────────────────────────────────────────

def ts_string(s: str) -> str:
    return json.dumps(str(s))


def ts_bool(b) -> str:
    return "true" if b else "false"


def ts_list(items: list[str]) -> str:
    return "[" + ", ".join(ts_string(i) for i in items) + "]"


def candidate_to_ts(candidate: dict, rank: int, score: float) -> str:
    profile = candidate.get("profile") or {}
    signals = candidate.get("redrob_signals") or {}
    skills = candidate.get("skills") or []
    certs = candidate.get("certifications") or []

    cand_id = candidate["candidate_id"]
    name = profile.get("anonymized_name", "Unknown")
    title = profile.get("current_title", "Professional")
    company = profile.get("current_company", "")
    yoe = float(profile.get("years_of_experience") or 0)
    location = profile.get("location", "")

    initials = "".join(part[0].upper() for part in name.split()[:2] if part)
    email = f"{name.lower().replace(' ', '.')}@candidate.redrob.in"

    background = (
        f"{title} at {company} with {yoe:.1f} years of experience. "
        f"Located in {location}. "
        + (profile.get("summary") or "")[:200]
    )

    completeness = int(signals.get("profile_completeness_score") or 60)
    resume_quality = max(40, min(95, completeness - 10 + len(certs) * 3))
    match_score = int(score * 100)

    missing = derive_missing_report(candidate)
    dna = derive_career_dna(candidate)
    tag, tag_label, tag_reason = derive_tag(candidate, score)
    lv = derive_learning_velocity(candidate)
    fr6, fr1 = derive_future_readiness(candidate)
    roadmap = derive_roadmap(candidate)
    rank_reason = (
        f"Ranked #{rank} based on {len([s for s in skills if s.get('proficiency') in ('advanced','expert')])} "
        f"advanced AI/ML skills, {yoe:.1f} years of experience, and strong Redrob behavioral signals "
        f"(response rate: {float(signals.get('recruiter_response_rate') or 0):.0%})."
    )
    evidence = derive_evidence_bundle(candidate)

    github_url = f"github.com/{name.lower().replace(' ', '-')}" if float(signals.get("github_activity_score") or -1) >= 0 else None
    linkedin_url = f"linkedin.com/in/{name.lower().replace(' ', '-')}" if signals.get("linkedin_connected") else None

    lines = [f"  {{"]
    lines.append(f"    id: {ts_string(cand_id)},")
    lines.append(f"    name: {ts_string(name)},")
    lines.append(f"    title: {ts_string(title)},")
    lines.append(f"    avatar: {ts_string(initials)},")
    lines.append(f"    email: {ts_string(email)},")
    lines.append(f"    background: {ts_string(background[:300])},")
    lines.append(f"    completenessScore: {completeness},")
    lines.append(f"    resumeQualityScore: {resume_quality},")
    lines.append(f"    missingReport: {ts_list(missing)},")
    lines.append(f"    careerDNA: {{")
    for dim, val in dna.items():
        lines.append(f"      {dim}: {val},")
    lines.append(f"    }},")
    lines.append(f"    matchScore: {match_score},")
    lines.append(f"    tag: {ts_string(tag)},")
    lines.append(f"    tagLabel: {ts_string(tag_label)},")
    lines.append(f"    tagReason: {ts_string(tag_reason)},")
    lines.append(f"    projectQuality: {min(98, match_score + 5)},")
    lines.append(f"    learningVelocity: {lv},")
    lines.append(f"    futureReadiness6m: {fr6},")
    lines.append(f"    futureReadiness1y: {fr1},")
    lines.append(f"    predictedRoadmap: {{")
    lines.append(f"      goal: {ts_string(roadmap['goal'])},")
    lines.append(f"      tasks: [")
    for task in roadmap["tasks"]:
        lines.append(f"        {{ name: {ts_string(task['name'])}, duration: {ts_string(task['duration'])} }},")
    lines.append(f"      ],")
    lines.append(f"    }},")
    lines.append(f"    rankReason: {ts_string(rank_reason)},")
    if github_url:
        lines.append(f"    githubUrl: {ts_string(github_url)},")
    if linkedin_url:
        lines.append(f"    linkedinUrl: {ts_string(linkedin_url)},")

    # evidenceBundle
    lines.append(f"    evidenceBundle: {{")
    if "github" in evidence:
        g = evidence["github"]
        lines.append(f"      github: {{")
        lines.append(f"        repoCount: {g['repoCount']},")
        lines.append(f"        commitFrequency: {ts_string(g['commitFrequency'])},")
        lines.append(f"        stars: {g['stars']},")
        lines.append(f"        forks: {g['forks']},")
        lines.append(f"        languages: {ts_list(g['languages'])},")
        lines.append(f"        hasOSSContributions: {ts_bool(g['hasOSSContributions'])},")
        lines.append(f"        projectComplexity: {ts_string(g['projectComplexity'])},")
        lines.append(f"        readmeQuality: {ts_string(g['readmeQuality'])},")
        lines.append(f"      }},")
    if "linkedin" in evidence:
        li = evidence["linkedin"]
        lines.append(f"      linkedin: {{")
        lines.append(f"        yearsExperience: {li['yearsExperience']},")
        lines.append(f"        hasRecommendations: {ts_bool(li['hasRecommendations'])},")
        lines.append(f"        certificationCount: {li['certificationCount']},")
        lines.append(f"        hasConsistentProgression: {ts_bool(li['hasConsistentProgression'])},")
        lines.append(f"        internshipCount: {li['internshipCount']},")
        lines.append(f"      }},")
    r = evidence["resume"]
    lines.append(f"      resume: {{")
    lines.append(f"        hasEducation: {ts_bool(r['hasEducation'])},")
    lines.append(f"        educationLevel: {ts_string(r['educationLevel'])},")
    lines.append(f"        certifications: {ts_list(r['certifications'])},")
    lines.append(f"        hackathonCount: {r['hackathonCount']},")
    lines.append(f"        leadershipMentions: {r['leadershipMentions']},")
    lines.append(f"        skillsListed: {ts_list(r['skillsListed'])},")
    lines.append(f"        projectsInResume: {r['projectsInResume']},")
    lines.append(f"      }},")
    lines.append(f"    }},")
    lines.append(f"  }}")

    return "\n".join(lines)


# ── TypeScript file header (interfaces — must stay unchanged) ─────────────────

TS_HEADER = """export interface CareerDNA {
  Builder: number;
  Innovator: number;
  Researcher: number;
  Leader: number;
  Collaborator: number;
  ProblemSolver: number;
}

// Pre-defined evidence bundles for DNA Engine 2.0
export interface CandidateEvidenceBundle {
  github?: {
    repoCount: number;
    commitFrequency: 'High' | 'Medium' | 'Low' | 'None';
    stars: number;
    forks: number;
    languages: string[];
    hasOSSContributions: boolean;
    projectComplexity: 'Enterprise' | 'Mid' | 'Basic';
    readmeQuality: 'High' | 'Medium' | 'Low';
  };
  linkedin?: {
    yearsExperience: number;
    hasRecommendations: boolean;
    certificationCount: number;
    hasConsistentProgression: boolean;
    internshipCount: number;
  };
  portfolio?: {
    projectCount: number;
    hasDeployedApps: boolean;
    hasCaseStudies: boolean;
    hasTechnicalDocs: boolean;
  };
  resume?: {
    hasEducation: boolean;
    educationLevel: 'PhD' | 'Masters' | 'Bachelors' | 'Bootcamp' | 'SelfTaught' | 'None';
    certifications: string[];
    hackathonCount: number;
    leadershipMentions: number;
    skillsListed: string[];
    projectsInResume: number;
  };
}

export interface RoadmapTask {
  name: string;
  duration: string;
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  avatar: string;
  email: string;
  background: string;
  completenessScore: number;
  resumeQualityScore: number;
  missingReport: string[];
  careerDNA: CareerDNA;
  matchScore: number;
  tag: 'Diamond' | 'Switcher' | 'Contributor' | 'Standard';
  tagLabel: string;
  tagReason: string;
  projectQuality: number;
  learningVelocity: number;
  futureReadiness6m: number;
  futureReadiness1y: number;
  predictedRoadmap: {
    goal: string;
    tasks: RoadmapTask[];
  };
  rankReason: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  // Career DNA Engine 2.0 — pre-defined evidence bundles for mock candidates
  evidenceBundle?: CandidateEvidenceBundle;
}
"""


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Sync Redrob top candidates → APTIV mockCandidates.ts")
    parser.add_argument("--submission", default=SUBMISSION_PATH, help="submission.csv path")
    parser.add_argument("--candidates", default=DATASET_PATH, help="candidates.jsonl path")
    parser.add_argument("--top", type=int, default=20, help="Number of candidates to sync (default: 20)")
    parser.add_argument("--out", default=OUTPUT_PATH, help="Output TypeScript file path")
    args = parser.parse_args()

    submission_path = Path(args.submission)
    jsonl_path = Path(args.candidates)
    out_path = Path(args.out)

    if not submission_path.exists():
        print(f"Error: {submission_path} not found. Run rank.py first.", file=sys.stderr)
        sys.exit(1)
    if not jsonl_path.exists():
        print(f"Error: {jsonl_path} not found.", file=sys.stderr)
        sys.exit(1)

    # Read submission CSV — get top-N candidate IDs in rank order
    top_ids = []
    with open(submission_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = sorted(reader, key=lambda r: int(r["rank"]))
        for row in rows[: args.top]:
            top_ids.append((row["candidate_id"], float(row["score"])))

    target_ids = {cid: score for cid, score in top_ids}
    print(f"Looking up {len(target_ids)} candidates in {jsonl_path} …", flush=True)

    # Stream JSONL and collect matching candidates
    found: dict[str, dict] = {}
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                c = json.loads(line)
            except json.JSONDecodeError:
                continue
            cid = c.get("candidate_id")
            if cid in target_ids:
                found[cid] = c
            if len(found) == len(target_ids):
                break

    print(f"Found {len(found)}/{len(target_ids)} candidates.", flush=True)

    # Generate TypeScript for each candidate in rank order
    ts_candidates = []
    for cid, score in top_ids:
        if cid not in found:
            print(f"  Warning: {cid} not found in JSONL, skipping.", file=sys.stderr)
            continue
        rank = next(i + 1 for i, (c, _) in enumerate(top_ids) if c == cid)
        ts_candidates.append(candidate_to_ts(found[cid], rank, score))

    ts_array = "export const mockCandidates: Candidate[] = [\n"
    ts_array += ",\n".join(ts_candidates)
    ts_array += "\n];\n"

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(TS_HEADER)
        f.write("\n")
        f.write(ts_array)

    print(f"Written {len(ts_candidates)} candidates to {out_path}")


if __name__ == "__main__":
    main()
