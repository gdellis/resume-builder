import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  resumeData: any;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, resumeData } = body;

    const ollamaUrl = process.env.OLLAMA_CLOUD_URL || 'https://ollama.com/v1';
    const model = process.env.OLLAMA_MODEL || 'llama3.2';

    const systemPrompt = `You are a professional resume writing assistant. Help the user improve their resume content.

Current resume data:
- Name: ${resumeData.basics?.name || 'Not provided'}
- Job Title: ${resumeData.basics?.label || 'Not provided'}
- Summary: ${resumeData.basics?.summary || 'Not provided'}
- Work Experience: ${resumeData.work?.length || 0} entries
- Education: ${resumeData.education?.length || 0} entries
- Skills: ${resumeData.skills?.map((s: any) => s.name).join(', ') || 'None'}

Guidelines:
1. Write professional, concise content
2. Use action verbs and quantify achievements where possible
3. Keep summaries to 2-4 sentences
4. Focus on relevant experience for the user's target role
5. Format responses with clear sections when needed

Respond helpfully to: ${message}`;

    const response = await fetch(`${ollamaUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get AI response', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ message: data.choices?.[0]?.message?.content || 'No response generated' });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}