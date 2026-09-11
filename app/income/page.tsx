'use client';

import { useState, useEffect } from 'react';
import { 
  FiDollarSign, FiCalendar, FiTag, FiFileText, 
  FiCheckCircle, FiArrowLeft, FiTrendingUp, FiCreditCard, FiSmartphone, FiShield
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function IncomePage() {
  const router = useRouter();
  const [category, setCategory] = useState('ขายหน้าร้าน (เงินสด/โอน)');
  
  // สำหรับหน้าร้าน (แยกเงินสด / เงินโอนทันที)
  const [cashAmount, setCashAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // สำหรับเดลิเวอรี
  const [deliveryGross, setDeliveryGross] = useState('');
  const [gpAmount, setGpAmount] = useState('');
  const [adsAmount, setAdsAmount] = useState('');
  const [loanDeduction, setLoanDeduction] = useState('');

  // สำหรับโครงการไทยช่วยไทย (ยอดขายเต็ม)
  const [thaiHelpGross, setThaiHelpGross] = useState('');

  // State สำหรับเลือกบัญชีธนาคารปลายทาง
  const [mainBankName, setMainBankName] = useState('กสิกรไทย (KBANK)');
  const [subBankName, setSubBankName] = useState('กรุงศรี (BAY)');
  const [selectedBank, setSelectedBank] = useState('กสิกรไทย (KBANK)');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  // โหลดชื่อธนาคารจากที่ตั้งค่าไว้ใน Wallet
  useEffect(() => {
    try {
      const savedMain = localStorage.getItem('wallet_main_bank');
      const savedSub = localStorage.getItem('wallet_sub_bank');

      if (savedMain) {
        try {
          const parsed = JSON.parse(savedMain);
          if (parsed.name) {
            setMainBankName(parsed.name);
            setSelectedBank(parsed.name);
          }
        } catch {
          setMainBankName(savedMain);
          setSelectedBank(savedMain);
        }
      }

      if (savedSub) {
        try {
          const parsed = JSON.parse(savedSub);
          if (parsed.name) setSubBankName(parsed.name);
        } catch {
          setSubBankName(savedSub);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // คำนวณยอด
  const cash = parseFloat(cashAmount) || 0;
  const transfer = parseFloat(transferAmount) || 0;
  const delivery = parseFloat(deliveryGross) || 0;
  const gp = parseFloat(gpAmount) || 0;
  const ads = parseFloat(adsAmount) || 0;
  const loan = parseFloat(loanDeduction) || 0;
  const thaiGross = parseFloat(thaiHelpGross) || 0;

  const isStoreFront = category === 'ขายหน้าร้าน (เงินสด/โอน)';
  const isThaiHelp = category === 'โครงการไทยช่วยไทย';

  // ยอดเงินเข้าบัญชีตามประเภท (เดลิเวอรีหัก GP / ค่าบริการ / หนี้ เรียบร้อย)
  const instantDeposit = transfer; 
  const nextDayDeliveryDeposit = Math.max(0, delivery - gp - ads - loan);

  const totalStoreSales = isStoreFront ? (cash + transfer) : isThaiHelp ? thaiGross : delivery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // กำหนดให้ยอดเงินที่เข้าบัญชี/กระเป๋าเงิน คือยอดสุทธิที่หักค่าใช้จ่ายแล้วอย่างถูกต้อง
    const finalAmount = isStoreFront ? transfer : isThaiHelp ? thaiGross : nextDayDeliveryDeposit;

    const newRecord = {
      id: Date.now(),
      date,
      channel: category,
      category,
      cash,
      transfer: isStoreFront ? transfer : 0,
      grossSales: totalStoreSales,
      amount: finalAmount, // ยอดสุทธิเข้าบัญชีจริง
      gpDeduction: isStoreFront ? 0 : gp,
      adDeduction: isStoreFront ? 0 : ads,
      debtDeduction: isStoreFront ? 0 : loan,
      netTransfer: isStoreFront ? transfer : nextDayDeliveryDeposit,
      bankAccount: selectedBank, 
      note
    };

    try {
      const existingData = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
      const updatedData = [newRecord, ...existingData];
      localStorage.setItem('incomeTransactions', JSON.stringify(updatedData));

      // บันทึกรายการลงในกระเป๋าเงิน (Wallet History) เพื่อให้ยอดเงินวิ่งเข้ากระเป๋าตามยอดสุทธิที่ถูกต้อง
      const walletHistory = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
      const newWalletTx = {
        id: Date.now(),
        date: date + ' ' + new Date().toLocaleTimeString(),
        type: 'เงินเข้า',
        amount: finalAmount,
        channel: selectedBank,
        note: `รายรับจาก ${category} (${note || 'ปิดยอดขายประจำวัน'})`
      };
      localStorage.setItem('walletTransactions', JSON.stringify([newWalletTx, ...walletHistory]));

    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }

    setSuccess(true);
    
    setTimeout(() => {
      router.push('/reports');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ส่วนหัว */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95">
              <FiArrowLeft size={22} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <FiDollarSign size={20} />
                </span>
                บันทึกปิดยอดขายประจำวัน 💰
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">สู้ๆ นะครับพี่! วันนี้เป้าหมายอยู่แค่เอื้อมแล้ว ✨🐕</p>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-3xl shadow-sm shrink-0 animate-bounce">
            🐕
          </div>
        </div>

        {success && (
          <div className="p-4 bg-emerald-500 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/20 animate-fade-in">
            <FiCheckCircle size={24} className="shrink-0" />
            <div>
              <p className="font-bold text-sm">เย้! บันทึกยอดขายสำเร็จเรียบร้อยแล้วครับพี่! 🎉</p>
              <p className="text-xs text-emerald-100 mt-0.5 font-medium">กำลังพาพี่ไปหน้ารายงานสรุปผลครับ 🚀...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
          
          {/* เลือกประเภทการขาย */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <FiTag size={16} className="text-emerald-600" /> เลือกช่องทางการขายหรือโครงการวันนี้ 🏷️
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { name: 'ขายหน้าร้าน (เงินสด/โอน)' }, 
                { name: 'GrabFood' }, 
                { name: 'LINE MAN' }, 
                { name: 'ShopeeFood' },
                { name: 'โครงการไทยช่วยไทย' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setCategory(item.name)}
                  className={`py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 text-center shadow-sm flex items-center justify-center gap-1.5 ${
                    category === item.name
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300 scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* เลือกบัญชีธนาคารรับเงินโอน */}
          <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5 shadow-sm">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
              <FiCreditCard size={16} className="text-emerald-600" /> เข้าบัญชีธนาคารไหนครับพี่? 🏦
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition-all"
            >
              <option value={mainBankName}>🟢 บัญชีหลัก: {mainBankName}</option>
              <option value={subBankName}>🟣 บัญชีสำรอง: {subBankName}</option>
            </select>
          </div>

          {/* 1. ฟอร์มกรณีขายหน้าร้าน */}
          {isStoreFront ? (
            <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4 shadow-sm">
              <div className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                <FiCreditCard className="text-emerald-600" size={18} /> แยกยอดเงินสดในเก๊ะ กับเงินโอนเข้าบัญชี 💵💳
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">ยอดเงินสด (เก็บเข้าเก๊ะร้าน) 🗄️</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 text-sm font-bold">฿</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-bold text-slate-800 shadow-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">ยอดเงินโอน / QR (เข้าบัญชีทันที) 📱</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 text-sm font-bold">฿</span>
                    <input
                      type="number"
                      step="0.01"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-bold text-slate-800 shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : isThaiHelp ? (
            /* 2. ฟอร์มกรณีโครงการไทยช่วยไทย */
            <div className="p-5 sm:p-6 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3 shadow-sm">
              <div className="font-bold text-indigo-900 text-xs sm:text-sm flex items-center gap-2">
                <FiShield className="text-indigo-600" size={18} /> โครงการไทยช่วยไทย (ยอดขายรวม) 🇹🇭✨
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-800 mb-2">ยอดขายรวมโครงการ (บาท) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-indigo-500 font-bold text-sm">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={thaiHelpGross}
                    onChange={(e) => setThaiHelpGross(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base font-bold text-slate-800 shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 3. ฟอร์มกรณีเดลิเวอรีปกติ */
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <FiSmartphone size={16} className="text-emerald-600" /> ยอดขายรวมบนแอป {category} (Gross Sales) 🛵💨 *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-sm">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={deliveryGross}
                    onChange={(e) => setDeliveryGross(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-base font-bold text-slate-800 shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="p-5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                  ⚡ รายการหัก / ค่าบริการ / หักหนี้ (ถ้ามี)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">หัก GP 📉</label>
                    <input
                      type="number"
                      step="0.01"
                      value={gpAmount}
                      onChange={(e) => setGpAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">หัก ค่าโฆษณา 📢</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adsAmount}
                      onChange={(e) => setAdsAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">หัก ผ่อนหนี้ 💳</label>
                    <input
                      type="number"
                      step="0.01"
                      value={loanDeduction}
                      onChange={(e) => setLoanDeduction(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* สรุปยอด */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-sky-50/80 border border-sky-100 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <span>📈</span> ยอดขายรวมของวันนี้
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-sky-950 mt-1.5">
                ฿{totalStoreSales.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-5 bg-emerald-50/80 border border-emerald-100 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <FiTrendingUp size={15} /> 
                {isStoreFront ? `โอนเข้าบัญชี (${selectedBank}) 💸` : isThaiHelp ? 'สถานะโครงการ 🌟' : `เข้าบัญชี ${selectedBank} (หลังหัก GP/หนี้) 🏦`}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-950 mt-1.5">
                ฿{(isStoreFront ? instantDeposit : isThaiHelp ? thaiGross : nextDayDeliveryDeposit).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* วันที่ */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FiCalendar size={16} className="text-emerald-600" /> วันที่ทำรายการ 📅
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition-all"
              />
            </div>

            {/* หมายเหตุ */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FiFileText size={16} className="text-emerald-600" /> หมายเหตุ / ข้อความน่ารักๆ (ถ้ามี) 📝
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น วันนี้ลูกค้าหน้าร้านแน่นมาก, สู้ตาย! 💪"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition-all"
              />
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              href="/"
              className="px-7 py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>❌</span> ยกเลิก
            </Link>
            <button
              type="submit"
              className="px-9 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all duration-200 flex items-center gap-2 active:scale-95"
            >
              <span>🚀</span> บันทึกปิดยอดขายเลย!
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}