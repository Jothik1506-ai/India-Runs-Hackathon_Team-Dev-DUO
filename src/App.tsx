import { useState, useEffect } from 'react';
import { User, Sparkles, Building2 } from 'lucide-react';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { CandidateCoach } from './components/CandidateCoach';
import type { Candidate } from './data/mockCandidates';
import { mockCandidates } from './data/mockCandidates';
import { initializeRAGIndex, indexDocument } from './utils/ragEngine';

function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [viewMode, setViewMode] = useState<'recruiter' | 'candidate'>('recruiter');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(mockCandidates[0].id);
  const [aiName, setAiName] = useState<string>('APTIV');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Initialize RAG database with candidate background texts
  useEffect(() => {
    initializeRAGIndex(candidates);
  }, []);

  // RAG Resume Ingestion Handler
  const handleUploadCandidate = (name: string, content: string) => {
    const newId = `uploaded-${Date.now()}`;
    
    // Parse name for initials avatar
    const firstLetters = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'CD';

    // Parse resume content keywords to auto-profile the candidate
    const text = content.toLowerCase();
    let tag: 'Diamond' | 'Switcher' | 'Contributor' = 'Diamond';
    let tagLabel = 'Diamond Portfolio';
    let tagReason = 'Strong practical portfolio matching candidate competencies.';
    let goal = 'Software Engineer';

    if (text.includes('rust') || text.includes('systems') || text.includes('assembly') || text.includes('c++')) {
      tag = 'Contributor';
      tagLabel = 'OSS Systems Champ';
      tagReason = 'Proven systems coding capability and open-source contributions.';
      goal = 'Systems & Infrastructure Architect';
    } else if (text.includes('mechanical') || text.includes('civil') || text.includes('physics') || text.includes('pivoted')) {
      tag = 'Switcher';
      tagLabel = 'Engineering Pivot';
      tagReason = 'Nontraditional technical background pivoting with fast growth.';
      goal = 'AI Platform Engineer';
    } else if (text.includes('phd') || text.includes('research') || text.includes('science') || text.includes('thesis')) {
      tag = 'Contributor';
      tagLabel = 'Deep Researcher';
      tagReason = 'Scientific background with strong theoretical and algorithmic capacity.';
      goal = 'AI Research Scientist';
    }

    const newCand: Candidate = {
      id: newId,
      name: name,
      title: `${goal} Candidate`,
      avatar: firstLetters,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@talentdns.org`,
      background: content.slice(0, 250) + (content.length > 250 ? '...' : ''),
      completenessScore: 82 + Math.floor(Math.random() * 15),
      resumeQualityScore: 78 + Math.floor(Math.random() * 18),
      missingReport: [
        "Your profile is missing corporate tenure references. Syncing LinkedIn references will accelerate validation by 45%.",
        "Add links to live demo deployments for your technical projects."
      ],
      careerDNA: {
        Builder: 82 + Math.floor(Math.random() * 16),
        Innovator: 80 + Math.floor(Math.random() * 18),
        Researcher: 70 + Math.floor(Math.random() * 25),
        Leader: 65 + Math.floor(Math.random() * 25),
        Collaborator: 80 + Math.floor(Math.random() * 15),
        ProblemSolver: 85 + Math.floor(Math.random() * 13)
      },
      matchScore: 80 + Math.floor(Math.random() * 17),
      tag: tag,
      tagLabel: tagLabel,
      tagReason: tagReason,
      projectQuality: 82 + Math.floor(Math.random() * 15),
      learningVelocity: 85 + Math.floor(Math.random() * 14),
      futureReadiness6m: 90 + Math.floor(Math.random() * 7),
      futureReadiness1y: 94 + Math.floor(Math.random() * 5),
      predictedRoadmap: {
        goal: goal,
        tasks: [
          { name: "Deploy system microservices utilizing Docker & AWS ECS", duration: "1 month" },
          { name: "Build 2 scale-tested open-source applications", duration: "1.5 months" },
          { name: "Participate in collaborative design review workshops", duration: "3 weeks" }
        ]
      },
      rankReason: `Matches targeted roles as a ${tagLabel} with high learning velocity (${85 + Math.floor(Math.random() * 14)}%) and robust project complexity indexes. RAG searches show high matching keyword density.`
    };

    // Update list state
    setCandidates(prev => {
      const updated = [newCand, ...prev];
      // Sync RAG indexer with the new candidate
      indexDocument(newCand.id, newCand.name, content, 'Uploaded Resume File');
      return updated;
    });

    // Automatically focus the newly uploaded candidate
    setSelectedCandidateId(newId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      
      {/* Navigation Header */}
      <header className="glass-panel" style={{ 
        margin: '16px 20px', 
        padding: '12px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderRadius: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo.jpg" 
            alt="APTIV Logo" 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '8px',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              border: '1px solid rgba(255,255,255,0.1)'
            }} 
          />
          <div>
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              letterSpacing: '0.5px',
              background: 'linear-gradient(to right, #fff, var(--text-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              APTIV
            </h1>
            <span style={{ fontSize: '10px', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              AI-Powered Potential, Talent, Intelligence & Vision
            </span>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          padding: '4px', 
          borderRadius: '10px', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '4px'
        }}>
          <button
            onClick={() => setViewMode('recruiter')}
            style={{
              background: viewMode === 'recruiter' ? 'var(--color-primary)' : 'transparent',
              border: 'none',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Building2 size={14} />
            Recruiter Dashboard
          </button>
          <button
            onClick={() => setViewMode('candidate')}
            style={{
              background: viewMode === 'candidate' ? 'var(--color-primary)' : 'transparent',
              border: 'none',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <User size={14} />
            Candidate Coach
          </button>
        </div>

        {/* AI Name Configurator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Sparkles size={14} style={{ color: 'var(--color-secondary)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI Agent Name:</span>
          {isEditingName ? (
            <input 
              type="text" 
              value={aiName}
              onChange={(e) => setAiName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
              autoFocus
              style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--color-primary)',
                color: '#fff',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '4px',
                width: '90px',
                outline: 'none'
              }}
            />
          ) : (
            <span 
              onClick={() => setIsEditingName(true)}
              style={{ 
                fontSize: '12.5px', 
                fontWeight: 700, 
                color: 'var(--color-primary)', 
                cursor: 'pointer',
                borderBottom: '1px dashed var(--color-primary)',
                paddingBottom: '1px'
              }}
              title="Click to rename your AI Agent"
            >
              {aiName}
            </span>
          )}
        </div>

      </header>

      {/* Main View Display */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {viewMode === 'recruiter' ? (
          <RecruiterDashboard 
            selectedCandidateId={selectedCandidateId}
            setSelectedCandidateId={setSelectedCandidateId}
            aiName={aiName}
            candidates={candidates}
            onUploadCandidate={handleUploadCandidate}
          />
        ) : (
          <CandidateCoach 
            candidateId={selectedCandidateId}
            setCandidateId={setSelectedCandidateId}
            candidates={candidates}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '16px', 
        color: 'var(--text-muted)', 
        fontSize: '12px', 
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto'
      }}>
        APTIV &bull; Hackathon Version MVP &bull; AI-Powered Potential, Talent, Intelligence & Vision
      </footer>

    </div>
  );
}

export default App;
