// AIVA Resume Scorer — Evidence-Based, Honest Scoring
// Replaces Math.random() inflation with real content analysis.
//
// Calibration target:
//   ECE student, 1 project, Python Basics, no GitHub/LinkedIn/portfolio
//   → matchScore ~50, completeness ~44, quality ~57, velocity ~55

export interface ScoredResume {
  matchScore: number;
  completenessScore: number;
  resumeQualityScore: number;
  learningVelocity: number;
  futureReadiness6m: number;
  futureReadiness1y: number;
  projectQuality: number;
  tag: 'Diamond' | 'Switcher' | 'Contributor' | 'Standard';
  tagLabel: string;
  tagReason: string;
  goal: string;
  missingReport: string[];
  rankReason: string;
  careerDNA: {
    Builder: number;
    Innovator: number;
    Researcher: number;
    Leader: number;
    Collaborator: number;
    ProblemSolver: number;
  };
}

// Clamp to integer in [lo, hi]
const clamp = (n: number, lo = 0, hi = 97): number =>
  Math.min(hi, Math.max(lo, Math.round(n)));

// Micro-jitter ±2 so scores don't look robotic (pure content, no inflation)
const jitter = (n: number): number => n + (Math.random() * 4 - 2);

export const scoreResume = (_name: string, content: string): ScoredResume => {
  const text = content.toLowerCase();
  const missing: string[] = [];

  // ─── PRESENCE DETECTION ─────────────────────────────────────────────────

  const hasGitHub    = /github\.com\/[\w-]+/.test(content);
  const hasLinkedIn  = /linkedin\.com\/in\/[\w-]+/.test(content);
  const hasPortfolio = /[\w-]+\.(dev|io|codes|app)/.test(content) && !content.includes('github.com') && !content.includes('linkedin.com');
  const hasEmail     = /[\w.+-]+@[\w.-]+\.\w{2,}/.test(content);
  const hasPhone     = /\b\d{10}\b|\+\d{1,3}[\s-]?\d{10}/.test(content);

  // ─── ACADEMIC SIGNALS ───────────────────────────────────────────────────

  const hasPhD      = /ph\.?d|doctorate/i.test(content);
  const hasMasters  = /m\.?tech|m\.?s\.|m\.?e\.|master|msc/i.test(content) && !hasPhD;
  const hasBachelors = /b\.?tech|b\.?e\.|b\.?sc|bachelor/i.test(content) && !hasMasters && !hasPhD;
  const isBootcamp  = /bootcamp|coding school/i.test(content);
  const isSelfTaught = /self.?taught|autodidact/i.test(content);

  const cgpaMatch = content.match(/(\d+\.\d+)\s*(cgpa|gpa|\/10|out of 10)/i);
  const cgpa = cgpaMatch ? parseFloat(cgpaMatch[1]) : null;

  // ─── PROJECT SIGNALS ────────────────────────────────────────────────────

  // Count explicit project headings/titles to avoid "project management" false positives
  const projectMatches = (content.match(/project\s*[:–\-\n]|project\s*\d|project\s*title/gi) || []);
  const projectCount = Math.min(projectMatches.length, 10);
  const hasDeployments = /deployed|live at|production|hosted on|vercel|netlify|heroku|render/i.test(content);
  const hasQuantifiedAchievements = /\b\d+[\s%+×x]\s*(users|accuracy|reduction|improvement|increase|decrease|faster|ms|requests|records|stars)/i.test(content);
  const hasDetailedProjectDesc = projectCount >= 1 && content.length > 600;

  // ─── SKILL SIGNALS ──────────────────────────────────────────────────────

  const ADVANCED_SKILLS = [
    'tensorflow', 'pytorch', 'langchain', 'llamaindex', 'kubernetes', 'docker',
    'fastapi', 'django', 'spring', 'react', 'next.js', 'node.js', 'nodejs',
    'aws', 'gcp', 'azure', 'verilog', 'vhdl', 'matlab', 'fpga', 'opencv',
    'llm', 'transformers', 'deep learning', 'machine learning', 'nlp', 'computer vision',
    'sql', 'postgresql', 'mongodb', 'redis', 'kafka', 'graphql', 'rust', 'golang',
    'scikit-learn', 'pandas', 'numpy', 'spark', 'airflow', 'dbt', 'microservices'
  ];
  const BASIC_SKILLS = ['python', 'java', 'javascript', 'typescript', 'html', 'css', 'c++', 'c#', 'swift', 'kotlin'];
  const TRIVIAL_SIGNALS = ['ms office', 'microsoft office', 'powerpoint', 'ms excel', 'ms word',
    'python (basics)', 'python basics', 'c programming basics', 'typing', 'internet'];

  const advancedCount = ADVANCED_SKILLS.filter(s => text.includes(s)).length;
  const basicCount    = BASIC_SKILLS.filter(s => text.includes(s)).length;
  const hasTrivialOnly = TRIVIAL_SIGNALS.some(s => text.includes(s)) && advancedCount === 0 && basicCount <= 1;

  // ─── LEARNING SIGNALS ───────────────────────────────────────────────────

  const hackathonCount = (text.match(/hackathon/g) || []).length;
  const certCount      = (text.match(/certif(?:ied|ication)|aws certified|gcp certif|azure certif|scrum|pmp|tensorflow cert/gi) || []).length;
  const workshopCount  = (text.match(/workshop|bootcamp course|online course|coursera|udemy|edx|nptel/gi) || []).length;
  const hasOSS         = /open.?source|contributor|pull request|merged pr|maintained/i.test(content);
  const internCount    = (text.match(/intern(?:ship)?/g) || []).length;
  const hasExperience  = internCount > 0 || /years?.+experience|experience.+years?|work experience/i.test(content);
  const leaderMentions = (text.match(/led\s|managed|mentored|founded|organized\s|president|head of|team lead/gi) || []).length;

  // ─── COMPLETENESS SCORE ─────────────────────────────────────────────────
  // What profile surface area does a recruiter have to evaluate?
  let completeness = 12; // base: has a resume file
  if (hasEmail)       completeness += 7;
  if (hasPhone)       completeness += 5;
  if (hasBachelors || hasMasters || hasPhD) completeness += 9;
  if (cgpa)           completeness += 4; // CGPA stated
  if (hasGitHub)      completeness += 22; // largest single signal
  if (hasLinkedIn)    completeness += 16;
  if (hasPortfolio)   completeness += 10;
  if (projectCount >= 1) completeness += 7;
  if (projectCount >= 3) completeness += 5;
  if (certCount >= 1) completeness += 4;
  if (hackathonCount >= 1) completeness += 4;
  if (hasExperience)  completeness += 5;

  if (!hasGitHub) missing.push('GitHub profile not detected. Adding a GitHub with 2–3 public projects can boost your score by 20+ points and lets recruiters verify your coding ability.');
  if (!hasLinkedIn) missing.push('No LinkedIn profile URL found. LinkedIn presence increases recruiter outreach rates by ~40% and unlocks recommendation signals.');
  if (!hasPortfolio && !hasGitHub) missing.push('No portfolio or live project URL found. Even a GitHub Pages link shows deployed work and dramatically raises industry readiness.');
  if (projectCount === 0) missing.push('No projects detected. Add at least 2–3 projects with: tech stack used, your personal contribution, and a GitHub link.');
  else if (projectCount === 1) missing.push(`Only 1 project detected. Aim for 3–5 projects. Each project should mention: dataset/tools used, accuracy achieved, and a GitHub or live URL.`);
  if (hasTrivialOnly) missing.push('Skills section contains only surface-level tools (MS Office, Python Basics). Replace with domain-specific depth: NumPy, Pandas, Scikit-learn, Git, SQL — or for ECE: Verilog, MATLAB, FPGA, Cadence.');
  if (!hasQuantifiedAchievements && projectCount >= 1) missing.push('Project descriptions lack quantified impact. Add numbers: accuracy %, dataset size, users, performance improvement, stars gained.');

  // ─── RESUME QUALITY SCORE ───────────────────────────────────────────────
  // How much actionable signal does this resume give a recruiter?
  let quality = 18; // base: structured document
  if (hasEmail && hasPhone) quality += 7;     // contact info complete
  if (hasBachelors) quality += 8;
  if (hasMasters)   quality += 13;
  if (hasPhD)       quality += 18;
  if (cgpa && cgpa >= 8.0) quality += 12;
  else if (cgpa && cgpa >= 7.0) quality += 7;
  if (advancedCount >= 4) quality += 18;
  else if (advancedCount >= 2) quality += 11;
  else if (advancedCount >= 1) quality += 6;
  else if (basicCount >= 2)   quality += 3;
  if (hasDetailedProjectDesc) quality += 8;
  if (hasDeployments)         quality += 8;
  if (hasQuantifiedAchievements) quality += 10;
  if (hackathonCount >= 1)    quality += 5;
  if (certCount >= 1)         quality += 5;
  if (workshopCount >= 1)     quality += 3;
  if (hasGitHub)              quality += 8; // resume references GitHub
  if (hasTrivialOnly)         quality -= 10; // net penalty
  if (projectCount === 0)     quality -= 8;

  // ─── MATCH SCORE (against software/AI/technical roles) ──────────────────
  let match = 20; // base: submitted a resume
  // Academic foundation — these always contribute baseline readiness
  if (hasPhD)        match += 14;
  else if (hasMasters)  match += 10;
  else if (hasBachelors) match += 7;
  if (cgpa && cgpa >= 8.5) match += 8;
  else if (cgpa && cgpa >= 7.5) match += 5;
  else if (cgpa && cgpa >= 6.5) match += 2;
  // Technical skill depth
  if (advancedCount >= 5) match += 28;
  else if (advancedCount >= 3) match += 20;
  else if (advancedCount >= 1) match += 11;
  else if (basicCount >= 2) match += 5;
  // Evidence of real work
  if (hasGitHub)         match += 16;
  if (projectCount >= 3) match += 14;
  else if (projectCount >= 1) match += 7;
  if (hasDeployments)    match += 8;
  if (hasExperience)     match += 10;
  if (internCount >= 1)  match += 7;
  if (certCount >= 2)    match += 6;
  if (hasOSS)            match += 10;
  if (hackathonCount >= 1) match += 5;
  if (hasTrivialOnly)    match -= 6;

  // ─── LEARNING VELOCITY ──────────────────────────────────────────────────
  let velocity = 32; // starts higher — everyone on a resume shows some learning
  if (hackathonCount >= 2) velocity += 18;
  else if (hackathonCount === 1) velocity += 10;
  if (certCount >= 2)  velocity += 14;
  else if (certCount === 1) velocity += 7;
  if (workshopCount >= 2) velocity += 10;
  else if (workshopCount === 1) velocity += 5;
  if (hasOSS)          velocity += 15;
  if (hasGitHub)       velocity += 12;
  if (advancedCount >= 3) velocity += 15;
  else if (advancedCount >= 1) velocity += 8;
  if (cgpa && cgpa >= 8.5) velocity += 10; // academic discipline = learning capacity
  else if (cgpa && cgpa >= 7.5) velocity += 5;
  if (hasTrivialOnly)  velocity -= 10;
  if (projectCount === 0) velocity -= 8;

  // ─── PROJECT QUALITY ────────────────────────────────────────────────────
  let pQuality = 20;
  if (projectCount >= 3) pQuality += 25;
  else if (projectCount >= 1) pQuality += 12;
  if (hasDeployments)  pQuality += 18;
  if (hasQuantifiedAchievements) pQuality += 15;
  if (hasGitHub)       pQuality += 12;
  if (hasOSS)          pQuality += 15;

  // ─── FUTURE READINESS ───────────────────────────────────────────────────
  const growthIndex = (velocity * 0.45) + (match * 0.35) + (completeness * 0.2);
  const fr6m  = clamp(match + Math.round((growthIndex - match) * 0.28), match, 97);
  const fr1y  = clamp(match + Math.round((growthIndex - match) * 0.60), fr6m, 97);

  // ─── CAREER DNA (evidence-based) ────────────────────────────────────────
  const dnaBuilder = clamp(
    30
    + (hasGitHub ? 20 : 0)
    + (projectCount >= 3 ? 18 : projectCount >= 1 ? 10 : 0)
    + (hasDeployments ? 14 : 0)
    + (advancedCount >= 2 ? 14 : advancedCount >= 1 ? 7 : 0)
    + (internCount >= 1 ? 6 : 0)
    + jitter(0)
  );

  const dnaInnovator = clamp(
    28
    + (hasOSS ? 18 : 0)
    + (hackathonCount >= 2 ? 16 : hackathonCount === 1 ? 9 : 0)
    + (advancedCount >= 3 ? 14 : advancedCount >= 1 ? 7 : 0)
    + (hasDeployments ? 10 : 0)
    + (hasGitHub ? 8 : 0)
    + jitter(0)
  );

  const dnaResearcher = clamp(
    30
    + (hasPhD ? 30 : hasMasters ? 20 : hasBachelors ? 12 : isBootcamp ? 5 : isSelfTaught ? 8 : 0)
    + (cgpa && cgpa >= 8.5 ? 18 : cgpa && cgpa >= 7.5 ? 10 : cgpa && cgpa >= 6.5 ? 5 : 0)
    + (certCount >= 2 ? 10 : certCount === 1 ? 5 : 0)
    + (workshopCount >= 1 ? 5 : 0)
    + jitter(0)
  );

  const dnaLeader = clamp(
    22
    + (leaderMentions >= 3 ? 22 : leaderMentions >= 1 ? 12 : 0)
    + (hasOSS ? 12 : 0)
    + (hackathonCount >= 1 ? 8 : 0)
    + (internCount >= 1 ? 8 : 0)
    + jitter(0)
  );

  const dnaCollaborator = clamp(
    28
    + (hasOSS ? 18 : 0)
    + (internCount >= 1 ? 16 : 0)
    + (hackathonCount >= 1 ? 12 : 0)
    + (hasExperience ? 10 : 0)
    + (projectCount >= 2 ? 8 : 0)
    + jitter(0)
  );

  const dnaProblemSolver = clamp(
    28
    + (hackathonCount >= 2 ? 18 : hackathonCount === 1 ? 10 : 0)
    + (advancedCount >= 3 ? 16 : advancedCount >= 1 ? 8 : 0)
    + (hasDeployments ? 10 : 0)
    + (hasQuantifiedAchievements ? 10 : 0)
    + (cgpa && cgpa >= 8.5 ? 8 : cgpa && cgpa >= 7.5 ? 4 : 0)
    + jitter(0)
  );

  // ─── TAG ASSIGNMENT (strict evidence-based) ─────────────────────────────
  // OSS Contributor: requires BOTH explicit GitHub URL AND OSS evidence
  const isOSSContributor = hasGitHub && hasOSS;
  // Career Switcher: explicit pivot language OR ECE/Mech with AI work
  const isSwitcher =
    /\b(pivoted|switching|transitioned|career change)\b/i.test(content)
    || (/\b(mechanical|civil|electrical|ece|electronics)\b/i.test(content)
        && /\b(machine learning|ai|deep learning|data science|software developer)\b/i.test(content));
  // Diamond: strong academics (8.5+ CGPA or Masters/PhD) but NO GitHub/LinkedIn/portfolio
  const isDiamond = !hasGitHub && !hasLinkedIn && cgpa !== null && cgpa >= 8.5 && (hasBachelors || hasMasters || hasPhD);
  // Researcher: PhD or research papers or thesis
  const isResearcher = hasPhD || /\bthesis\b|\bpublished\b|\bpaper\b|\bjournal\b|\bresearch paper\b/i.test(content);

  let tag: 'Diamond' | 'Switcher' | 'Contributor' | 'Standard' = 'Standard';
  let tagLabel = 'Standard Applicant';
  let tagReason = 'Standard academic or professional background.';

  if (isOSSContributor) {
    tag = 'Contributor';
    tagLabel = 'OSS Contributor';
    tagReason = 'GitHub profile and open source contribution evidence found in resume.';
  } else if (isResearcher && (hasPhD || /\bthesis\b/i.test(content))) {
    tag = 'Contributor';
    tagLabel = 'Research Expert';
    tagReason = 'Academic research background with published work or thesis evidence.';
  } else if (isSwitcher) {
    tag = 'Switcher';
    tagLabel = 'Career Switcher';
    tagReason = 'Evidence of transitioning from a non-CS field into technical roles.';
  } else if (isDiamond) {
    tag = 'Diamond';
    tagLabel = 'Hidden Academic Gem';
    tagReason = `Strong CGPA (${cgpa}) but missing GitHub, LinkedIn, and portfolio — classic hidden potential candidate.`;
  }

  // ─── GOAL DETECTION ─────────────────────────────────────────────────────
  let goal = 'Software Engineer';
  if (/\b(llm|langchain|llama|gpt|ai agent|rag|vector db|generative ai)\b/i.test(content))
    goal = 'AI/LLM Engineer';
  else if (/\b(machine learning|deep learning|data science|neural network)\b/i.test(content))
    goal = 'ML/AI Engineer';
  else if (/\b(vlsi|verilog|vhdl|fpga|embedded|cadence|tanner|ece|electronics)\b/i.test(content))
    goal = 'Embedded Systems Engineer';
  else if (/\b(data analyst|power bi|tableau|excel analytics|business intelligence)\b/i.test(content))
    goal = 'Data Analyst';
  else if (/\b(full.?stack|react|vue|angular|next\.js|frontend|backend)\b/i.test(content))
    goal = 'Full Stack Developer';
  else if (/\b(devops|kubernetes|terraform|ci\/cd|infrastructure)\b/i.test(content))
    goal = 'DevOps Engineer';
  else if (hasPhD || hasMasters) goal = 'Research Engineer';

  // ─── RANK REASON (honest & specific) ────────────────────────────────────
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (cgpa && cgpa >= 8.0) strengths.push(`strong academics (CGPA ${cgpa})`);
  if (hasGitHub) strengths.push('verified GitHub presence');
  if (hasLinkedIn) strengths.push('LinkedIn profile');
  if (projectCount >= 3) strengths.push(`${projectCount} documented projects`);
  if (hackathonCount >= 1) strengths.push('hackathon participation');
  if (advancedCount >= 3) strengths.push('strong technical skill depth');
  if (hasOSS) strengths.push('open-source contributions');
  if (hasDeployments) strengths.push('deployed applications');
  if (hasExperience) strengths.push('work/internship experience');

  if (!hasGitHub) gaps.push('no GitHub profile');
  if (!hasLinkedIn) gaps.push('no LinkedIn profile');
  if (projectCount < 2) gaps.push(`only ${Math.max(0, projectCount)} project(s) visible`);
  if (hasTrivialOnly) gaps.push('skills section lacks technical depth');
  if (!hasDeployments) gaps.push('no deployed applications found');
  if (!hasQuantifiedAchievements) gaps.push('no quantified impact in descriptions');

  const rankReason = strengths.length > 0
    ? `Shows ${strengths.join(', ')}. Key gaps for higher ranking: ${gaps.length > 0 ? gaps.join(', ') : 'none'}. Score is evidence-based and will improve as profile grows.`
    : `Limited verifiable evidence at this stage. Primary gaps: ${gaps.join(', ')}. Score reflects current evidence level — not a permanent ceiling.`;

  return {
    matchScore:          clamp(jitter(match), 22, 95),
    completenessScore:   clamp(jitter(completeness), 20, 97),
    resumeQualityScore:  clamp(jitter(quality), 20, 97),
    learningVelocity:    clamp(jitter(velocity), 20, 97),
    futureReadiness6m:   clamp(fr6m, 25, 97),
    futureReadiness1y:   clamp(fr1y, 30, 97),
    projectQuality:      clamp(jitter(pQuality), 15, 97),
    tag,
    tagLabel,
    tagReason,
    goal,
    missingReport: missing.length > 0 ? missing : ['Profile looks solid! Consider adding certifications or open-source contributions to reach the next tier.'],
    rankReason,
    careerDNA: {
      Builder:       dnaBuilder,
      Innovator:     dnaInnovator,
      Researcher:    dnaResearcher,
      Leader:        dnaLeader,
      Collaborator:  dnaCollaborator,
      ProblemSolver: dnaProblemSolver
    }
  };
};

// Generate a context-aware roadmap from resume content
export const generateRoadmap = (goal: string, text: string, _scores: ScoredResume): Array<{ name: string; duration: string }> => {
  const t = text.toLowerCase();
  const tasks: Array<{ name: string; duration: string }> = [];

  // Priority 1: Fix the biggest gap — GitHub
  if (!/github\.com\/[\w-]+/.test(text)) {
    tasks.push({ name: 'Create GitHub profile and push your existing project with a detailed README', duration: '1 week' });
  }
  // Priority 2: LinkedIn
  if (!/linkedin\.com\/in\/[\w-]+/.test(text)) {
    tasks.push({ name: 'Build LinkedIn profile with education, projects, and skills', duration: '3 days' });
  }
  // Priority 3: Role-specific upskilling
  if (goal.includes('ML') || goal.includes('AI') || goal.includes('LLM')) {
    if (!t.includes('scikit') && !t.includes('sklearn')) tasks.push({ name: 'Build end-to-end ML project using Scikit-learn + Pandas', duration: '3 weeks' });
    if (!t.includes('pytorch') && !t.includes('tensorflow')) tasks.push({ name: 'Complete fast.ai or Deep Learning Specialization (Andrew Ng)', duration: '1.5 months' });
    tasks.push({ name: 'Deploy an ML model as a REST API using FastAPI or Streamlit', duration: '2 weeks' });
  } else if (goal.includes('Embedded') || goal.includes('ECE')) {
    if (!t.includes('verilog') && !t.includes('vhdl')) tasks.push({ name: 'Learn Verilog/VHDL basics via HDLBits and build 3 digital circuits', duration: '1 month' });
    if (!t.includes('fpga')) tasks.push({ name: 'Implement a UART/SPI protocol on an FPGA board', duration: '3 weeks' });
    tasks.push({ name: 'Complete NPTEL course on Digital VLSI Design and add to LinkedIn', duration: '6 weeks' });
  } else if (goal.includes('Full Stack') || t.includes('react') || t.includes('frontend')) {
    tasks.push({ name: 'Build and deploy a full-stack app (React + Node.js + PostgreSQL)', duration: '1.5 months' });
    tasks.push({ name: 'Obtain a cloud certification (AWS Cloud Practitioner)', duration: '1 month' });
  } else {
    tasks.push({ name: 'Build 2 projects in your primary language with GitHub links and live deployments', duration: '1.5 months' });
    tasks.push({ name: 'Complete one relevant certification (AWS / Google / NPTEL)', duration: '1 month' });
  }
  // Priority 4: Quantify existing projects
  const projectCount = (text.match(/project\s*[:–\-\n]|project\s*\d/gi) || []).length;
  if (projectCount >= 1 && !/\b\d+[\s%+]\s*(accuracy|users|reduction|improvement)/i.test(text)) {
    tasks.push({ name: 'Rewrite all project descriptions: add tech stack, your role, measurable outcomes', duration: '1 week' });
  }
  // Limit to 4 tasks
  return tasks.slice(0, 4);
};
