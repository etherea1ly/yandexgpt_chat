import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    const folderId = process.env.YANDEX_FOLDER_ID;
    const apiKey = process.env.YANDEX_API_KEY;
    
    if (!folderId || !apiKey) {
      console.error("YandexGPT credentials missing in .env.local");
      return NextResponse.json({ reply: 'Ошибка: не настроен API YandexGPT' }, { status: 500 });
    }

    const requestBody = {
      modelUri: `gpt://${folderId}/yandexgpt/latest`,
      completionOptions: {
        stream: false,
        temperature: 0.7,  // чуть выше для творческих ответов
        maxTokens: 2000,
      },
      messages: [
        {
          role: 'system',
          text: 'Ты дружелюбный и полезный AI-ассистент. Отвечай вежливо, понятно и по существу. Можешь поддержать разговор на любые темы, но не выдумывай факты.',
        },
        {
          role: 'user',
          text: message,
        },
      ],
    };

    const response = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Api-Key ${apiKey}`,
        },
      }
    );

    const reply = response.data.result.alternatives[0].message.text;
    return NextResponse.json({ reply });
    
  } catch (error: any) {
    console.error('YandexGPT API Error:', error.response?.data || error.message);
    return NextResponse.json(
      { reply: 'Извините, произошла ошибка. Попробуйте позже.' },
      { status: 500 }
    );
  }
}