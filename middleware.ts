import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ถ้าเข้าหน้า /auth, ไฟล์ระบบ, หรือสตรีมต่างๆ ให้ปล่อยผ่านตามปกติ
  if (
    pathname.startsWith('/auth') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // นอกเหนือจากนั้น (รวมถึงหน้าแรก / ด้วย) ถ้ายังไม่ได้เข้าหน้าล็อกอิน ให้ดีดไปที่ /auth ทันที!
  const url = request.nextUrl.clone();
  url.pathname = '/auth';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};