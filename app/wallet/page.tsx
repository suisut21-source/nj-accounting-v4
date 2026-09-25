'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Building2, Banknote, Save } from 'lucide-react';

export default function WalletPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. State สำหรับตั้งค่าบัญชี
  const [mainBank, setMainBank] = useState({
    name: 'ไทยพาณิชย์',
    accountNumber: '123-4-56789-0',
    type: 'ออมทรัพย์'
  });

  const [subBank, setSubBank] = useState({
    name: 'กสิกรไทย',
    accountNumber: '987-6-54321-0',
    type: 'ออมทรัพย์'
  });

  const [balances, setBalances] = useState({
    main: 0,
    sub: 0,
    cash: 0
  });

  // 2. โหลดข้อมูลการตั้งค่าและประวัติธุรกรรม
  useEffect(() => {
    const savedMain = localStorage.getItem('wallet_main_bank');
    const savedSub = localStorage.getItem('wallet_sub_bank');
    
    let currentMainName = mainBank.name;
    let currentSubName = subBank.name;

    if (savedMain) {
      try {
        const parsed = JSON.parse(savedMain);
        if (parsed?.name) {
          setMainBank(parsed);
          currentMainName = parsed.name;
        }
      } catch (e) {}
    }
    if (savedSub) {
      try {
        const parsed = JSON.parse(savedSub);
        if (parsed?.name) {
          setSubBank(parsed);
          currentSubName = parsed.name;
        }
      } catch (e) {}
    }

    const income = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
    const expense = JSON.parse(localStorage.getItem('expenseTransactions') || '[]');
    const transfers = JSON.parse(localStorage.getItem('transferTransactions') || '[]');

    let mainTotal = 0;
    let subTotal = 0;
    let cashTotal = 0;

    const formattedIncome = income.map((item: any) => {
      const totalAmount = Number(item.netTransfer || item.netAmount || item.net || item.amount || item.displayAmount || 0);
      
      // รวมข้อความทุกฟิลด์เพื่อตรวจสอบว่าเป็นช่องทางไหน
      const targetAccount = `${item.bankAccount || ''} ${item.channel || ''} ${item.paymentMethod || ''} ${item.note || ''} ${item.category || ''}`.toLowerCase();

      // เช็กให้ชัดเจน: ถ้าระบุชื่อธนาคาร หรือคำว่าโอน ให้เข้าบัญชีธนาคารทันที
      const isExplicitCash = targetAccount.includes('เงินสด') && !targetAccount.includes('โอน') && !targetAccount.includes('ไทยพาณิชย์') && !targetAccount.includes('กสิกรไทย') && !targetAccount.includes('กรุงไทย') && !targetAccount.includes('กรุงเทพ') && !targetAccount.includes('กรุงศรี');
      const isSub = targetAccount.includes('สำรอง') || targetAccount.includes(currentSubName.toLowerCase());
      const isBankTransfer = targetAccount.includes('ไทยพาณิชย์') || targetAccount.includes('กสิกรไทย') || targetAccount.includes('กรุงไทย') || targetAccount.includes('กรุงเทพ') || targetAccount.includes('กรุงศรี') || targetAccount.includes('โอน') || targetAccount.includes('bank') || targetAccount.includes('qr');

      if (isExplicitCash) {
        cashTotal += totalAmount;
      } else if (isSub) {
        subTotal += totalAmount;
      } else if (isBankTransfer || totalAmount > 0) {
        // ถ้าเป็นชื่อธนาคารหรือไม่ได้ระบุว่าเป็นเงินสด ให้เข้าบัญชีหลัก
        mainTotal += totalAmount;
      } else {
        cashTotal += totalAmount;
      }

      const displayChan = item.bankAccount || item.channel || (isExplicitCash ? 'เงินสดหน้าร้าน' : `โอนเข้า (${currentMainName})`);

      return {
        ...item,
        type: 'income',
        typeName: 'เงินเข้า',
        displayAmount: totalAmount,
        channel: displayChan
      };
    });

    const formattedExpense = expense.map((item: any) => {
      const amt = Number(item.amount || 0);
      const targetAccount = `${item.paymentMethod || ''} ${item.channel || ''} ${item.vendor || ''}`.toLowerCase();

      if (targetAccount.includes('เงินสด') && !targetAccount.includes('โอน')) {
        cashTotal -= amt;
      } else if (targetAccount.includes('สำรอง') || targetAccount.includes(currentSubName.toLowerCase())) {
        subTotal -= amt;
      } else {
        mainTotal -= amt;
      }

      return {
        ...item,
        type: 'expense',
        typeName: 'เงินออก',
        displayAmount: -amt,
        channel: item.paymentMethod || item.vendor || item.category || 'ค่าใช้จ่ายทั่วไป'
      };
    });

    const formattedTransfers = transfers.map((item: any) => {
      const amt = Number(item.amount || 0);
      const fromAcc = (item.fromAccount || '').toLowerCase();
      const toAcc = (item.toAccount || '').toLowerCase();

      if (fromAcc.includes('เงินสด')) cashTotal -= amt;
      else if (fromAcc.includes('สำรอง') || fromAcc.includes(currentSubName.toLowerCase())) subTotal -= amt;
      else mainTotal -= amt;

      if (toAcc.includes('เงินสด')) cashTotal += amt;
      else if (toAcc.includes('สำรอง') || toAcc.includes(currentSubName.toLowerCase())) subTotal += amt;
      else mainTotal += amt;

      return {
        ...item,
        type: 'transfer',
        typeName: 'โยกย้ายเงิน',
        displayAmount: amt,
        channel: `${item.fromAccount} ➔ ${item.toAccount}`
      };
    });

    setBalances({
      main: mainTotal,
      sub: subTotal,
      cash: cashTotal < 0 ? 0 : cashTotal
    });

    const all = [...formattedIncome, ...formattedExpense, ...formattedTransfers].sort(
      (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    );

    setTransactions(all);
  }, [mainBank.name, subBank.name]);

  const handleSaveBankInfo = () => {
    localStorage.setItem('wallet_main_bank', JSON.stringify(mainBank));
    localStorage.setItem('wallet_sub_bank', JSON.stringify(subBank));
    alert('บันทึกข้อมูลบัญชีธนาคารเรียบร้อยแล้วครับ! 🍋');
  };

  const handleChangeMainBank = (newName: string) => {
    const updated = { ...mainBank, name: newName };
    setMainBank(updated);
    localStorage.setItem('wallet_main_bank', JSON.stringify(updated));
  };

  const handleChangeSubBank = (newName: string) => {
    const updated = { ...subBank, name: newName };
    setSubBank(updated);
    localStorage.setItem('wallet_sub_bank', JSON.stringify(updated));
  };

  const getMainBankTheme = (name: string) => {
    switch (name) {
      case 'ไทยพาณิชย์': return { border: '#7b1fa2', text: '#7b1fa2', bg: '#f3e8ff' };
      case 'กสิกรไทย': return { border: '#00a859', text: '#00874a', bg: '#e6f4ea' };
      case 'กรุงไทย': return { border: '#006699', text: '#006699', bg: '#e0f2fe' };
      case 'กรุงเทพ': return { border: '#1e3a8a', text: '#1e3a8a', bg: '#e0e7ff' };
      case 'กรุงศรีอยุธยา': return { border: '#d97706', text: '#b45309', bg: '#fef3c7' };
      default: return { border: '#BF7E46', text: '#BF7E46', bg: '#FBEDD6' };
    }
  };

  const getSubBankTheme = (name: string) => {
    switch (name) {
      case 'กสิกรไทย': return { border: '#00a859', text: '#00874a', bg: '#e6f4ea' };
      case 'ไทยพาณิชย์': return { border: '#7b1fa2', text: '#7b1fa2', bg: '#f3e8ff' };
      case 'กรุงไทย': return { border: '#006699', text: '#006699', bg: '#e0f2fe' };
      case 'กรุงเทพ': return { border: '#1e3a8a', text: '#1e3a8a', bg: '#e0e7ff' };
      case 'กรุงศรีอยุธยา': return { border: '#d97706', text: '#b45309', bg: '#fef3c7' };
      default: return { border: '#97C6E0', text: '#334155', bg: '#f1f5f9' };
    }
  };

  const mainTheme = getMainBankTheme(mainBank.name);
  const subTheme = getSubBankTheme(subBank.name);

  const filteredTransactions = transactions.filter(tx => 
    tx.channel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.typeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans p-4 sm:p-6 min-h-screen bg-white">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-[2.5rem] border-2 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: '#BF7E46' }}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm text-white" style={{ backgroundColor: '#BF7E46' }}>
            💰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight" style={{ color: '#BF7E46' }}>กระเป๋าเงิน / บัญชีธนาคาร</h1>
              <span className="text-xs">☕️</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">จัดการบัญชีธนาคารและตรวจสอบยอดเงิน Real-time เน้นสีเด่นชัดตามแบงก์</p>
          </div>
        </div>

        <button 
          onClick={handleSaveBankInfo}
          className="px-5 py-3 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center gap-2 hover:opacity-95"
          style={{ backgroundColor: '#BF7E46' }}
        >
          <Save className="w-4 h-4" />
          <span>บันทึกการตั้งค่าบัญชีธนาคาร</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: บัญชีหลัก */}
        <div className="bg-white p-6 rounded-[2.5rem] border-[3px] shadow-sm space-y-4 relative overflow-hidden transition hover:shadow-md" style={{ borderColor: mainTheme.border }}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-white" style={{ backgroundColor: mainTheme.border }}>
              <Building2 className="w-6 h-6" />
            </div>
            <select
              value={mainBank.name}
              onChange={(e) => handleChangeMainBank(e.target.value)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold border-2 shadow-sm focus:outline-none transition cursor-pointer bg-white text-slate-700"
              style={{ borderColor: mainTheme.border }}
            >
              <option value="ไทยพาณิชย์" className="text-slate-700 font-bold">ไทยพาณิชย์ (SCB)</option>
              <option value="กสิกรไทย" className="text-slate-700 font-bold">กสิกรไทย (KBANK)</option>
              <option value="กรุงไทย" className="text-slate-700 font-bold">กรุงไทย (KTB)</option>
              <option value="กรุงเทพ" className="text-slate-700 font-bold">กรุงเทพ (BBL)</option>
              <option value="กรุงศรีอยุธยา" className="text-slate-700 font-bold">กรุงศรีอยุธยา (BAY)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: mainTheme.text }}>เลขที่บัญชีหลัก:</label>
            <input 
              type="text" 
              value={mainBank.accountNumber}
              onChange={(e) => {
                const updated = {...mainBank, accountNumber: e.target.value};
                setMainBank(updated);
                localStorage.setItem('wallet_main_bank', JSON.stringify(updated));
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              placeholder="เช่น 123-4-56789-0"
            />
            <h2 className="text-sm font-black text-slate-800 mt-2">บัญชีหลัก ({mainBank.name})</h2>
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col">
            <span className="text-xs text-slate-400 font-bold mb-1">ยอดเงินคงเหลือ</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: mainTheme.text }}>
              {balances.main.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-sm text-slate-500 font-bold">บาท</span>
            </span>
          </div>
        </div>

        {/* Card 2: บัญชีสำรอง */}
        <div className="bg-white p-6 rounded-[2.5rem] border-[3px] shadow-sm space-y-4 relative overflow-hidden transition hover:shadow-md" style={{ borderColor: subTheme.border }}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-white" style={{ backgroundColor: subTheme.border }}>
              <Building2 className="w-6 h-6" />
            </div>
            <select
              value={subBank.name}
              onChange={(e) => handleChangeSubBank(e.target.value)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold border-2 shadow-sm focus:outline-none transition cursor-pointer bg-white text-slate-700"
              style={{ borderColor: subTheme.border }}
            >
              <option value="กสิกรไทย" className="text-slate-700 font-bold">กสิกรไทย (KBANK)</option>
              <option value="ไทยพาณิชย์" className="text-slate-700 font-bold">ไทยพาณิชย์ (SCB)</option>
              <option value="กรุงไทย" className="text-slate-700 font-bold">กรุงไทย (KTB)</option>
              <option value="กรุงเทพ" className="text-slate-700 font-bold">กรุงเทพ (BBL)</option>
              <option value="กรุงศรีอยุธยา" className="text-slate-700 font-bold">กรุงศรีอยุธยา (BAY)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: subTheme.text }}>เลขที่บัญชีสำรอง:</label>
            <input 
              type="text" 
              value={subBank.accountNumber}
              onChange={(e) => {
                const updated = {...subBank, accountNumber: e.target.value};
                setSubBank(updated);
                localStorage.setItem('wallet_sub_bank', JSON.stringify(updated));
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              placeholder="เช่น 987-6-54321-0"
            />
            <h2 className="text-sm font-black text-slate-800 mt-2">บัญชีสำรอง ({subBank.name})</h2>
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col">
            <span className="text-xs text-slate-400 font-bold mb-1">ยอดเงินคงเหลือ</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: subTheme.text }}>
              {balances.sub.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-sm text-slate-500 font-bold">บาท</span>
            </span>
          </div>
        </div>

        {/* Card 3: Cash Box */}
        <div className="bg-white p-6 rounded-[2.5rem] border-[3px] shadow-sm space-y-4 relative overflow-hidden transition hover:shadow-md" style={{ borderColor: '#BF7E46' }}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-md" style={{ backgroundColor: '#BF7E46' }}>
              <Banknote className="w-6 h-6" />
            </div>
            <span className="px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-sm border-2 bg-white" style={{ borderColor: '#BF7E46', color: '#BF7E46' }}>
              💵 เงินสดจริง
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#BF7E46' }}>เงินสด • Cash Box</p>
            <h2 className="text-base font-black text-slate-800 mt-0.5">เงินสดหน้าร้าน</h2>
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col mt-2">
            <span className="text-xs text-slate-400 font-bold mb-1">ยอดเงินคงเหลือ</span>
            <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#BF7E46' }}>
              {balances.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-sm text-slate-500 font-bold">บาท</span>
            </span>
          </div>
        </div>

      </div>

      {/* Transactions History Table Section */}
      <div className="bg-white rounded-[2.5rem] border-2 shadow-sm p-6 space-y-5" style={{ borderColor: '#97C6E0' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-800">ประวัติการเคลื่อนไหวเงินสดรวม (เงินเข้า - ออก - โยกย้าย)</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">ตรวจสอบรายการเงินเข้าและออกจากทุกช่องทางได้ที่นี่</p>
          </div>
          <div className="w-full sm:w-72">
            <input 
              type="text"
              placeholder="🔍 ค้นหารายการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#BF7E46] transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-white rounded-2xl" style={{ backgroundColor: '#BF7E46' }}>
                <th className="py-3 px-4 rounded-l-xl">วันที่ / เวลา</th>
                <th className="py-3 px-4">รายการ</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">ช่องทาง / บัญชี</th>
                <th className="py-3 px-4 text-right rounded-r-xl">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 text-slate-400 font-normal">{tx.date || tx.createdAt?.split('T')[0]}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {tx.note || tx.typeName} {tx.vendor && `(${tx.vendor})`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                        tx.type === 'expense' ? 'bg-rose-50 text-rose-700 border border-rose-200/60' :
                        'bg-sky-50 text-sky-700 border border-sky-200/60'
                      }`}>
                        {tx.type === 'income' && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                        {tx.type === 'expense' && <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                        {tx.type === 'transfer' && <ArrowRightLeft className="w-3 h-3 text-sky-600" />}
                        {tx.typeName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{tx.channel}</td>
                    <td className={`py-3.5 px-4 text-right font-black text-sm ${
                      tx.displayAmount > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isNaN(tx.displayAmount) ? '฿0.00' : (tx.displayAmount > 0 ? `+${tx.displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : tx.displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2}))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-normal">
                    ยังไม่มีประวัติรายการในระบบครับพี่ ☕️
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
