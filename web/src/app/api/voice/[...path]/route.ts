import { NextRequest, NextResponse } from 'next/server';

const CHATLOG_API_URL = process.env.NEXT_PUBLIC_CHATLOG_API_URL || 'http://localhost:5030';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const voicePath = params.path.join('/');
  const backendURL = `${CHATLOG_API_URL}/voice/${voicePath}`;

  try {
    const response = await fetch(backendURL);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Voice not found' },
        { status: response.status },
      );
    }

    const voiceBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'audio/mp3';

    return new NextResponse(voiceBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying voice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice' },
      { status: 500 },
    );
  }
}
