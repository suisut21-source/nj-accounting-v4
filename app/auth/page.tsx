'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function RootAuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      setErrorMessage('กรุณากรอกเบอร์โทรศัพท์มือถือให้ครบ 10 หลักครับ');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // --- ระบบเข้าสู่ระบบ (Login) เช็กจากตาราง stores ---
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('phone_number', cleanPhone)
          .eq('password', password)
          .single();

        if (error || !data) {
          throw new Error('เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้องครับ');
        }

        // บันทึกสถานะล็อกอินและข้อมูลร้านค้าลงเครื่อง
        localStorage.setItem('nj_is_logged_in', 'true');
        localStorage.setItem('nj_phone', cleanPhone);
        localStorage.setItem('nj_shop_name', data.shop_name || 'ร้านค้าของฉัน');
        
      } else {
        // --- ระบบสมัครสมาชิก (Sign Up) บันทึกลงตาราง stores ---
        const { data: existingStore } = await supabase
          .from('stores')
          .select('phone_number')
          .eq('phone_number', cleanPhone)
          .single();

        if (existingStore) {
          throw new Error('เบอร์โทรศัพท์นี้ถูกใช้งานสมัครร้านค้าไปแล้วครับ');
        }

        // คำนวณวันหมดอายุทดลองใช้ฟรี 30 วันล่วงหน้า
        const trialExpireDate = new Date();
        trialExpireDate.setDate(trialExpireDate.getDate() + 30);

        // 2. บันทึกข้อมูลร้านค้าใหม่ลงตาราง stores (ตั้งค่าสถานะเป็น pending เพื่อรอแอดมินอนุมัติ)
        const { error: insertError } = await supabase
          .from('stores')
          .insert([
            {
              phone_number: cleanPhone,
              password: password,
              shop_name: shopName || 'ร้านค้าของฉัน',
              subscription_status: 'pending', // เปลี่ยนเป็นรอตรวจสอบ เพื่อให้แอดมินได้กดอนุมัติ
              package_name: 'ทดลองใช้ฟรี 30 วัน',
              expire_date: trialExpireDate.toISOString() // บันทึกวันหมดอายุ
            }
          ]);

        if (insertError) throw insertError;

        localStorage.setItem('nj_is_logged_in', 'true');
        localStorage.setItem('nj_phone', cleanPhone);
        localStorage.setItem('nj_shop_name', shopName || 'ร้านค้าของฉัน');
      }

      // พาไปหน้าหลักของระบบ
      window.location.href = '/';

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
            {isLogin ? 'เข้าสู่ระบบด้วยเบอร์โทรศัพท์เพื่อจัดการร้านค้า' : 'กรอกเบอร์โทรและตั้งรหัสผ่านเพื่อเปิดบัญชีร้านค้า (ทดลองใช้ฟรี 30 วัน)'}
          </p>
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

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: '#BF7E46', color: '#ffffff', fontWeight: '900', fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', marginTop: '6px' }}
          >
            {loading ? 'กำลังตรวจสอบ...' : isLogin ? 'เข้าสู่ระบบด้วยเบอร์โทร' : 'สมัครสมาชิก & เริ่มต้นใช้งานฟรี 30 วัน 🐕'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #fbedd6', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}
          >
            {isLogin ? 'ยังไม่มีบัญชีร้านค้า? สร้างบัญชีเลย' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
          </button>
        </div>
      </div>
    </div>
  );
}