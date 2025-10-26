'use client';

import { useState, useEffect } from 'react';

interface ResearchStep {
  step: string;
  status: 'pending' | 'in-progress' | 'completed';
  result?: string;
}

interface StoredRun {
  runId: string;
  query: string;
  status: string;
  result?: string;
  timestamp: number;
}

const SAMPLE_DOMAINS = [
  'History & Society',
  'Markets & Investment & Finance',
  'Companies & Products',
];

export default function DeepResearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<ResearchStep[]>([]);
  const [result, setResult] = useState('');
  const [runId, setRunId] = useState('');
  const [storedRuns, setStoredRuns] = useState<StoredRun[]>([]);

  useEffect(() => {
    // Load stored runs from localStorage
    const stored = localStorage.getItem('deepResearchRuns');
    if (stored) {
      setStoredRuns(JSON.parse(stored));
    }
  }, []);

  const saveRun = (run: StoredRun) => {
    const runs = [...storedRuns, run];
    setStoredRuns(runs);
    localStorage.setItem('deepResearchRuns', JSON.stringify(runs));
  };

  const loadRun = (run: StoredRun) => {
    setQuery(run.query);
    setRunId(run.runId);
    setResult(run.result || '');
    if (run.status === 'completed') {
      setSteps([
        { step: 'Task created', status: 'completed' },
        { step: 'Research in progress', status: 'completed' },
        { step: 'Synthesizing results', status: 'completed' },
      ]);
    }
  };

  const pollTaskStatus = async (taskRunId: string) => {
    const maxAttempts = 180; // 3 minutes max for ultra processor
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/deep-research?runId=${taskRunId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setSteps([
            { step: 'Task created', status: 'completed' },
            { step: 'Research in progress', status: 'completed' },
            { step: 'Synthesizing results', status: 'completed' },
          ]);
          
          // Handle different output formats
          let resultText = '';
          if (data.output) {
            if (typeof data.output === 'string') {
              resultText = data.output;
            } else if (data.output.content) {
              resultText = JSON.stringify(data.output.content, null, 2);
            } else {
              resultText = JSON.stringify(data.output, null, 2);
            }
          }
          
          setResult(resultText);
          setLoading(false);
          
          // Save to localStorage
          saveRun({
            runId: taskRunId,
            query,
            status: 'completed',
            result: resultText,
            timestamp: Date.now(),
          });
          
          return;
        } else if (data.status === 'failed') {
          setSteps([]);
          setResult('Research task failed. Please try again.');
          setLoading(false);
          return;
        } else if (data.status === 'running') {
          setSteps([
            { step: 'Task created', status: 'completed' },
            { step: 'Research in progress', status: 'in-progress' },
            { step: 'Synthesizing results', status: 'pending' },
          ]);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    setSteps([]);
    setResult('Research task timed out. Please try again with a shorter query.');
    setLoading(false);
  };

  const handleResearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResult('');
    setSteps([
      { step: 'Creating task', status: 'in-progress' },
      { step: 'Research in progress', status: 'pending' },
      { step: 'Synthesizing results', status: 'pending' },
    ]);

    try {
      const response = await fetch('/api/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (data.run_id) {
        setRunId(data.run_id);
        setSteps([
          { step: 'Task created', status: 'completed' },
          { step: 'Research in progress', status: 'in-progress' },
          { step: 'Synthesizing results', status: 'pending' },
        ]);
        
        // Save initial run to localStorage
        saveRun({
          runId: data.run_id,
          query,
          status: 'running',
          timestamp: Date.now(),
        });
        
        // Start polling
        await pollTaskStatus(data.run_id);
      } else {
        setSteps([]);
        setResult('Failed to create research task. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Deep Research error:', error);
      setSteps([]);
      setResult('An error occurred during research. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="border-b border-zinc-800 p-6">
        <h2 className="text-2xl font-semibold mb-2">Deep Research</h2>
        <p className="text-sm text-zinc-400">Research anything deeply, with structured outputs</p>
      </div>

      <div className="flex-1 p-6 flex">
        {storedRuns.length > 0 && (
          <div className="w-64 border-r border-zinc-800 pr-4 mr-4">
            <h3 className="text-sm font-medium mb-3 text-zinc-400">Recent Runs</h3>
            <div className="space-y-2">
              {storedRuns.slice(-5).reverse().map((run) => (
                <button
                  key={run.runId}
                  onClick={() => loadRun(run)}
                  className="w-full text-left p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
                >
                  <div className="text-xs text-zinc-500 mb-1">
                    {new Date(run.timestamp).toLocaleString()}
                  </div>
                  <div className="text-sm truncate">{run.query}</div>
                  <div className={`text-xs mt-1 ${run.status === 'completed' ? 'text-green-500' : 'text-orange-500'}`}>
                    {run.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 max-w-4xl mx-auto">
          {!loading && steps.length === 0 && !result && (
            <>
              <div className="mb-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Start a deep research task</h3>
                <p className="text-zinc-400 mb-2">From question to verifiable structured intelligence.</p>
              </div>

              <div className="relative mb-8">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                  placeholder="Enter your research question..."
                  className="w-full px-4 py-4 pr-40 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <select className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none">
                    <option>Ultra (Recommended)</option>
                    <option>Fast</option>
                    <option>Standard</option>
                  </select>
                  <button
                    onClick={handleResearch}
                    disabled={!query.trim()}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Start Research →
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-zinc-500 mb-4">Explore sample research across popular domains</p>
                <div className="flex flex-wrap gap-3">
                  {SAMPLE_DOMAINS.map((domain, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm hover:border-zinc-700 transition-colors"
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(loading || steps.length > 0) && (
            <div className="space-y-6">
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <h3 className="font-medium mb-4">Research Query</h3>
                <p className="text-zinc-400">{query}</p>
              </div>

              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <h3 className="font-medium mb-4">Research Progress</h3>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {step.status === 'completed' && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {step.status === 'in-progress' && (
                        <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                      )}
                      {step.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full border-2 border-zinc-700" />
                      )}
                      <span className={step.status === 'pending' ? 'text-zinc-500' : ''}>{step.step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result && (
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <h3 className="font-medium mb-4">Research Results</h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-300 whitespace-pre-wrap">{result}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
