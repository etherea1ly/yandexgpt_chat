"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const STORAGE_KEY = "chat-history";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка истории из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
    setLoaded(true);
  }, []);

  // Сохранение в localStorage при изменении сообщений (после загрузки)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [messages, loaded]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // TODO: заменить на реальный вызов AI API
    setTimeout(() => {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Эхо: ${text}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 500);
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          AI Chat Assistant
        </h1>
        <button
          onClick={clearHistory}
          className="text-sm text-zinc-500 hover:text-red-500 transition-colors"
        >
          Очистить историю
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-center text-zinc-400 mt-20">
              Напишите сообщение, чтобы начать чат
            </p>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span
                  className={`block text-[10px] mt-1 ${
                    msg.role === "user" ? "text-blue-200" : "text-zinc-400"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Отправить
          </button>
        </div>
      </footer>
    </div>
  );
}