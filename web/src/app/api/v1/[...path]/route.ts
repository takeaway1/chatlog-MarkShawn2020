import { NextRequest, NextResponse } from 'next/server';

const CHATLOG_API_URL = process.env.NEXT_PUBLIC_CHATLOG_API_URL || 'http://localhost:5030';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const apiPath = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const backendURL = `${CHATLOG_API_URL}/api/v1/${apiPath}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const response = await fetch(backendURL, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'API request failed' },
        { status: response.status },
      );
    }

    const contentType = response.headers.get('content-type') || 'application/json';

    // Handle JSON responses
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Handle other content types (CSV, text, etc.)
    const data = await response.text();
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Error proxying API request:', error);
    return NextResponse.json(
      { error: 'Failed to proxy API request' },
      { status: 500 },
    );
  }
}
