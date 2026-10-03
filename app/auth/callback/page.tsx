'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

function LineCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('กำลังเชื่อมต่อและยืนยันตัวตนกับ LINE...');

  useEffect(() => {
    const handleLineCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatusMessage('การเข้าสู่ระบบด้วย LINE ถูกยกเลิก');
        setTimeout(() => router.push('/auth'), 3000);
        return;
      }

      if (!code) return;

      try {
        setStatusMessage('กำลังตรวจสอบข้อมูลบัญชีร้านค้า...');

        const response = await fetch('/api/line-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri: window.location.origin + '/auth/callback' }),
        });

        const result = await response.json();

        if (!response.ok || !result.lineUserId) {
          throw new Error(result.message || 'ไม่สามารถยืนยันตัวตนกับ LINE ได้');
        }

        const { lineUserId, displayName } = result;

        const { data: existingStore } = await supabase
          .from('stores')
          .select('*')
          .eq('line_user_id', lineUserId)
          .single();

        if (existingStore) {
          localStorage.setItem('nj_is_logged_in', 'true');
          localStorage.setItem('nj_line_user_id', lineUserId);
          localStorage.setItem('nj_shop_name', existingStore.shop_name || 'ร้านค้าของฉัน');
          
          setStatusMessage('สร้างบัญชีร้านค้าสำเร็จ! กำลังพาไปรับสิทธิ์ทดลองใช้ฟรี...');
          setTimeout(() => { window.location.href = '/pricing'; }, 1000);

        } else {
          const trialExpireDate = new Date();
          trialExpireDate.setDate(trialExpireDate.getDate() + 30);

          const newShopName = displayName ? `ร้านของ ${displayName}` : 'ร้านค้าของฉัน';

          const { error: insertError } = await supabase
            .from('stores')
            .insert([
              {
                line_user_id: lineUserId,
                shop_name: newShopName,
                subscription_status: 'pending',
                package_name: 'ทดลองใช้ฟรี 30 วัน',
                expire_date: trialExpireDate.toISOString()
              }
            ]);

          if (insertError) throw insertError;

          localStorage.setItem('nj_is_logged_in', 'true');
          localStorage.setItem('nj_line_user_id', lineUserId);
          localStorage.setItem('nj_shop_name', newShopName);

          setStatusMessage('สร้างบัญชีร้านค้าสำเร็จ! กำลังพาเข้าสู่ระบบ...');
          setTimeout(() => { window.location.href = '/'; }, 1000);
        }

      } catch (err: any) {
        console.error('Line Callback Error:', err);
        setStatusMessage(`⚠️ เกิดข้อผิดพลาด: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}`);
        setTimeout(() => router.push('/auth'), 4000);
      }
    };

    handleLineCallback();
  }, [searchParams, router]);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf7f2', margin: 0, padding: '20px', boxSizing: 'border-box', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px 32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #fbedd6', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐕💬</div>
        <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#2d3748', margin: '0 0 12px 0' }}>กำลังเชื่อมต่อ LINE</h2>
        <p style={{ fontSize: '13px', color: '#4a5568', margin: 0, fontWeight: '500', lineHeight: '1.5' }}>{statusMessage}</p>
      </div>
    </div>
  );
}


export default function LineCallbackPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลด...</div>}>
      <LineCallbackContent />
    </Suspense>
  );
}