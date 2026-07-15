import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('transportai_token')?.value;
    
    if (token) {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(() => {});
    }

    cookieStore.delete('transportai_token');
    return NextResponse.json({ success: true });
  } catch (error) {
    const cookieStore = await cookies();
    cookieStore.delete('transportai_token');
    return NextResponse.json({ success: true });
  }
}
