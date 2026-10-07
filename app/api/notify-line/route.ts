import { NextResponse } from 'next/server';

const clip = (value: unknown, max = 100) =>
  String(value ?? '').trim().slice(0, max) || 'ไม่ได้ระบุ';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = 'new_registration',
      shopName,
      oldShopName,
      packageName,
      oldPackageName,
      phone,
      status,
    } = body;

    const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const ADMIN_LINE_USER_ID = process.env.ADMIN_LINE_USER_ID;

    if (!CHANNEL_ACCESS_TOKEN || !ADMIN_LINE_USER_ID) {
      return NextResponse.json({ success: false, error: 'Missing LINE config' }, { status: 400 });
    }

    let message: string;

    if (type === 'shop_updated') {
      // แก้เฉพาะชื่อ/เบอร์
      message =
        `✏️ ร้านค้าแก้ไขข้อมูล\n\n` +
        `🏪 ชื่อเดิม: ${clip(oldShopName)}\n` +
        `🏪 ชื่อใหม่: ${clip(shopName)}\n` +
        `📞 เบอร์โทร: ${clip(phone, 20)}\n` +
        `📌 สถานะปัจจุบัน: ${clip(status, 20)}`;
    } else if (type === 'package_changed') {
      // เปลี่ยนแพ็กเกจระหว่างรออนุมัติ → ต้องให้แอดมินตรวจสอบ/อนุมัติอีกครั้ง
      message =
        `🔄 ร้านค้าเปลี่ยนแพ็กเกจ (รออนุมัติ)\n\n` +
        `🏪 ชื่อร้าน: ${clip(shopName)}\n` +
        `📦 แพ็กเกจเดิม: ${clip(oldPackageName, 150)}\n` +
        `📦 แพ็กเกจใหม่: ${clip(packageName, 150)}\n` +
        `📞 เบอร์โทร: ${clip(phone, 20)}\n\n` +
        `👉 กรุณาเข้าไปตรวจสอบและกดอนุมัติในระบบได้เลยครับ!`;
    } else {
      // สมัครใหม่
      message =
        `🚨 มีร้านค้าสมัครแพ็กเกจใหม่!\n\n` +
        `🏪 ชื่อร้าน: ${clip(shopName)}\n` +
        `📦 แพ็กเกจ: ${clip(packageName, 150)}\n` +
        `📞 เบอร์โทร: ${clip(phone, 20)}\n\n` +
        `👉 กรุณาเข้าไปตรวจสอบและกดอนุมัติในระบบได้เลยครับ!`;
    }

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: ADMIN_LINE_USER_ID,
        messages: [{ type: 'text', text: message }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LINE API error:', response.status, errorText);
      return NextResponse.json({ success: false, error: errorText }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending LINE notification:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}