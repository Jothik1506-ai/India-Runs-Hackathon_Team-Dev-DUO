import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, XCircle, GitBranch, Globe, FileText, Award, Zap } from 'lucide-react';
import type { Candidate } from '../data/mockCandidates';
import { computeDNAProfile, buildDNAFromEvidence, type DNAProfile, type DNADimension, type ConfidenceLevel } from '../utils/dnaEngine';

interface DNAEvidencePanelProps {
  candidate: Candidate;
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  GitHub: <GitBranch size={10} />,
  Portfolio: <Globe size={10} />,
  LinkedIn: <Globe size={10} />,
  Resume: <FileText size={10} />,
  Certifications: <Award size={10} />,
  Hackathon: <Zap size={10} />,
  OSS: <GitBranch size={10} />
};

const SOURCE_COLORS: Record<string, string> = {
  GitHub: 'rgba(139,92,246,0.15)',
  Portfolio: 'rgba(6,182,212,0.15)',
  LinkedIn: 'rgba(14,165,233,0.15)',
  Resume: 'rgba(255,255,255,0.05)',
  Certifications: 'rgba(16,185,129,0.15)',
  Hackathon: 'rgba(245,158,11,0.15)',
  OSS: 'rgba(139,92,246,0.15)'
};

const SOURCE_TEXT: Record<string, string> = {
  GitHub: '#a78bfa',
  Portfolio: '#67e8f9',
  LinkedIn: '#7dd3fc',
  Resume: '#a1a1aa',
  Certifications: '#6ee7b7',
  Hackathon: '#fcd34d',
  OSS: '#a78bfa'
};

const LEVEL_LABELS: Record<number, string> = {
  1: 'L1 · Verified',
  2: 'L2 · Documented',
  3: 'L3 · Self-Declared'
};

const LEVEL_COLORS: Record<number, string> = {
  1: '#10b981',
  2: '#0ea5e9',
  3: '#f59e0b'
};

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { color: string; bg: string; label: string }> = {
  High: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'High Confidence' },
  Medium: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', label: 'Medium Confidence' },
  Low: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Low Confidence' }
};

const DNA_COLORS: Record<string, { gradient: string; border: string }> = {
  Builder: { gradient: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', border: 'rgba(139,92,246,0.3)' },
  Innovator: { gradient: 'linear-gradient(90deg, #06b6d4, #0284c7)', border: 'rgba(6,182,212,0.3)' },
  Researcher: { gradient: 'linear-gradient(90deg, #10b981, #059669)', border: 'rgba(16,185,129,0.3)' },
  Leader: { gradient: 'linear-gradient(90deg, #f59e0b, #d97706)', border: 'rgba(245,158,11,0.3)' },
  Collaborator: { gradient: 'linear-gradient(90deg, #ec4899, #be185d)', border: 'rgba(236,72,153,0.3)' },
  ProblemSolver: { gradient: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', border: 'rgba(139,92,246,0.3)' }
};

const DimensionRow: React.FC<{ name: string; dim: DNADimension }> = ({ name, dim }) => {
  const [expanded, setExpanded] = useState(false);
  const conf = CONFIDENCE_CONFIG[dim.confidence];
  const colors = DNA_COLORS[name] || DNA_COLORS.Builder;

  return (
    <div style={{ border: `1px solid ${expanded ? colors.border : 'var(--border-color)'}`, borderRadius: '10px', overflow: 'hidden', transition: 'border-color var(--transition-fast)' }}>
      {/* Header Row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', cursor: 'pointer', background: expanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
      >
        {/* Dimension name */}
        <div style={{ width: '96px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{name === 'ProblemSolver' ? 'Problem Solver' : name}</span>
        </div>

        {/* Progress bar */}
        <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${dim.score}%`, height: '100%', background: colors.gradient, borderRadius: '4px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>

        {/* Score */}
        <div style={{ width: '38px', textAlign: 'right', fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', flexShrink: 0 }}>
          {dim.score}%
        </div>

        {/* Confidence badge */}
        <div style={{ background: conf.bg, border: `1px solid ${conf.color}22`, borderRadius: '6px', padding: '2px 8px', fontSize: '9.5px', fontWeight: 700, color: conf.color, letterSpacing: '0.3px', flexShrink: 0, minWidth: '110px', textAlign: 'center' }}>
          {conf.label}
        </div>

        {/* Expand chevron */}
        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded evidence panel */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-color)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.12)' }}>

          {/* Supporting Evidence */}
          {dim.evidence.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '8px' }}>
                SUPPORTING EVIDENCE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {dim.evidence.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{ev.text}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                      <span style={{ fontSize: '9px', background: SOURCE_COLORS[ev.source] || 'rgba(255,255,255,0.05)', color: SOURCE_TEXT[ev.source] || 'var(--text-muted)', border: `1px solid ${SOURCE_TEXT[ev.source] || 'var(--border-color)'}22`, borderRadius: '4px', padding: '1px 5px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {SOURCE_ICONS[ev.source]}
                        {ev.source}
                      </span>
                      <span style={{ fontSize: '9px', color: LEVEL_COLORS[ev.level], background: `${LEVEL_COLORS[ev.level]}15`, border: `1px solid ${LEVEL_COLORS[ev.level]}30`, borderRadius: '4px', padding: '1px 5px' }}>
                        {LEVEL_LABELS[ev.level]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Evidence */}
          {dim.missing.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '8px' }}>
                MISSING EVIDENCE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {dim.missing.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <XCircle size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement tip */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '8px', padding: '10px 12px' }}>
            <AlertCircle size={13} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--color-primary)', fontWeight: 700 }}>How to improve:</strong> {dim.improvement}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const DNAEvidencePanel: React.FC<DNAEvidencePanelProps> = ({ candidate }) => {
  const dnaProfile = useMemo<DNAProfile>(() => {
    if (candidate.evidenceBundle) {
      return computeDNAProfile({
        candidateName: candidate.name,
        github: candidate.evidenceBundle.github,
        linkedin: candidate.evidenceBundle.linkedin,
        portfolio: candidate.evidenceBundle.portfolio,
        resume: candidate.evidenceBundle.resume
      });
    }
    // Fallback: infer from background + rankReason text
    return buildDNAFromEvidence(
      candidate.name,
      candidate.background + ' ' + candidate.rankReason,
      candidate.githubUrl,
      candidate.linkedinUrl,
      candidate.portfolioUrl
    );
  }, [candidate.id]);

  const overallConfidence = useMemo(() => {
    const dims = Object.values(dnaProfile) as DNADimension[];
    const highCount = dims.filter(d => d.confidence === 'High').length;
    const medCount = dims.filter(d => d.confidence === 'Medium').length;
    if (highCount >= 4) return { label: 'High Overall Confidence', color: '#10b981', bg: 'rgba(16,185,129,0.08)' };
    if (highCount >= 2 || medCount >= 4) return { label: 'Medium Overall Confidence', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' };
    return { label: 'Low Overall Confidence', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' };
  }, [dnaProfile]);

  const evidenceCount = useMemo(() => {
    return (Object.values(dnaProfile) as DNADimension[]).reduce((sum, d) => sum + d.evidence.length, 0);
  }, [dnaProfile]);

  const dimensions = ['Builder', 'Innovator', 'Researcher', 'Leader', 'Collaborator', 'ProblemSolver'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/aiva-logo.png" alt="AIVA" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
            AIVA CAREER DNA ENGINE 2.0
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{evidenceCount} evidence items</span>
          <div style={{ background: overallConfidence.bg, border: `1px solid ${overallConfidence.color}33`, borderRadius: '6px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: overallConfidence.color }}>
            {overallConfidence.label}
          </div>
        </div>
      </div>

      {/* Evidence Trust Level Legend */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {[1, 2, 3].map(l => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: LEVEL_COLORS[l] }} />
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>{LEVEL_LABELS[l]}</span>
          </div>
        ))}
      </div>

      {/* Dimension Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {dimensions.map(dim => (
          <DimensionRow key={dim} name={dim} dim={dnaProfile[dim]} />
        ))}
      </div>

      {/* AIVA Attribution */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', paddingTop: '4px' }}>
        <img src="/aiva-logo.png" alt="AIVA" style={{ width: '12px', height: '12px', objectFit: 'contain', opacity: 0.5 }} />
        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Analysis by AIVA Intelligence · Evidence-grounded scoring</span>
      </div>
    </div>
  );
};
