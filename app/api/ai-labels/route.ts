import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { label, style, model, language, apiKey } = await req.json();

    if (!label) {
      return NextResponse.json({ error: 'Label is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    // Proxy request to Anthropic Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20240620', // updated standard claude model
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: `Translate this code structural label "${label}" into a more human-readable description for a flowchart node.
          Style: ${style || 'Concise'}. Output Language: ${language || 'English'}.
          Return ONLY the new string label without quotes, starting context, or formatting.`
        }],
      }),
    });

    if (!response.ok) {
        const err = await response.text();
        return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const improvedLabel = data.content?.[0]?.text?.trim() || label;

    return NextResponse.json({ label: improvedLabel });
  } catch (error: any) {
    console.error("Error generating AI label:", error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
