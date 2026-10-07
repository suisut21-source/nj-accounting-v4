'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FiCheck, FiStar, FiClock, FiZap, FiShield } from 'react-icons/fi';

interface StoreData {
  shop_name: string;
  phone_number: string;
  subscription_status: string;
  package_name: string;
  expire_date: string;
  line_user_id: string;
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('NJ Plus (ทดลองใช้ฟรี 1 เดือนแรก - หลังจากนั้น 259 บาท/เดือน)');
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreData | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(30);
  const supportContact = '@579mimsm (Admin Support / NJ ยินดีบริการ)';

  const myBankInfo = {
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    accountNumber: '417-118907-4',
    accountName: 'นางสาวณัฐมล ชุ่มชื่น'
  };

  useEffect(() => {
    const fetchStoreStatus = async () => {
      const lineUserId = localStorage.getItem('nj_line_user_id');
      if (!lineUserId) return;

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('line_user_id', lineUserId)
        .single();

      if (!error && data) {
        setStoreInfo(data);
        if (data.shop_name && !shopName) setShopName(data.shop_name);
        if (data.phone_number && !shopPhone) setShopPhone(data.phone_number);

        if (data.expire_date) {
          const expDate = new Date(data.expire_date);
          const now = new Date();
          const diffTime = expDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysLeft(diffDays > 0 ? diffDays : 0);
        }
      }
    };

    fetchStoreStatus();
    const interval = setInterval(fetchStoreStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('รูปภาพมีขนาดใหญ่เกินไปครับ! กรุณาเลือกรูปที่มีขนาดต่ำกว่า 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSlipImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      alert('กรุณากรอกชื่อร้านค้าของคุณ');
      return;
    }

    const lineUserId = localStorage.getItem('nj_line_user_id');
    if (!lineUserId) {
      alert('⚠️ ไม่พบข้อมูลการเข้าสู่ระบบผ่าน LINE กรุณาล็อกอินใหม่อีกครั้ง');
      window.location.href = '/auth';
      return;
    }

    const expireDateObj = new Date();
    expireDateObj.setDate(expireDateObj.getDate() + 30);

    const { error } = await supabase
      .from('stores')
      .update({
        shop_name: shopName,
        phone_number: shopPhone ? shopPhone.replace(/\D/g, '') : null,
        package_name: selectedPlan,
        subscription_status: 'pending',
        expire_date: expireDateObj.toISOString()
      })
      .eq('line_user_id', lineUserId);

    if (error) {
      alert('⚠️ เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
      console.error(error);
      return;
    }

    // 🚀 เพิ่มโค้ดส่วนนี้เพื่อส่งแจ้งเตือนเข้า LINE แอดมินอัตโนมัติ
    try {
      await fetch('/api/notify-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: shopName,
          packageName: selectedPlan,
          phone: shopPhone || 'ไม่ได้ระบุ'
        })
      });
    } catch (err) {
      console.error('Line notify error:', err);
    }

    alert('ลงทะเบียนรับสิทธิ์เรียบร้อยแล้วครับ! รอแอดมินตรวจสอบและอนุมัติเปิดสิทธิ์ใช้งาน 🐾');
    window.location.reload();
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 font-sans pb-24">
      
      {/* Header */}
      <div 
        className="p-8 rounded-[2.5rem] shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-800 relative overflow-hidden"
        style={{ backgroundColor: '#FBEDD6', borderColor: '#f3dcbc' }}
      >
        <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-10 pointer-events-none">
          🎁
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div 
            className="w-16 h-16 rounded-3xl border flex items-center justify-center text-3xl shadow-md bg-white"
            style={{ borderColor: '#e6ccab' }}
          >
            🚀
          </div>
          <div>
            <span className="text-xs font-bold px-3 py-1 bg-[#BF7E46] text-white rounded-full uppercase tracking-wider shadow-sm">
              Free Trial 1 Month
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              ทดลองใช้ NJ Accounting ฟรี 1 เดือนเต็ม!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              กรุณาเลือกแพ็กเกจที่ต้องการด้านล่าง แล้วลงทะเบียนเพื่อรับสิทธิ์ใช้งานฟรีทันที
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 กล่องแสดงสถานะแพ็กเกจจาก Cloud DB จริง */}
      {storeInfo && (
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border-2 border-amber-300 space-y-5" style={{ backgroundColor: '#FFFBEB' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <h3 className="font-black text-sm text-slate-900">สถานะแพ็กเกจของร้านคุณ ({storeInfo.shop_name})</h3>
                <p className="text-xs text-slate-600">เบอร์โทรติดต่อ: {storeInfo.phone_number || 'ยังไม่ได้ระบุ'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black px-4 py-1.5 rounded-full shadow-2xs ${
                storeInfo.subscription_status === 'active' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-amber-500 text-white animate-pulse'
              }`}>
                {storeInfo.subscription_status === 'active' ? 'อนุมัติแล้ว ✅' : 'รอตรวจสอบ ⏳'}
              </span>

              {storeInfo.subscription_status === 'active' && (
                <button
                  onClick={() => { window.location.href = '/'; }}
                  className="px-4 py-1.5 bg-[#BF7E46] text-white text-xs font-bold rounded-full shadow-sm hover:opacity-90"
                >
                  เข้าสู่หน้าหลัก 🚀
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-slate-400 font-bold">แพ็กเกจที่เลือก:</span>
              <p className="font-black text-[#BF7E46] text-sm">{storeInfo.package_name || 'ทดลองใช้ฟรี 30 วัน'}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-slate-400 font-bold">ระยะเวลาทดลองใช้:</span>
              <p className="font-bold text-slate-800">30 วันเต็ม</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-slate-400 font-bold">สถานะเวลาทดลองฟรี:</span>
              <p className={`font-black text-sm ${daysLeft > 5 ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}>
                {daysLeft > 0 ? `⏳ เหลือเวลาอีก ${daysLeft} วัน` : '⚠️ ครบกำหนดทดลองใช้แล้ว'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ส่วนเลือกแพ็กเกจทั้ง 3 ระดับ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* 1. NJ Start */}
        <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border-2 flex flex-col justify-between space-y-6 transition ${
          selectedPlan.includes('NJ Start') ? 'border-[#BF7E46] ring-2 ring-[#BF7E46]/20 shadow-md' : 'border-slate-200/80'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">🌱 ร้านเล็กเริ่มต้น</span>
              <span className="text-xs font-black px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">ฟรี 1 เดือนแรก</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-1">NJ Start</h2>
            <div className="mb-4">
              <span className="text-2xl font-black text-[#BF7E46]">199 บาท</span>
              <span className="text-xs text-slate-500 font-bold"> / เดือน</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">สำหรับร้านค้าและเจ้าของกิจการที่เริ่มทำบัญชี</p>
            
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ใช้งานได้ 1–2 คน</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> บันทึกรายรับ–รายจ่าย</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> จัดการเงินสด / บัญชีธนาคาร</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ✓ บันทึกและแยกยอดเดลิเวอรี (Grab / LINE MAN / ShopeeFood)</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> รายงานสรุปยอดขายและค่าใช้จ่าย</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ภาษี & VAT / ดาวน์โหลด Excel / ZIP</li>
              <li className="flex items-center gap-3 font-bold text-amber-700"><span className="text-amber-500 font-bold">✓</span> เข้าสู่ระบบด้วย LINE (พื้นฐาน)</li>
            </ul>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setSelectedPlan('NJ Start (ทดลองใช้ฟรี 1 เดือนแรก - หลังจากนั้น 199 บาท/เดือน)');
              document.getElementById('trial-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full py-4 text-xs font-bold rounded-2xl shadow-sm transition tracking-wide ${
              selectedPlan.includes('NJ Start')
                ? 'bg-[#BF7E46] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {selectedPlan.includes('NJ Start') ? '✓ เลือก NJ Start แล้ว' : '🎯 เลือก NJ Start'}
          </button>
        </div>

        {/* 2. NJ Plus (แนะนำ) */}
        <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border-2 flex flex-col justify-between space-y-6 relative overflow-hidden transition ${
          selectedPlan.includes('NJ Plus') ? 'border-[#BF7E46] ring-2 ring-[#BF7E46]/20 shadow-md' : 'border-[#BF7E46]'
        }`}>
          <div className="absolute top-0 right-0 bg-[#BF7E46] text-white text-[11px] font-black px-6 py-1.5 rounded-bl-3xl shadow-sm tracking-wider uppercase flex items-center gap-1">
            <FiStar /> แพ็กเกจแนะนำยอดฮิต
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">👑 สำหรับทีมงาน</span>
              <span className="text-xs font-black px-3 py-1 bg-amber-100 text-amber-800 rounded-full">ฟรี 1 เดือนแรก</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-1">NJ Plus</h2>
            <div className="mb-4">
              <span className="text-2xl font-black text-[#BF7E46]">259 บาท</span>
              <span className="text-xs text-slate-500 font-bold"> / เดือน</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">สำหรับร้านที่มีพนักงานและต้องการระบบแจ้งเตือนผ่าน LINE</p>
            
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-3 font-bold text-slate-900"><span className="text-emerald-600">✓</span> ทุกฟีเจอร์ใน NJ Start ครบถ้วน</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ใช้งาน 3–4 คน (เพิ่มพนักงานได้ทันที)</li>
              <li className="flex items-center gap-3 font-bold text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                <FiZap className="text-amber-600 shrink-0 text-base" /> รับสรุปยอดและแจ้งเตือนผ่าน LINE อัตโนมัติ
              </li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> รายงานและข้อมูลเชิงลึกสำหรับเจ้าของร้าน</li>
              <li className="flex items-center gap-3"><span className="text-amber-500 font-bold">✓</span> Priority Support ดูแลเป็นพิเศษ</li>
            </ul>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setSelectedPlan('NJ Plus (ทดลองใช้ฟรี 1 เดือนแรก - หลังจากนั้น 259 บาท/เดือน)');
              document.getElementById('trial-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full py-4 text-xs font-bold rounded-2xl shadow-sm transition tracking-wide ${
              selectedPlan.includes('NJ Plus')
                ? 'bg-[#BF7E46] text-white shadow-md'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {selectedPlan.includes('NJ Plus') ? '✓ เลือก NJ Plus แล้ว' : '🎯 เลือก NJ Plus (แนะนำ)'}
          </button>
        </div>

        {/* 3. NJ Pro (Future Plan - Coming Soon) */}
        <div className="bg-slate-50 p-8 rounded-[2.5rem] shadow-sm border-2 border-dashed border-slate-300 flex flex-col justify-between space-y-6 relative opacity-90">
          <div className="absolute top-0 right-0 bg-slate-700 text-white text-[11px] font-black px-6 py-1.5 rounded-bl-3xl shadow-sm tracking-wider uppercase flex items-center gap-1">
            <FiClock /> เร็วๆ นี้ 🚀
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold px-3 py-1 bg-slate-200 text-slate-700 rounded-full">🚀 ธุรกิจเติบโต</span>
              <span className="text-xs font-black px-3 py-1 bg-slate-200 text-slate-600 rounded-full">Future Plan</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-1">NJ Pro</h2>
            <div className="mb-4">
              <span className="text-2xl font-black text-slate-700">499 บาท</span>
              <span className="text-xs text-slate-500 font-bold"> / เดือน</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">ระบบอัตโนมัติเต็มรูปแบบ รองรับหลายกิจการ</p>
            
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-3 font-bold text-slate-800"><span className="text-slate-500">✓</span> ทุกฟีเจอร์ใน NJ Plus</li>
              <li className="flex items-center gap-3"><span className="text-slate-500">✓</span> ใช้งานได้มากกว่า 4 คนขึ้นไป</li>
              <li className="flex items-center gap-3"><span className="text-slate-500">✓</span> รองรับหลายร้าน / หลายกิจการ</li>
              <li className="flex items-center gap-3"><span className="text-slate-500">✓</span> LINE Automation (พิมพ์ยอดผ่านแชตได้)</li>
              <li className="flex items-center gap-3"><span className="text-slate-500">✓</span> รายงานขั้นสูงและการสรุปยอดตามช่วงเวลา</li>
            </ul>
          </div>
          
          <button
            type="button"
            disabled
            className="w-full py-4 text-xs font-bold rounded-2xl bg-slate-200 text-slate-400 cursor-not-allowed"
          >
            🚧 วางแผนเปิดให้บริการเร็วๆ นี้
          </button>
        </div>

      </div>

      {/* ฟอร์มลงทะเบียน */}
      <div id="trial-form" className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-200/80 space-y-6">
        <div className="border-b pb-4 flex items-center justify-between border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xl">📝</span>
            <div>
              <h2 className="font-black text-lg text-slate-900">ลงทะเบียนรับสิทธิ์ทดลองใช้ฟรี 1 เดือน</h2>
              <p className="text-xs text-slate-500">กรอกข้อมูลร้านค้าเพื่อเริ่มใช้งานแพ็กเกจที่คุณเลือก</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-[#BF7E46]">
            🎁 แพ็กเกจที่เลือก: {selectedPlan.split(' ')[0]} {selectedPlan.split(' ')[1]}
          </div>
        </div>

        <form onSubmit={handleSubmitTrial} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ชื่อร้านค้าของคุณ</label>
              <input 
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="เช่น ร้านอารี"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none text-slate-800 text-xs shadow-sm focus:border-[#BF7E46]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">เบอร์โทรศัพท์ติดต่อ</label>
              <input 
                type="text"
                maxLength={10}
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="0812345678"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none text-slate-800 text-xs shadow-sm focus:border-[#BF7E46]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">แนบรูปภาพหน้าร้าน หรือโลโก้ (ถ้ามี)</label>
            <input 
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#BF7E46] file:text-white hover:file:opacity-90 shadow-sm"
            />
            {slipImage && (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-emerald-600 mb-2">📸 รูปภาพที่เลือก:</p>
                <img src={slipImage} alt="Shop Preview" className="h-32 rounded-xl border shadow-sm object-contain" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition hover:opacity-90 text-white cursor-pointer"
            style={{ backgroundColor: '#BF7E46' }}
          >
            🎁 ยืนยันรับสิทธิ์ทดลองใช้ฟรี 1 เดือน ({selectedPlan.split(' ')[0]} {selectedPlan.split(' ')[1]})
          </button>
        </form>
      </div>

      {/* บัญชีธนาคาร */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-200/80 space-y-4">
        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
          <span>💳</span> ช่องทางชำระเงินค่าบริการ (กรณีต่ออายุแพ็กเกจ)
        </h3>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold block mb-1">ธนาคาร:</span>
            <strong className="text-slate-800">{myBankInfo.bankName}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold block mb-1">เลขที่บัญชี:</span>
            <strong className="text-[#BF7E46] text-sm">{myBankInfo.accountNumber}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold block mb-1">ชื่อบัญชี:</span>
            <strong className="text-slate-800">{myBankInfo.accountName}</strong>
          </div>
        </div>
      </div>
{/* 🧪 ปุ่มทดสอบยิง LINE Notify ด่วน */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-emerald-200 text-center space-y-4">
        <h3 className="font-black text-sm text-slate-900 flex items-center justify-center gap-2">
          <span>🧪</span> ทดสอบระบบแจ้งเตือน LINE ด่วน
        </h3>
        <p className="text-xs text-slate-500">คลิกปุ่มด้านล่างเพื่อทดสอบส่งข้อความแจ้งเตือนเข้า LINE แอดมินทันที</p>
        <button
          type="button"
          onClick={async () => {
            try {
              const res = await fetch('/api/notify-line', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  shopName: shopName || 'ร้านทดสอบ NJ',
                  packageName: selectedPlan,
                  phone: shopPhone || '0812345678'
                })
              });
              const result = await res.json();
              if (result.success) {
                alert('🎉 ส่งข้อความทดสอบเข้า LINE สำเร็จแล้ว! ลองเช็คมือถือดูครับ');
              } else {
                alert('⚠️ ส่งไม่สำเร็จ: ' + JSON.stringify(result));
              }
            } catch (err) {
              console.error(err);
              alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ API');
            }
          }}
          className="w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition hover:bg-emerald-700 text-white cursor-pointer bg-emerald-600"
        >
          🚀 กดทดสอบยิง LINE Notify เดี๋ยวนี้!
        </button>
      </div>
      {/* Support Contact */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <span>💬</span> ต้องการความช่วยเหลือหรือติดต่อสอบถาม?
          </h3>
          <p className="text-xs text-slate-600 mt-1">ติดปัญหาการใช้งานหรือต้องการปรึกษา ทักหาทีมงาน NJ ได้ตลอดเวลาครับ</p>
        </div>
        <div className="px-4 py-2 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs font-black text-[#BF7E46]">
          {supportContact}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 space-y-2">
        <p className="text-xs font-bold text-slate-600 tracking-wide">
          🐕 บัญชีไม่ต้องยาก แค่รู้ว่าเงินไปไหน ก็รู้ว่าธุรกิจกำลังไปทางไหน ✨
        </p>
        <p className="text-[10px] text-slate-400">NJ Accounting v1.0 — พัฒนาด้วยความใส่ใจเพื่อผู้ประกอบการไทย</p>
      </div>

    </div>
  );
}

