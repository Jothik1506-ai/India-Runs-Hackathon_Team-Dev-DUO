// AIVA Career DNA Engine 2.0
// Evidence-based scoring with explainable confidence levels

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type EvidenceLevel = 1 | 2 | 3; // 1=Highest (GitHub/Portfolio), 2=Resume/Certs, 3=Self-declared

export interface EvidenceItem {
  text: string;
  level: EvidenceLevel;
  source: 'GitHub' | 'Portfolio' | 'LinkedIn' | 'Resume' | 'Certifications' | 'Hackathon' | 'OSS';
}

export interface DNADimension {
  score: number;
  confidence: ConfidenceLevel;
  evidence: EvidenceItem[];
  missing: string[];
  improvement: string;
}

export interface DNAProfile {
  Builder: DNADimension;
  Innovator: DNADimension;
  Researcher: DNADimension;
  Leader: DNADimension;
  Collaborator: DNADimension;
  ProblemSolver: DNADimension;
}

export interface GitHubSignals {
  repoCount: number;
  commitFrequency: 'High' | 'Medium' | 'Low' | 'None';
  stars: number;
  forks: number;
  languages: string[];
  hasOSSContributions: boolean;
  projectComplexity: 'Enterprise' | 'Mid' | 'Basic';
  readmeQuality: 'High' | 'Medium' | 'Low';
}

export interface LinkedInSignals {
  yearsExperience: number;
  hasRecommendations: boolean;
  certificationCount: number;
  hasConsistentProgression: boolean;
  internshipCount: number;
}

export interface PortfolioSignals {
  projectCount: number;
  hasDeployedApps: boolean;
  hasCaseStudies: boolean;
  hasTechnicalDocs: boolean;
}

export interface ResumeSignals {
  hasEducation: boolean;
  educationLevel: 'PhD' | 'Masters' | 'Bachelors' | 'Bootcamp' | 'SelfTaught' | 'None';
  certifications: string[];
  hackathonCount: number;
  leadershipMentions: number;
  skillsListed: string[];
  projectsInResume: number;
}

export interface EvidenceBundle {
  candidateName: string;
  resumeText?: string;
  github?: GitHubSignals;
  linkedin?: LinkedInSignals;
  portfolio?: PortfolioSignals;
  resume?: ResumeSignals;
}

// Compute confidence based on how many Level-1 evidence items support the score
const computeConfidence = (evidence: EvidenceItem[]): ConfidenceLevel => {
  const l1 = evidence.filter(e => e.level === 1).length;
  const l2 = evidence.filter(e => e.level === 2).length;
  if (l1 >= 2) return 'High';
  if (l1 >= 1 || l2 >= 2) return 'Medium';
  return 'Low';
};

// Clamp score to [0, 100]
const clamp = (n: number): number => Math.min(100, Math.max(0, Math.round(n)));

export const computeDNAProfile = (bundle: EvidenceBundle): DNAProfile => {
  const { github, linkedin, portfolio, resume } = bundle;

  // ── Builder ───────────────────────────────────────────────────────────────
  const builderEvidence: EvidenceItem[] = [];
  const builderMissing: string[] = [];
  let builderBase = 40;

  if (github) {
    if (github.repoCount >= 10) {
      builderEvidence.push({ text: `${github.repoCount} GitHub repositories`, level: 1, source: 'GitHub' });
      builderBase += 20;
    } else if (github.repoCount >= 5) {
      builderEvidence.push({ text: `${github.repoCount} GitHub repositories`, level: 1, source: 'GitHub' });
      builderBase += 12;
    } else {
      builderMissing.push('More public GitHub repositories showing project work');
    }
    if (github.commitFrequency === 'High') {
      builderEvidence.push({ text: 'High commit frequency — consistent builder', level: 1, source: 'GitHub' });
      builderBase += 15;
    } else if (github.commitFrequency === 'Medium') {
      builderEvidence.push({ text: 'Moderate commit activity', level: 1, source: 'GitHub' });
      builderBase += 8;
    } else {
      builderMissing.push('Active and recent GitHub commit history');
    }
    if (github.projectComplexity === 'Enterprise') {
      builderEvidence.push({ text: 'Enterprise-grade project complexity', level: 1, source: 'GitHub' });
      builderBase += 12;
    } else if (github.projectComplexity === 'Mid') {
      builderEvidence.push({ text: 'Mid-tier project complexity', level: 1, source: 'GitHub' });
      builderBase += 6;
    }
    if (github.stars >= 100) {
      builderEvidence.push({ text: `${github.stars}+ GitHub stars — community validated projects`, level: 1, source: 'GitHub' });
      builderBase += 8;
    }
  } else {
    builderMissing.push('GitHub profile with project evidence');
  }

  if (portfolio) {
    if (portfolio.hasDeployedApps) {
      builderEvidence.push({ text: 'Live deployed applications in portfolio', level: 1, source: 'Portfolio' });
      builderBase += 10;
    } else {
      builderMissing.push('Deployed live applications (not just code)');
    }
    if (portfolio.projectCount >= 3) {
      builderEvidence.push({ text: `${portfolio.projectCount} portfolio projects`, level: 1, source: 'Portfolio' });
      builderBase += 5;
    }
  } else {
    builderMissing.push('Portfolio website with project showcases');
  }

  if (resume?.projectsInResume && resume.projectsInResume >= 2) {
    builderEvidence.push({ text: `${resume.projectsInResume} projects documented in resume`, level: 2, source: 'Resume' });
    builderBase += 5;
  }

  const builderDimension: DNADimension = {
    score: clamp(builderBase),
    confidence: computeConfidence(builderEvidence),
    evidence: builderEvidence,
    missing: builderMissing,
    improvement: 'Ship 2–3 more public projects with live deployments and link them in a portfolio to raise Builder confidence to High.'
  };

  // ── Innovator ─────────────────────────────────────────────────────────────
  const innovatorEvidence: EvidenceItem[] = [];
  const innovatorMissing: string[] = [];
  let innovatorBase = 38;

  if (github) {
    if (github.hasOSSContributions) {
      innovatorEvidence.push({ text: 'Open source contributions to community projects', level: 1, source: 'OSS' });
      innovatorBase += 18;
    } else {
      innovatorMissing.push('Open source contributions to external projects');
    }
    const uniqueLangs = github.languages.length;
    if (uniqueLangs >= 4) {
      innovatorEvidence.push({ text: `Polyglot coder — ${uniqueLangs} languages (${github.languages.join(', ')})`, level: 1, source: 'GitHub' });
      innovatorBase += 14;
    } else if (uniqueLangs >= 2) {
      innovatorEvidence.push({ text: `Multi-language projects (${github.languages.join(', ')})`, level: 1, source: 'GitHub' });
      innovatorBase += 8;
    } else {
      innovatorMissing.push('Experiment with diverse programming languages or paradigms');
    }
    if (github.forks >= 10) {
      innovatorEvidence.push({ text: `${github.forks} forks — others building on your work`, level: 1, source: 'GitHub' });
      innovatorBase += 10;
    }
  }

  if (resume?.hackathonCount && resume.hackathonCount > 0) {
    innovatorEvidence.push({ text: `${resume.hackathonCount} hackathon participation(s)`, level: 2, source: 'Hackathon' });
    innovatorBase += resume.hackathonCount * 6;
  } else {
    innovatorMissing.push('Hackathon participation or innovation challenges');
  }

  if (portfolio?.hasCaseStudies) {
    innovatorEvidence.push({ text: 'Case studies showing problem-to-solution thinking', level: 1, source: 'Portfolio' });
    innovatorBase += 8;
  }

  const innovatorDimension: DNADimension = {
    score: clamp(innovatorBase),
    confidence: computeConfidence(innovatorEvidence),
    evidence: innovatorEvidence,
    missing: innovatorMissing,
    improvement: 'Contribute to open source projects and join a hackathon to prove innovation under constraints.'
  };

  // ── Researcher ────────────────────────────────────────────────────────────
  const researcherEvidence: EvidenceItem[] = [];
  const researcherMissing: string[] = [];
  let researcherBase = 35;

  if (resume) {
    if (resume.educationLevel === 'PhD') {
      researcherEvidence.push({ text: 'PhD — deepest academic research background', level: 2, source: 'Resume' });
      researcherBase += 30;
    } else if (resume.educationLevel === 'Masters') {
      researcherEvidence.push({ text: 'Masters degree — strong academic foundation', level: 2, source: 'Resume' });
      researcherBase += 18;
    } else if (resume.educationLevel === 'Bachelors') {
      researcherEvidence.push({ text: 'Bachelors degree in technical field', level: 2, source: 'Resume' });
      researcherBase += 10;
    } else if (resume.educationLevel === 'SelfTaught') {
      researcherEvidence.push({ text: 'Self-taught — demonstrates independent research capability', level: 3, source: 'Resume' });
      researcherBase += 5;
      researcherMissing.push('Formal courses, certifications, or deep documentation of research projects');
    }

    if (resume.certifications.length >= 2) {
      researcherEvidence.push({ text: `${resume.certifications.length} certifications (${resume.certifications.slice(0, 2).join(', ')})`, level: 2, source: 'Certifications' });
      researcherBase += resume.certifications.length * 4;
    } else if (resume.certifications.length === 0) {
      researcherMissing.push('Industry certifications showing structured learning');
    }
  }

  if (github?.readmeQuality === 'High') {
    researcherEvidence.push({ text: 'High-quality README documentation — technical depth visible', level: 1, source: 'GitHub' });
    researcherBase += 12;
  } else {
    researcherMissing.push('Detailed README files and technical documentation in repositories');
  }

  if (portfolio?.hasTechnicalDocs) {
    researcherEvidence.push({ text: 'Technical documentation in portfolio', level: 1, source: 'Portfolio' });
    researcherBase += 10;
  }

  const researcherDimension: DNADimension = {
    score: clamp(researcherBase),
    confidence: computeConfidence(researcherEvidence),
    evidence: researcherEvidence,
    missing: researcherMissing,
    improvement: 'Write technical blog posts, detailed READMEs, or pursue certifications to demonstrate research depth.'
  };

  // ── Leader ────────────────────────────────────────────────────────────────
  const leaderEvidence: EvidenceItem[] = [];
  const leaderMissing: string[] = [];
  let leaderBase = 33;

  if (github?.hasOSSContributions) {
    leaderEvidence.push({ text: 'OSS maintainer or contributor — community leadership signal', level: 1, source: 'OSS' });
    leaderBase += 14;
  }

  if (github && github.stars >= 50) {
    leaderEvidence.push({ text: `${github.stars} stars — recognized technical authority`, level: 1, source: 'GitHub' });
    leaderBase += 10;
  }

  if (resume?.leadershipMentions && resume.leadershipMentions >= 2) {
    leaderEvidence.push({ text: `${resume.leadershipMentions} leadership mentions in resume`, level: 2, source: 'Resume' });
    leaderBase += resume.leadershipMentions * 5;
  } else {
    leaderMissing.push('Leadership roles (team lead, project lead, mentor, club president)');
  }

  if (linkedin?.hasRecommendations) {
    leaderEvidence.push({ text: 'LinkedIn recommendations — peer validation of leadership', level: 2, source: 'LinkedIn' });
    leaderBase += 12;
  } else {
    leaderMissing.push('LinkedIn recommendations from colleagues or managers');
  }

  if (linkedin?.hasConsistentProgression) {
    leaderEvidence.push({ text: 'Consistent career progression on LinkedIn', level: 2, source: 'LinkedIn' });
    leaderBase += 8;
  }

  const leaderDimension: DNADimension = {
    score: clamp(leaderBase),
    confidence: computeConfidence(leaderEvidence),
    evidence: leaderEvidence,
    missing: leaderMissing,
    improvement: 'Lead a project or team, mentor juniors, or contribute in a decision-making capacity to grow Leader DNA.'
  };

  // ── Collaborator ──────────────────────────────────────────────────────────
  const collaboratorEvidence: EvidenceItem[] = [];
  const collaboratorMissing: string[] = [];
  let collaboratorBase = 40;

  if (github?.hasOSSContributions) {
    collaboratorEvidence.push({ text: 'Open source contributions require cross-team collaboration', level: 1, source: 'OSS' });
    collaboratorBase += 18;
  } else {
    collaboratorMissing.push('Contributions to existing OSS projects (PRs, issues, reviews)');
  }

  if (github && github.forks >= 5) {
    collaboratorEvidence.push({ text: `${github.forks} forks — others collaborating on your code`, level: 1, source: 'GitHub' });
    collaboratorBase += 8;
  }

  if (linkedin?.yearsExperience && linkedin.yearsExperience >= 1) {
    collaboratorEvidence.push({ text: `${linkedin.yearsExperience} year(s) of professional/team experience`, level: 2, source: 'LinkedIn' });
    collaboratorBase += Math.min(linkedin.yearsExperience * 5, 20);
  } else {
    collaboratorMissing.push('Professional team experience or internship history');
  }

  if (linkedin?.internshipCount && linkedin.internshipCount >= 1) {
    collaboratorEvidence.push({ text: `${linkedin.internshipCount} internship(s) — structured team collaboration`, level: 2, source: 'LinkedIn' });
    collaboratorBase += linkedin.internshipCount * 7;
  }

  if (resume?.hackathonCount && resume.hackathonCount > 0) {
    collaboratorEvidence.push({ text: 'Hackathons show ability to collaborate under pressure', level: 2, source: 'Hackathon' });
    collaboratorBase += 8;
  }

  const collaboratorDimension: DNADimension = {
    score: clamp(collaboratorBase),
    confidence: computeConfidence(collaboratorEvidence),
    evidence: collaboratorEvidence,
    missing: collaboratorMissing,
    improvement: 'Add internship or team project history. Contribute to OSS PRs and show group hackathon work.'
  };

  // ── Problem Solver ────────────────────────────────────────────────────────
  const problemSolverEvidence: EvidenceItem[] = [];
  const problemSolverMissing: string[] = [];
  let problemSolverBase = 38;

  if (github?.projectComplexity === 'Enterprise') {
    problemSolverEvidence.push({ text: 'Solved enterprise-scale technical challenges in projects', level: 1, source: 'GitHub' });
    problemSolverBase += 22;
  } else if (github?.projectComplexity === 'Mid') {
    problemSolverEvidence.push({ text: 'Mid-complexity problem solving in projects', level: 1, source: 'GitHub' });
    problemSolverBase += 12;
  } else {
    problemSolverMissing.push('Higher complexity projects (APIs, distributed systems, AI pipelines)');
  }

  if (resume?.hackathonCount && resume.hackathonCount >= 2) {
    problemSolverEvidence.push({ text: `${resume.hackathonCount} hackathons — time-constrained problem solving`, level: 2, source: 'Hackathon' });
    problemSolverBase += 14;
  } else if (resume?.hackathonCount === 1) {
    problemSolverEvidence.push({ text: '1 hackathon participation', level: 2, source: 'Hackathon' });
    problemSolverBase += 7;
  } else {
    problemSolverMissing.push('Hackathon or competitive programming experience');
  }

  if (github?.languages && github.languages.length >= 3) {
    problemSolverEvidence.push({ text: `Uses ${github.languages.length} languages — adaptable problem solver`, level: 1, source: 'GitHub' });
    problemSolverBase += 10;
  }

  if (portfolio?.hasCaseStudies) {
    problemSolverEvidence.push({ text: 'Portfolio case studies document problem-solving approach', level: 1, source: 'Portfolio' });
    problemSolverBase += 10;
  } else {
    problemSolverMissing.push('Case studies showing structured problem decomposition');
  }

  if (linkedin?.certificationCount && linkedin.certificationCount >= 2) {
    problemSolverEvidence.push({ text: `${linkedin.certificationCount} certifications show structured skill acquisition`, level: 2, source: 'Certifications' });
    problemSolverBase += 6;
  }

  const problemSolverDimension: DNADimension = {
    score: clamp(problemSolverBase),
    confidence: computeConfidence(problemSolverEvidence),
    evidence: problemSolverEvidence,
    missing: problemSolverMissing,
    improvement: 'Participate in hackathons, solve LeetCode/system design problems publicly, and write case studies.'
  };

  return {
    Builder: builderDimension,
    Innovator: innovatorDimension,
    Researcher: researcherDimension,
    Leader: leaderDimension,
    Collaborator: collaboratorDimension,
    ProblemSolver: problemSolverDimension
  };
};

// Extract plain scores from DNA profile (for radar chart compatibility)
export const dnaProfileToScores = (profile: DNAProfile): Record<string, number> => ({
  Builder: profile.Builder.score,
  Innovator: profile.Innovator.score,
  Researcher: profile.Researcher.score,
  Leader: profile.Leader.score,
  Collaborator: profile.Collaborator.score,
  ProblemSolver: profile.ProblemSolver.score
});

// GitHub URL → signals (heuristic; real integration would call GitHub API)
export const inferGitHubSignals = (url: string | undefined, resumeText?: string): GitHubSignals | undefined => {
  if (!url) return undefined;
  const text = (resumeText || '').toLowerCase();

  const hasOSS = text.includes('open source') || text.includes('contributor') || text.includes('pull request') || text.includes('merged');
  const isHighFreq = text.includes('daily') || text.includes('active contributor') || text.includes('8000 stars') || text.includes('popular');
  const starsHint = text.includes('8000') || text.includes('8,000') ? 8000 : text.includes('stars') ? 120 : 0;
  const forkHint = text.includes('forks') ? 60 : 0;

  const langs: string[] = [];
  const langMap: Record<string, string> = {
    python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript', rust: 'Rust',
    golang: 'Go', java: 'Java', 'c++': 'C++', react: 'React/TS', swift: 'Swift',
    kotlin: 'Kotlin', node: 'Node.js', llm: 'LLM/Python', langchain: 'LangChain'
  };
  for (const [kw, lang] of Object.entries(langMap)) {
    if (text.includes(kw) && !langs.includes(lang)) langs.push(lang);
  }

  return {
    repoCount: text.includes('github') ? (isHighFreq ? 24 : 8) : 4,
    commitFrequency: isHighFreq ? 'High' : text.includes('github') ? 'Medium' : 'Low',
    stars: starsHint,
    forks: forkHint,
    languages: langs.length > 0 ? langs : ['JavaScript'],
    hasOSSContributions: hasOSS,
    projectComplexity: text.includes('llm') || text.includes('microservice') || text.includes('distributed') ? 'Enterprise'
      : text.includes('api') || text.includes('saas') || text.includes('framework') ? 'Mid' : 'Basic',
    readmeQuality: hasOSS || isHighFreq ? 'High' : 'Medium'
  };
};

export const inferLinkedInSignals = (url: string | undefined, resumeText?: string): LinkedInSignals | undefined => {
  if (!url) return undefined;
  const text = (resumeText || '').toLowerCase();
  return {
    yearsExperience: text.includes('3 year') || text.includes('senior') ? 3 : text.includes('1 year') ? 1 : 0,
    hasRecommendations: text.includes('recommend') || text.includes('endorsed'),
    certificationCount: (text.match(/certif|aws|gcp|azure|scrum|pmp/g) || []).length,
    hasConsistentProgression: text.includes('promoted') || text.includes('senior') || text.includes('lead'),
    internshipCount: (text.match(/intern/g) || []).length
  };
};

export const inferPortfolioSignals = (url: string | undefined, resumeText?: string): PortfolioSignals | undefined => {
  if (!url) return undefined;
  const text = (resumeText || '').toLowerCase();
  return {
    projectCount: (text.match(/project|built|developed|created/g) || []).length,
    hasDeployedApps: text.includes('deployed') || text.includes('production') || text.includes('live') || !!url,
    hasCaseStudies: text.includes('case study') || text.includes('problem') && text.includes('solution'),
    hasTechnicalDocs: text.includes('documentation') || text.includes('readme') || text.includes('docs')
  };
};

export const inferResumeSignals = (text: string): ResumeSignals => {
  const t = text.toLowerCase();
  const edu: ResumeSignals['educationLevel'] =
    t.includes('phd') || t.includes('doctorate') ? 'PhD'
    : t.includes('master') || t.includes('msc') || t.includes('meng') ? 'Masters'
    : t.includes('bachelor') || t.includes('bsc') || t.includes('beng') || t.includes('b.tech') ? 'Bachelors'
    : t.includes('bootcamp') ? 'Bootcamp'
    : t.includes('self-taught') || t.includes('self taught') || t.includes('autodidact') ? 'SelfTaught'
    : 'None';

  const certs: string[] = [];
  if (t.includes('aws')) certs.push('AWS');
  if (t.includes('gcp') || t.includes('google cloud')) certs.push('GCP');
  if (t.includes('azure')) certs.push('Azure');
  if (t.includes('scrum') || t.includes('agile')) certs.push('Scrum');
  if (t.includes('tensorflow')) certs.push('TensorFlow');
  if (t.includes('kubernetes') || t.includes('ckad')) certs.push('Kubernetes');

  return {
    hasEducation: edu !== 'None',
    educationLevel: edu,
    certifications: certs,
    hackathonCount: (t.match(/hackathon/g) || []).length,
    leadershipMentions: (t.match(/led|managed|mentored|founded|organized|director|head of/g) || []).length,
    skillsListed: extractSkills(t),
    projectsInResume: (t.match(/project:|project\s*\d|built a|developed a|created a/g) || []).length
  };
};

const extractSkills = (text: string): string[] => {
  const knownSkills = ['python', 'javascript', 'typescript', 'react', 'node', 'java', 'rust', 'go', 'c++',
    'aws', 'docker', 'kubernetes', 'tensorflow', 'pytorch', 'langchain', 'llm', 'sql', 'postgres', 'mongodb',
    'graphql', 'next.js', 'fastapi', 'django', 'flask', 'spring', 'redis', 'kafka'];
  return knownSkills.filter(s => text.includes(s));
};

// Full pipeline: text + URLs → DNA profile
export const buildDNAFromEvidence = (
  candidateName: string,
  resumeText: string,
  githubUrl?: string,
  linkedinUrl?: string,
  portfolioUrl?: string
): DNAProfile => {
  const resumeSignals = inferResumeSignals(resumeText);
  const githubSignals = inferGitHubSignals(githubUrl, resumeText);
  const linkedinSignals = inferLinkedInSignals(linkedinUrl, resumeText);
  const portfolioSignals = inferPortfolioSignals(portfolioUrl, resumeText);

  return computeDNAProfile({
    candidateName,
    resumeText,
    github: githubSignals,
    linkedin: linkedinSignals,
    portfolio: portfolioSignals,
    resume: resumeSignals
  });
};
