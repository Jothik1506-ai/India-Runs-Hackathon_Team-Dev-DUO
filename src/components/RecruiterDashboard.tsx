import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Target, BrainCircuit, ShieldCheck, Upload, Globe, FileUp } from 'lucide-react';
import type { Candidate } from '../data/mockCandidates';
import { RadarChart } from './RadarChart';
import { ResumeUploader } from './ResumeUploader';
import { DNAEvidencePanel } from './DNAEvidencePanel';

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

const metricsVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const metricItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

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
  aiName: _aiName,
  candidates,
  onUploadCandidate
}) => {
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareId, setCompareId] = useState<string>(candidates[1]?.id || 'cand-2');
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);
  const [dnaView, setDnaView] = useState<'radar' | 'evidence'>('radar');
  
  // Track checklist tasks completed by candidate
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (candidateId: string, taskIndex: number) => {
    const key = `${candidateId}-${taskIndex}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter candidates based on state prop
  const filteredCandidates = candidates.filter(c => {
    if (filterTag === 'ALL') return true;
    if (filterTag === 'HIDDEN') return c.tag !== 'Standard';
    return c.tag === filterTag;
  });

  // Sort candidates by matchScore descending
  const rankedCandidates = [...filteredCandidates].sort((a, b) => b.matchScore - a.matchScore);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const comparisonCandidate = candidates.find(c => c.id === compareId) || candidates[0];


  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 20px 20px 20px', flexGrow: 1 }}>
      
      {/* Upper Panel Quick Info & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {candidates.length > 0 && ['ALL', 'HIDDEN', 'Diamond', 'Switcher', 'Contributor'].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              style={{
                background: filterTag === tag ? 'var(--color-primary)' : 'var(--bg-input)',
                border: '1px solid',
                borderColor: filterTag === tag ? 'var(--color-primary)' : 'var(--border-color)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 500,
                color: filterTag === tag ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-sans)'
              }}
            >
              {tag === 'ALL' ? 'All Applicants' : tag === 'HIDDEN' ? 'High Potential' : tag === 'Diamond' ? 'Diamond Talent' : tag}
            </button>
          ))}
        </div>

        {candidates.length > 0 && (
          <button
            onClick={() => setIsUploaderOpen(!isUploaderOpen)}
            className="glow-btn-secondary"
            style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px' }}
          >
            <Upload size={14} />
            {isUploaderOpen ? 'Close Uploader' : 'Upload Resumes'}
          </button>
        )}
      </div>

      {/* RAG Upload Widget collapsible drawer */}
      {isUploaderOpen && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '10px' }}>INDEX NEW RESUMES INTO RAG DATABASE</h4>
          <ResumeUploader onUploadCandidate={(name, content) => {
            onUploadCandidate(name, content);
            setIsUploaderOpen(false);
          }} />
        </div>
      )}

      {/* Empty State — no resumes uploaded yet */}
      {candidates.length === 0 && !isUploaderOpen && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          {/* Icon Ring */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            border: '1px solid rgba(139,92,246,0.35)',
            boxShadow: '0 0 40px rgba(139,92,246,0.15), 0 0 80px rgba(139,92,246,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(139,92,246,0.06)',
          }}>
            <FileUp size={36} style={{ color: 'var(--color-primary)', opacity: 0.85 }} />
          </div>

          {/* Headline */}
          <div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.3px',
            }}>
              No resumes yet
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '380px',
              margin: '0 auto',
            }}>
              Upload your resume and AIVA will score it, generate your Career DNA, and build a personalised growth roadmap for you.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setIsUploaderOpen(true)}
            className="glow-btn-secondary"
            style={{ fontSize: '14px', padding: '12px 28px', borderRadius: '10px', gap: '8px' }}
          >
            <Upload size={16} />
            Upload Your Resume
          </button>

          {/* Supported formats hint */}
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
            Supports PDF, DOCX, and TXT — parsed instantly by AIVA
          </p>
        </motion.div>
      )}

      {/* Main Grid: Sidebar + Candidate Details */}
      {candidates.length > 0 && (
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', flexGrow: 1, alignItems: 'stretch' }}>
        
        {/* Left column - Rankings & Talent Pool */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '16px', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>
            RANKED APPLICANTS ({rankedCandidates.length})
          </span>
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {rankedCandidates.map((c, index) => {
              const isSelected = c.id === selectedCandidateId;
              const avatarRing = c.tag === 'Diamond' ? 'avatar-ring-diamond' : c.tag === 'Switcher' ? 'avatar-ring-switcher' : c.tag === 'Contributor' ? 'avatar-ring-contributor' : 'avatar-ring-standard';
              const tagClass = c.tag === 'Diamond' ? 'tag-diamond' : c.tag === 'Switcher' ? 'tag-switcher' : c.tag === 'Contributor' ? 'tag-contributor' : '';
              const avatarBg = c.tag === 'Diamond' ? 'rgba(139,92,246,0.12)' : c.tag === 'Switcher' ? 'rgba(244,63,94,0.12)' : c.tag === 'Contributor' ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.05)';
              const avatarColor = c.tag === 'Diamond' ? '#c4b5fd' : c.tag === 'Switcher' ? '#fda4af' : c.tag === 'Contributor' ? '#67e8f9' : 'var(--text-secondary)';
              return (
                <motion.div
                  key={c.id}
                  variants={itemVariants}
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={isSelected ? 'candidate-item-selected' : ''}
                  whileHover={isSelected ? {} : { x: 2, backgroundColor: 'rgba(255,255,255,0.025)' }}
                  style={{
                    background: isSelected ? undefined : 'rgba(255,255,255,0.015)',
                    border: isSelected ? undefined : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)', width: '18px', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                        {index + 1}
                      </div>
                      <div className={`score-ring ${avatarRing}`} style={{
                        width: '34px',
                        height: '34px',
                        background: `conic-gradient(${avatarColor} ${c.matchScore}%, rgba(255,255,255,0.04) 0)`,
                        flexShrink: 0
                      }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: avatarBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 700, color: avatarColor
                        }}>
                          {c.avatar}
                        </div>
                      </div>
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <h5 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          {c.tag !== 'Standard' && (
                            <span className={tagClass} style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, letterSpacing: '0.3px' }}>
                              {c.tagLabel}
                            </span>
                          )}
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title.split(' ').slice(0,2).join(' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', background: 'linear-gradient(135deg, #67e8f9, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{c.matchScore}%</div>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.4px' }}>MATCH</span>
                    </div>
                  </div>
                  <div className="progress-bar-track" style={{ height: '2px' }}>
                    <div className={`progress-bar-fill ${c.tag === 'Diamond' ? 'progress-bar-fill-purple' : c.tag === 'Contributor' ? 'progress-bar-fill-cyan' : c.tag === 'Switcher' ? '' : 'progress-bar-fill-cyan'}`}
                      style={{ width: `${c.matchScore}%`, background: c.tag === 'Switcher' ? 'linear-gradient(90deg, #be185d, #f43f5e, #fb7185)' : undefined }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Right column - Candidate Details & Comparison panel */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
          {selectedCandidate && (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
              
              {/* Header Panel */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selectedCandidate.name}</h2>
                    {selectedCandidate.tag !== 'Standard' && (
                      <span className={`${selectedCandidate.tag === 'Diamond' ? 'tag-diamond' : selectedCandidate.tag === 'Switcher' ? 'tag-switcher' : 'tag-contributor'}`}
                        style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, letterSpacing: '0.4px' }}>
                        {selectedCandidate.tagLabel}
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--color-secondary)', fontSize: '13.5px', fontWeight: 500, marginTop: '4px' }}>
                    {selectedCandidate.title} &bull; <span style={{ color: 'var(--text-secondary)' }}>{selectedCandidate.email}</span>
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                    {selectedCandidate.background}
                  </p>

                  {/* Portfolio / Social Links */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    {selectedCandidate.portfolioUrl && (
                      <a href={`https://${selectedCandidate.portfolioUrl}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-secondary)', textDecoration: 'none' }}>
                        <Globe size={12} /> {selectedCandidate.portfolioUrl}
                      </a>
                    )}
                    {selectedCandidate.githubUrl && (
                      <a href={`https://${selectedCandidate.githubUrl}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> {selectedCandidate.githubUrl}
                      </a>
                    )}
                    {selectedCandidate.linkedinUrl && (
                      <a href={`https://${selectedCandidate.linkedinUrl}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9" rx="1"/><circle cx="4" cy="4" r="2"/></svg> {selectedCandidate.linkedinUrl}
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setCompareMode(!compareMode)}
                    className="btn-outline" 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {compareMode ? 'Exit Comparison' : 'Compare Candidate'}
                  </button>
                </div>
              </div>

              {/* Detail Modes */}
              {compareMode ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Left Column: Active Selected Candidate */}
                  <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
                    <h4 style={{ color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                      {selectedCandidate.name} (Active)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                      <div className="metric-card-cyan">
                        <span className="section-label" style={{ fontSize: '9px', color: 'var(--color-secondary)', marginBottom: '4px' }}>MATCH SCORE</span>
                        <h4 className="gradient-text-secondary" style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{selectedCandidate.matchScore}%</h4>
                      </div>
                      <div className="metric-card-green">
                        <span className="section-label" style={{ fontSize: '9px', color: 'var(--color-success)', marginBottom: '4px' }}>LEARNING VELOCITY</span>
                        <h4 className="gradient-text-success" style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{selectedCandidate.learningVelocity}%</h4>
                      </div>
                    </div>
                    <RadarChart data={selectedCandidate.careerDNA} />
                    <div className="insight-panel insight-panel-purple" style={{ marginTop: '12px' }}>
                      <strong style={{ fontSize: '11px', color: 'var(--color-primary)' }}>AIVA Insights:</strong>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.45' }}>{selectedCandidate.rankReason}</p>
                    </div>
                  </div>

                  {/* Right Column: Comparative Candidate Selector */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ color: 'var(--color-secondary)', fontSize: '14px', fontWeight: 600 }}>Compare With:</h4>
                      <select 
                        value={compareId}
                        onChange={(e) => setCompareId(e.target.value)}
                        className="input-base"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        {candidates.filter(c => c.id !== selectedCandidate.id).map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.matchScore}%)</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                      <div className="metric-card-cyan">
                        <span className="section-label" style={{ fontSize: '9px', color: 'var(--color-secondary)', marginBottom: '4px' }}>MATCH SCORE</span>
                        <h4 className="gradient-text-secondary" style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{comparisonCandidate.matchScore}%</h4>
                      </div>
                      <div className="metric-card-green">
                        <span className="section-label" style={{ fontSize: '9px', color: 'var(--color-success)', marginBottom: '4px' }}>LEARNING VELOCITY</span>
                        <h4 className="gradient-text-success" style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{comparisonCandidate.learningVelocity}%</h4>
                      </div>
                    </div>
                    <RadarChart data={comparisonCandidate.careerDNA} />
                    <div className="insight-panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', marginTop: '12px' }}>
                      <strong style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>AI Insights:</strong>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.45' }}>{comparisonCandidate.rankReason}</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Candidate Metrics Cards */}
                  <motion.div
                    variants={metricsVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}
                  >
                    <motion.div variants={metricItemVariants} className="metric-card-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className="section-label" style={{ color: 'var(--color-secondary)' }}>
                        <ShieldCheck size={11} style={{ color: 'var(--color-secondary)' }} />
                        Profile Complete
                      </span>
                      <h4 className="gradient-text-secondary" style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{selectedCandidate.completenessScore}%</h4>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill progress-bar-fill-cyan" style={{ width: `${selectedCandidate.completenessScore}%` }} />
                      </div>
                    </motion.div>
                    <motion.div variants={metricItemVariants} className="metric-card-purple" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className="section-label" style={{ color: 'var(--color-primary)' }}>
                        <BrainCircuit size={11} style={{ color: 'var(--color-primary)' }} />
                        Resume Quality
                      </span>
                      <h4 className="gradient-text-primary" style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{selectedCandidate.resumeQualityScore}%</h4>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill progress-bar-fill-purple" style={{ width: `${selectedCandidate.resumeQualityScore}%` }} />
                      </div>
                    </motion.div>
                    <motion.div variants={metricItemVariants} className="metric-card-green" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className="section-label" style={{ color: 'var(--color-success)' }}>
                        <Target size={11} style={{ color: 'var(--color-success)' }} />
                        Learning Velocity
                      </span>
                      <h4 className="gradient-text-success" style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{selectedCandidate.learningVelocity}%</h4>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill progress-bar-fill-green" style={{ width: `${selectedCandidate.learningVelocity}%` }} />
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Dual Panel details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
                    
                    {/* DNA Profile (Left) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                          <Target size={14} style={{ color: 'var(--color-secondary)' }} />
                          CAREER DNA PROFILE
                        </h4>
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', borderRadius: '7px', padding: '3px' }}>
                          <button
                            onClick={() => setDnaView('radar')}
                            style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '5px', border: 'none', cursor: 'pointer', background: dnaView === 'radar' ? 'var(--color-primary)' : 'transparent', color: dnaView === 'radar' ? '#fff' : 'var(--text-muted)', fontWeight: 600, transition: 'all var(--transition-fast)' }}
                          >Radar</button>
                          <button
                            onClick={() => setDnaView('evidence')}
                            style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '5px', border: 'none', cursor: 'pointer', background: dnaView === 'evidence' ? 'var(--color-primary)' : 'transparent', color: dnaView === 'evidence' ? '#fff' : 'var(--text-muted)', fontWeight: 600, transition: 'all var(--transition-fast)' }}
                          >Evidence</button>
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-color)' }}>
                        {dnaView === 'radar' ? (
                          <RadarChart data={selectedCandidate.careerDNA} />
                        ) : (
                          <DNAEvidencePanel candidate={selectedCandidate} />
                        )}
                      </div>
                    </div>

                    {/* Projections & Roadmaps (Right) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Projections Stack Bar */}
                      <div className="insight-panel insight-panel-cyan">
                        <h4 className="section-label" style={{ color: 'var(--color-secondary)', marginBottom: '10px' }}>
                          <ShieldCheck size={12} />
                          AIVA FUTURE READINESS PROJECTIONS
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { label: 'Current Match', val: selectedCandidate.matchScore, cls: 'progress-bar-fill-cyan' },
                            { label: '6-Month Projection', val: selectedCandidate.futureReadiness6m, cls: 'progress-bar-fill-purple' },
                            { label: '1-Year Projection', val: selectedCandidate.futureReadiness1y, cls: 'progress-bar-fill-green' },
                          ].map(({ label, val, cls }) => (
                            <div key={label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                <span>{label}</span>
                                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{val}%</strong>
                              </div>
                              <div className="progress-bar-track" style={{ height: '4px' }}>
                                <div className={`progress-bar-fill ${cls}`} style={{ width: `${val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rank Reasoning */}
                      <div className="insight-panel insight-panel-purple">
                        <h4 className="section-label" style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>
                          <BrainCircuit size={12} />
                          AIVA EXPLAINABLE RANK REASONING
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                          {selectedCandidate.rankReason}
                        </p>
                      </div>

                      {/* Timeline Roadmap */}
                      <div>
                        <h4 className="section-label" style={{ marginBottom: '10px' }}>
                          PROJECTED 6-MONTH UPSKILLING ROADMAP &mdash; <span style={{ color: 'var(--color-secondary)' }}>{selectedCandidate.predictedRoadmap.goal}</span>
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {selectedCandidate.predictedRoadmap.tasks.map((task, idx) => {
                            const isCompleted = completedTasks[`${selectedCandidate.id}-${idx}`] || false;
                            return (
                              <div
                                key={idx}
                                onClick={() => toggleTask(selectedCandidate.id, idx)}
                                className={`roadmap-step ${isCompleted ? 'completed' : ''}`}
                              >
                                <div className="roadmap-step-num">{isCompleted ? '✓' : idx + 1}</div>
                                <span style={{ flex: 1, fontSize: '12.5px', color: isCompleted ? 'var(--text-secondary)' : '#fff', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                                  {task.name}
                                </span>
                                <span style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--color-secondary)', fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0 }}>
                                  {task.duration}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

            </div>
          )}
        </div>

      </div>
      )}

    </div>
  );
};
