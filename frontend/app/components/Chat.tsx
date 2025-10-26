'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLE_QUERIES = [
  'What are the best new restaurants in NYC?',
  'Who is the current CEO of Snowflake?',
  "What are Trump's proposed tariffs on imports?",
  'What is the latest news about Apple?',
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: messages }),
      });
      const data = await response.json();
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response || 'Sorry, I could not process your request.' 
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, an error occurred. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="border-b border-zinc-800 p-6">
        <h2 className="text-2xl font-semibold mb-2">Chat</h2>
        <p className="text-sm text-zinc-400">AI-powered conversational search</p>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="mb-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
              <p className="text-zinc-400">Ask me anything</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
              {EXAMPLE_QUERIES.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(query)}
                  className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-left hover:border-zinc-700 transition-colors"
                >
                  <p className="text-sm font-medium">{query.split('?')[0]}?</p>
                  {query.includes('\n') && (
                    <p className="text-xs text-zinc-500 mt-1">{query.split('\n')[1]}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-900 border border-zinc-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <p className="text-sm text-zinc-400">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Send a message..."
            className="w-full px-4 py-3 pr-12 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
