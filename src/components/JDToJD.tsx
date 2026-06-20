import React, { useState } from 'react';
import { Briefcase, Play, Users } from 'lucide-react';
import type { Candidate } from '../data/mockCandidates';

interface JDToJDProps {
  candidates: Candidate[];
  onSelectCandidate: (candidateId: string, tabName: 'evaluator' | 'coach') => void;
}

interface JobRole {
  id: string;
  title: string;
  requirements: string;
}

export const JDToJD: React.FC<JDToJDProps> = ({ candidates, onSelectCandidate }) => {
  const [roles, setRoles] = useState<JobRole[]>([
    {
      id: 'j1',
      title: 'AI Platform Engineer',
      requirements: 'Requirements:\n- Strong practical experience building LLM agents and RAG pipelines\n- Proficient in Python, LangChain, or LlamaIndex\n- Experience with vector databases (Pinecone, Chroma, Qdrant)\n- Background in Mechanical Engineering, Physics, or Math is a plus'
    },
    {
      id: 'j2',
      title: 'Principal Systems Architect',
      requirements: 'Requirements:\n- Deep systems-level programming expertise in C++, Rust, or Go\n- Core open-source contributions to developer tools and databases\n- Experience design microservices scalable deployments\n- Excellent understanding of concurrency and performance optimization'
    },
    {
      id: 'j3',
      title: 'Lead React Developer',
      requirements: 'Requirements:\n- 4+ years of freelance or corporate web application development\n- Production grade knowledge of Next.js, React 19, TypeScript, and CSS3\n- Self-taught builder with outstanding portfolio projects\n- UI/UX engineering experience'
    }
  ]);
  const [selectedRoleId, setSelectedRoleId] = useState('j1');
  const [jdText, setJdText] = useState(roles[0].requirements);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectRole = (id: string) => {
    setSelectedRoleId(id);
    const role = roles.find(r => r.id === id);
    if (role) {
      setJdText(role.requirements);
      setScores({});
    }
  };

  const createNewRole = () => {
    const newId = `j-${Date.now()}`;
    const newRole: JobRole = {
      id: newId,
      title: 'New Custom Role',
      requirements: 'Requirements:\n- Type required skills here...'
    };
    setRoles(prev => [...prev, newRole]);
    setSelectedRoleId(newId);
    setJdText(newRole.requirements);
    setScores({});
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const jdTerms = jdText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 3);
      const calculated: Record<string, number> = {};

      candidates.forEach(c => {
        const profileText = `${c.name} ${c.title} ${c.background} ${c.tagReason} ${Object.keys(c.careerDNA).join(' ')}`.toLowerCase();
        let matches = 0;
        
        jdTerms.forEach(term => {
          if (profileText.includes(term)) {
            matches++;
          }
        });

        // Calculate a score between 65% and 98% based on match density
        const overlapRatio = jdTerms.length > 0 ? matches / jdTerms.length : 0;
        const score = Math.min(98, Math.max(60, Math.round(60 + (overlapRatio * 38) + (c.learningVelocity / 15))));
        calculated[c.id] = score;
      });

      setScores(calculated);
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', padding: '0 20px 20px 20px', flexGrow: 1, height: 'calc(100vh - 120px)' }}>
      
      {/* Left Sidebar - Job Roles */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '16px', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
            JOB DESCRIPTION LIST
          </span>
          <button 
            onClick={createNewRole}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-secondary)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
          >
            + New JD
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {roles.map(r => {
            const isActive = r.id === selectedRoleId;
            return (
              <div
                key={r.id}
                onClick={() => selectRole(r.id)}
                style={{
                  background: isActive ? 'rgba(139, 92, 246, 0.06)' : 'rgba(255, 255, 255, 0.01)',
                  border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Briefcase size={14} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: 600, color: isActive ? '#fff' : 'var(--text-secondary)' }}>
                    {r.title}
                  </h5>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Main Editor and Match List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', height: '100%' }}>
        
        {/* Editor (Left) */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Edit Job Specifications
            </h3>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="glow-btn-primary"
              style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px' }}
            >
              {isAnalyzing ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Play size={12} fill="currentColor" /> Match Resumes
                </>
              )}
            </button>
          </div>

          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste Job Description specifications here..."
            style={{
              flexGrow: 1,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              lineHeight: '1.5',
              outline: 'none',
              resize: 'none',
              transition: 'border-color var(--transition-fast)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          />
        </div>

        {/* Candidate Match Scores (Right) */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '16px', height: '100%', overflowY: 'auto' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
            RANKED RESUMES MATCH INDEX
          </span>

          {Object.keys(scores).length === 0 ? (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', gap: '8px' }}>
              <Users size={32} style={{ color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Click **Match Resumes** above to evaluate the candidate pool against these requirements.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {candidates
                .map(c => ({ ...c, score: scores[c.id] || 60 }))
                .sort((a, b) => b.score - a.score)
                .map((c, i) => (
                  <div
                    key={c.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)' }}>#{i + 1}</span>
                      <div style={{ overflow: 'hidden' }}>
                        <span 
                          onClick={() => onSelectCandidate(c.id, 'evaluator')}
                          style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 600, display: 'block', cursor: 'pointer', borderBottom: '1px dotted transparent' }}
                          onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = '#fff'}
                          onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
                        >
                          {c.name}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {c.title}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)', display: 'block' }}>
                        {c.score}%
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Match</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
