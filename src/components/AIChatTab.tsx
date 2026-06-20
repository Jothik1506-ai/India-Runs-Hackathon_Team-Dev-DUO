import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, MessageSquare, History } from 'lucide-react';
import type { Candidate } from '../data/mockCandidates';
import { queryRAGIndex } from '../utils/ragEngine';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  matchedCandidates?: Candidate[];
}

interface AIChatTabProps {
  candidates: Candidate[];
  aiName: string;
  onSelectCandidate: (candidateId: string) => void;
}

export const AIChatTab: React.FC<AIChatTabProps> = ({ candidates, aiName, onSelectCandidate }) => {
  const [conversations] = useState([
    { id: 'c1', title: 'Talent Growth Analytics', query: 'Show candidates with high growth potential' },
    { id: 'c2', title: 'Hidden Talents Lookup', query: 'Show hidden talent candidates' },
    { id: 'c3', title: 'Leadership Suitability', query: 'Find future AI leaders' },
    { id: 'c4', title: 'Alex Rivera vs David Kim', query: 'Compare Alex Rivera with David Kim' },
    { id: 'c5', title: 'Full Stack Competency', query: 'Find self-taught programmers' }
  ]);
  const [activeConvId, setActiveConvId] = useState('c1');

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
    const ragMatches = queryRAGIndex(query, 3);
    if (ragMatches.length > 0 && (q.includes('find') || q.includes('search') || q.includes('resume') || q.includes('who') || q.includes('experience') || q.includes('skills') || q.includes('candidate') || q.includes('rust') || q.includes('project') || q.includes('work') || q.includes('background') || q.includes('aws') || q.includes('cloud') || q.includes('freelance') || q.includes('degree') || q.includes('self-taught'))) {
      const matchDetails = ragMatches.map(r => `* **${r.chunk.candidateName}** (_${r.chunk.source}_):\n  "${r.chunk.text}"`).join('\n\n');
      const ids = ragMatches.map(r => r.chunk.candidateId);
      const matchedCandidates = candidates.filter(c => ids.includes(c.id));
      return {
        responseText: `I searched the RAG indexed resumes database and found the following relevant matches:\n\n${matchDetails}`,
        matches: matchedCandidates
      };
    }
    
    if (q.includes('growth') || q.includes('velocity') || q.includes('potential') || q.includes('future')) {
      const sorted = [...candidates]
        .sort((a, b) => b.learningVelocity - a.learningVelocity)
        .slice(0, 3);
      
      return {
        responseText: `Based on learning velocity and projected career arcs, here are the top candidates with exceptional growth rates:\n\n1. **${sorted[0].name}** (Learning Velocity: ${sorted[0].learningVelocity}%)\n2. **${sorted[1].name}** (Learning Velocity: ${sorted[1].learningVelocity}%)\n3. **${sorted[2].name}** (Learning Velocity: ${sorted[2].learningVelocity}%)`,
        matches: sorted
      };
    }

    if (q.includes('hidden') || q.includes('diamond') || q.includes('switcher') || q.includes('pedigree') || q.includes('traditional')) {
      const hidden = candidates.filter(c => c.tag === 'Diamond' || c.tag === 'Switcher' || c.tag === 'Contributor');
      const list = hidden.map(h => `* **${h.name}** (${h.tagLabel}) - ${h.tagReason}`).join('\n');
      return {
        responseText: `Traditional ATS systems usually reject these candidates due to non-standard backgrounds, but our engine identified them as high-value hires:\n\n${list}`,
        matches: hidden
      };
    }

    if (q.includes('leader') || q.includes('management') || q.includes('leadership')) {
      const leaders = [...candidates]
        .sort((a, b) => b.careerDNA.Leader - a.careerDNA.Leader)
        .slice(0, 2);
      return {
        responseText: `I analyzed their Career DNA profiles. The top candidates with the strongest leadership and collaborative capacity index are:\n\n* **${leaders[0].name}** (Leader DNA: ${leaders[0].careerDNA.Leader}%, Collaborator DNA: ${leaders[0].careerDNA.Collaborator}%)\n* **${leaders[1].name}** (Leader DNA: ${leaders[1].careerDNA.Leader}%, Collaborator DNA: ${leaders[1].careerDNA.Collaborator}%)`,
        matches: leaders
      };
    }

    if (q.includes('compare') || q.includes('versus') || q.includes('vs') || q.includes('why was') || q.includes('ranked')) {
      const matchAlex = candidates.find(c => c.name.toLowerCase().includes('alex'));
      const matchDavid = candidates.find(c => c.name.toLowerCase().includes('david'));
      if (matchAlex && matchDavid) {
        return {
          responseText: `Here is a side-by-side comparison of **Alex Rivera** (Ranked #1) vs **David Kim** (Ranked #5):\n\n* **Learning Velocity:** Alex: 95% | David: 82%\n* **Project Quality:** Alex: 92% | David: 75%\n* **DNA Match:** Alex scores exceptionally high as a Builder (94) & Problem Solver (96), whereas David presents a more standard junior builder curve (82/78).\n\nAlex is ranked higher primarily due to his exponential project-centric learning index and systems contribution rate, bypassing the lack of a traditional degree.`,
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
    }, 1000);
  };

  const selectConversation = (id: string, query: string) => {
    setActiveConvId(id);
    handleSend(query);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', padding: '0 20px 20px 20px', flexGrow: 1, height: 'calc(100vh - 120px)' }}>
      
      {/* Left Sidebar - Recent conversations */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '16px', height: '100%', overflowY: 'auto' }}>
        <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
          <History size={15} style={{ color: 'var(--color-primary)' }} />
          CONVERSATION HISTORY
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {conversations.map(c => {
            const isActive = c.id === activeConvId;
            return (
              <div
                key={c.id}
                onClick={() => selectConversation(c.id, c.query)}
                style={{
                  background: isActive ? 'rgba(var(--color-primary-rgb), 0.07)' : 'var(--bg-input)',
                  border: `1px solid ${isActive ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-color)'}`,
                  borderRadius: '10px',
                  padding: '11px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <MessageSquare size={14} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {c.title}
                  </h5>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {c.query.slice(0, 32)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Main Chat Window */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 16px rgba(139,92,246,0.2)' }}>
            <Bot size={17} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{aiName} Agent Inquiries</h3>
            <span style={{ fontSize: '11px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="status-dot-online" />
              Ready &bull; Indexing {`${candidates.length}`} candidate profiles
            </span>
          </div>
        </div>

        {/* Messaging area */}
        <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: msg.sender === 'user' ? 'var(--color-secondary-glow)' : 'var(--color-primary-glow)',
                  border: `1px solid ${msg.sender === 'user' ? 'var(--color-secondary)' : 'var(--color-primary)'}`,
                  flexShrink: 0
                }}>
                  {msg.sender === 'user' ? <User size={13} style={{ color: 'var(--color-secondary)' }} /> : <Sparkles size={13} style={{ color: 'var(--color-primary)' }} />}
                </div>
                <div className={msg.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'} style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)'
                }}>
                  {msg.text}

                  {/* Candidate Quick Links inside responses */}
                  {msg.matchedCandidates && msg.matchedCandidates.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      {msg.matchedCandidates.map(c => (
                        <button
                          key={c.id}
                          onClick={() => onSelectCandidate(c.id)}
                          className="suggestion-chip"
                          style={{ fontSize: '11px', padding: '3px 10px' }}
                        >
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: 'var(--color-secondary)', flexShrink: 0 }}>
                            {c.avatar.slice(0,1)}
                          </span>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions chips */}
              {msg.suggestions && (
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '38px' }}>
                  {msg.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="suggestion-chip"
                    >
                      <Sparkles size={10} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start', alignItems: 'center' }}>
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
                <Bot size={13} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse 1.2s infinite' }}></span>
                <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse 1.2s infinite 0.2s' }}></span>
                <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse 1.2s infinite 0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          style={{ padding: '14px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', background: 'var(--bg-surface)' }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask ${aiName} anything about candidates…`}
            className="input-base"
            style={{ flexGrow: 1, padding: '11px 16px' }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), #6d28d9)',
              border: 'none',
              borderRadius: '8px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 10px var(--color-primary-glow)',
              transition: 'all var(--transition-fast)',
              flexShrink: 0
            }}
          >
            <Send size={16} style={{ color: '#fff' }} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
