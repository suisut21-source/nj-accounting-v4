import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { shopName, packageName, phone } = await request.json();
    
    const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const ADMIN_LINE_USER_ID = process.env.ADMIN_LINE_USER_ID;

    if (!CHANNEL_ACCESS_TOKEN || !ADMIN_LINE_USER_ID) {
      return NextResponse.json({ success: false, error: 'Missing LINE config' }, { status: 400 });
    }

    const message = `🚨 มีร้านค้าสมัครแพ็กเกจใหม่!\n\n🏪 ชื่อร้าน: ${shopName}\n📦 แพ็กเกจ: ${packageName}\n📞 เบอร์โทร: ${phone}\n\n👉 กรุณาเข้าไปตรวจสอบและกดอนุมัติในระบบได้เลยครับ!`;

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: ADMIN_LINE_USER_ID,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      })
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending LINE notification:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}