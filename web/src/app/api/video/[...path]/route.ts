import { NextRequest, NextResponse } from 'next/server';

const CHATLOG_API_URL = process.env.NEXT_PUBLIC_CHATLOG_API_URL || 'http://localhost:5030';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const videoPath = params.path.join('/');
  const backendURL = `${CHATLOG_API_URL}/video/${videoPath}`;

  try {
    const response = await fetch(backendURL);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: response.status },
      );
    }

    const videoBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'video/mp4';

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 },
    );
  }
}
