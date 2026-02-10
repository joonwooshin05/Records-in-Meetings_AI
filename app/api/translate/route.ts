import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_CODES: Record<string, string> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  'zh-CN': 'zh-CN',
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

    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: `MyMemory API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.quotaFinished) {
      return NextResponse.json(
        { error: 'Translation quota exceeded' },
        { status: 429 }
      );
    }

    const translatedText = data.responseData?.translatedText;
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
