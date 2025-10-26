'use client';

import { useState } from 'react';

interface SearchResult {
  title: string;
  url: string;
  excerpt: string;
}

export default function WebSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="border-b border-zinc-800 p-6">
        <h2 className="text-2xl font-semibold mb-2">Search</h2>
        <p className="text-sm text-zinc-400">Ranked web URLs with long, relevant content</p>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Query</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your search query..."
                className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Results</h3>
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <h4 className="font-medium mb-1">{result.title}</h4>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mb-2 block">
                    {result.url}
                  </a>
                  <p className="text-sm text-zinc-400">{result.excerpt}</p>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <p>Enter a search query to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
