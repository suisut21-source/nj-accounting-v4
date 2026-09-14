'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, HelpCircle, Calendar, Plus, Upload, ArrowUpRight, ArrowDownLeft, 
  AlertCircle, ChevronRight, X, Camera, FileOutput, Calculator, ChevronDown, TrendingUp, BarChart3, AlertTriangle, Clock
} from 'lucide-react';

export default function Home() {
  // 🔐 ระบบเช็กสถานะการล็อกอิน (ถ้ายังไม่ล็อกอิน จะแสดงหน้าล็อกอินก่อน)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const savedAuth = localStorage.getItem('nj_is_logged_in');
    if (savedAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanPhone = authPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setAuthError('กรุณากรอกเบอร์โทรศัพท์มือถือให้ครบ 10 หลักครับ');
      return;
    }

    if (authPassword.length < 6) {
      setAuthError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรครับ');
      return;
    }

    // ผ่านการตรวจสอบ จำลองการล็อกอินสำเร็จและบันทึกลงเครื่อง
    localStorage.setItem('nj_is_logged_in', 'true');
    localStorage.setItem('shop_phone', cleanPhone);
    setIsLoggedIn(true);
  };

  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [shopName, setShopName] = useState('Aree');

  useEffect(() => {
    const savedName = localStorage.getItem('shop_name');
    if (savedName) setShopName(savedName);
  }, []);

  useEffect(() => {
    const savedIncome = 
      JSON.parse(localStorage.getItem('incomeTransactions') || 'null') ||
      JSON.parse(localStorage.getItem('incomes') || 'null') ||
      JSON.parse(localStorage.getItem('income') || '[]');

    const savedExpense = 
      JSON.parse(localStorage.getItem('expenseTransactions') || 'null') ||
      JSON.parse(localStorage.getItem('expenses') || 'null') ||
      JSON.parse(localStorage.getItem('expense') || 'null') ||
      JSON.parse(localStorage.getItem('moneyOut') || '[]');

    setIncomeData(Array.isArray(savedIncome) ? savedIncome : []);
    setExpenseData(Array.isArray(savedExpense) ? savedExpense : []);
  }, []);

  const allDates = [...incomeData.map(i => i.date), ...expenseData.map(e => e.date)].filter(Boolean);
  const availableMonths = Array.from(
    new Set(
      allDates.map(d => {
        const str = String(d);
        if (str.includes('-')) return str.slice(0, 7);
        return '';
      }).filter(Boolean)
    )
  ).sort().reverse() as string[];

  const filteredIncome = selectedMonth === 'all' 
    ? incomeData 
    : incomeData.filter(item => String(item.date || '').startsWith(selectedMonth));

  const filteredExpense = selectedMonth === 'all' 
    ? expenseData 
    : expenseData.filter(item => String(item.date || '').startsWith(selectedMonth));

  const totalSales = filteredIncome.reduce((sum, item) => {
    const gross = Number(item?.grossSales || item?.total || item?.amount || item?.price || 0);
    return sum + gross;
  }, 0);
  
  const expenseFromOut = filteredExpense.reduce((sum, item) => {
    const val = Number(item?.amount || item?.total || item?.netTotal || item?.price || item?.cost || 0);
    return sum + val;
  }, 0);
  
  const totalDeductions = filteredIncome.reduce((sum, item) => {
    const gp = Number(item.gpDeduction || item.gpAmount || 0);
    const ad = Number(item.adDeduction || item.adAmount || 0);
    const debt = Number(item.debtDeduction || item.debtAmount || 0);
    return sum + (gp + ad + debt);
  }, 0);

  const totalOtherExpenses = expenseFromOut;
  const totalExpenses = totalOtherExpenses + totalDeductions;
  const netProfit = totalSales - totalExpenses;

  const calculatePersonalIncomeTax = (income: number) => {
    const expenseDeduction = income * 0.60;
    const incomeAfterExpense = income - expenseDeduction;
    const personalDeduction = 60000;
    let netTaxableIncome = Math.max(0, incomeAfterExpense - personalDeduction);

    let tax = 0;
    if (netTaxableIncome > 5000000) {
      tax += (netTaxableIncome - 5000000) * 0.35;
      netTaxableIncome = 5000000;
    }
    if (netTaxableIncome > 2000000) {
      tax += (netTaxableIncome - 2000000) * 0.30;
      netTaxableIncome = 2000000;
    }
    if (netTaxableIncome > 1000000) {
      tax += (netTaxableIncome - 1000000) * 0.25;
      netTaxableIncome = 1000000;
    }
    if (netTaxableIncome > 750000) {
      tax += (netTaxableIncome - 750000) * 0.20;
      netTaxableIncome = 750000;
    }
    if (netTaxableIncome > 500000) {
      tax += (netTaxableIncome - 500000) * 0.15;
      netTaxableIncome = 500000;
    }
    if (netTaxableIncome > 300000) {
      tax += (netTaxableIncome - 300000) * 0.10;
      netTaxableIncome = 300000;
    }
    if (netTaxableIncome > 150000) {
      tax += (netTaxableIncome - 150000) * 0.05;
    }
    return Math.floor(tax);
  };

  const estimatedTax = calculatePersonalIncomeTax(totalSales);

  const chartMonths = availableMonths.length > 0 ? availableMonths.slice(0, 6).reverse() : ['ยอดปัจจุบัน'];
  const chartData = chartMonths.map(month => {
    const mIncomeList = incomeData.filter(i => i.date && String(i.date).startsWith(month === 'ยอดปัจจุบัน' ? '' : month));
    const mExpenseList = expenseData.filter(e => e.date && String(e.date).startsWith(month === 'ยอดปัจจุบัน' ? '' : month));
    
    const mIncome = mIncomeList.reduce((sum, i) => sum + (Number(i.grossSales || i.total || i.amount || 0)), 0);
    const mExpenseOut = mExpenseList.reduce((sum, e) => sum + (Number(e.amount || e.total || e.price || 0)), 0);
    const mGpIn = mIncomeList.reduce((sum, i) => {
      const g = Number(i.gp || i.gpFee || 0);
      const a = Number(i.ads || 0);
      const d = Number(i.debt || 0);
      const o = Number(i.deduction || 0);
      return sum + Number(i.totalDeduction || (g + a + d + o));
    }, 0);
    
    return {
      month: month === 'ยอดปัจจุบัน' ? 'ภาพรวม' : month,
      income: mIncome,
      expense: mExpenseOut + mGpIn
    };
  });

  const maxChartValue = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1000);

  const recentTransactions = [
    ...incomeData.map(item => ({ ...item, type: 'income', displayAmount: Number(item.grossSales || item.total || item.amount || 0) })),
    ...expenseData.map(item => ({ ...item, type: 'expense', displayAmount: Number(item.amount || item.total || item.netTotal || item.price || 0) }))
  ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 5);

  const targetPnd94 = new Date('2026-09-30');
  const today = new Date();
  const diffTimePnd94 = targetPnd94.getTime() - today.getTime();
  const diffDaysPnd94 = Math.ceil(diffTimePnd94 / (1000 * 60 * 60 * 24));

  const targetPnd90 = new Date('2027-03-31');
  const diffTimePnd90 = targetPnd90.getTime() - today.getTime();
  const diffDaysPnd90 = Math.ceil(diffTimePnd90 / (1000 * 60 * 60 * 24));

  // 🛑 ถ่ายยังไม่ล็อกอิน ให้แสดงหน้าล็อกอินตรงนี้ทันทีโดยไม่ให้เห็นแดชบอร์ด
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf7f2', margin: 0, padding: '20px', boxSizing: 'border-box', position: 'fixed', top: 0, left: 0, zIndex: 9999, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #fbedd6', boxSizing: 'border-box' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fbedd6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '32px', border: '1px solid rgba(191, 126, 70, 0.2)' }}>
              🐕
            </div>
            
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#2d3748', margin: '0 0 8px 0' }}>
              ยินดีต้อนรับกลับครับพี่! 👋
            </h1>
            <p style={{ fontSize: '12px', color: '#4a5568', margin: 0, fontWeight: '500' }}>
              กรุณาเข้าสู่ระบบด้วยเบอร์โทรศัพท์เพื่อจัดการร้านค้า
            </p>
          </div>

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

          {authError && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '12px', color: '#c53030', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568', paddingLeft: '4px' }}>เบอร์โทรศัพท์ (10 หลัก)</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={authPhone}
                onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, ''))}
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
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#faf7f2', border: '1px solid #fbedd6', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#2d3748', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ paddingTop: '6px' }}>
              <button
                type="submit"
                style={{ width: '100%', padding: '14px', backgroundColor: '#BF7E46', color: '#ffffff', fontWeight: '900', fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              >
                เข้าสู่ระบบด้วยเบอร์โทร 🐕
              </button>
            </div>
          </form>

          <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '12px', textAlign: 'center', fontSize: '11px', color: '#276749', fontWeight: '600' }}>
            💬 ติดปัญหาตรงไหนทักมาได้ตลอดเลยนะครับ Line ID: @579mimsm
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', fontWeight: '500', color: '#a0aec0', borderTop: '1px solid #fbedd6', paddingTop: '14px' }}>
            ระบบจัดการร้านค้า NJ Accounting v1.0.0 • ดูแลร้านค้าด้วยใจ 🐕✨
          </div>
        </div>
      </div>
    );
  }

  // ✅ ถ้าล็อกอินแล้ว จะแสดงหน้าแดชบอร์ดเดิมของพี่ทั้งหมดแบบครบถ้วนสมบูรณ์ตามปกติ!
  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans relative bg-slate-50 min-h-screen px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-[#BF7E46]/30 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800 tracking-tight">สวัสดีครับ,{shopName} 👋</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">ร้าน{shopName} • ภาพรวมการเงินและภาษีประจำวัน</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* ปุ่มออกจากระบบเพิ่มให้เผื่ออยากเคลียร์สถานะล็อกอิน */}
          <button 
            onClick={() => {
              localStorage.removeItem('nj_is_logged_in');
              setIsLoggedIn(false);
            }}
            className="p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-sm"
            title="ออกจากระบบ"
          >
            🚪 ออกจากระบบ
          </button>

          <button 
            onClick={() => setShowAlertModal(true)}
            className="relative p-2 rounded-2xl bg-amber-50/80 hover:bg-amber-100 text-amber-800 border border-amber-200/60 transition flex items-center gap-1.5 px-3 text-xs font-bold shadow-sm"
          >
            <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>แจ้งเตือนภาษี</span>
            <span className="w-4 h-4 bg-rose-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center ml-1">2</span>
          </button>
          
          <div className="flex items-center gap-2 bg-sky-50/40 px-3 py-2 rounded-2xl border-2 border-sky-200 hover:border-sky-300 text-xs text-slate-700 font-bold transition">
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-600"
            >
              <option value="all">ทุกเดือนทั้งหมด</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>เดือน {m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 🚨 TAX URGENT ALERT BANNER */}
      <div className="relative bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-[2px] rounded-3xl shadow-lg shadow-orange-200/50 animate-pulse-slow">
        <div className="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 p-4 rounded-[22px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shrink-0 shadow-md ring-2 ring-rose-200 animate-bounce-slow">
              ⏳
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm sm:text-base tracking-tight text-rose-950">
                  แจ้งเตือนกำหนดยื่นภาษีบุคคลธรรมดา
                </h3>
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                  🔥 สำคัญมาก
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-900/90 font-semibold mt-1">
                เหลือเวลาอีก{" "}
                <strong className="text-rose-600 text-base sm:text-lg font-black underline decoration-2 underline-offset-2">
                  {diffDaysPnd94 > 0 ? diffDaysPnd94 : 0} วัน
                </strong>{" "}
                ก่อนครบกำหนดยื่น ภ.ง.ด.94 (ครึ่งปี) ภายใน 30 กันยายนนี้!
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowAlertModal(true)}
            className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-rose-300/50 transition-all duration-150 shrink-0 flex items-center justify-center gap-1.5"
          >
            ตรวจสอบรายการภาษีทั้งหมด
            <span className="text-base">→</span>
          </button>
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* รายรับ */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-4 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400"></div>
          <div className="flex justify-between items-start pt-1">
            <div>
              <span className="text-xs font-bold text-slate-400">รายรับรวมทั้งหมด</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-700 tracking-tight">{totalSales.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-400">บาท</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">จาก {filteredIncome.length} รายการ</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ข้อมูลจริง</span>
          </div>
        </div>

        {/* ค่าใช้จ่าย */}
        <div className="bg-white rounded-3xl border border-rose-100 p-4 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-400"></div>
          <div className="flex justify-between items-start pt-1">
            <div>
              <span className="text-xs font-bold text-slate-400">ค่าใช้จ่ายรวม (Expenses + GP)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-rose-600 tracking-tight">฿{totalExpenses.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-50 flex flex-col gap-0.5 text-[10px]">
            <span className="text-slate-400">• ค่าวัดถุดิบ/รายจ่ายร้าน: ฿{totalOtherExpenses.toLocaleString()}</span>
            {totalDeductions > 0 && (
              <span className="text-amber-600 font-bold">• ค่าหัก GP/โฆษณา/ผ่อนหนี้: ฿{totalDeductions.toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* กำไรสุทธิ */}
        <div className="bg-white rounded-3xl border border-indigo-100 p-4 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-400"></div>
          <div className="flex justify-between items-start pt-1">
            <div>
              <span className="text-xs font-bold text-slate-400">กำไรสุทธิ (Net Profit)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-indigo-600 tracking-tight">
                   ฿{netProfit.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">ยอดขายรวม หักด้วย รายจ่ายรวมทั้งหมด</span>
            <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">คำนวณอัตโนมัติ</span>
          </div>
        </div>

        {/* ภาษีที่ควรเตรียม */}
        <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/30 rounded-3xl border border-amber-200/60 p-4 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400"></div>
          <div className="flex justify-between items-start pt-1">
            <div>
              <span className="text-xs font-bold text-amber-800">ภาษีที่ควรเตรียม</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-amber-950 tracking-tight">{estimatedTax.toLocaleString()}</span>
                <span className="text-xs font-bold text-amber-800/60">บาท</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center">
              <Calculator className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
            <span className="text-amber-800/70">เกณฑ์สรรพากร (เหมา 60%)</span>
            <Link href="/reports" className="font-bold text-amber-800 hover:underline">ดูรายละเอียด →</Link>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div>
        <div className="flex items-center gap-2 mb-2.5 px-1">
          <span className="text-sm">✨</span>
          <h2 className="text-xs font-black text-slate-500 tracking-wider uppercase">เมนูจัดการข้อมูลด่วน (Quick Actions)</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <Link 
            href="/income"
            className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-4 rounded-3xl border border-emerald-300/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex items-center gap-3 text-left group relative overflow-hidden block"
          >
            <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 font-black">💰</div>
            <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-black tracking-tight">เงินเข้า</p>
                <span className="text-xs">💰</span>
              </div>
              <p className="text-[10px] text-emerald-50 font-medium">บันทึกรายรับ</p>
            </div>
          </Link>

          <Link 
            href="/expense"
            className="bg-gradient-to-br from-rose-400 to-red-400 text-white p-4 rounded-3xl border border-rose-300/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex items-center gap-3 text-left group relative overflow-hidden block"
          >
            <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 font-black">💸</div>
            <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition">
              <ArrowUpRight className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-black tracking-tight">เงินออก</p>
                <span className="text-xs">💸</span>
              </div>
              <p className="text-[10px] text-rose-50 font-medium">บันทึกรายจ่าย</p>
            </div>
          </Link>

          <Link 
            href="/expense"
            className="bg-gradient-to-br from-sky-400 to-blue-400 text-white p-4 rounded-3xl border border-sky-300/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex items-center gap-3 text-left group relative overflow-hidden block"
          >
            <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 font-black">📸</div>
            <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition">
              <Camera className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-black tracking-tight">ถ่ายใบเสร็จ</p>
                <span className="text-xs">📸</span>
              </div>
              <p className="text-[10px] text-sky-50 font-medium">สแกนอัปโหลด</p>
            </div>
          </Link>

          <Link 
            href="/reports" 
            className="bg-gradient-to-br from-amber-400 to-orange-400 text-white p-4 rounded-3xl border border-amber-300/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex items-center gap-3 text-left group relative overflow-hidden block"
          >
            <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 font-black">📊</div>
            <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition">
              <FileOutput className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-black tracking-tight leading-tight">สร้างรายงาน</p>
                <span className="text-[10px]">📊</span>
              </div>
              <p className="text-[9px] text-amber-50 font-medium truncate mt-0.5">PDF/Excel</p>
            </div>
          </Link>

          <Link
            href="/tax"
            className="bg-gradient-to-br from-violet-500 to-purple-600 p-4 rounded-3xl shadow-sm flex flex-col justify-between text-white hover:opacity-95 transition relative overflow-hidden"
          >
            <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 font-black">🧮</div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full">ประมาณการ</span>
            </div>
            <div className="mt-2">
              <h3 className="text-xs font-black tracking-tight">คำนวณภาษี</h3>
              <p className="text-[9px] text-purple-100 font-medium">จำลองภาษี 4 หมวด</p>
            </div>
          </Link>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-white p-5 rounded-3xl border-2 border-[#BF7E46]/30 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-xs text-slate-800">กราฟเปรียบเทียบรายรับและรายจ่าย</h3>
              <p className="text-[10px] text-slate-400">อัปเดตสถิติตามข้อมูลจริงในระบบแบบเรียลไทม์</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-400 inline-block"></span>
              <span className="text-slate-600 font-bold">รายรับ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-400 inline-block"></span>
              <span className="text-slate-600 font-bold">รายจ่าย</span>
            </div>
          </div>
        </div>

        <div className="pt-6 pb-2 px-2">
          {chartData.length === 0 || (chartData.length === 1 && chartData[0].income === 0 && chartData[0].expense === 0) ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-3xl">
              <BarChart3 className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
              ยังไม่มีข้อมูลเพียงพอแสดงกราฟ ลองบันทึกรายรับหรือรายจ่ายก่อนนะครับ
            </div>
          ) : (
            <div className="h-56 flex items-end justify-around gap-4 border-b border-slate-100 pb-2">
              {chartData.map((d, index) => {
                const incomeHeight = Math.max((d.income / maxChartValue) * 160, 8);
                const expenseHeight = Math.max((d.expense / maxChartValue) * 160, 8);
                return (
                  <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="flex items-end justify-center gap-1.5 w-full h-44 pb-2">
                      <div 
                        style={{ height: `${incomeHeight}px` }} 
                        className="w-full max-w-[32px] bg-emerald-400 rounded-t-xl transition-all duration-500 relative group-hover:bg-emerald-500 shadow-sm"
                      ></div>
                      <div 
                        style={{ height: `${expenseHeight}px` }} 
                        className="w-full max-w-[32px] bg-rose-400 rounded-t-xl transition-all duration-500 relative group-hover:bg-rose-500 shadow-sm"
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 mt-2 truncate w-full text-center">{d.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-3xl border-2 border-sky-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-xs text-slate-800">รายการเคลื่อนไหวล่าสุดในระบบ</h4>
            <Link href="/reports" className="text-[11px] text-amber-600 font-bold hover:underline">ดูทั้งหมด →</Link>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                ยังไม่มีข้อมูลการบันทึกรายการ ลองกดปุ่ม <strong>"เงินเข้า"</strong> หรือ <strong>"เงินออก"</strong> ด้านบนได้เลยครับ
              </div>
            ) : (
              recentTransactions.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-2xl hover:bg-amber-50/30 transition border border-slate-100/80">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-2xl flex items-center justify-center font-bold text-xs ${item.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                      {item.type === 'income' ? '📥' : '📤'}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-700">
                        {item.type === 'income' ? (item.category || item.channel || 'รายรับหน้าร้าน') : (item.category || item.name || 'รายจ่าย')}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.date || '-'} {item.note ? `• ${item.note}` : ''}</p>
                    </div>
                  </div>
                  <span className={`font-black text-xs ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {item.type === 'income' ? `+${item.displayAmount.toLocaleString()} บาท` : `-${item.displayAmount.toLocaleString()} บาท`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-[#BF7E46]/30 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-xs text-slate-800">ปฏิทินภาษี & สถานะแจ้งเตือน</h4>
              <span className="text-[9px] bg-rose-100 text-rose-600 font-bold px-1.5 py-0.5 rounded-full animate-pulse">● Active Alert</span>
            </div>
            <button onClick={() => setShowAlertModal(true)} className="text-[11px] text-amber-600 font-bold hover:underline">ดูรายละเอียด →</button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-extrabold text-xs text-slate-800">ภ.ง.ด.94 (ภาษีครึ่งปีบุคคลธรรมดา)</p>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded-md">ร้านค้าทั่วไป</span>
                </div>
                <p className="text-[10px] text-amber-800/80 font-medium mt-0.5">กำหนดเขตยื่น: ก.ค. - 30 ก.ย.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-white bg-rose-400 px-2.5 py-1 rounded-xl shadow-sm">
                  เหลือ {diffDaysPnd94 > 0 ? diffDaysPnd94 : 0} วัน
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-extrabold text-xs text-slate-800">ภ.ง.ด.90 (ภาษีประจำปีบุคคลธรรมดา)</p>
                  <span className="text-[9px] font-bold text-sky-800 bg-sky-200/60 px-1.5 py-0.5 rounded-md">ร้านค้าทั่วไป</span>
                </div>
                <p className="text-[10px] text-sky-800/80 font-medium mt-0.5">กำหนดเขตยื่น: ม.ค. - 31 มี.ค.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-sky-900 bg-sky-200/80 px-2.5 py-1 rounded-xl">
                  อีก {diffDaysPnd90 > 0 ? diffDaysPnd90 : 365} วัน
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-xs text-slate-800">ภาษีมูลค่าเพิ่ม (ภ.พ.30)</p>
                <p className="text-[10px] text-slate-400">เฉพาะร้านที่จด VAT (รายได้เกิน 1.8 ลบ.)</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-xl">ยื่นทุกวันที่ 15-23</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-800">ศูนย์แจ้งเตือนภาษีร้าน ข้าวพันผัก</h3>
                  <p className="text-[10px] text-slate-400">กำหนดเขตยื่นภาษีและคำเตือนกรมสรรพากร</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAlertModal(false)}
                className="w-8 h-8 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                    🚨 ภ.ง.ด. 94 (ครึ่งปีภาษี)
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    เหลืออีก {diffDaysPnd94} วัน
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  สำหรับร้านค้าบุคคลธรรมดาที่มีรายได้ระหว่าง มกราคม - มิถุนายน ต้องยื่นแบบแสดงรายการและชำระภาษี (ถ้ามี) ภายในวันที่ <strong>30 กันยายนนี้</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/60 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-sky-950 flex items-center gap-1.5">
                    📅 ภ.ง.ด. 90 (ประจำปีภาษี)
                  </span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    รอบปี 2569
                  </span>
                </div>
                <p className="text-xs text-sky-900/80 leading-relaxed">
                  สรุปรายรับรายจ่ายตลอดทั้งปีของร้านค้าเพื่อยื่นภาษีเงินได้บุคคลธรรมดาประจำปี กำหนดเขตยื่นภายใน <strong>31 มีนาคมปีหน้า</strong>
                </p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setShowAlertModal(false)}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-2xl shadow-sm transition"
                >
                  รับทราบและเข้าใจแล้วครับ 🐾
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
