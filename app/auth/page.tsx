'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RootAuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ฟังก์ชันสำหรับพาไปหน้า LINE Login ของ LINE Developers
  const handleLineLogin = () => {
    setLoading(true);
    setErrorMessage('');

    const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '2011830472';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth');
    const state = Math.random().toString(36).substring(2);
    
    localStorage.setItem('line_auth_state', state);

    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
    
    window.location.href = lineAuthUrl;
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf7f2', margin: 0, padding: '20px', boxSizing: 'border-box', position: 'fixed', top: 0, left: 0, zIndex: 9999, overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #fbedd6', boxSizing: 'border-box', textAlign: 'center' }}>
        
        {/* --- โลโก้น้องหมาสุดน่ารัก --- */}
        <div style={{ width: '90px', height: '90px', borderRadius: '20px', overflow: 'hidden', margin: '0 auto 20px auto', border: '2px solid #fbedd6', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <img 
            src="/logo.jpg" 
            alt="NJ Accounting Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#2d3748', margin: '0 0 10px 0' }}>
          NJ Accounting
        </h1>
        
        <p style={{ fontSize: '13px', color: '#4a5568', margin: '0 0 28px 0', fontWeight: '500', lineHeight: '1.6' }}>
          ระบบบัญชีและจัดการร้านค้าอัจฉริยะ ปลอดภัยสูงสุดด้วยการเข้าสู่ระบบผ่าน LINE ส่วนตัว
        </p>

        {errorMessage && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '12px', color: '#c53030', fontSize: '12px', fontWeight: 'bold' }}>
            ⚠️️ {errorMessage}
          </div>
        )}

        {/* --- ปุ่ม LINE Login หลัก (บังคับใช้งานผ่าน LINE เท่านั้น) --- */}
        <button
          type="button"
          onClick={handleLineLogin}
          disabled={loading}
          style={{ width: '100%', padding: '16px', backgroundColor: '#06C755', color: '#ffffff', fontWeight: '900', fontSize: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 6px 12px rgba(6, 199, 85, 0.25)', transition: 'all 0.2s ease' }}
        >
          <span style={{ fontSize: '20px' }}>💬</span> {loading ? 'กำลังเชื่อมต่อ LINE...' : 'เข้าสู่ระบบด้วย LINE'}
        </button>

        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #fbedd6', fontSize: '11px', color: '#a0aec0', fontWeight: '500' }}>
          🔒 ป้องกันการแชร์บัญชีและระบุตัวตนเจ้าของร้านค้า 100%
        </div>

      </div>
    </div>
  );
}