import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, redirectUri } = await request.json();

    if (!code) {
      return NextResponse.json({ message: 'ไม่พบรหัส Authentication Code' }, { status: 400 });
    }

    const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '2011830472';
    const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

    // 1. นำ code ไปแลก Access Token กับ LINE API
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('code', code);
    tokenParams.append('redirect_uri', redirectUri);
    tokenParams.append('client_id', channelId);
    tokenParams.append('client_secret', channelSecret);

    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'ไม่สามารถแลก Access Token กับ LINE ได้');
    }

    // 2. นำ Access Token ไปดึงข้อมูลโปรไฟล์ผู้ใช้ (LINE User ID และ Display Name)
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok || !profileData.userId) {
      throw new Error('ไม่สามารถดึงข้อมูลโปรไฟล์จาก LINE ได้');
    }

    // ส่ง LINE User ID และชื่อกลับไปให้หน้าบ้านใช้งานต่อ
    return NextResponse.json({
      lineUserId: profileData.userId,
      displayName: profileData.displayName,
      pictureUrl: profileData.pictureUrl,
    });

  } catch (err: any) {
    console.error('Line API Error:', err);
    return NextResponse.json({ message: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ LINE API' }, { status: 500 });
  }
}