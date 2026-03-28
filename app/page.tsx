'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Загружаем историю при старте
  useEffect(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  // Сохраняем при каждом изменении
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ошибка соединения' }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">AI Chat Assistant</h1>
        <div className="bg-gray-800 rounded-lg p-4 h-96 overflow-y-auto mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400">AI печатает...</div>}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 rounded bg-gray-700 text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={sendMessage} 
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}