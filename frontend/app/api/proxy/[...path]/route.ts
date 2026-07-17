import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/+$/, '');

export async function middleware(req: NextRequest) {
  const method = req.method;
  
  let baseUrl = BACKEND_URL;
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  let path = req.nextUrl.pathname.replace(/^\/api\/proxy/, '');
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const searchParams = req.nextUrl.search;
  
  const targetUrl = `${baseUrl}${path}${searchParams}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('cookie');
  headers.delete('connection');

  const cookieStore = await cookies();
  const token = cookieStore.get('transportai_token')?.value;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    let bodyData: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        bodyData = await req.text();
      } catch (e) {
        // ignore or log
      }
    }

    const requestOptions: RequestInit & { duplex?: 'half' } = {
      method,
      headers,
      redirect: 'manual',
      body: bodyData,
      duplex: 'half',
    };

    const res = await fetch(targetUrl, requestOptions);

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('content-encoding');

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(JSON.stringify({ error: 'Proxy Request Failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Next.js Route Handlers require explicitly exporting allowed methods
export { middleware as GET, middleware as POST, middleware as PUT, middleware as DELETE, middleware as PATCH, middleware as OPTIONS };
