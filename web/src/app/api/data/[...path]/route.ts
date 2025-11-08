import { NextRequest, NextResponse } from 'next/server';

const CHATLOG_API_URL = process.env.NEXT_PUBLIC_CHATLOG_API_URL || 'http://localhost:5030';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const dataPath = params.path.join('/');
  const backendURL = `${CHATLOG_API_URL}/data/${dataPath}`;

  try {
    const response = await fetch(backendURL);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Data not found' },
        { status: response.status },
      );
    }

    const dataBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(dataBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 },
    );
  }
}
