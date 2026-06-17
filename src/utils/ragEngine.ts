export interface IndexedChunk {
  candidateId: string;
  candidateName: string;
  text: string;
  source: string; // e.g. 'Resume', 'GitHub', 'Background'
}

export interface SearchResult {
  chunk: IndexedChunk;
  score: number;
}

// Global registry of documents indexed in-memory
let indexedDatabase: IndexedChunk[] = [];

// Clean and normalize text into searchable terms
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);
};

// Index a block of text split by sentences/paragraphs for a candidate
export const indexDocument = (candidateId: string, candidateName: string, text: string, source: string) => {
  // Split by sentences or paragraphs to create readable context windows
  const paragraphs = text.split(/(?:\r?\n){2,}|\.\s+/).map(p => p.trim()).filter(p => p.length > 10);
  
  paragraphs.forEach(para => {
    indexedDatabase.push({
      candidateId,
      candidateName,
      text: para,
      source
    });
  });
};

// Reset database and re-initialize with active candidate pool
export const initializeRAGIndex = (candidates: Array<{ id: string; name: string; background: string; rankReason: string }>) => {
  indexedDatabase = [];
  candidates.forEach(c => {
    indexDocument(c.id, c.name, c.background, 'Background Detail');
    indexDocument(c.id, c.name, c.rankReason, 'AI Rank Explanation');
  });
};

// Retrieve top relevant chunks for a user query
export const queryRAGIndex = (queryString: string, limit: number = 3): SearchResult[] => {
  const queryTerms = tokenize(queryString);
  if (queryTerms.length === 0) return [];

  const results: SearchResult[] = indexedDatabase.map(chunk => {
    const chunkTerms = tokenize(chunk.text);
    
    // Count matches (simple tf similarity approximation)
    let score = 0;
    queryTerms.forEach(qTerm => {
      const occurrences = chunkTerms.filter(cTerm => cTerm === qTerm).length;
      if (occurrences > 0) {
        // Boost matches
        score += occurrences;
      }
    });

    return { chunk, score };
  });

  // Filter out zero-score results and sort by descending match score
  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
