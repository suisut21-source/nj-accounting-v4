'use client';
import { useState } from 'react';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);

  const handleLineLogin = () => {
    setLoading(true);
    const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '2006571253';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const state = Math.random().toString(36).substring(7);
    
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf7f2', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px 32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #fbedd6', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
  <img 
    src="/logo.jpg" 
    alt="NJ Accounting Logo" 
    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '2px solid #fbedd6' }} 
  />
</div>
        <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#2d3748', margin: '0 0 8px 0' }}>NJ Accounting</h1>
        <p style={{ fontSize: '13px', color: '#4a5568', margin: '0 0 32px 0', fontWeight: '500' }}>ระบบบัญชีร้านค้าอัจฉริยะ</p>

        <button
          type="button"
          onClick={handleLineLogin}
          disabled={loading}
          style={{ width: '100%', padding: '16px', backgroundColor: '#06C755', color: '#ffffff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(6, 199, 85, 0.3)' }}
        >
          <span>{loading ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย LINE'}</span>
        </button>

        <p style={{ fontSize: '11px', color: '#a0aec0', marginTop: '24px' }}>
          ปลอดภัย รวดเร็ว เข้าใช้งานได้ทันทีด้วยบัญชี LINE ของคุณ
        </p>
      </div>
    </div>
  );
}