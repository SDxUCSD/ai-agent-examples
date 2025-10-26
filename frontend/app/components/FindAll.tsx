'use client';

import { useState } from 'react';

interface Column {
  name: string;
  description?: string;
  type?: string;
}

interface FindAllSpec {
  columns: Column[];
  [key: string]: any;
}

const CATEGORIES = [
  'Business Intelligence',
  'Startups & SMBs',
  'Talent & Hiring',
  'Healthcare',
];

export default function FindAll() {
  const [query, setQuery] = useState('');
  const [keywords, setKeywords] = useState('');
  const [policy, setPolicy] = useState('INCLUDE');
  const [domain, setDomain] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [maxExcerpt, setMaxExcerpt] = useState(20000);
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<FindAllSpec | null>(null);
  const [results, setResults] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  const handleSearch = async (execute = false) => {
    if (!query.trim()) return;

    setLoading(true);
    setSpec(null);
    setResults(null);
    
    try {
      const response = await fetch('/api/findall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: query,
          executeNow: execute,
        }),
      });
      const data = await response.json();
      
      if (data.spec) {
        setSpec(data.spec);
      }
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('FindAll error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!spec) return;

    setLoading(true);
    try {
      const response = await fetch('/api/findall', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spec),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('FindAll execute error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex bg-zinc-950">
      <div className="w-96 border-r border-zinc-800 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Find All</h2>
          <p className="text-sm text-zinc-400">Build a dataset from the web</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Objective <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-zinc-500 mb-2">Natural-language description of what the web research goal is.</p>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Lithium supply contracts"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 text-white text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Keywords</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="lithium supply contracts, Lithium suppliers, ..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Policy</label>
            <div className="flex gap-2">
              <select
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
                className="flex-none w-32 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 text-white text-sm"
              >
                <option>INCLUDE</option>
                <option>EXCLUDE</option>
              </select>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain to include (e.g. arxiv.org)"
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max results</label>
            <input
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max excerpt chars</label>
            <input
              type="number"
              value={maxExcerpt}
              onChange={(e) => setMaxExcerpt(Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 text-white text-sm"
            />
          </div>

          <button
            onClick={() => handleSearch(false)}
            disabled={loading || !query.trim()}
            className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Spec'}
          </button>

          {spec && !results && (
            <button
              onClick={handleExecute}
              disabled={loading}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Execute & Get Results'}
            </button>
          )}

          <button
            onClick={() => handleSearch(true)}
            disabled={loading || !query.trim()}
            className="w-full px-4 py-2 border border-zinc-700 hover:bg-zinc-900 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Generate & Execute Now'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Results</h3>
            <p className="text-sm text-zinc-400">LLM friendly snippets optimized for agent context efficiency and accuracy</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'visual' ? 'bg-white text-black' : 'border border-zinc-700'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'json' ? 'bg-white text-black' : 'border border-zinc-700'
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        {!loading && !spec && (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <svg className="w-16 h-16 mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h4 className="text-lg font-medium mb-2">Enter your search objective</h4>
            <p className="text-zinc-400">Run a search to see the generated extraction spec</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400">Generating extraction spec...</p>
          </div>
        )}

        {viewMode === 'visual' && spec && spec.columns && (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <h4 className="font-medium mb-2">Generated Extraction Spec</h4>
              <p className="text-sm text-zinc-400 mb-4">This spec defines what data will be extracted from web sources</p>
              <div className="overflow-x-auto">
                <table className="w-full border border-zinc-800 rounded-lg">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium">Column Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {spec.columns.map((col, index) => (
                      <tr key={index} className="hover:bg-zinc-900/50">
                        <td className="px-4 py-3 text-sm font-mono text-blue-400">{col.name}</td>
                        <td className="px-4 py-3 text-sm text-zinc-300">{col.description || '-'}</td>
                        <td className="px-4 py-3 text-sm text-zinc-500">{col.type || 'string'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {results && (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                <h4 className="font-medium mb-2">Extraction Results</h4>
                <p className="text-sm text-zinc-400 mb-4">{results.length || 0} entities found</p>
                <div className="overflow-x-auto">
                  <table className="w-full border border-zinc-800 rounded-lg">
                    <thead className="bg-zinc-800">
                      <tr>
                        {spec.columns.map((col, idx) => (
                          <th key={idx} className="px-4 py-3 text-left text-xs font-medium">{col.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {Array.isArray(results) && results.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-zinc-900/50">
                          {spec.columns.map((col, colIdx) => (
                            <td key={colIdx} className="px-4 py-3 text-sm text-zinc-300">
                              {typeof row[col.name] === 'object' ? JSON.stringify(row[col.name]) : String(row[col.name] || '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'json' && (spec || results) && (
          <div className="space-y-4">
            {spec && (
              <div>
                <h4 className="font-medium mb-2">Spec</h4>
                <pre className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm overflow-x-auto">
                  <code>{JSON.stringify(spec, null, 2)}</code>
                </pre>
              </div>
            )}
            {results && (
              <div>
                <h4 className="font-medium mb-2">Results</h4>
                <pre className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm overflow-x-auto">
                  <code>{JSON.stringify(results, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
