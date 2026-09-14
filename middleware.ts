import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ปล่อยผ่านหน้า /auth และไฟล์ระบบต่างๆ (เช่น _next, favicon) เพื่อไม่ให้เกิดลูปวนซ้ำ
  if (pathname.startsWith('/auth') || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // เช็กว่ามีคุกกี้เซสชันของ Supabase หรือสถานะล็อกอินไหม
  // (ในที่นี้เราเช็ก supabase-auth-token หรือคุกกี้ที่พี่สะดวก)
  const hasSession = request.cookies.get('sb-access-token') || request.cookies.get('sb-refresh-token');

  // ถ้าไม่มีการล็อกอิน ให้ดีดกลับไปหน้า /auth ทันที!
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};