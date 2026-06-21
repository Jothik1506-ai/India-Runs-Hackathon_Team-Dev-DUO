export interface CareerDNA {
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

export const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Alex Rivera",
    title: "Self-Taught AI Developer",
    avatar: "AR",
    email: "alex.rivera@gmail.com",
    background: "Mechanical Engineering student who pivoted to AI/ML 10 months ago. Built multiple open-source LLM agents.",
    completenessScore: 82,
    resumeQualityScore: 78,
    missingReport: [
      "Your profile is missing a LinkedIn connection. Syncing it can boost outreach response rates by 15%.",
      "Missing formal cloud certifications. Adding AWS/GCP basic certs will align you with enterprise needs."
    ],
    careerDNA: {
      Builder: 94,
      Innovator: 91,
      Researcher: 70,
      Leader: 65,
      Collaborator: 82,
      ProblemSolver: 96
    },
    matchScore: 88,
    tag: "Switcher",
    tagLabel: "Career Switcher",
    tagReason: "Mechanical Engineering background with exceptionally rapid growth in practical AI implementations.",
    projectQuality: 92,
    learningVelocity: 95,
    futureReadiness6m: 92,
    futureReadiness1y: 97,
    predictedRoadmap: {
      goal: "AI Platform Engineer",
      tasks: [
        { name: "Deep Learning Specialization (Andrew Ng)", duration: "3 weeks" },
        { name: "Build 3 End-to-End LLM Agent Projects using LangChain", duration: "1 month" },
        { name: "Contribute to LangChain/LlamaIndex core repositories", duration: "2 months" },
        { name: "System Design for AI inference scalability", duration: "1.5 months" }
      ]
    },
    rankReason: "Alex ranks higher due to a phenomenal Learning Velocity (95%) and high project quality (92%) despite lacking a traditional CS degree. The DNA profile highlights top-tier Builder and Problem Solver capabilities.",
    githubUrl: "github.com/alexrivera-ai",
    linkedinUrl: "linkedin.com/in/alex-rivera-pivots",
    portfolioUrl: "alexrivera.dev",
    evidenceBundle: {
      github: { repoCount: 18, commitFrequency: 'High', stars: 340, forks: 42, languages: ['Python', 'LangChain', 'TypeScript', 'Rust'], hasOSSContributions: true, projectComplexity: 'Enterprise', readmeQuality: 'High' },
      linkedin: { yearsExperience: 1, hasRecommendations: false, certificationCount: 0, hasConsistentProgression: false, internshipCount: 0 },
      portfolio: { projectCount: 5, hasDeployedApps: true, hasCaseStudies: true, hasTechnicalDocs: true },
      resume: { hasEducation: true, educationLevel: 'SelfTaught', certifications: [], hackathonCount: 2, leadershipMentions: 1, skillsListed: ['Python', 'LangChain', 'LlamaIndex', 'Rust', 'TypeScript'], projectsInResume: 6 }
    }
  },
  {
    id: "cand-2",
    name: "Lana Chen",
    title: "Full Stack Engineer",
    avatar: "LC",
    email: "lana.c@outlook.com",
    background: "High school graduate, self-taught programmer with 4 years of freelance web and app development experience.",
    completenessScore: 92,
    resumeQualityScore: 68,
    missingReport: [
      "Resume lacks traditional academic background details. Structure your freelance work like senior roles to offset this.",
      "Add direct links to live web app deployments for your portfolio projects."
    ],
    careerDNA: {
      Builder: 96,
      Innovator: 88,
      Researcher: 60,
      Leader: 75,
      Collaborator: 90,
      ProblemSolver: 89
    },
    matchScore: 86,
    tag: "Diamond",
    tagLabel: "Diamond in the Rough",
    tagReason: "Strong, production-grade portfolio and freelance history, overlooked by standard ATS due to missing academic degree.",
    projectQuality: 94,
    learningVelocity: 88,
    futureReadiness6m: 90,
    futureReadiness1y: 93,
    predictedRoadmap: {
      goal: "Senior Full Stack Architect",
      tasks: [
        { name: "Advanced System Design and Distributed Systems", duration: "1 month" },
        { name: "Deploy full stack SaaS running on Kubernetes/Docker", duration: "2 months" },
        { name: "Contribute to Next.js or React Core repo", duration: "1 month" }
      ]
    },
    rankReason: "Lana outperforms peers with formal degrees because of her outstanding portfolio quality (94%) and robust practical Builder score (96%). Traditional ATS filter she fails is bypassed by her Career DNA signature.",
    githubUrl: "github.com/lanachen-codes",
    portfolioUrl: "lanachen.codes",
    evidenceBundle: {
      github: { repoCount: 22, commitFrequency: 'High', stars: 180, forks: 28, languages: ['TypeScript', 'React', 'Next.js', 'CSS', 'Node.js'], hasOSSContributions: false, projectComplexity: 'Mid', readmeQuality: 'High' },
      portfolio: { projectCount: 8, hasDeployedApps: true, hasCaseStudies: true, hasTechnicalDocs: false },
      resume: { hasEducation: false, educationLevel: 'SelfTaught', certifications: [], hackathonCount: 1, leadershipMentions: 0, skillsListed: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Figma'], projectsInResume: 8 }
    }
  },
  {
    id: "cand-3",
    name: "Marcus Aurelius",
    title: "Open Source Contributor",
    avatar: "MA",
    email: "marcus.codes@oss.org",
    background: "Core contributor to Node.js and Express.js ecosystems. Active GitHub profile with 8,000+ stars on personal repos.",
    completenessScore: 78,
    resumeQualityScore: 65,
    missingReport: [
      "Your resume is extremely short (1 page summary). Expand on project business impact to improve Recruiter scores.",
      "Missing professional references or history of corporate tenure."
    ],
    careerDNA: {
      Builder: 98,
      Innovator: 92,
      Researcher: 85,
      Leader: 70,
      Collaborator: 95,
      ProblemSolver: 94
    },
    matchScore: 92,
    tag: "Contributor",
    tagLabel: "OSS Champ",
    tagReason: "Massive community contributions, maintaining popular developer utilities, but has limited standard office employment.",
    projectQuality: 98,
    learningVelocity: 90,
    futureReadiness6m: 94,
    futureReadiness1y: 96,
    predictedRoadmap: {
      goal: "Principal Systems Engineer",
      tasks: [
        { name: "Learn Cloud Security & Infrastructure Management", duration: "1 month" },
        { name: "Build enterprise-grade SaaS microservices framework", duration: "1.5 months" },
        { name: "Obtain AWS Certified Solutions Architect Associate", duration: "1 month" }
      ]
    },
    rankReason: "Marcus holds the highest technical project score (98%) and Collaborator DNA (95%). Traditional ATS would penalize his short resume, but Career DNA highlights his massive actual code footprint.",
    githubUrl: "github.com/marcus-codes",
    evidenceBundle: {
      github: { repoCount: 38, commitFrequency: 'High', stars: 8200, forks: 640, languages: ['JavaScript', 'TypeScript', 'Node.js', 'Go', 'Rust'], hasOSSContributions: true, projectComplexity: 'Enterprise', readmeQuality: 'High' },
      resume: { hasEducation: false, educationLevel: 'SelfTaught', certifications: [], hackathonCount: 0, leadershipMentions: 1, skillsListed: ['Node.js', 'JavaScript', 'TypeScript', 'Express', 'Go', 'Rust'], projectsInResume: 4 }
    }
  },
  {
    id: "cand-4",
    name: "Sarah Jenkins",
    title: "Software Engineer II",
    avatar: "SJ",
    email: "sarah.jenkins@corp.com",
    background: "BS in Computer Science. 3 years working at a mid-sized fintech company maintaining Java and React services.",
    completenessScore: 98,
    resumeQualityScore: 90,
    missingReport: [
      "Perfect profile structure! To elevate further, try adding links to open-source contributions or personal hobby projects."
    ],
    careerDNA: {
      Builder: 80,
      Innovator: 75,
      Researcher: 70,
      Leader: 78,
      Collaborator: 85,
      ProblemSolver: 82
    },
    matchScore: 82,
    tag: "Standard",
    tagLabel: "Standard Applicant",
    tagReason: "Strong formal background, standard academic credentials, and reliable corporate background.",
    projectQuality: 80,
    learningVelocity: 78,
    futureReadiness6m: 84,
    futureReadiness1y: 88,
    predictedRoadmap: {
      goal: "Lead Fintech Architect",
      tasks: [
        { name: "Distributed Systems & Event-Driven Architecture", duration: "2 months" },
        { name: "Participate in internal architecture committees", duration: "3 months" }
      ]
    },
    rankReason: "Sarah has a highly complete profile (98%) and solid foundation, but lower overall learning velocity (78%) compared to active builders, placing her standard but highly qualified.",
    linkedinUrl: "linkedin.com/in/sarah-jenkins-fintech",
    evidenceBundle: {
      github: { repoCount: 6, commitFrequency: 'Low', stars: 12, forks: 2, languages: ['Java', 'React', 'JavaScript'], hasOSSContributions: false, projectComplexity: 'Mid', readmeQuality: 'Medium' },
      linkedin: { yearsExperience: 3, hasRecommendations: true, certificationCount: 2, hasConsistentProgression: true, internshipCount: 1 },
      resume: { hasEducation: true, educationLevel: 'Bachelors', certifications: ['AWS', 'Scrum'], hackathonCount: 0, leadershipMentions: 1, skillsListed: ['Java', 'React', 'Spring', 'SQL', 'AWS'], projectsInResume: 3 }
    }
  },
  {
    id: "cand-5",
    name: "David Kim",
    title: "Junior Backend Developer",
    avatar: "DK",
    email: "david.kim@startup.io",
    background: "Bootcamp graduate with 1 year experience building Python REST APIs for an e-commerce startup.",
    completenessScore: 85,
    resumeQualityScore: 82,
    missingReport: [
      "Missing front-end skills. Learning React would improve your versatility and profile score by 18%.",
      "No custom domain portfolio website. Standard GitHub pages are okay, but custom domains appear more professional."
    ],
    careerDNA: {
      Builder: 82,
      Innovator: 74,
      Researcher: 65,
      Leader: 60,
      Collaborator: 80,
      ProblemSolver: 78
    },
    matchScore: 74,
    tag: "Standard",
    tagLabel: "Standard Applicant",
    tagReason: "Standard bootcamp transition pathway with junior backend engineering experience.",
    projectQuality: 75,
    learningVelocity: 82,
    futureReadiness6m: 78,
    futureReadiness1y: 84,
    predictedRoadmap: {
      goal: "Backend Lead / Engineer",
      tasks: [
        { name: "Advanced Data Structures & Algorithms", duration: "1 month" },
        { name: "Docker and AWS Container services", duration: "3 weeks" },
        { name: "Build 2 scale-tested Golang or Python microservices", duration: "1.5 months" }
      ]
    },
    rankReason: "David is ranked below Alex and Marcus because of lower current project complexity (75%) and standard learning rates, though his trajectory remains healthy.",
    githubUrl: "github.com/davidkim-backend",
    linkedinUrl: "linkedin.com/in/davidkim-dev",
    evidenceBundle: {
      github: { repoCount: 5, commitFrequency: 'Medium', stars: 8, forks: 1, languages: ['Python', 'JavaScript'], hasOSSContributions: false, projectComplexity: 'Basic', readmeQuality: 'Low' },
      linkedin: { yearsExperience: 1, hasRecommendations: false, certificationCount: 0, hasConsistentProgression: false, internshipCount: 0 },
      resume: { hasEducation: true, educationLevel: 'Bootcamp', certifications: [], hackathonCount: 1, leadershipMentions: 0, skillsListed: ['Python', 'Django', 'REST API', 'Docker'], projectsInResume: 3 }
    }
  }
];
