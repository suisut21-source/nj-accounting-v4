'use client';

import { useState, useEffect } from 'react';
import { Camera, Check, Upload, Building2, Wallet } from 'lucide-react';

export default function ExpensePage() {
  const [formData, setFormData] = useState({
    category: 'ค่าวัตถุดิบ / ของสด',
    paymentMethod: 'เงินสด',
    bankAccount: '',
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    receiptImage: null as string | null
  });

  const [expenses, setExpenses] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const [mainBankName, setMainBankName] = useState('กสิกรไทย');
  const [subBankName, setSubBankName] = useState('ไทยพาณิชย์');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('expenseTransactions') || '[]');
    setExpenses(saved);

    const savedMain = localStorage.getItem('wallet_main_bank');
    const savedSub = localStorage.getItem('wallet_sub_bank');
    
    if (savedMain) {
      try {
        const parsed = JSON.parse(savedMain);
        if (parsed?.name) setMainBankName(parsed.name);
      } catch (e) {}
    }
    if (savedSub) {
      try {
        const parsed = JSON.parse(savedSub);
        if (parsed?.name) setSubBankName(parsed.name);
      } catch (e) {}
    }
  }, []);

  // ฟังก์ชันช่วยกำหนดสีตามชื่อธนาคาร
  const getBankTheme = (bankName: string, isSelected: boolean) => {
    if (!isSelected) {
      return 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100';
    }

    if (bankName.includes('กสิกรไทย') || bankName.includes('KBANK')) {
      return 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200';
    } else if (bankName.includes('ไทยพาณิชย์') || bankName.includes('SCB')) {
      return 'bg-purple-700 text-white border-purple-700 shadow-sm shadow-purple-200';
    } else if (bankName.includes('กรุงเทพ') || bankName.includes('BBL')) {
      return 'bg-blue-900 text-white border-blue-900 shadow-sm shadow-blue-200';
    } else if (bankName.includes('กรุงไทย') || bankName.includes('KTB')) {
      return 'bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-200';
    } else if (bankName.includes('กรุงศรี') || bankName.includes('BAY')) {
      return 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200';
    } else if (bankName.includes('ทหารไทยธนชาต') || bankName.includes('TTB')) {
      return 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200';
    } else if (bankName.includes('ออมสิน') || bankName.includes('GSB')) {
      return 'bg-pink-600 text-white border-pink-600 shadow-sm shadow-pink-200';
    } else {
      return 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('รูปภาพมีขนาดใหญ่เกินไปครับพี่! กรุณาเลือกรูปที่มีขนาดต่ำกว่า 5MB นะครับ 🐾');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, receiptImage: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้องครับพี่');
      return;
    }

    const finalPaymentMethod = formData.paymentMethod === 'โอนผ่านบัญชี' 
      ? `โอนผ่านบัญชี (${formData.bankAccount || mainBankName})` 
      : 'เงินสด';

    const newExpense = {
      ...formData,
      paymentMethod: finalPaymentMethod,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    try {
      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      localStorage.setItem('expenseTransactions', JSON.stringify(updated));
    } catch (error) {
      alert('พื้นที่จัดเก็บเต็ม (อาจเพราะรูปภาพใหญ่เกินไป) ลองเลือกรูปใหม่อีกครั้งนะครับพี่');
      return;
    }

    setSuccessMessage('บันทึกรายจ่ายสำเร็จเรียบร้อยแล้วครับพี่! 🐾');
    setTimeout(() => setSuccessMessage(''), 3000);

    setFormData({
      category: 'ค่าวัตถุดิบ / ของสด',
      paymentMethod: 'เงินสด',
      bankAccount: '',
      amount: '',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      receiptImage: null
    });
  };

  const categories = [
    'ค่าวัตถุดิบ / ของสด',
    'ค่าบรรจุภัณฑ์ / กล่อง',
    'ค่าน้ำ / ค่าไฟ / ค่าเช่า',
    'ค่าจ้างพนักงาน',
    'อุปกรณ์ / เครื่องมือ',
    'อื่นๆ'
  ];

  const paymentMethods = ['เงินสด', 'โอนผ่านบัญชี'];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans text-slate-800">
      
      {/* Top Header Bar ขยายเต็มจอสวยงาม */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
              💸 บันทึกรายจ่าย (เงินออก)
            </h1>
            <p className="text-xs text-slate-500 font-medium">บันทึกบิลและค่าใช้จ่ายร้านค้า</p>
          </div>
          <span className="px-3 py-1 bg-rose-50 border border-rose-200/60 text-rose-600 rounded-full text-xs font-bold shadow-2xs">
            รายจ่าย / ภาษี 🧾
          </span>
        </div>
      </div>

      {/* Main Form Content Area ขยายกว้างเต็มตาขึ้นในคอมพิวเตอร์ */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-8">
        
        {successMessage && (
          <div className="mb-6 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Card 1: หมวดหมู่รายจ่าย */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-4">
            <label className="text-xs sm:text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              🏷️ เลือกหมวดหมู่รายจ่าย
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition border ${
                      isSelected 
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-200' 
                        : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-rose-50/50 hover:border-rose-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid แบ่งสัดส่วนซ้าย-ขวาให้ใช้พื้นที่หน้าจอคอมได้คุ้มค่า */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ฝั่งซ้าย: รายละเอียดการจ่ายเงิน & ยอดเงิน */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 2: ช่องทางการจ่าย & จำนวนเงิน */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
                <label className="text-xs sm:text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                  💳 รายละเอียดการจ่ายเงิน
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const isSelected = formData.paymentMethod === method;
                    return (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setFormData({ ...formData, paymentMethod: method, bankAccount: method === 'โอนผ่านบัญชี' ? mainBankName : '' })}
                        className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition border flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        <Wallet className={`w-4 h-4 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                        {method}
                      </button>
                    );
                  })}
                </div>

                {formData.paymentMethod === 'โอนผ่านบัญชี' && (
                  <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-rose-500" />
                      เลือกบัญชีธนาคารที่ใช้โอนจ่าย 🏦
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, bankAccount: mainBankName })}
                        className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition flex items-center justify-center gap-2 ${
                          getBankTheme(mainBankName, formData.bankAccount === mainBankName || !formData.bankAccount)
                        }`}
                      >
                         บัญชีหลัก ({mainBankName})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, bankAccount: subBankName })}
                        className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition flex items-center justify-center gap-2 ${
                          getBankTheme(subBankName, formData.bankAccount === subBankName)
                        }`}
                      >
                         บัญชีสำรอง ({subBankName})
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">ยอดเงินที่จ่าย 💸</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-base">฿</span>
                      <input 
                        type="number"
                        step="any"
                        required
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 font-black text-lg focus:outline-none focus:border-rose-400 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">ชื่อร้านค้า / ผู้ขาย 🏪</label>
                    <input 
                      type="text"
                      placeholder="เช่น แม็คโคร, ตลาดสด..."
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: วันที่ & หมายเหตุ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">📅 วันที่ทำรายการ</label>
                    <input 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">📝 หมายเหตุ (ถ้ามี)</label>
                    <input 
                      type="text"
                      placeholder="โน้ตกันลืม..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* ฝั่งขวา: สรุปยอดเงิน & อัปโหลดรูปใบเสร็จ */}
            <div className="lg:col-span-5 space-y-6 flex flex-col">
              
              {/* Card 4: สรุปยอดเงินออก */}
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-100 mb-1">🧾 ยอดรายจ่ายที่จะบันทึก</p>
                  <p className="text-3xl sm:text-4xl font-black tracking-tight">
                    ฿{formData.amount ? Number(formData.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-xs shrink-0">
                  <Upload className="w-7 h-7" />
                </div>
              </div>

              {/* Card 5: แนบรูปใบเสร็จ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-4 flex-1 flex flex-col justify-between">
                <label className="text-xs sm:text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                  📸 แนบรูปใบเสร็จ / บิล 🧾
                </label>
                
                <label className="border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50/50 rounded-2xl p-6 text-center transition cursor-pointer relative flex-1 flex flex-col items-center justify-center min-h-[160px] block">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {formData.receiptImage ? (
                    <div className="space-y-3">
                      <img src={formData.receiptImage} alt="Receipt Preview" className="max-h-48 mx-auto rounded-2xl shadow-sm border border-slate-200 object-contain" />
                      <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                        📸 บันทึกรูปบิลเรียบร้อย (แตะเพื่อเปลี่ยนรูปใหม่) 🔄
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 pointer-events-none">
                      <div className="w-12 h-12 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                        <Camera className="w-6 h-6 text-rose-500" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-700">อัปโหลดรูปบิล หรือถ่ายรูปเก็บไว้</p>
                      <p className="text-[11px] text-slate-400 font-medium">หลักฐานสำคัญสำหรับหักลดหย่อนภาษี</p>
                    </div>
                  )}
                </label>
              </div>

            </div>

          </div>

          {/* Action Buttons ด้านล่างสุด */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex gap-4">
            <button 
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 py-4 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl font-bold text-sm hover:bg-rose-50 transition shadow-2xs flex justify-center items-center gap-2"
            >
              ❌ ยกเลิก
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-bold text-sm hover:bg-rose-600 transition shadow-md shadow-rose-200 flex justify-center items-center gap-2"
            >
              🚀 บันทึกรายจ่ายเลย! 🐕
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
