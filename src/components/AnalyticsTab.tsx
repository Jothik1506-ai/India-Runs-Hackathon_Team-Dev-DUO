import React from 'react';
import { Target, Award, BrainCircuit, BarChart3, AlertCircle, Compass, Users } from 'lucide-react';
import type { Candidate } from '../data/mockCandidates';
import { RadarChart } from './RadarChart';

interface AnalyticsTabProps {
  candidates: Candidate[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ candidates }) => {
  // 1. Dynamic Metric Computations
  const totalProfiles = candidates.length;
  const highPotentialProfiles = candidates.filter(c => c.tag !== 'Standard').length;
  const avgMatchScore = (candidates.reduce((sum, c) => sum + c.matchScore, 0) / totalProfiles).toFixed(1);
  const avgLearningVelocity = (candidates.reduce((sum, c) => sum + c.learningVelocity, 0) / totalProfiles).toFixed(1);

  // Calculate Average DNA profile of the current candidate pool
  const avgDNA = {
    Builder: Math.round(candidates.reduce((sum, c) => sum + c.careerDNA.Builder, 0) / totalProfiles),
    Innovator: Math.round(candidates.reduce((sum, c) => sum + c.careerDNA.Innovator, 0) / totalProfiles),
    Researcher: Math.round(candidates.reduce((sum, c) => sum + c.careerDNA.Researcher, 0) / totalProfiles),
    Leader: Math.round(candidates.reduce((sum, c) => sum + c.careerDNA.Leader, 0) / totalProfiles),
    Collaborator: Math.round(candidates.reduce((sum, c) => sum + c.careerDNA.Collaborator, 0) / totalProfiles),
    ProblemSolver: Math.round(candidates.reduce((sum, c) => sum + c.careerDNA.ProblemSolver, 0) / totalProfiles),
  };

  // Determine top spike tag group
  const cohortTypes = {
    Diamond: candidates.filter(c => c.tag === 'Diamond').length,
    Switcher: candidates.filter(c => c.tag === 'Switcher').length,
    Contributor: candidates.filter(c => c.tag === 'Contributor').length,
    Standard: candidates.filter(c => c.tag === 'Standard').length
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px 20px 20px', flexGrow: 1 }}>
      
      {/* Dynamic Telemetry Metrics cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TOTAL PROFILES AUDITED</span>
            <h4 style={{ fontSize: '20px', fontWeight: 700 }}>{totalProfiles} Candidates</h4>
          </div>
        </div>

        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-secondary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award style={{ color: 'var(--color-secondary)' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>HIDDEN TALENT DISCOVERED</span>
            <h4 style={{ fontSize: '20px', fontWeight: 700 }}>{highPotentialProfiles} Identified</h4>
          </div>
        </div>

        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target style={{ color: 'var(--color-success)' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>AVERAGE ELIGIBILITY MATCH</span>
            <h4 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{avgMatchScore}%</h4>
          </div>
        </div>

        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 style={{ color: 'var(--color-warning)' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>AVG. LEARNING VELOCITY</span>
            <h4 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{avgLearningVelocity}%</h4>
          </div>
        </div>

      </div>

      {/* Main Grid: Telemetry graphs + Aggregate DNA web - Matches Figma Screen 4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        
        {/* Left Side: Distributions & Cohorts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Cohorts Distribution */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: 'var(--color-secondary)' }} />
              TALENT COHORT DISTRIBUTION
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.03)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Diamonds</span>
                <h4 style={{ fontSize: '22px', color: 'var(--color-primary)', fontWeight: 700 }}>{cohortTypes.Diamond}</h4>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Overlooked Assets</span>
              </div>
              <div style={{ background: 'rgba(244, 63, 94, 0.03)', border: '1px solid rgba(244, 63, 94, 0.1)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Switchers</span>
                <h4 style={{ fontSize: '22px', color: '#fb7185', fontWeight: 700 }}>{cohortTypes.Switcher}</h4>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Cross-Domain Growth</span>
              </div>
              <div style={{ background: 'rgba(6, 182, 212, 0.03)', border: '1px solid rgba(6, 182, 212, 0.1)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Contributors</span>
                <h4 style={{ fontSize: '22px', color: 'var(--color-secondary)', fontWeight: 700 }}>{cohortTypes.Contributor}</h4>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Open Source Builders</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Standard</span>
                <h4 style={{ fontSize: '22px', color: 'var(--text-secondary)', fontWeight: 700 }}>{cohortTypes.Standard}</h4>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Traditional Path</span>
              </div>
            </div>

            {/* Score distribution mockup bars */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                CANDIDATE MATCH INDEX MATCH RANGE
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    <span>90% - 100% (High Eligibility)</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{candidates.filter(c => c.matchScore >= 90).length} Candidates</span>
                  </div>
                  <div style={{ background: 'var(--border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--color-primary)', width: `${(candidates.filter(c => c.matchScore >= 90).length / totalProfiles) * 100}%`, height: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    <span>80% - 89% (Solid Matches)</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{candidates.filter(c => c.matchScore >= 80 && c.matchScore < 90).length} Candidates</span>
                  </div>
                  <div style={{ background: 'var(--border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--color-secondary)', width: `${(candidates.filter(c => c.matchScore >= 80 && c.matchScore < 90).length / totalProfiles) * 100}%`, height: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    <span>70% - 79% (Developing Match)</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{candidates.filter(c => c.matchScore >= 70 && c.matchScore < 80).length} Candidates</span>
                  </div>
                  <div style={{ background: 'var(--border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--color-warning)', width: `${(candidates.filter(c => c.matchScore >= 70 && c.matchScore < 80).length / totalProfiles) * 100}%`, height: '100%' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Top Ranked Candidates list */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
              TOP TALENT INDEX RANKINGS
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...candidates].sort((a,b)=>b.matchScore - a.matchScore).slice(0, 3).map((c, i) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary)' }}>#{i+1}</span>
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{c.title}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.08)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px' }}>
                      {c.tagLabel}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {c.matchScore}% Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Aggregate DNA Profile Web & Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Average DNA Profile */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={14} style={{ color: 'var(--color-secondary)' }} />
              AVERAGE TALENT POOL DNA
            </h4>
            <div style={{ background: 'var(--bg-raised)', borderRadius: '12px', padding: '10px', border: '1px solid var(--border-color)' }}>
              <RadarChart data={avgDNA} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '10px' }}>
              The candidate pool shows strong averages in <strong>Builder</strong> and <strong>ProblemSolver</strong> properties.
            </p>
          </div>

          {/* AI Talent Report */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BrainCircuit size={14} />
              AI TALENT INSIGHTS REPORT
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <p>
                &bull; **Skill Clusters**: Strong concentrations of web developers and system contributors. Open-source experience is exceptionally high within the top 3 deciles.
              </p>
              <p>
                &bull; **Self-Learning Index**: Average learning velocity is **{avgLearningVelocity}%**, indicating a candidate pool that adapts quickly to new cloud technologies and AI frameworks.
              </p>
              <div style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: '8px', padding: '10px', display: 'flex', gap: '8px', marginTop: '4px' }}>
                <AlertCircle size={15} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                  **Action Recommendation**: Profile indices reveal a general lack of corporate enterprise tenure. Prioritize testing candidate system microservices architecture designs.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
