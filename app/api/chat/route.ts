import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Запрос к локальному Ollama
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:1.5b',
        prompt: `Ты дружелюбный AI-ассистент. Отвечай кратко. Сообщение: ${message}`,
        stream: false
      })
    });

    const data = await response.json();
    const reply = data.response || 'Не удалось получить AI ответ';
    
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Ollama error:', error);
    return NextResponse.json(
      { reply: 'Ошибка: Ollama не запущен. Выполните `ollama serve`' },
      { status: 500 }
    );
  }
}