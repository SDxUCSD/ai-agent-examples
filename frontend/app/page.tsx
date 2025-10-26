'use client';

import { useState } from 'react';
import WebSearch from './components/WebSearch';
import Chat from './components/Chat';
import FindAll from './components/FindAll';
import DeepResearch from './components/DeepResearch';

type Tab = 'search' | 'chat' | 'findall' | 'deep-research';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('search');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex h-screen">
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-semibold mb-2">Web Research APIs</h1>
            <p className="text-sm text-zinc-400">for AIs</p>
          </div>

          <nav className="flex-1 px-4">
            <div className="mb-6">
              <div className="text-xs text-zinc-500 uppercase mb-2 px-3">API Playground</div>
              <button
                onClick={() => setActiveTab('deep-research')}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  activeTab === 'deep-research'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Deep Research</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('findall')}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  activeTab === 'findall'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Find All</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  activeTab === 'search'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Search</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Chat</span>
                </div>
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 mb-2">API Status</div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-zinc-400">Connected</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          {activeTab === 'search' && <WebSearch />}
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'findall' && <FindAll />}
          {activeTab === 'deep-research' && <DeepResearch />}
        </main>
      </div>
    </div>
  );
}
