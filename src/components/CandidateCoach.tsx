import React, { useState } from 'react';
import { Target, Award, CheckCircle2, Circle, AlertCircle, Compass, ShieldAlert } from 'lucide-react';
import { RadarChart } from './RadarChart';


import type { Candidate } from '../data/mockCandidates';


interface CandidateCoachProps {
  candidateId: string;
  setCandidateId: (id: string) => void;
  candidates: Candidate[];
}

export const CandidateCoach: React.FC<CandidateCoachProps> = ({ candidateId, setCandidateId, candidates }) => {
  const selectedCandidate = candidates.find(c => c.id === candidateId) || candidates[0];
  
  // Track checklist tasks completed by candidate
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (taskIndex: number) => {
    const key = `${selectedCandidate.id}-${taskIndex}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCompletenessColor = (score: number) => {
    if (score > 85) return 'var(--color-success)';
    if (score > 70) return 'var(--color-warning)';
    return 'var(--color-accent)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      
      {/* Selector banner for demo purposes */}
      <div className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>PREVIEW AS CANDIDATE:</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {candidates.map((c) => (
            <button
              key={c.id}
              onClick={() => setCandidateId(c.id)}
              style={{
                background: candidateId === c.id ? 'var(--color-primary-glow)' : 'transparent',
                border: '1px solid',
                borderColor: candidateId === c.id ? 'var(--color-primary)' : 'var(--border-color)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        
        {/* Left Side: Audit & Growth Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Stage 1: AI Profile Audit Overview */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'var(--color-secondary)' }} />
              AI PROFILE SCREENING AUDIT
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              
              {/* Profile Completeness card */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="70" height="70" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                    <circle 
                      cx="38" 
                      cy="38" 
                      r="32" 
                      fill="none" 
                      stroke={getCompletenessColor(selectedCandidate.completenessScore)} 
                      strokeWidth="6" 
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - selectedCandidate.completenessScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: 'absolute', fontSize: '15px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                    {selectedCandidate.completenessScore}%
                  </div>
                </div>
                <div>
                  <h5 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>Completeness Score</h5>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Percentage of relevant index criteria met</span>
                </div>
              </div>

              {/* Resume Quality card */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="70" height="70" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                    <circle 
                      cx="38" 
                      cy="38" 
                      r="32" 
                      fill="none" 
                      stroke={getCompletenessColor(selectedCandidate.resumeQualityScore)} 
                      strokeWidth="6" 
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - selectedCandidate.resumeQualityScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: 'absolute', fontSize: '15px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                    {selectedCandidate.resumeQualityScore}%
                  </div>
                </div>
                <div>
                  <h5 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>Resume Quality</h5>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Semantic formatting & impact index</span>
                </div>
              </div>

            </div>

            {/* Missing Information Report */}
            <div style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.12)', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontWeight: 600 }}>
                <ShieldAlert size={15} />
                IMPROVEMENT PLAN
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedCandidate.missingReport.map((rep, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--color-warning)', fontSize: '14px' }}>&bull;</span>
                    <p style={{ lineHeight: '1.4' }}>{rep}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Stage 7: Personalized Growth Coaching Roadmap */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>UPSKILLING TARGET: {selectedCandidate.predictedRoadmap.goal}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Follow this dynamic roadmap to boost eligibility index to 87%+ within 6 months</p>
              </div>
              <div style={{ background: 'var(--color-primary-glow)', border: '1px solid var(--color-primary)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                Recommended Plan
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '20px' }}>
              {/* Center timeline bar line */}
              <div style={{ position: 'absolute', left: '8px', top: '10px', bottom: '20px', width: '1px', background: 'var(--border-color)' }}></div>
              
              {selectedCandidate.predictedRoadmap.tasks.map((task, idx) => {
                const isCompleted = completedTasks[`${selectedCandidate.id}-${idx}`] || false;
                return (
                  <div key={idx} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                    {/* Checkbox Icon */}
                    <div 
                      onClick={() => toggleTask(idx)}
                      style={{ 
                        position: 'absolute', 
                        left: '-20px', 
                        top: '2px', 
                        cursor: 'pointer', 
                        background: 'var(--bg-main)', 
                        zIndex: 2, 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
                      ) : (
                        <Circle size={16} style={{ color: 'var(--text-secondary)' }} />
                      )}
                    </div>

                    <div style={{ 
                      flexGrow: 1, 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px', 
                      padding: '12px',
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      opacity: isCompleted ? 0.6 : 1,
                      transition: 'all var(--transition-fast)'
                    }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--color-secondary)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>
                          STEP {idx + 1}
                        </span>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {task.name}
                        </h4>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-primary)', background: 'var(--color-primary-glow)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        {task.duration}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Right Side: Radar DNA & Future Readiness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Career DNA */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={14} style={{ color: 'var(--color-secondary)' }} />
              MY CAREER DNA
            </h4>
            <div style={{ background: 'rgba(0, 0, 0, 0.15)', borderRadius: '12px', padding: '6px', border: '1px solid var(--border-color)' }}>
              <RadarChart data={selectedCandidate.careerDNA} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '10px' }}>
              Your profile spikes heavily in <strong>{Object.entries(selectedCandidate.careerDNA).sort((a,b)=>b[1]-a[1])[0][0]}</strong> skills.
            </p>
          </div>

          {/* Future Readiness Score Prediction */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
              FUTURE POTENTIAL ESTIMATION
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current Matching Score:</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{selectedCandidate.matchScore}%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>6-Month Predicted Matching:</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{selectedCandidate.futureReadiness6m}%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>1-Year Predicted Matching:</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-success)' }}>{selectedCandidate.futureReadiness1y}%</span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={15} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  Projections are evaluated based on a <strong>{selectedCandidate.learningVelocity}% Learning Velocity</strong> profile.
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
