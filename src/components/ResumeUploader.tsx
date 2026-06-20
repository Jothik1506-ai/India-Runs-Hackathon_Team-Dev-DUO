import React, { useState, useRef } from 'react';
import { CheckCircle, AlertCircle, FileUp, Loader2 } from 'lucide-react';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

// Set up PDF.js worker source via Vite asset URL loader
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ResumeUploaderProps {
  onUploadCandidate: (name: string, content: string) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUploadCandidate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileList, setFileList] = useState<{ name: string; size: string; status: 'success' | 'error' | 'loading'; candidateName?: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Helper algorithm to parse/guess candidate name from text content or file name
  const parseNameFromResumeText = (text: string, fileName: string): string => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    // Scan first 5 lines for a line structured like a candidate name (2-3 words, capitalized, no symbols)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      const words = line.split(/\s+/);
      
      if (
        words.length >= 2 && 
        words.length <= 4 && 
        !line.includes('@') && 
        !line.includes('/') && 
        !line.includes(':') &&
        !/\d/.test(line) &&
        !/^(resume|cv|curriculum|vitae|portfolio|page|email|phone|experience|summary|about|skills|page|contact)/i.test(line)
      ) {
        // Confirm words are capitalized
        const isCapitalized = words.every(w => w[0] === w[0]?.toUpperCase());
        if (isCapitalized) {
          return line;
        }
      }
    }

    // Fallback: Clean up filename extension and symbols
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    return baseName
      .replace(/[-_]+/g, ' ')
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Asynchronous browser-level PDF extractor
  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  // Asynchronous browser-level DOCX extractor
  const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // Process a single file from the batch
  const processSingleFile = (file: File): Promise<{ name: string; size: string; status: 'success' | 'error'; candidateName?: string }> => {
    return new Promise((resolve) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;

      if (fileExtension === 'pdf') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const text = await extractTextFromPDF(buffer);
            
            if (text.trim().length > 0) {
              const detectedName = parseNameFromResumeText(text, file.name);
              onUploadCandidate(detectedName, text);
              resolve({ name: file.name, size: sizeStr, status: 'success', candidateName: detectedName });
            } else {
              resolve({ name: file.name, size: sizeStr, status: 'error' });
            }
          } catch (err) {
            console.error(err);
            resolve({ name: file.name, size: sizeStr, status: 'error' });
          }
        };
        reader.readAsArrayBuffer(file);

      } else if (fileExtension === 'docx') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const text = await extractTextFromDocx(buffer);
            
            if (text.trim().length > 0) {
              const detectedName = parseNameFromResumeText(text, file.name);
              onUploadCandidate(detectedName, text);
              resolve({ name: file.name, size: sizeStr, status: 'success', candidateName: detectedName });
            } else {
              resolve({ name: file.name, size: sizeStr, status: 'error' });
            }
          } catch (err) {
            console.error(err);
            resolve({ name: file.name, size: sizeStr, status: 'error' });
          }
        };
        reader.readAsArrayBuffer(file);

      } else {
        // Fallback for TXT, MD, JSON
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text && text.trim().length > 0) {
            const detectedName = parseNameFromResumeText(text, file.name);
            onUploadCandidate(detectedName, text);
            resolve({ name: file.name, size: sizeStr, status: 'success', candidateName: detectedName });
          } else {
            resolve({ name: file.name, size: sizeStr, status: 'error' });
          }
        };
        reader.readAsText(file);
      }
    });
  };

  // Process multiple files
  const processFiles = async (files: FileList) => {
    setIsProcessing(true);
    const incomingFiles = Array.from(files);

    // Initialise loading states in the list
    const newItems = incomingFiles.map(file => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      status: 'loading' as const
    }));
    setFileList(prev => [...newItems, ...prev]);

    // Parse files sequentially to prevent state race conditions
    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];
      const result = await processSingleFile(file);

      // Update the status of this specific file in the list
      setFileList(prev => 
        prev.map(item => item.name === file.name ? { ...item, status: result.status, candidateName: result.candidateName } : item)
      );
    }
    
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
          background: dragActive ? 'rgba(139, 92, 246, 0.04)' : 'rgba(255, 255, 255, 0.01)',
          borderRadius: '12px',
          padding: '30px 20px',
          textAlign: 'center',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-fast)',
          position: 'relative'
        }}
        onClick={isProcessing ? undefined : onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.json"
          onChange={handleChange}
          multiple
          disabled={isProcessing}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {isProcessing ? (
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--color-primary)', animation: 'spin 2s linear infinite' }} />
          ) : (
            <FileUp size={36} style={{ color: 'var(--color-secondary)', opacity: 0.8 }} />
          )}
          <div>
            <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isProcessing ? 'Processing files...' : 'Drag & Drop files or Browse'}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Select multiple PDF, DOCX, or Text resumes at once
            </p>
          </div>
        </div>
      </div>

      {/* Batch Processing List */}
      {fileList.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              INGESTION QUEUE / HISTORY
            </span>
            <button 
              onClick={() => setFileList([])}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer' }}
            >
              Clear Logs
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
            {fileList.map((f, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '8px 12px', 
                  fontSize: '12px' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', marginRight: '10px' }}>
                  {f.status === 'loading' && (
                    <Loader2 size={13} style={{ color: 'var(--color-info)', animation: 'spin 1.5s linear infinite' }} />
                  )}
                  {f.status === 'success' && (
                    <CheckCircle size={13} style={{ color: 'var(--color-success)' }} />
                  )}
                  {f.status === 'error' && (
                    <AlertCircle size={13} style={{ color: 'var(--color-accent)' }} />
                  )}
                  <span style={{ 
                    color: f.status === 'success' ? '#fff' : 'var(--text-secondary)', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap'
                  }}>
                    {f.name}
                  </span>
                </div>
                
                <span style={{ color: 'var(--text-muted)', fontSize: '10.5px', flexShrink: 0 }}>
                  {f.status === 'loading' && 'Parsing...'}
                  {f.status === 'success' && (f.candidateName || 'Success')}
                  {f.status === 'error' && 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS Spin Helper */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};
