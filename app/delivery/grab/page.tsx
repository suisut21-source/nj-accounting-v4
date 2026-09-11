'use client';

import { useState, useEffect } from 'react';

export default function GrabPage() {
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    const savedIncome = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
    const savedExpense = JSON.parse(localStorage.getItem('expenseTransactions') || '[]');
    setIncomeData(savedIncome);
    setExpenseData(savedExpense);
  }, []);

  // ดึงรายการเดือนทั้งหมดที่มีในระบบมาทำตัวเลือก
  const availableMonths = Array.from(
    new Set([
      ...incomeData.map(item => item.date ? item.date.substring(0, 7) : ''),
      ...expenseData.map(item => item.date ? item.date.substring(0, 7) : '')
    ])
  ).filter(Boolean).sort().reverse();

  // กรองข้อมูลรายรับเฉพาะ Grab ตามเดือนที่เลือก
  const grabIncomes = incomeData.filter(item => {
    const channelStr = (item.channel || item.platform || item.source || '').toLowerCase();
    const isGrab = channelStr.includes('grab');
    if (!isGrab) return false;
    if (selectedMonth === 'all') return true;
    return item.date && item.date.startsWith(selectedMonth);
  });

  // กรองข้อมูลรายจ่ายเฉพาะ Grab ตามเดือนที่เลือก
  const grabExpenses = expenseData.filter(item => {
    const textToCheck = ((item.category || '') + ' ' + (item.note || '') + ' ' + (item.channel || '')).toLowerCase();
    const isGrab = textToCheck.includes('grab');
    if (!isGrab) return false;
    if (selectedMonth === 'all') return true;
    return item.date && item.date.startsWith(selectedMonth);
  });

  let totalGross = 0;
  let totalGp = 0;
  let totalAds = 0;
  let totalDebtInstallment = 0;

  // คำนวณจากฝั่งรายรับ Grab
  grabIncomes.forEach(item => {
    const gross = Number(item.grossSales || item.total || item.amount || 0);
    const gp = Number(item.gpDeduction || item.gpAmount || item.gp || 0);
    const ads = Number(item.adDeduction || item.adsFee || item.advertising || item.ads || 0);
    const debt = Number(
      item.debtInstallment || item.debtDeduction || item.debt || 
      item.productInstallment || item.installment || 0
    );

    totalGross += gross;
    totalGp += gp;
    totalAds += ads;
    totalDebtInstallment += debt;
  });

  // คำนวณเพิ่มจากฝั่งรายจ่าย
  grabExpenses.forEach(item => {
    const amount = Number(item.amount || 0);
    const textLower = ((item.note || '') + ' ' + (item.category || '')).toLowerCase();

    if (textLower.includes('โฆษณา') || textLower.includes('ads') || textLower.includes('โปรโมท')) {
      totalAds += amount;
    } else if (textLower.includes('ผ่อน') || textLower.includes('หนี้') || textLower.includes('debt') || textLower.includes('installment')) {
      totalDebtInstallment += amount;
    }
  });

  const totalNet = totalGross - totalGp - totalAds - totalDebtInstallment;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* ส่วนหัวโทนเขียว Grab (#1a5632) พร้อมตัวเลือกเดือน */}
      <div 
        className="p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-white border border-[#1a5632]/30"
        style={{ backgroundColor: '#1a5632' }}
      >
        <div>
          <h1 className="text-2xl font-black text-white">🛵 สรุปยอดขาย: Grab</h1>
          <p className="text-sm text-emerald-100 font-medium mt-1">แสดงข้อมูลและยอดสรุปเฉพาะแพลตฟอร์ม Grab แยกตามเดือน</p>
        </div>

        {/* ตัวเลือกเดือน / ปี */}
        <div className="flex items-center gap-2 bg-black/15 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10">
          <span className="text-xs font-bold text-white whitespace-nowrap">เลือกเดือน:</span>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white text-slate-800 text-sm font-black rounded-xl px-3 py-1.5 outline-none cursor-pointer shadow-sm border border-[#1a5632]/20"
          >
            <option value="all">ทั้งหมด (ทุกเดือน)</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>
                เดือน {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2 การ์ดหลักใหญ่เด่นชัด: ยอดขายหน้า App (Gross) & ยอดรับสุทธิ (Net) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div 
          className="p-6 rounded-[2rem] shadow-sm border-2 flex flex-col justify-between transition hover:shadow-md bg-white"
          style={{ borderColor: '#1a5632' }}
        >
          <p className="text-xs font-black uppercase tracking-wider text-[#1a5632]">📦 ยอดขายหน้า App (Gross)</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{totalGross.toLocaleString()}</span>
            <span className="text-base font-bold text-slate-700">บาท</span>
          </div>
        </div>

        <div 
          className="p-6 rounded-[2rem] shadow-sm border-2 flex flex-col justify-between transition hover:shadow-md text-white"
          style={{ backgroundColor: '#1a5632', borderColor: '#1a5632' }}
        >
          <p className="text-xs font-black uppercase tracking-wider text-emerald-100">💰 ยอดรับสุทธิ (Net)</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{totalNet.toLocaleString()}</span>
            <span className="text-base font-bold text-emerald-100">บาท</span>
          </div>
        </div>

      </div>

      {/* 3 การ์ดค่าใช้จ่าย */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* หักค่า GP */}
        <div className="p-5 rounded-2xl shadow-sm border bg-white border-slate-200/80 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">หักค่า GP</p>
          <p className="text-2xl font-black mt-2 text-rose-600">
            -{totalGp.toLocaleString()} <span className="text-xs font-bold text-slate-400">บาท</span>
          </p>
        </div>

        {/* ค่าโฆษณา */}
        <div className="p-5 rounded-2xl shadow-sm border bg-white border-slate-200/80 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ค่าโฆษณา (Ads)</p>
          <p className="text-2xl font-black mt-2 text-rose-600">
            -{totalAds.toLocaleString()} <span className="text-xs font-bold text-slate-400">บาท</span>
          </p>
        </div>

        {/* หักผ่อนหนี้ */}
        <div className="p-5 rounded-2xl shadow-sm border bg-white border-slate-200/80 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">หักผ่อนหนี้</p>
          <p className="text-2xl font-black mt-2 text-rose-600">
            -{totalDebtInstallment.toLocaleString()} <span className="text-xs font-bold text-slate-400">บาท</span>
          </p>
        </div>

      </div>

      {/* ตารางแสดงรายการ */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/80 overflow-hidden p-2">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-black text-base text-slate-800">ประวัติรายการ Grab ({grabIncomes.length} รายการรายรับ)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: '#1a5632' }}>
                <th className="p-4 rounded-l-2xl">วันที่</th>
                <th className="p-4">ช่องทาง</th>
                <th className="p-4 text-right">ยอดขายรวม</th>
                <th className="p-4 text-right">หัก GP</th>
                <th className="p-4 text-right">ค่า Ads</th>
                <th className="p-4 text-right rounded-r-2xl">ยอดสุทธิ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {grabIncomes.length > 0 ? (
                grabIncomes.map((item, index) => {
                  const gross = Number(item.grossSales || item.total || item.amount || 0);
                  const gp = Number(item.gpDeduction || item.gpAmount || item.gp || 0);
                  const ads = Number(item.adDeduction || item.adsFee || item.advertising || item.ads || 0);
                  const debt = Number(item.debtInstallment || item.debtDeduction || item.debt || item.productInstallment || 0);
                  const net = gross - gp - ads - debt;
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-500">{item.date || '-'}</td>
                      <td className="p-4 font-bold text-slate-800">{item.channel || item.platform || 'GrabFood'}</td>
                      <td className="p-4 text-right font-black text-slate-800">{gross.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-rose-600">-{gp.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-rose-600">-{ads.toLocaleString()}</td>
                      <td className="p-4 text-right font-black text-emerald-600">{net.toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    ยังไม่มีข้อมูลการขายของ Grab ในเดือนที่เลือกครับพี่ 🛵💚
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}