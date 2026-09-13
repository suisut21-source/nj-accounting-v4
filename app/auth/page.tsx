'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const formatEmailFromPhone = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `${cleanPhone}@nj-accounting.com`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (phone.replace(/\D/g, '').length !== 10) {
      setErrorMessage('กรุณากรอกเบอร์โทรศัพท์มือถือให้ครบ 10 หลักครับ');
      setLoading(false);
      return;
    }

    const authEmail = formatEmailFromPhone(phone);

    try {
      if (isLogin) {
        // เข้าสู่ระบบ
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

        if (error) throw error;
      } else {
        // สมัครสมาชิกใหม่
        const { error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              shop_name: shopName,
              phone: phone.replace(/\D/g, ''),
            },
          },
        });

        if (signUpError) throw signUpError;

        // ล็อกอินต่อทันทีหลังสมัคร
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

        if (signInError) throw signInError;
      }

      // บันทึกสถานะว่าล็อกอินแล้วในเครื่อง
      localStorage.setItem('nj_is_logged_in', 'true');

      // พุ่งตรงไปหน้าตั้งค่าร้านค้าทันที
      window.location.href = '/settings';

    } catch (err: any) {
      console.error('Auth Error:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งครับ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf7f2', margin: 0, padding: '20px', boxSizing: 'border-box', position: 'fixed', top: 0, left: 0, zIndex: 9999, overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #fbedd6', boxSizing: 'border-box' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fbedd6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '32px', border: '1px solid rgba(191, 126, 70, 0.2)' }}>
            🐕
          </div>
          
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#2d3748', margin: '0 0 8px 0' }}>
            {isLogin ? 'ยินดีต้อนรับกลับครับพี่! 👋' : 'มาสร้างร้านค้ากัน! 🚀'}
          </h1>
          <p style={{ fontSize: '12px', color: '#4a5568', margin: 0, fontWeight: '500' }}>
            {isLogin ? 'เข้าสู่ระบบด้วยเบอร์โทรศัพท์เพื่อจัดการร้านค้า' : 'กรอกเบอร์โทรและตั้งรหัสผ่านเพื่อเปิดบัญชีร้านค้า'}
          </p>
        </div>

        {/* กล่องโปรโมชั่นพิเศษ */}
        <div style={{ backgroundColor: '#fffbf2', border: '1px solid #fbedd6', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#bf7e46', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🎁 สิทธิพิเศษสำหรับพี่:
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#4a5568', marginBottom: '6px', fontWeight: '600' }}>
            <span>• ทดลองใช้งานฟรีเต็มระบบ</span>
            <span style={{ backgroundColor: '#e6fffa', color: '#319795', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>1 เดือนเต็ม</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#4a5568', fontWeight: '600' }}>
            <span>• หลังจากนั้นแพ็กเกจรายเดือน</span>
            <span style={{ color: '#bf7e46', fontWeight: 'bold' }}>เพียง 199 บาท/เดือน</span>
          </div>
        </div>

        {errorMessage && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '12px', color: '#c53030', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568', paddingLeft: '4px' }}>ชื่อร้านค้า</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="เช่น ร้านข้าวพันผัก"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#faf7f2', border: '1px solid #fbedd6', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#2d3748', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568', paddingLeft: '4px' }}>เบอร์โทรศัพท์ (10 หลัก)</label>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="0812345678"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#faf7f2', border: '1px solid #fbedd6', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#2d3748', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568', paddingLeft: '4px' }}>รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#faf7f2', border: '1px solid #fbedd6', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#2d3748', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ paddingTop: '6px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#BF7E46', color: '#ffffff', fontWeight: '900', fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            >
              {loading ? 'กำลังตรวจสอบ...' : isLogin ? 'เข้าสู่ระบบด้วยเบอร์โทร' : 'สมัครสมาชิก & เริ่มต้นใช้งาน 🐕'}
            </button>
          </div>
        </form>

        {/* กล่องติดต่อช่วยเหลือ */}
        <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '12px', textAlign: 'center', fontSize: '11px', color: '#276749', fontWeight: '600' }}>
          💬 ติดปัญหาตรงไหนทักมาได้ตลอดเลยนะครับ Line ID: @579mimsm
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #fbedd6', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setShopName(''); setPhone(''); setPassword('');
              setErrorMessage('');
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}
          >
            {isLogin ? 'ยังไม่มีบัญชีร้านค้า? สร้างบัญชีเลย' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', fontWeight: '500', color: '#a0aec0', borderTop: '1px solid #fbedd6', paddingTop: '14px' }}>
          ระบบจัดการร้านค้า NJ Accounting v1.0.0 • ดูแลร้านค้าด้วยใจ 🐕✨
        </div>
      </div>
    </div>
  );
}