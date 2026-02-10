import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_CODES: Record<string, string> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  zh: 'zh-CN',
};

export async function POST(request: NextRequest) {
  try {
    const { text, from, to } = await request.json();

    if (!text || !from || !to) {
      return NextResponse.json({ error: 'Missing text, from, or to' }, { status: 400 });
    }

    const sourceLang = LANGUAGE_CODES[from] ?? from;
    const targetLang = LANGUAGE_CODES[to] ?? to;

    if (sourceLang === targetLang) {
      return NextResponse.json({ translatedText: text });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Google Translate error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Response format: [[["translated text","original text",null,null,10]],null,"en"]
    let translatedText = '';
    if (Array.isArray(data) && Array.isArray(data[0])) {
      translatedText = data[0].map((segment: string[]) => segment[0]).join('');
    }

    if (!translatedText) {
      return NextResponse.json(
        { error: 'No translation returned' },
        { status: 502 }
      );
    }

    return NextResponse.json({ translatedText });
  } catch {
    return NextResponse.json({ error: 'Translation request failed' }, { status: 500 });
  }
}
