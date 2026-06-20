import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import type { Candidate } from '../data/mockCandidates';
import { mockCandidates } from '../data/mockCandidates';
import { queryRAGIndex } from '../utils/ragEngine';


interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  matchedCandidates?: Candidate[];
}

interface AIChatProps {
  onSelectCandidate: (candidateId: string) => void;
  aiName: string;
}

export const AIChat: React.FC<AIChatProps> = ({ onSelectCandidate, aiName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am ${aiName}, your Talent Intelligence Assistant. I evaluate, profile, and rank candidates beyond standard resume keywords.\n\nTry asking me about specific talent cohorts or rankings!`,
      timestamp: new Date(),
      suggestions: [
        "Show candidates with high growth potential",
        "Show hidden talent candidates",
        "Find future AI leaders",
        "Compare Alex Rivera with David Kim"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const processQuery = (query: string): { responseText: string; matches?: Candidate[] } => {
    const q = query.toLowerCase();

    // Check RAG database matching
    const ragMatches = queryRAGIndex(query, 2);
    if (ragMatches.length > 0 && (q.includes('find') || q.includes('search') || q.includes('resume') || q.includes('who') || q.includes('experience') || q.includes('skills') || q.includes('candidate') || q.includes('rust') || q.includes('project') || q.includes('work') || q.includes('background'))) {
      const matchDetails = ragMatches.map(r => `* **${r.chunk.candidateName}** (_${r.chunk.source}_):\n  "${r.chunk.text}"`).join('\n\n');
      const ids = ragMatches.map(r => r.chunk.candidateId);
      const candidates = mockCandidates.filter(c => ids.includes(c.id));
      return {
        responseText: `I searched the RAG indexed resumes database and found the following relevant matches:\n\n${matchDetails}`,
        matches: candidates
      };
    }
    
    if (q.includes('growth') || q.includes('velocity') || q.includes('potential') || q.includes('future')) {
      const candidates = [...mockCandidates]
        .sort((a, b) => b.learningVelocity - a.learningVelocity)
        .slice(0, 3);
      
      return {
        responseText: `Based on learning velocity and projected career arcs, here are the top 3 candidates with exceptional growth rates:\n\n1. **${candidates[0].name}** (Learning Velocity: ${candidates[0].learningVelocity}%)\n2. **${candidates[1].name}** (Learning Velocity: ${candidates[1].learningVelocity}%)\n3. **${candidates[2].name}** (Learning Velocity: ${candidates[2].learningVelocity}%)`,
        matches: candidates
      };
    }

    if (q.includes('hidden') || q.includes('diamond') || q.includes('switcher') || q.includes('pedigree') || q.includes('traditional')) {
      const hidden = mockCandidates.filter(c => c.tag === 'Diamond' || c.tag === 'Switcher' || c.tag === 'Contributor');
      return {
        responseText: `Traditional ATS systems usually reject these candidates due to non-standard backgrounds, but our engine identified them as high-value hires:\n\n* **${hidden[0].name}** (${hidden[0].tagLabel}) - ${hidden[0].tagReason}\n* **${hidden[1].name}** (${hidden[1].tagLabel}) - ${hidden[1].tagReason}\n* **${hidden[2].name}** (${hidden[2].tagLabel}) - ${hidden[2].tagReason}`,
        matches: hidden
      };
    }

    if (q.includes('leader') || q.includes('management') || q.includes('leadership')) {
      const leaders = [...mockCandidates]
        .sort((a, b) => b.careerDNA.Leader - a.careerDNA.Leader)
        .slice(0, 2);
      return {
        responseText: `I analyzed their Career DNA profiles. The top candidates with the strongest leadership and collaborative capacity index are:\n\n* **${leaders[0].name}** (Leader DNA: ${leaders[0].careerDNA.Leader}%, Collaborator DNA: ${leaders[0].careerDNA.Collaborator}%)\n* **${leaders[1].name}** (Leader DNA: ${leaders[1].careerDNA.Leader}%, Collaborator DNA: ${leaders[1].careerDNA.Collaborator}%)`,
        matches: leaders
      };
    }

    if (q.includes('compare') || q.includes('versus') || q.includes('vs') || q.includes('why was') || q.includes('ranked')) {
      // Find candidate names
      const matchAlex = mockCandidates.find(c => c.name.toLowerCase().includes('alex'));
      const matchDavid = mockCandidates.find(c => c.name.toLowerCase().includes('david'));
      if (matchAlex && matchDavid) {
        return {
          responseText: `Here is a side-by-side comparison of **Alex Rivera** (Ranked #2) vs **David Kim** (Ranked #5):\n\n* **Learning Velocity:** Alex: 95% | David: 82%\n* **Project Quality:** Alex: 92% | David: 75%\n* **DNA Match:** Alex scores exceptionally high as a Builder (94) & Problem Solver (96), whereas David presents a more standard junior builder curve (82/78).\n\nAlex is ranked higher primarily due to his exponential project-centric learning index and systems contribution rate, bypassing the lack of a traditional degree.`,
          matches: [matchAlex, matchDavid]
        };
      }
    }

    // Default Fallback
    return {
      responseText: `I am happy to assist! I index the candidate database on Skill Match, Project Complexity, Career DNA, Learning Velocity, and Future Readiness. Try asking:\n- "Who has the highest coding project quality?"\n- "Find me open source developers"\n- "Show hidden talent candidates"`
    };
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const { responseText, matches } = processQuery(textToSend);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
        matchedCandidates: matches
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
        <Bot size={20} className="text-glow-primary" style={{ color: 'var(--color-primary)' }} />
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{aiName} Agent</h3>
          <span style={{ fontSize: '11px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }}></span>
            Ready to Analyze
          </span>
        </div>
      </div>

      {/* Message Area */}
      <div style={{ flexGrow: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: msg.sender === 'user' ? 'var(--color-secondary-glow)' : 'var(--color-primary-glow)',
                border: `1px solid ${msg.sender === 'user' ? 'var(--color-secondary)' : 'var(--color-primary)'}`
              }}>
                {msg.sender === 'user' ? <User size={14} style={{ color: 'var(--color-secondary)' }} /> : <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />}
              </div>
              <div style={{ 
                background: msg.sender === 'user' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${msg.sender === 'user' ? 'rgba(6, 182, 212, 0.2)' : 'var(--border-color)'}`,
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13.5px',
                lineHeight: '1.5',
                whiteSpace: 'pre-line',
                color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)'
              }}>
                {msg.text}

                {/* Candidate tags link inside chat */}
                {msg.matchedCandidates && msg.matchedCandidates.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    {msg.matchedCandidates.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => onSelectCandidate(c.id)}
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.05)', 
                          border: '1px solid var(--border-color)', 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          color: 'var(--color-secondary)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        View {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Inline suggestions */}
            {msg.suggestions && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '36px' }}>
                {msg.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'var(--color-primary-glow)',
              border: '1px solid var(--color-primary)'
            }}>
              <Bot size={14} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse 1.2s infinite' }}></span>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse 1.2s infinite 0.2s' }}></span>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse 1.2s infinite 0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', background: 'rgba(0, 0, 0, 0.2)' }}
      >
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask ${aiName} (e.g. "who are the switchers?")...`}
          style={{ 
            flexGrow: 1, 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            padding: '10px 14px', 
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          style={{ 
            background: 'var(--color-primary)', 
            border: 'none', 
            borderRadius: '8px', 
            width: '38px', 
            height: '38px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            boxShadow: '0 4px 10px var(--color-primary-glow)'
          }}
        >
          <Send size={16} style={{ color: 'var(--text-primary)' }} />
        </button>
      </form>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
