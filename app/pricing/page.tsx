'use client';
import { useState, useEffect } from 'react';

interface SlipItem {
  id: number;
  date: string;
  shopName: string;
  shopPhone: string;
  plan: string;
  slipImage: string;
  status: string;
  startDate?: string;
  expireDate?: string;
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('NJ Start (ทดลองใช้ฟรี 1 เดือนแรก - หลังจากนั้น 199 บาท/เดือน)');
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mySubscription, setMySubscription] = useState<SlipItem | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(30);
  const supportContact = '@579mimsm (Admin Support / NJ ยินดีบริการ)';

  // ข้อมูลบัญชีธนาคารของร้านเรา (สำหรับให้ลูกค้าโอนเงินชำระค่าบริการ)
  const myBankInfo = {
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    accountNumber: '417-118907-4',
    accountName: 'นางสาวณัฐมล ชุ่มชื่น'
  };

  // โหลดข้อมูลแพ็กเกจและคำนวณวันหมดอายุ 30 วัน
  useEffect(() => {
    const savedSlips: SlipItem[] = JSON.parse(localStorage.getItem('adminPendingSlips') || '[]');
    if (savedSlips.length > 0) {
      const currentSub = savedSlips[0];
      
      if (!currentSub.expireDate) {
        const start = new Date();
        const expire = new Date();
        expire.setDate(expire.getDate() + 30);
        
        currentSub.startDate = start.toISOString();
        currentSub.expireDate = expire.toISOString();
        
        savedSlips[0] = currentSub;
        localStorage.setItem('adminPendingSlips', JSON.stringify(savedSlips));
      }

      const expDate = new Date(currentSub.expireDate);
      const now = new Date();
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysLeft(diffDays > 0 ? diffDays : 0);
      setMySubscription(currentSub);
    }
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

  const handleSubmitTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      alert('กรุณากรอกชื่อร้านค้าของคุณ');
      return;
    }
    if (!shopPhone || shopPhone.length < 10) {
      alert('กรุณากรอกเบอร์โทรศัพท์ร้านให้ถูกต้อง (อย่างน้อย 10 หลัก)');
      return;
    }

    const startDateObj = new Date();
    const expireDateObj = new Date();
    expireDateObj.setDate(expireDateObj.getDate() + 30);

    const newTrialSubmission: SlipItem = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      shopName,
      shopPhone,
      plan: selectedPlan,
      slipImage: slipImage || 'https://placehold.co/400x300?text=Free+Trial+1+Month',
      status: 'รอตรวจสอบ',
      startDate: startDateObj.toISOString(),
      expireDate: expireDateObj.toISOString()
    };

    try {
      const existingSlips = JSON.parse(localStorage.getItem('adminPendingSlips') || '[]');
      const updatedSlips = [newTrialSubmission, ...existingSlips];
      localStorage.setItem('adminPendingSlips', JSON.stringify(updatedSlips));
      setMySubscription(newTrialSubmission);
      setDaysLeft(30);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      return;
    }

    setIsSubmitted(true);
    alert('ลงทะเบียนรับสิทธิ์ทดลองใช้ฟรี 1 เดือนเรียบร้อยแล้วครับ! รอแอดมินตรวจสอบและเปิดสิทธิ์ใช้งานได้เลย 🐾');
    
    setShopName('');
    setShopPhone('');
    setSlipImage(null);
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
              กรุณาเลือกแพ็กเกจที่ต้องการด้านล่าง (NJ Start หรือ NJ Plus) แล้วลงทะเบียนเพื่อรับสิทธิ์ใช้งานฟรีทันที
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 กล่องแสดงสถานะแพ็กเกจและการนับถอยหลังวันใช้งาน */}
      {mySubscription && (
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border-2 border-amber-300 space-y-5" style={{ backgroundColor: '#FFFBEB' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <h3 className="font-black text-sm text-slate-900">สถานะแพ็กเกจของร้านคุณ ({mySubscription.shopName})</h3>
                <p className="text-xs text-slate-600">เบอร์โทรติดต่อ: {mySubscription.shopPhone}</p>
              </div>
            </div>
            <span className={`text-xs font-black px-4 py-1.5 rounded-full shadow-2xs ${
              mySubscription.status.includes('อนุมัติ') 
                ? 'bg-emerald-600 text-white' 
                : 'bg-amber-500 text-white animate-pulse'
            }`}>
              {mySubscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-slate-400 font-bold">แพ็กเกจที่เลือก:</span>
              <p className="font-black text-[#BF7E46] text-sm">{mySubscription.plan}</p>
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

      {/* ส่วนเลือกแพ็กเกจ (Pricing Cards) แยกตัวเลือกชัดเจน */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* NJ Start */}
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
              <span className="text-xs text-slate-500 font-bold"> / เดือน (หลังหมดช่วงฟรี)</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">เหมาะสำหรับร้านขนาดเล็ก เจ้าของดูแลและทำบัญชีเอง</p>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ใช้งานได้ 1–2 คน</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> บันทึกรายรับ–รายจ่าย</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> จัดการเงินสด / บัญชี</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> รองรับบันทึกและแยกค่าใช้จ่ายเดลิเวอรี (Grab / LINE MAN / ShopeeFood)</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> รายงานสรุปยอดขายและกำไร</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ภาษีและ VAT</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ดาวน์โหลด Excel + ZIP ใบเสร็จ</li>
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
            {selectedPlan.includes('NJ Start') ? '✓ เลือกแพ็กเกจ NJ Start แล้ว (เลื่อนลงไปกรอกข้อมูลด้านล่าง)' : '🎯 เลือกแพ็กเกจ NJ Start (ทดลองฟรี 1 เดือน)'}
          </button>
        </div>

        {/* NJ Plus */}
        <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border-2 flex flex-col justify-between space-y-6 relative overflow-hidden transition ${
          selectedPlan.includes('NJ Plus') ? 'border-[#BF7E46] ring-2 ring-[#BF7E46]/20 shadow-md' : 'border-[#BF7E46]/60'
        }`}>
          <div className="absolute top-0 right-0 bg-[#BF7E46] text-white text-[11px] font-black px-6 py-1.5 rounded-bl-3xl shadow-sm tracking-wider uppercase">
            ⭐ ฟรี 1 เดือนยอดฮิต
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">👥 สำหรับทีมงาน</span>
              <span className="text-xs font-black px-3 py-1 bg-amber-100 text-amber-800 rounded-full">ฟรี 1 เดือนแรก</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-1">NJ Plus</h2>
            <div className="mb-4">
              <span className="text-2xl font-black text-[#BF7E46]">259 บาท</span>
              <span className="text-xs text-slate-500 font-bold"> / เดือน (หลังหมดช่วงฟรี)</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">สำหรับร้านที่มีพนักงานช่วยจัดการ ต้องการระบบทีมเวิร์ก</p>
            
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-3 font-bold text-slate-900"><span className="text-[#BF7E46]">✓</span> ใช้งานได้ 3–4 คน (ปลดล็อกเพิ่มพนักงานได้ทันที)</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ทุกฟีเจอร์ครบถ้วนใน NJ Start</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ช่วยจัดรูปแบบไฟล์รายรับ–รายจ่าย 1 ครั้ง/เดือน</li>
              <li className="flex items-center gap-3"><span className="text-emerald-600 font-bold">✓</span> ได้รับการดูแลช่วยเหลือเป็นลำดับแรก (Priority Support)</li>
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
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {selectedPlan.includes('NJ Plus') ? '✓ เลือกแพ็กเกจ NJ Plus แล้ว (เลื่อนลงไปกรอกข้อมูลด้านล่าง)' : '🎯 เลือกแพ็กเกจ NJ Plus (ทดลองฟรี 1 เดือน)'}
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
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="เช่น ร้านพาเพลิน"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none text-slate-800 text-xs shadow-sm focus:border-[#BF7E46]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">เบอร์โทรศัพท์ติดต่อ (สำหรับผูกและเปิดสิทธิ์)</label>
              <input 
                type="text"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
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
            className="w-full py-4 text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition hover:opacity-90 text-white"
            style={{ backgroundColor: '#BF7E46' }}
          >
            🎁 ยืนยันรับสิทธิ์ทดลองใช้ฟรี 1 เดือน ({selectedPlan.split(' ')[0]} {selectedPlan.split(' ')[1]})
          </button>
        </form>

        {isSubmitted && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold text-center">
            ✨ ลงทะเบียนสำเร็จ! ข้อมูลถูกส่งไปที่ระบบแอดมินแล้ว รออนุมัติเปิดสิทธิ์ใช้งานฟรี 1 เดือนได้เลยครับ
          </div>
        )}
      </div>

      {/* 💳 กล่องแสดงบัญชีธนาคารสำหรับโอนเงิน (เผื่อลูกค้าต้องการชำระเงินต่ออายุ) */}
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