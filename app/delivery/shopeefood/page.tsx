'use client';

import { useState, useEffect } from 'react';

export default function ShopeeFoodPage() {
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

  // กรองข้อมูลรายรับเฉพาะ ShopeeFood ตามเดือนที่เลือก
  const shopeeIncomes = incomeData.filter(item => {
    const channelStr = (item.channel || item.platform || item.source || '').toLowerCase();
    const isShopee = channelStr.includes('shopee');
    if (!isShopee) return false;
    if (selectedMonth === 'all') return true;
    return item.date && item.date.startsWith(selectedMonth);
  });

  // กรองข้อมูลรายจ่ายเฉพาะ ShopeeFood ตามเดือนที่เลือก
  const shopeeExpenses = expenseData.filter(item => {
    const textToCheck = ((item.category || '') + ' ' + (item.note || '') + ' ' + (item.channel || '')).toLowerCase();
    const isShopee = textToCheck.includes('shopee');
    if (!isShopee) return false;
    if (selectedMonth === 'all') return true;
    return item.date && item.date.startsWith(selectedMonth);
  });

  let totalGross = 0;
  let totalGp = 0;
  let totalAds = 0;
  let totalDebtInstallment = 0;

  // คำนวณจากฝั่งรายรับ ShopeeFood
  shopeeIncomes.forEach(item => {
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
  shopeeExpenses.forEach(item => {
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ส่วนหัว: สีส้มเข้ม (แบบเดียวกับ Grab แต่เปลี่ยนเป็นสีส้ม #FE8505) */}
      <div 
        className="p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-white"
        style={{ backgroundColor: '#FE8505' }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🛵</span> สรุปยอดขาย: ShopeeFood
          </h1>
          <p className="text-sm text-orange-100 mt-1">แสดงข้อมูลและยอดสรุปเฉพาะแพลตฟอร์ม ShopeeFood แยกตามเดือน</p>
        </div>

        {/* ตัวเลือกเดือน / ปี */}
        <div className="flex items-center gap-2 bg-black/15 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
          <span className="text-xs font-bold text-white whitespace-nowrap">เลือกเดือน:</span>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white text-slate-800 text-sm font-semibold rounded-lg px-3 py-1.5 outline-none cursor-pointer shadow-sm"
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

      {/* 2 การ์ดหลักใหญ่เด่นชัด (Gross & Net แบบหน้า Grab) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ยอดขายหน้า App (Gross) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">📦 ยอดขายหน้า APP (GROSS)</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{totalGross.toLocaleString()}</span>
            <span className="text-sm font-semibold text-slate-500">บาท</span>
          </div>
        </div>

        {/* ยอดรับสุทธิ (Net) - ใช้พื้นหลังสีส้มเข้ม #FE8505 */}
        <div 
          className="p-6 rounded-2xl shadow-md flex flex-col justify-between text-white"
          style={{ backgroundColor: '#FE8505' }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-orange-100">💰 ยอดรับสุทธิ (NET)</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{totalNet.toLocaleString()}</span>
            <span className="text-sm font-semibold text-orange-100">บาท</span>
          </div>
        </div>
      </div>

      {/* 3 การ์ดค่าใช้จ่าย (หัก GP, ค่า Ads, หักผ่อนหนี้) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* หักค่า GP */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">หักค่า GP</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            -{totalGp.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
          </p>
        </div>

        {/* ค่าโฆษณา (Ads) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">ค่าโฆษณา (ADS)</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            -{totalAds.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
          </p>
        </div>

        {/* หักผ่อนหนี้ */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">หักผ่อนหนี้</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            -{totalDebtInstallment.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
          </p>
        </div>
      </div>

      {/* ตารางแสดงรายการ (หัวตารางสีส้มเข้ม #FE8505 ตรงเป๊ะกับหน้า Grab) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-base text-slate-800">ประวัติรายการ ShopeeFood ({shopeeIncomes.length} รายการรายรับ)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-white" style={{ backgroundColor: '#FE8505' }}>
                <th className="p-4">วันที่</th>
                <th className="p-4">ช่องทาง</th>
                <th className="p-4 text-right">ยอดขายรวม</th>
                <th className="p-4 text-right">หัก GP</th>
                <th className="p-4 text-right">ค่า ADS</th>
                <th className="p-4 text-right">หักผ่อนหนี้</th>
                <th className="p-4 text-right">ยอดสุทธิ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {shopeeIncomes.length > 0 ? (
                shopeeIncomes.map((item, index) => {
                  const gross = Number(item.grossSales || item.total || item.amount || 0);
                  const gp = Number(item.gpDeduction || item.gpAmount || item.gp || 0);
                  const ads = Number(item.adDeduction || item.adsFee || item.advertising || item.ads || 0);
                  const debt = Number(item.debtInstallment || item.debtDeduction || item.debt || item.productInstallment || 0);
                  const net = gross - gp - ads - debt;
                  return (
                    <tr key={index} className="hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 text-slate-600">{item.date || '-'}</td>
                      <td className="p-4 font-medium text-slate-800">{item.channel || item.platform || 'ShopeeFood'}</td>
                      <td className="p-4 text-right font-semibold text-slate-800">{gross.toLocaleString()}</td>
                      <td className="p-4 text-right font-medium text-red-600">-{gp.toLocaleString()}</td>
                      <td className="p-4 text-right font-medium text-red-600">-{ads.toLocaleString()}</td>
                      <td className="p-4 text-right font-medium text-red-600">-{debt.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-slate-900">{net.toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    ยังไม่มีข้อมูลการขายของ ShopeeFood ในเดือนที่เลือก
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