import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ข้ามไฟล์ระบบและหน้า auth
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // เช็กคุกกี้ที่ขึ้นต้นด้วย sb- (คุ้กกี้ล็อกอินของ Supabase)
  const allCookies = request.cookies.getAll()
  const hasSupabaseSession = allCookies.some(cookie => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token'))

  // ถ้ายังไม่ล็อกอิน ให้ดีดไปหน้า /auth ทันที
  if (!hasSupabaseSession) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}