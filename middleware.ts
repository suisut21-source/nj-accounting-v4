import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // เปิดทางให้ทุกหน้าวิ่งผ่านได้อย่างราบรื่นไร้รอยต่อ
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}