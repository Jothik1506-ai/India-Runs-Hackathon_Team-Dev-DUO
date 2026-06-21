import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Files, CheckSquare, MessageSquare, Compass, Sun, Moon } from 'lucide-react';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AIChatTab } from './components/AIChatTab';
import { SourcesTab } from './components/SourcesTab';
import { CandidateCoach } from './components/CandidateCoach';
import type { Candidate } from './data/mockCandidates';
import { indexDocument } from './utils/ragEngine';
import { scoreResume, generateRoadmap } from './utils/resumeScorer';

function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeTab, setActiveTab] = useState<'evaluator' | 'chat' | 'sources' | 'coach'>('evaluator');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [aiName, setAiName] = useState<string>('APTIV');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('aptiv-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aptiv-theme', theme);
  }, [theme]);

  // RAG Resume Ingestion Handler — honest evidence-based scoring (no Math.random inflation)
  const handleUploadCandidate = (name: string, content: string) => {
    const newId = crypto.randomUUID();

    const firstLetters = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'CD';

    const scored = scoreResume(name, content);
    const roadmapTasks = generateRoadmap(scored.goal, content, scored);

    const newCand: Candidate = {
      id: newId,
      name: name,
      title: `${scored.goal} Candidate`,
      avatar: firstLetters,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@talentdns.org`,
      background: content.slice(0, 250) + (content.length > 250 ? '...' : ''),
      completenessScore: scored.completenessScore,
      resumeQualityScore: scored.resumeQualityScore,
      missingReport: scored.missingReport,
      careerDNA: scored.careerDNA,
      matchScore: scored.matchScore,
      tag: scored.tag,
      tagLabel: scored.tagLabel,
      tagReason: scored.tagReason,
      projectQuality: scored.projectQuality,
      learningVelocity: scored.learningVelocity,
      futureReadiness6m: scored.futureReadiness6m,
      futureReadiness1y: scored.futureReadiness1y,
      predictedRoadmap: {
        goal: scored.goal,
        tasks: roadmapTasks
      },
      rankReason: scored.rankReason
    };

    setCandidates(prev => {
      const updated = [newCand, ...prev];
      indexDocument(newCand.id, newCand.name, content, 'Uploaded Resume File');
      return updated;
    });

    setSelectedCandidateId(newId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      
      {/* Navigation Header */}
      <motion.header
        className="glass-panel"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' as const }}
        style={{
          margin: '16px 20px',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '16px',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 50,
          position: 'sticky',
          top: '16px',
        }}
      >
        
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.div
            className="animate-logo"
            style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(6,182,212,0.12))', border: '1px solid rgba(139,92,246,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
              <img src="/aiva-logo.png" alt="AIVA" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </div>
          </motion.div>
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
              by AIVA &bull; Talent Intelligence &amp; Vision
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
            AIVA Recruiter AI
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`nav-pill-button ${activeTab === 'sources' ? 'active' : ''}`}
          >
            <Files size={14} />
            AIVA Sources
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`nav-pill-button ${activeTab === 'coach' ? 'active' : ''}`}
          >
            <Compass size={14} />
            AIVA Career Coach
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
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AIVA Agent:</span>
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

      </motion.header>

      {/* Main View Display */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'evaluator' && (
            <motion.div
              key="evaluator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' as const }}
              style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
            >
              <RecruiterDashboard
                selectedCandidateId={selectedCandidateId}
                setSelectedCandidateId={setSelectedCandidateId}
                aiName={aiName}
                candidates={candidates}
                onUploadCandidate={handleUploadCandidate}
              />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' as const }}
              style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
            >
              <AIChatTab
                candidates={candidates}
                aiName={aiName}
                onSelectCandidate={(id) => {
                  setSelectedCandidateId(id);
                  setActiveTab('evaluator');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'sources' && (
            <motion.div
              key="sources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' as const }}
              style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
            >
              <SourcesTab
                candidates={candidates}
                onUploadCandidate={handleUploadCandidate}
                aiName={aiName}
              />
            </motion.div>
          )}

          {activeTab === 'coach' && (
            <motion.div
              key="coach"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' as const }}
              style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
            >
              <CandidateCoach
                candidateId={selectedCandidateId}
                setCandidateId={setSelectedCandidateId}
                candidates={candidates}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
        APTIV &bull; Powered by AIVA Intelligence &bull; AI-Powered Potential, Talent, Intelligence & Vision
      </footer>

    </div>
  );
}

export default App;
