import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Search, FileText, CheckCircle2, Circle, HelpCircle, Loader2 } from 'lucide-react';
import type { Candidate } from '../data/mockCandidates';
import { queryRAGIndex } from '../utils/ragEngine';
import { ResumeUploader } from './ResumeUploader';

interface SourcesTabProps {
  candidates: Candidate[];
  onUploadCandidate: (name: string, content: string) => void;
  aiName: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  sourcesUsed?: string[];
}

export const SourcesTab: React.FC<SourcesTabProps> = ({ candidates, onUploadCandidate, aiName: _aiName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSources, setSelectedSources] = useState<Record<string, boolean>>({});
  const [showAddSourceDrawer, setShowAddSourceDrawer] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState('Untitled notebook');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Initialize selectedSources to check all candidates by default
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    candidates.forEach(c => {
      initial[c.id] = true;
    });
    setSelectedSources(initial);
  }, [candidates.length]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Welcome to your Assessment Notebook. Select candidate resume sources on the left, then ask me questions. I will answer grounded strictly on the selected document sources.`,
      timestamp: new Date()
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

  // Handle checkboxes
  const toggleSource = (id: string) => {
    setSelectedSources(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectAll = () => {
    const updated: Record<string, boolean> = {};
    candidates.forEach(c => {
      updated[c.id] = true;
    });
    setSelectedSources(updated);
  };

  const deselectAll = () => {
    const updated: Record<string, boolean> = {};
    candidates.forEach(c => {
      updated[c.id] = false;
    });
    setSelectedSources(updated);
  };

  // Filter candidates based on search
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      // Find list of active selected candidate IDs
      const checkedIds = Object.keys(selectedSources).filter(id => selectedSources[id]);
      
      if (checkedIds.length === 0) {
        setMessages((prev) => [...prev, {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Please select at least one candidate source on the left to query the notebook.`,
          timestamp: new Date()
        }]);
        setIsTyping(false);
        return;
      }

      // Query RAG index
      const ragResults = queryRAGIndex(textToSend, 6);
      
      // Filter RAG results to include ONLY selected candidate IDs
      const filteredResults = ragResults.filter(r => checkedIds.includes(r.chunk.candidateId));

      let replyText = '';
      let sourcesUsed: string[] = [];

      if (filteredResults.length > 0) {
        const citationBlocks = filteredResults.map((r, idx) => {
          if (!sourcesUsed.includes(r.chunk.candidateName)) {
            sourcesUsed.push(r.chunk.candidateName);
          }
          return `[Citation ${idx + 1}] **${r.chunk.candidateName}** (${r.chunk.source}):\n"${r.chunk.text}"`;
        }).join('\n\n');

        replyText = `Based on the selected candidate resume documents, here is the information found:\n\n${citationBlocks}`;
      } else {
        // If no direct RAG matches in selected docs, fallback to summarizing selected candidates
        const selectedCandDetails = candidates.filter(c => checkedIds.includes(c.id));
        const names = selectedCandDetails.map(c => c.name).join(', ');
        
        replyText = `I searched the selected resume files (${names}) but couldn't find a direct keyword match for your specific query. \n\nTry asking about candidate experience, specific skills (like Java, React, Python, Rust), background, or projects.`;
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date(),
        sourcesUsed: sourcesUsed.length > 0 ? sourcesUsed : undefined
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', padding: '0 20px 20px 20px', flexGrow: 1, height: 'calc(100vh - 120px)' }}>
      
      {/* Left Pane - Sources Explorer */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '16px', height: '100%', overflow: 'hidden' }}>
        
        {/* Search & Add Header */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base"
              style={{ width: '100%', padding: '9px 10px 9px 30px', fontSize: '12px' }}
            />
          </div>
          <button
            onClick={() => setShowAddSourceDrawer(!showAddSourceDrawer)}
            className="glow-btn-primary"
            style={{ padding: '0 12px', borderRadius: '8px', flexShrink: 0, height: '36px' }}
            title="Upload new source file"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Collapsible Uploader Area */}
        {showAddSourceDrawer && (
          <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
            <h5 style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px' }}>UPLOAD RESUME FILE</h5>
            <ResumeUploader onUploadCandidate={(name, content) => {
              onUploadCandidate(name, content);
              setShowAddSourceDrawer(false);
            }} />
          </div>
        )}

        {/* Helper guide */}
        <div className="insight-panel insight-panel-cyan" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
          <HelpCircle size={14} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Select resume files to ground queries. Chat will search only checked sources.
          </span>
        </div>

        {/* Selected count progress */}
        {(() => {
          const checked = Object.values(selectedSources).filter(Boolean).length;
          const pct = candidates.length > 0 ? Math.round((checked / candidates.length) * 100) : 0;
          return (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span className="section-label">SOURCE FILES</span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: checked > 0 ? 'var(--color-secondary)' : 'var(--text-muted)' }}>
                  {checked}/{candidates.length} active
                </span>
              </div>
              <div className="progress-bar-track" style={{ height: '3px', marginBottom: '6px' }}>
                <div className="progress-bar-fill progress-bar-fill-cyan" style={{ width: `${pct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={selectAll} style={{ background: 'transparent', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', fontSize: '10.5px', fontWeight: 600 }}>Select all</button>
                <button onClick={deselectAll} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10.5px' }}>Clear</button>
              </div>
            </div>
          );
        })()}

        {/* Sources List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredCandidates.map(c => {
            const isChecked = selectedSources[c.id] || false;
            const tagClass = c.tag === 'Diamond' ? 'tag-diamond' : c.tag === 'Switcher' ? 'tag-switcher' : c.tag === 'Contributor' ? 'tag-contributor' : '';
            return (
              <div
                key={c.id}
                onClick={() => toggleSource(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 11px',
                  background: isChecked ? 'rgba(6,182,212,0.04)' : 'rgba(255,255,255,0.01)',
                  border: `1px solid ${isChecked ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isChecked ? '0 0 8px rgba(6,182,212,0.07)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', overflow: 'hidden' }}>
                  <div style={{ color: isChecked ? 'var(--color-secondary)' : 'var(--text-muted)', flexShrink: 0 }}>
                    {isChecked ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', overflow: 'hidden' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isChecked ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isChecked ? 'rgba(6,182,212,0.2)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={13} style={{ color: isChecked ? 'var(--color-secondary)' : 'var(--text-muted)' }} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontSize: '12px', color: isChecked ? '#fff' : 'var(--text-secondary)', display: 'block', fontWeight: isChecked ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name}_resume.pdf
                      </span>
                      {c.tag !== 'Standard' && (
                        <span className={tagClass} style={{ fontSize: '9px', padding: '0px 5px', borderRadius: '3px', fontWeight: 600 }}>{c.tagLabel}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: '6px' }}>
                  {12 + (c.name.length % 5)} KB
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane - Grounded Notebook Chat */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Notebook Title Area */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {isEditingTitle ? (
              <input
                type="text"
                value={notebookTitle}
                onChange={(e) => setNotebookTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
                autoFocus
                className="input-base"
                style={{ fontSize: '15px', fontWeight: 600, padding: '2px 8px' }}
              />
            ) : (
              <h3
                onClick={() => setIsEditingTitle(true)}
                style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-block', borderBottom: '1px dashed var(--border-color-hover)' }}
              >
                {notebookTitle}
              </h3>
            )}
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Notebook LM Mode &bull; Grounded on {Object.values(selectedSources).filter(Boolean).length} selected sources
            </p>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Created: 18 Jun 2026
          </span>
        </div>

        {/* Messaging Logs */}
        <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  background: msg.sender === 'user' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                  border: `1px solid ${msg.sender === 'user' ? 'var(--color-secondary)' : 'var(--color-primary)'}`,
                  flexShrink: 0
                }}>
                  {msg.sender === 'user' ? <span style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 'bold' }}>U</span> : <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'bold' }}>N</span>}
                </div>
                <div className={msg.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'} style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)'
                }}>
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  
                  {/* Sources cited footer */}
                  {msg.sourcesUsed && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', width: '100%', fontWeight: 'bold' }}>Sources Cited:</span>
                      {msg.sourcesUsed.map((src, i) => (
                        <span key={i} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.04)', color: 'var(--color-secondary)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: '4px' }}>
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid var(--color-primary)'
              }}>
                <Loader2 size={13} style={{ color: 'var(--color-primary)', animation: 'spin 1.5s linear infinite' }} />
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

        {/* Input Text Form */}
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
            placeholder="Ask the notebook grounded on selected sources…"
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
