import { useState, useEffect } from 'react';
import { Sparkles, Files, CheckSquare, MessageSquare, Compass, Sun, Moon } from 'lucide-react';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AIChatTab } from './components/AIChatTab';
import { SourcesTab } from './components/SourcesTab';
import { CandidateCoach } from './components/CandidateCoach';
import type { Candidate } from './data/mockCandidates';
import { mockCandidates } from './data/mockCandidates';
import { initializeRAGIndex, indexDocument } from './utils/ragEngine';

function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [activeTab, setActiveTab] = useState<'evaluator' | 'chat' | 'sources' | 'coach'>('evaluator');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(mockCandidates[0].id);
  const [aiName, setAiName] = useState<string>('APTIV');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('aptiv-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aptiv-theme', theme);
  }, [theme]);

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
    let tag: 'Diamond' | 'Switcher' | 'Contributor' | 'Standard' = 'Diamond';
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
        gap: '12px',
        zIndex: 50
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
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }} 
          />
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '2px',
              background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #0ea5e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              APTIV
            </h1>
            <span style={{ fontSize: '9.5px', color: 'var(--color-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', opacity: 0.8 }}>
              AI Talent Intelligence &amp; Vision
            </span>
          </div>
        </div>

        {/* Center Pill Switcher - Direct Match to Figma Mockups */}
        <div className="nav-pill-container">
          <button
            onClick={() => setActiveTab('evaluator')}
            className={`nav-pill-button ${activeTab === 'evaluator' ? 'active' : ''}`}
          >
            <CheckSquare size={14} />
            Recruiter Dashboard
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`nav-pill-button ${activeTab === 'chat' ? 'active' : ''}`}
          >
            <MessageSquare size={14} />
            AIVA AI
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`nav-pill-button ${activeTab === 'sources' ? 'active' : ''}`}
          >
            <Files size={14} />
            AIVA RAG
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`nav-pill-button ${activeTab === 'coach' ? 'active' : ''}`}
          >
            <Compass size={14} />
            Candidate Coach
          </button>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* AI Name Configurator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'var(--bg-input)',
            padding: '5px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
          }}>
            <Sparkles size={13} style={{ color: 'var(--color-secondary)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Agent:</span>
            {isEditingName ? (
              <input
                type="text"
                value={aiName}
                onChange={(e) => setAiName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
                autoFocus
                className="input-base"
                style={{ fontSize: '12px', padding: '2px 6px', width: '90px' }}
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

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

      </header>

      {/* Main View Display */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'evaluator' && (
          <RecruiterDashboard 
            selectedCandidateId={selectedCandidateId}
            setSelectedCandidateId={setSelectedCandidateId}
            aiName={aiName}
            candidates={candidates}
            onUploadCandidate={handleUploadCandidate}
          />
        )}
        
        {activeTab === 'chat' && (
          <AIChatTab 
            candidates={candidates}
            aiName={aiName}
            onSelectCandidate={(id) => {
              setSelectedCandidateId(id);
              setActiveTab('evaluator');
            }}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesTab 
            candidates={candidates}
            onUploadCandidate={handleUploadCandidate}
            aiName={aiName}
          />
        )}

        {activeTab === 'coach' && (
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
        padding: '14px',
        color: 'var(--text-muted)',
        fontSize: '11px',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto',
        background: 'var(--bg-surface)',
        
      }}>
        APTIV &bull; Hackathon Version MVP &bull; AI-Powered Potential, Talent, Intelligence & Vision
      </footer>

    </div>
  );
}

export default App;
