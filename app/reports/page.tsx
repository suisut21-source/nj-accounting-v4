'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Printer, FileSpreadsheet, Trash2, Calendar, 
  TrendingUp, TrendingDown, DollarSign, Wallet, ShoppingBag, Percent 
} from 'lucide-react';

export default function ReportsPage() {
  const [shopName, setShopName] = useState('Aree');
  useEffect(() => {
    const savedName = localStorage.getItem('shop_name');
    if (savedName) setShopName(savedName);
  }, []);

  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    const savedIncome = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
    const savedExpense = JSON.parse(localStorage.getItem('expenseTransactions') || '[]');
    setIncomeData(savedIncome);
    setExpenseData(savedExpense);
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

  const filteredIncome = incomeData.filter(item => {
    if (selectedMonth === 'all') return true;
    if (!item || !item.date) return false;
    return String(item.date).startsWith(selectedMonth);
  });

  const filteredExpense = expenseData.filter(item => {
    if (selectedMonth === 'all') return true;
    if (!item || !item.date) return false;
    return String(item.date).startsWith(selectedMonth);
  });

  let totalGrossSales = 0; 
  let totalDeductions = 0; 
  let totalCash = 0;       
  let totalTransfer = 0;  

  filteredIncome.forEach(item => {
    const gross = Number(item.grossSales || item.total || item.net || item.amount || 0);
    const gpDeduction = Number(item.gpDeduction || item.gpAmount || 0);
    const adDeduction = Number(item.adDeduction || item.adAmount || 0);
    const debtDeduction = Number(item.debtDeduction || item.debtAmount || 0);
    const deductionSum = gpDeduction + adDeduction + debtDeduction;

    let cash = Number(item.cash || 0);
    let transfer = Number(item.netTransfer || item.transfer || item.appTransfer || 0);

    if (cash === 0 && transfer === 0) {
      if (item.channel && item.channel !== 'หน้าร้าน / ทั่วไป' && item.channel !== 'หน้าร้าน (เงินสด/โอน)') {
        transfer = gross - deductionSum;
      } else {
        cash = gross;
      }
    } else {
      if (item.channel && item.channel !== 'หน้าร้าน / ทั่วไป' && item.channel !== 'หน้าร้าน (เงินสด/โอน)' && transfer === 0) {
        transfer = gross - deductionSum;
      }
    }

    totalGrossSales += gross;
    totalDeductions += deductionSum;
    totalCash += cash;
    totalTransfer += transfer;
  });

  const totalOtherExpenses = filteredExpense.reduce((sum, item) => sum + (Number(item?.amount || 0)), 0);
  const totalAllExpenses = totalOtherExpenses + totalDeductions;
  const netProfit = totalGrossSales - totalAllExpenses;

  // ฟังก์ชันดาวน์โหลด Excel พร้อม ZIP รูปใบเสร็จ
  const handleExportZip = async () => {
    try {
      setIsExporting(true);

      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      let csvContent = `\uFEFF=== รายงานสรุปบัญชีร้าน${shopName} ===\n`;
      csvContent += `เดือนที่เลือก: ${selectedMonth}\n\n`;
      
      csvContent += "--- รายการเงินเข้า (ยอดขาย) ---\n";
      csvContent += "วันที่,ช่องทาง,ยอดขายรวม (Gross),หัก GP/ค่าบริการ/หนี้,เงินสดในเก๊ะ,เงินโอนเข้าบัญชี (Net),หมายเหตุ\n";
      
      filteredIncome.forEach(item => {
        const gross = Number(item.grossSales || item.total || item.net || item.amount || 0);
        const gp = Number(item.gpDeduction || item.gpAmount || 0);
        const ad = Number(item.adDeduction || item.adAmount || 0);
        const debt = Number(item.debtDeduction || item.debtAmount || 0);
        const totalDeduct = gp + ad + debt;
        let cash = Number(item.cash || 0);
        let netTransfer = Number(item.netTransfer || item.transfer || item.appTransfer || 0);

        if (cash === 0 && netTransfer === 0) {
          if (item.channel && item.channel !== 'หน้าร้าน / ทั่วไป' && item.channel !== 'หน้าร้าน (เงินสด/โอน)') {
            netTransfer = gross - totalDeduct;
          } else {
            cash = gross;
          }
        } else if (netTransfer === 0 && item.channel && item.channel !== 'หน้าร้าน / ทั่วไป' && item.channel !== 'หน้าร้าน (เงินสด/โอน)') {
          netTransfer = gross - totalDeduct;
        }

        const channelName = item.channel || item.category || 'หน้าร้าน';
        const noteText = (item.note || '-').replace(/"/g, '""');
        csvContent += `"${item.date || '-'}","${channelName}",${gross},${totalDeduct},${cash},${netTransfer},"${noteText}"\n`;
      });

      csvContent += "\n--- รายการเงินออก (รายจ่าย / ซื้อของ) ---\n";
      csvContent += "วันที่,หมวดหมู่,ร้านค้า/ผู้ขาย,ช่องทางจ่าย,จำนวนเงิน,หมายเหตุ\n";

      const receiptsFolder = zip.folder("receipts_images");

      for (let i = 0; i < filteredExpense.length; i++) {
        const item = filteredExpense[i];
        const sellerName = item.vendor || item.seller || item.merchant || '-';
        const noteText = (item.note || '-').replace(/"/g, '""');
        csvContent += `"${item.date || '-'}","${item.category || '-'}","${sellerName}","${item.paymentMethod || 'เงินสด'}",${Number(item.amount) || 0},"${noteText}"\n`;

        const imageSource = item.receiptImage || item.receiptUrl;

        if (imageSource && receiptsFolder) {
          try {
            if (imageSource.startsWith('data:image')) {
              const arr = imageSource.split(',');
              const mimeMatch = arr[0].match(/:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const blob = new Blob([u8arr], { type: mime });
              const extension = mime.includes('png') ? 'png' : 'jpg';
              receiptsFolder.file(`receipt_${item.date || 'unknown'}_${i + 1}.${extension}`, blob);
            } else {
              const response = await fetch(imageSource);
              const blob = await response.blob();
              const extension = blob.type.includes('png') ? 'png' : blob.type.includes('pdf') ? 'pdf' : 'jpg';
              receiptsFolder.file(`receipt_${item.date || 'unknown'}_${i + 1}.${extension}`, blob);
            }
          } catch (err) {
            console.error('Could not pack receipt image for zip', err);
          }
        }
      }

      zip.file("accounting_report.csv", csvContent);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Accounting_Report_${selectedMonth === 'all' ? 'All_Months' : selectedMonth}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ ZIP กรุณาลองใหม่อีกครั้งครับ');
    } finally {
      setIsExporting(false);
    }
  };

  const deleteIncome = (index: number) => {
    if (confirm('คุณต้องการลบรายการเงินเข้ารายการนี้ใช่หรือไม่?')) {
      const updated = filteredIncome.filter((_, i) => i !== index);
      setIncomeData(updated);
      localStorage.setItem('incomeTransactions', JSON.stringify(updated));
    }
  };

  const deleteExpense = (index: number) => {
    if (confirm('คุณต้องการลบรายการเงินออกรายการนี้ใช่หรือไม่?')) {
      const updated = filteredExpense.filter((_, i) => i !== index);
      setExpenseData(updated);
      localStorage.setItem('expenseTransactions', JSON.stringify(updated));
    }
  };

  const clearAllData = () => {
    if (confirm('⚠️ เตือน: คุณต้องการลบข้อมูลทั้งหมดในระบบใช่หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้')) {
      localStorage.removeItem('incomeTransactions');
      localStorage.removeItem('expenseTransactions');
      setIncomeData([]);
      setExpenseData([]);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans p-4 sm:p-6">
      
      {/* ส่วนหัวคุมโทนด้วยสี Papaya Whip (#FBEDD6) และ Caramel (#BF7E46) */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-sm"
        style={{ backgroundColor: '#FBEDD6', borderColor: '#f3dcbc' }}
      >
        <div className="flex items-center gap-3.5">
          <div 
            className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-sm bg-white"
            style={{ borderColor: '#e6ccab' }}
          >
            📊
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">สรุปรายงานบัญชีและยอดขายร้าน{shopName} 🍜</h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">รายงานสรุปรายรับ รายจ่าย ค่า GP Delivery และกำไรสุทธิประจำร้าน</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-bold rounded-xl transition shadow-sm hover:opacity-90"
            style={{ backgroundColor: '#BF7E46' }}
          >
            <Printer className="w-4 h-4" /> พิมพ์รายงาน
          </button>
          <button 
            onClick={handleExportZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" /> {isExporting ? 'กำลังสร้างไฟล์ ZIP...' : 'โหลด Excel + รูปใบเสร็จ (ZIP)'}
          </button>
          <button 
            onClick={clearAllData}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl hover:bg-rose-100 transition"
          >
            <Trash2 className="w-4 h-4" /> ล้างทั้งหมด
          </button>
          <Link 
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
        </div>
      </div>

      {/* แถบเลือกเดือน */}
      <div 
        className="p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white"
        style={{ borderColor: '#f1e2cd' }}
      >
        <div 
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold text-slate-700 shadow-sm"
          style={{ backgroundColor: '#FBEDD6', borderColor: '#e6ccab' }}
        >
          <Calendar className="w-4 h-4" style={{ color: '#BF7E46' }} />
          <span>เลือกดูตามเดือน:</span>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-extrabold"
          >
            <option value="all">ทุกเดือนทั้งหมด</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>เดือน {m}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-bold px-2">
          รายรับ <span className="text-emerald-600 font-black">{filteredIncome.length}</span> รายการ | 
          รายจ่าย <span className="text-rose-600 font-black">{filteredExpense.length}</span> รายการ
        </div>
      </div>

      {/* 4 การ์ดสรุปยอด */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">ยอดขายรวม (Gross Sales)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">฿{totalGrossSales.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">ยอดขายรวมหน้าร้าน + เดลิเวอรีทุกช่องทาง</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-rose-500">รายจ่ายรวม (Expenses + GP)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-600">฿{totalAllExpenses.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-slate-500 flex flex-col gap-0.5">
            <span>• ค่าวัดถุดิบ/รายจ่ายร้าน: ฿{totalOtherExpenses.toLocaleString()}</span>
            {totalDeductions > 0 && <span className="font-bold" style={{ color: '#BF7E46' }}>• ค่าหัก GP/โฆษณา/ผ่อนหนี้: ฿{totalDeductions.toLocaleString()}</span>}
          </div>
        </div>

        {/* การ์ดกำไรสุทธิ ใช้สี Caramel (#BF7E46) ให้เข้ากับชุดสีหลัก */}
        <div className="text-white p-5 rounded-2xl shadow-sm space-y-2" style={{ backgroundColor: '#BF7E46' }}>
          <span className="text-xs font-bold text-amber-100">กำไรสุทธิ (Net Profit)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black">฿{netProfit.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-amber-100/90 font-medium">ยอดขายรวม หักลบด้วย รายจ่ายรวมทั้งหมดแล้ว</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">เงินสดในเก๊ะ / เงินโอนเข้าบัญชี</span>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[11px] text-slate-400 font-bold">เงินสดในเก๊ะ</p>
              <p className="text-sm font-black text-slate-800">฿{totalCash.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-bold">โอน/รับจริงเข้าธนาคาร</p>
              <p className="text-sm font-black text-indigo-600">฿{totalTransfer.toLocaleString()}</p>
            </div>
          </div>
        </div>

      </div>

      {/* ตารางรายการเงินเข้า */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div 
          className="p-4 border-b flex items-center justify-between"
          style={{ backgroundColor: '#FBEDD6', borderColor: '#f1e2cd' }}
        >
          <div className="flex items-center gap-2">
            <span>📥</span>
            <h3 className="font-black text-sm text-slate-800">รายการเงินเข้า (ยอดขาย)</h3>
          </div>
          <span 
            className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: '#BF7E46' }}
          >
            {filteredIncome.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-white font-bold" style={{ backgroundColor: '#BF7E46' }}>
                <th className="p-3.5">วันที่</th>
                <th className="p-3.5">ช่องทาง</th>
                <th className="p-3.5 text-right">ยอดขายรวม (Gross)</th>
                <th className="p-3.5 text-right">หัก GP / ค่าบริการ / หนี้</th>
                <th className="p-3.5 text-right">เงินสดในเก๊ะ</th>
                <th className="p-3.5 text-right">เงินโอน/รับเข้าบัญชีจริง (Net)</th>
                <th className="p-3.5">หมายเหตุ</th>
                <th className="p-3.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncome.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-medium">
                    ยังไม่มีรายการเงินเข้าในระบบ
                  </td>
                </tr>
              ) : (
                filteredIncome.map((item, index) => {
                  const gross = Number(item.grossSales || item.total || item.net || item.amount || 0);
                  const gp = Number(item.gpDeduction || item.gpAmount || 0);
                  const ad = Number(item.adDeduction || item.adAmount || 0);
                  const debt = Number(item.debtDeduction || item.debtAmount || 0);
                  const totalDeduct = gp + ad + debt;

                  let cash = Number(item.cash || 0);
                  let netTransfer = Number(item.netTransfer || item.transfer || item.appTransfer || 0);

                  if (cash === 0 && netTransfer === 0) {
                    if (item.channel && item.channel !== 'หน้าร้าน / ทั่วไป' && item.channel !== 'หน้าร้าน (เงินสด/โอน)') {
                      netTransfer = gross - totalDeduct;
                    } else {
                      cash = gross;
                    }
                  } else if (netTransfer === 0 && item.channel && item.channel !== 'หน้าร้าน / ทั่วไป' && item.channel !== 'หน้าร้าน (เงินสด/โอน)') {
                    netTransfer = gross - totalDeduct;
                  }

                  return (
                    <tr key={index} className="hover:bg-amber-50/30 transition font-medium text-slate-700">
                      <td className="p-3.5 whitespace-nowrap text-slate-500">{item.date || '-'}</td>
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          item.channel === 'LINE MAN' ? 'bg-emerald-100 text-emerald-800' :
                          item.channel === 'Grab' || item.channel === 'GrabFood' ? 'bg-green-100 text-green-800' :
                          item.channel === 'ShopeeFood' ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.channel || item.category || 'หน้าร้าน'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900">฿{gross.toLocaleString()}</td>
                      <td className="p-3.5 text-right font-bold text-rose-500">
                        {totalDeduct > 0 ? `-฿${totalDeduct.toLocaleString()}` : '-'}
                        {totalDeduct > 0 && (
                          <div className="text-[9px] text-slate-400 font-normal mt-0.5">
                            {gp > 0 && <span>GP: ฿{gp.toLocaleString()} </span>}
                            {ad > 0 && <span>ads: ฿{ad.toLocaleString()} </span>}
                            {debt > 0 && <span>หนี้: ฿{debt.toLocaleString()}</span>}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-600">฿{cash.toLocaleString()}</td>
                      <td className="p-3.5 text-right font-black text-emerald-600">฿{netTransfer.toLocaleString()}</td>
                      <td className="p-3.5 text-slate-400 max-w-[150px] truncate">{item.note || '-'}</td>
                      <td className="p-3.5 text-center">
                        <button 
                          onClick={() => deleteIncome(index)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ตารางรายการเงินออก */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div 
          className="p-4 border-b flex items-center justify-between"
          style={{ backgroundColor: '#FBEDD6', borderColor: '#f1e2cd' }}
        >
          <div className="flex items-center gap-2">
            <span>📤</span>
            <h3 className="font-black text-sm text-slate-800">รายการเงินออก (รายจ่าย / ซื้อของ)</h3>
          </div>
          <span 
            className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: '#BF7E46' }}
          >
            {filteredExpense.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-white font-bold" style={{ backgroundColor: '#BF7E46' }}>
                <th className="p-3.5">วันที่</th>
                <th className="p-3.5">หมวดหมู่</th>
                <th className="p-3.5">ร้านค้า / ผู้ขาย</th>
                <th className="p-3.5">ช่องทางจ่าย</th>
                <th className="p-3.5 text-right">จำนวนเงิน</th>
                <th className="p-3.5">หมายเหตุ / ใบเสร็จ</th>
                <th className="p-3.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpense.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-medium">
                    ยังไม่มีรายการเงินออกในระบบ
                  </td>
                </tr>
              ) : (
                filteredExpense.map((item, index) => (
                  <tr key={index} className="hover:bg-amber-50/30 transition font-medium text-slate-700">
                    <td className="p-3.5 whitespace-nowrap text-slate-500">{item.date || '-'}</td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">{item.category || '-'}</td>
                    <td className="p-3.5 text-slate-500">{item.vendor || item.seller || item.merchant || '-'}</td>
                    <td className="p-3.5 whitespace-nowrap">{item.paymentMethod || 'เงินสด'}</td>
                    <td className="p-3.5 text-right font-black text-rose-600">฿{(Number(item.amount) || 0).toLocaleString()}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 truncate max-w-[120px]">{item.note || '-'}</span>
                        {(item.receiptImage || item.receiptUrl) && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            📷 มีรูปใบเสร็จ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button 
                        onClick={() => deleteExpense(index)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}