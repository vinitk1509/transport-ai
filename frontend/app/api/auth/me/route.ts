import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('transportai_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No response body');
      console.error(`Backend /auth/me failed with status ${res.status}: ${errorText}`);
      cookieStore.delete('transportai_token');
      return NextResponse.json({ error: 'Unauthorized', details: errorText, status: res.status }, { status: 401 });
    }

    const user = await res.json();
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
