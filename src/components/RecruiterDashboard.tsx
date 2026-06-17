import React, { useState } from 'react';
import { Award, Target, BrainCircuit, MessageSquare, GitBranch, ShieldCheck, Zap, Upload } from 'lucide-react';
import type { Candidate } from '../data/mockCandidates';
import { RadarChart } from './RadarChart';
import { AIChat } from './AIChat';
import { ResumeUploader } from './ResumeUploader';

interface RecruiterDashboardProps {
  selectedCandidateId: string;
  setSelectedCandidateId: (id: string) => void;
  aiName: string;
  candidates: Candidate[];
  onUploadCandidate: (name: string, content: string) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  selectedCandidateId,
  setSelectedCandidateId,
  aiName,
  candidates,
  onUploadCandidate
}) => {
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareId, setCompareId] = useState<string>('cand-5'); // compare with David Kim by default
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);

  // Filter candidates based on state prop
  const filteredCandidates = candidates.filter(c => {
    if (filterTag === 'ALL') return true;
    if (filterTag === 'HIDDEN') return c.tag !== 'Standard';
    return c.tag === filterTag;
  });

  // Sort candidates by matchScore descending
  const rankedCandidates = [...filteredCandidates].sort((a, b) => b.matchScore - a.matchScore);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0] || mockFallback;
  const comparisonCandidate = candidates.find(c => c.id === compareId) || candidates[0] || mockFallback;

  const getTagStyles = (tag: string) => {
    switch (tag) {
      case 'Diamond':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
      case 'Switcher':
        return { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' };
      case 'Contributor':
        return { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--text-secondary)', border: 'var(--border-color)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
      
      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
            <BrainCircuit style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI Audited Profiles</span>
            <h4 style={{ fontSize: '20px', fontWeight: 'bold' }}>{candidates.length} Active</h4>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-secondary-glow)', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
            <Award style={{ color: 'var(--color-secondary)' }} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hidden Talents Unlocked</span>
            <h4 style={{ fontSize: '20px', fontWeight: 'bold' }}>{candidates.filter(c => c.tag !== 'Standard').length} High-Potential</h4>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
            <Zap style={{ color: '#10b981' }} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Avg. Learning Velocity</span>
            <h4 style={{ fontSize: '20px', fontWeight: 'bold' }}>88.2% Velocity</h4>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', flexGrow: 1, alignItems: 'stretch' }}>
        
        {/* Left column - Rankings & Upload Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Quick Filters */}
          <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>FILTER POOL</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['ALL', 'HIDDEN', 'Diamond', 'Switcher', 'Contributor'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  style={{
                    background: filterTag === tag ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: filterTag === tag ? 'var(--color-primary)' : 'var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {tag === 'ALL' ? 'All Applicants' : tag === 'HIDDEN' ? 'Hidden Talents' : tag}
                </button>
              ))}
            </div>
          </div>

          {/* RAG Upload Widget collapsible card */}
          <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setIsUploaderOpen(!isUploaderOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={14} />
                INDEX NEW RESUMES (RAG)
              </span>
              <span>{isUploaderOpen ? 'Collapse [-]' : 'Expand [+]'}</span>
            </button>
            
            {isUploaderOpen && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                <ResumeUploader onUploadCandidate={onUploadCandidate} />
              </div>
            )}
          </div>

          {/* List Wrapper */}
          <div className="glass-panel" style={{ flexGrow: 1, padding: '12px', overflowY: 'auto', maxHeight: '450px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>RANKED APPLICANTS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rankedCandidates.map((c, index) => {
                const styles = getTagStyles(c.tag);
                const isSelected = c.id === selectedCandidateId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCandidateId(c.id)}
                    style={{
                      background: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)', width: '16px' }}>#{index + 1}</div>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                        {c.avatar}
                      </div>
                      <div>
                        <h5 style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>{c.name}</h5>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>{c.title}</span>
                        {c.tag !== 'Standard' && (
                          <span style={{ 
                            background: styles.bg, 
                            color: styles.text, 
                            border: `1px solid ${styles.border}`, 
                            fontSize: '9px', 
                            padding: '1px 6px', 
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginTop: '4px'
                          }}>
                            {c.tagLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{c.matchScore}%</div>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Match</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column - Deep Details & Compare */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Details Panel */}
          {selectedCandidate && (
            <div className="glass-panel" style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Candidate Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{selectedCandidate.name}</h2>
                  <p style={{ color: 'var(--color-secondary)', fontSize: '14px', fontWeight: 500 }}>{selectedCandidate.title} &bull; <span style={{ color: 'var(--text-secondary)' }}>{selectedCandidate.email}</span></p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '600px' }}>{selectedCandidate.background}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setCompareMode(!compareMode)}
                    className="btn-outline" 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <GitBranch size={14} />
                    {compareMode ? 'Exit Compare' : 'Compare Candidate'}
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison Mode or Normal Mode */}
              {compareMode ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Left - Selected Candidate */}
                  <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
                    <h4 style={{ color: 'var(--color-primary)', fontSize: '15px', marginBottom: '10px' }}>{selectedCandidate.name} (Active)</h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MATCH SCORE</span>
                        <h4 style={{ fontSize: '18px', color: 'var(--color-secondary)' }}>{selectedCandidate.matchScore}%</h4>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>LEARNING VELOCITY</span>
                        <h4 style={{ fontSize: '18px', color: 'var(--color-primary)' }}>{selectedCandidate.learningVelocity}%</h4>
                      </div>
                    </div>
                    <RadarChart data={selectedCandidate.careerDNA} />
                    <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.1)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>
                      <strong>Rank Reason:</strong> {selectedCandidate.rankReason}
                    </div>
                  </div>

                  {/* Right - Comparison Selection */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ color: 'var(--color-secondary)', fontSize: '15px' }}>Compare With:</h4>
                      <select 
                        value={compareId}
                        onChange={(e) => setCompareId(e.target.value)}
                        style={{ background: 'var(--bg-main)', color: '#fff', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}
                      >
                        {candidates.filter(c => c.id !== selectedCandidate.id).map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.matchScore}%)</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MATCH SCORE</span>
                        <h4 style={{ fontSize: '18px', color: 'var(--color-secondary)' }}>{comparisonCandidate.matchScore}%</h4>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>LEARNING VELOCITY</span>
                        <h4 style={{ fontSize: '18px', color: 'var(--color-primary)' }}>{comparisonCandidate.learningVelocity}%</h4>
                      </div>
                    </div>
                    <RadarChart data={comparisonCandidate.careerDNA} />
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>
                      <strong>Rank Reason:</strong> {comparisonCandidate.rankReason}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
                  
                  {/* Left - DNA Web */}
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Target size={14} style={{ color: 'var(--color-secondary)' }} />
                      CAREER DNA PROFILE
                    </h4>
                    <div style={{ background: 'rgba(0, 0, 0, 0.15)', borderRadius: '12px', padding: '10px', border: '1px solid var(--border-color)' }}>
                      <RadarChart data={selectedCandidate.careerDNA} />
                    </div>
                  </div>

                  {/* Right - Profile stats, Growth & Why */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Score breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>PROFILE COMPLETENESS</span>
                        <h4 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>{selectedCandidate.completenessScore}%</h4>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>RESUME QUALITY SCORE</span>
                        <h4 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>{selectedCandidate.resumeQualityScore}%</h4>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>PROJECT COMPLEXITY</span>
                        <h4 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>{selectedCandidate.projectQuality}%</h4>
                      </div>
                    </div>

                    {/* Future Readiness Prediction */}
                    <div style={{ background: 'rgba(6, 182, 212, 0.03)', border: '1px solid rgba(6, 182, 212, 0.1)', borderRadius: '12px', padding: '14px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <ShieldCheck size={14} />
                        FUTURE READINESS PREDICTION
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>Current Match: <strong>{selectedCandidate.matchScore}%</strong></span>
                            <span>6m Projection: <strong>{selectedCandidate.futureReadiness6m}%</strong></span>
                            <span>1y Projection: <strong>{selectedCandidate.futureReadiness1y}%</strong></span>
                          </div>
                          {/* Interactive glow progress bars */}
                          <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ background: 'var(--color-secondary)', width: `${selectedCandidate.matchScore}%`, height: '100%', position: 'absolute', left: 0, zIndex: 3 }} />
                            <div style={{ background: 'var(--color-primary)', width: `${selectedCandidate.futureReadiness6m}%`, height: '100%', position: 'absolute', left: 0, zIndex: 2, opacity: 0.6 }} />
                            <div style={{ background: '#10b981', width: `${selectedCandidate.futureReadiness1y}%`, height: '100%', position: 'absolute', left: 0, zIndex: 1, opacity: 0.3 }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explainable Rank Explanation */}
                    <div style={{ background: 'rgba(139, 92, 246, 0.03)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '12px', padding: '14px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <BrainCircuit size={14} />
                        EXPLAINABLE RANK REASONING
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {selectedCandidate.rankReason}
                      </p>
                    </div>

                    {/* Roadmap Summary */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>PROJECTED 6-MONTH UPSKILLING ROADMAP ({selectedCandidate.predictedRoadmap.goal})</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedCandidate.predictedRoadmap.tasks.map((t, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-primary)' }}>&bull; {t.name}</span>
                            <span style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>{t.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Floating AI Chat Side Button & Modal */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
        {isChatOpen ? (
          <div style={{ width: '380px', height: '520px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }} className="animate-fade-in">
            <div style={{ height: '100%', position: 'relative' }}>
              <button 
                onClick={() => setIsChatOpen(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer', zIndex: 10 }}
              >
                Minimize
              </button>
              <AIChat onSelectCandidate={(id) => {
                setSelectedCandidateId(id);
                setIsChatOpen(false);
              }} aiName={aiName} />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="glow-btn-primary"
            style={{ borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <MessageSquare size={24} style={{ color: '#fff' }} />
          </button>
        )}
      </div>

    </div>
  );
};

// Fallback constant just in case array index resolves empty
const mockFallback: Candidate = {
  id: "fall-1",
  name: "Standby Profile",
  title: "Candidate Profile",
  avatar: "SP",
  email: "standby@platform.ai",
  background: "Initial search indexing standby",
  completenessScore: 80,
  resumeQualityScore: 80,
  missingReport: [],
  careerDNA: { Builder: 80, Innovator: 80, Researcher: 80, Leader: 80, Collaborator: 80, ProblemSolver: 80 },
  matchScore: 80,
  tag: 'Standard',
  tagLabel: 'Standard Candidate',
  tagReason: 'Standard matching data profile',
  projectQuality: 80,
  learningVelocity: 80,
  futureReadiness6m: 80,
  futureReadiness1y: 80,
  predictedRoadmap: { goal: 'Full Stack Engineer', tasks: [] },
  rankReason: "System initialization placeholder metadata."
};
