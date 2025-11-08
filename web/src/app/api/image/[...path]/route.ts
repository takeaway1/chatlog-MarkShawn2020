import { NextRequest, NextResponse } from 'next/server';

const CHATLOG_API_URL = process.env.NEXT_PUBLIC_CHATLOG_API_URL || 'http://localhost:5030';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const imagePath = params.path.join('/');
  const backendURL = `${CHATLOG_API_URL}/image/${imagePath}`;

  console.log(`[Image Proxy] Requesting: ${backendURL}`);

  try {
    const response = await fetch(backendURL, {
      redirect: 'manual', // Don't follow redirects automatically
    });

    console.log(`[Image Proxy] Response status: ${response.status}`);

    // Handle redirects
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      console.log(`[Image Proxy] Redirect to: ${location}`);

      if (location && location !== '/') {
        // Follow redirect to /data/* endpoint
        const redirectURL = `${CHATLOG_API_URL}${location}`;
        const redirectResponse = await fetch(redirectURL);

        if (redirectResponse.ok) {
          const imageBuffer = await redirectResponse.arrayBuffer();
          const contentType = redirectResponse.headers.get('content-type') || 'image/jpeg';

          return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      }

      return NextResponse.json(
        { error: 'Image not found in database', md5: imagePath },
        { status: 404 },
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Image Proxy] Error response: ${errorText}`);
      return NextResponse.json(
        { error: 'Image not found', details: errorText },
        { status: response.status },
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[Image Proxy] Exception:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image', message: String(error) },
      { status: 500 },
    );
  }
}
