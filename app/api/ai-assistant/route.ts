import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }

  const { question, context } = await request.json();

  if (!question || typeof question !== 'string') {
    return NextResponse.json(
      { error: 'Question is required' },
      { status: 400 }
    );
  }

  const systemMessage = context
    ? `You are a helpful AI assistant in a meeting. Here is the current meeting transcript for context:\n\n${context}\n\nAnswer the user's question based on the meeting context when relevant. Be concise and helpful.`
    : 'You are a helpful AI assistant in a meeting. Answer the user\'s question concisely and helpfully.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: question },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return NextResponse.json(
      { error: error.error?.message ?? 'OpenAI API request failed' },
      { status: response.status }
    );
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content ?? 'No response from AI';

  return NextResponse.json({ answer });
}
