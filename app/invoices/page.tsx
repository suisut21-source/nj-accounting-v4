'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, Plus, Trash2, Printer, CheckCircle2, 
  Wallet, Building2, ShoppingBag, ShieldAlert, Sparkles 
} from 'lucide-react';

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

interface Invoice {
  id: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerTaxId: string;
  items: InvoiceItem[];
  total: number;
  targetAccount: string;
}

export default function InvoicesPage() {
  const [shopName, setShopName] = useState('Aree');

  useEffect(() => {
    const savedName = localStorage.getItem('shop_name');
    if (savedName) setShopName(savedName);
  }, []);

  const paymentOptions = [
    'เงินสด',
    'บัญชีหลัก',
    'บัญชีสำรอง'
  ];

  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('เงินสด');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: 'สินค้า / อาหาร', qty: 1, price: 0 }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('invoicesList');
    if (saved) {
      setInvoices(JSON.parse(saved));
    }
  }, []);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'qty' || field === 'price' ? Number(value) : value
    };
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { name: '', qty: 1, price: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const handleSaveAndPrint = () => {
    if (!customerName.trim()) {
      alert('กรุณากรอกชื่อลูกค้า / ร้านค้าก่อนออกใบเสร็จครับ');
      return;
    }

    const randomId = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const today = new Date().toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: randomId,
      date: today,
      customerName,
      customerAddress,
      customerTaxId,
      items,
      total: totalAmount,
      targetAccount: selectedWallet
    };

    // 1. บันทึกประวัติใบเสร็จ
    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('invoicesList', JSON.stringify(updatedInvoices));

    // 2. บันทึกเข้าหน้ารายงาน (incomeTransactions)
    const existingIncome = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
    const isCash = selectedWallet === 'เงินสด';
    
    const incomeEntry = {
      id: Date.now(),
      date: today,
      channel: `บิล (${selectedWallet})`,
      category: 'ขายหน้าร้าน (ใบเสร็จ)',
      grossSales: totalAmount,
      cash: isCash ? totalAmount : 0,
      netTransfer: !isCash ? totalAmount : 0,
      amount: totalAmount,
      note: `ออกใบเสร็จเลขที่ ${randomId} ให้กับ ${customerName} (รับผ่าน ${selectedWallet})`
    };
    localStorage.setItem('incomeTransactions', JSON.stringify([incomeEntry, ...existingIncome]));

    // 3. บันทึกเข้าหน้ากระเป๋าเงิน (walletTransactions)
    const walletHistory = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
    const targetChannelName = selectedWallet === 'เงินสด' ? 'Cash Box' : selectedWallet;
    
    const newWalletTx = {
      id: Date.now() + 1,
      date: today + ' ' + new Date().toLocaleTimeString(),
      type: 'เงินเข้า',
      amount: totalAmount,
      channel: targetChannelName,
      note: `ออกใบเสร็จเลขที่ ${randomId} ให้กับ ${customerName} (รับผ่าน ${selectedWallet})`
    };
    localStorage.setItem('walletTransactions', JSON.stringify([newWalletTx, ...walletHistory]));

    printInvoice(newInvoice);

    setCustomerName('');
    setCustomerAddress('');
    setCustomerTaxId('');
    setItems([{ name: '', qty: 1, price: 0 }]);
  };

  const printInvoice = (inv: Invoice) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('กรุณาอนุญาตให้ pop-up หน้าต่างทำงานเพื่อพิมพ์ใบเสร็จครับ');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>ใบเสร็จรับเงิน - ${inv.id}</title>
        <style>
          body { font-family: 'Sarabun', Tahoma, sans-serif; padding: 20px; color: #2d3748; font-size: 14px; background-color: #faf7f2; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #BF7E46; padding-bottom: 15px; }
          .header h2 { margin: 0; color: #BF7E46; font-size: 22px; font-weight: bold; }
          .header p { margin: 3px 0; color: #4a5568; font-size: 12px; }
          .info-box { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #cbd5e0; padding: 8px 12px; text-align: left; }
          th { background-color: #97C6E0; color: #1a365d; font-weight: bold; }
          .text-right { text-align: right; }
          .total-box { text-align: right; font-size: 16px; font-weight: bold; color: #BF7E46; margin-top: 10px; }
          .payment-badge { display: inline-block; padding: 5px 12px; background: #FBEDD6; color: #7b341e; border-radius: 6px; font-size: 12px; font-weight: bold; margin-top: 10px; border: 1px solid #f6ad55; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>ร้าน ${shopName}</h2>
          <p>ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ</p>
        </div>

        <div class="info-box">
          <div>
            <strong>เลขที่ใบเสร็จ:</strong> ${inv.id}<br>
            <strong>วันที่:</strong> ${inv.date}<br>
            <strong>ช่องทางรับเงิน:</strong> ${inv.targetAccount}
          </div>
          <div style="text-align: right;">
            <strong>ลูกค้า:</strong> ${inv.customerName}<br>
            ${inv.customerAddress ? `<strong>ที่อยู่:</strong> ${inv.customerAddress}<br>` : ''}
            ${inv.customerTaxId ? `<strong>เลขประจำตัวผู้เสียภาษี:</strong> ${inv.customerTaxId}` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>รายการ</th>
              <th style="width: 80px;" class="text-right">จำนวน</th>
              <th style="width: 100px;" class="text-right">ราคา/หน่วย</th>
              <th style="width: 120px;" class="text-right">รวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td class="text-right">${item.qty}</td>
                <td class="text-right">${Number(item.price || 0).toLocaleString()}</td>
                <td class="text-right">${(item.qty * item.price).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="payment-badge">
          📥 ชำระผ่าน: ${inv.targetAccount}
        </div>

        <div class="total-box">
          ยอดสุทธิรวมทั้งสิ้น: ${inv.total.toLocaleString()} บาท
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const deleteInvoice = (targetInv: Invoice) => {
    if (confirm(`คุณต้องการลบใบเสร็จเลขที่ ${targetInv.id} ใช่หรือไม่? (ยอดเงินจะถูกหักออกจากหน้ารายงานและกระเป๋าเงินอัตโนมัติ)`)) {
      const updatedInvoices = invoices.filter(inv => inv.id !== targetInv.id);
      setInvoices(updatedInvoices);
      localStorage.setItem('invoicesList', JSON.stringify(updatedInvoices));

      const existingIncome = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
      const filteredIncome = existingIncome.filter((inc: any) => !inc.note?.includes(targetInv.id));
      localStorage.setItem('incomeTransactions', JSON.stringify(filteredIncome));

      const walletHistory = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
      const filteredWallet = walletHistory.filter((wal: any) => !wal.note?.includes(targetInv.id));
      localStorage.setItem('walletTransactions', JSON.stringify(filteredWallet));
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans p-4 sm:p-6 bg-[#faf7f2] min-h-screen text-[#2d3748]">
      
      {/* Header สดใสมีสีสัน */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-[#BF7E46]/30 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#97C6E0] border-2 border-[#5993b5] flex items-center justify-center text-2xl shadow-sm text-white shrink-0">
            📄
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#BF7E46] flex items-center gap-2 flex-wrap">
              ออกใบเสร็จ / ใบกำกับภาษีร้าน {shopName} <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </h1>
            <p className="text-xs text-[#4a5568] font-semibold">ออกบิลพร้อมเลือกช่องทางรับเงิน และเชื่อมโยงหน้ารายงานอัตโนมัติ</p>
          </div>
        </div>

        <Link 
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#97C6E0] text-[#1a365d] border border-[#5993b5] text-xs font-bold rounded-xl hover:bg-[#7db4d4] transition w-fit shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
        </Link>
      </div>

      {/* Form สร้างใบเสร็จ */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-[#97C6E0]/50 shadow-md space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-[#FBEDD6] pb-3">
          <span className="text-[#BF7E46] font-bold text-lg">📝</span>
          <h2 className="font-black text-sm text-[#2d3748]">สร้างใบเสร็จใหม่</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#4a5568] mb-1">ชื่อลูกค้า / ร้านค้า *</label>
            <input 
              type="text" 
              placeholder="ระบุชื่อลูกค้า" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-xs border-2 border-[#cbd5e0] rounded-xl focus:outline-none focus:border-[#BF7E46] font-medium bg-[#faf7f2]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#4a5568] mb-1">ที่อยู่ (ถ้ามี)</label>
            <input 
              type="text" 
              placeholder="ที่อยู่ลูกค้า" 
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs border-2 border-[#cbd5e0] rounded-xl focus:outline-none focus:border-[#BF7E46] font-medium bg-[#faf7f2]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#4a5568] mb-1">เลขประจำตัวผู้เสียภาษี (ถ้ามี)</label>
            <input 
              type="text" 
              placeholder="13 หลัก (ถ้ามี)" 
              value={customerTaxId}
              onChange={(e) => setCustomerTaxId(e.target.value)}
              className="w-full px-3 py-2 text-xs border-2 border-[#cbd5e0] rounded-xl focus:outline-none focus:border-[#BF7E46] font-medium bg-[#faf7f2]"
            />
          </div>
        </div>

        {/* ตัวเลือกช่องทางการชำระเงิน 3 แบบ */}
        <div className="bg-[#FBEDD6] p-4 rounded-2xl border-2 border-[#f6ad55] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#BF7E46] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              💳
            </div>
            <div>
              <span className="text-xs font-black text-[#7b341e] block">เลือกช่องทางการชำระเงิน:</span>
              <span className="text-[10px] text-[#9c4221]">ยอดเงินจะถูกบันทึกและวิ่งเข้ารายงานกับกระเป๋าเงินตามช่องทางที่คุณเลือกอัตโนมัติ</span>
            </div>
          </div>
          <select 
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs font-black bg-white border-2 border-[#f6ad55] rounded-xl text-[#7b341e] focus:outline-none focus:border-[#BF7E46] cursor-pointer shadow-sm min-w-[160px]"
          >
            {paymentOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* รายการสินค้า (แก้ไขให้ Responsive ไม่ล้นจอมือถือ) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#4a5568]">รายการสินค้า / บริการ</label>
            <button 
              onClick={addItemRow}
              className="flex items-center gap-1 text-xs font-bold text-white bg-[#BF7E46] hover:bg-[#a06838] px-3 py-1.5 rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:flex sm:items-center gap-2 bg-[#faf7f2] sm:bg-transparent p-3 sm:p-0 rounded-xl border border-[#e2e8f0] sm:border-none">
                <input 
                  type="text" 
                  placeholder="ชื่อสินค้า / รายการ" 
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 text-xs border-2 border-[#cbd5e0] rounded-xl focus:outline-none focus:border-[#BF7E46] font-medium bg-white sm:bg-[#faf7f2]"
                />
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <input 
                    type="number" 
                    placeholder="จำนวน" 
                    min="1"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    className="w-full sm:w-20 px-3 py-2 text-xs border-2 border-[#cbd5e0] rounded-xl focus:outline-none focus:border-[#BF7E46] font-medium text-center bg-white sm:bg-[#faf7f2]"
                  />
                  <input 
                    type="number" 
                    placeholder="ราคาต่อหน่วย" 
                    min="0"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    className="w-full sm:w-28 px-3 py-2 text-xs border-2 border-[#cbd5e0] rounded-xl focus:outline-none focus:border-[#BF7E46] font-medium text-right bg-white sm:bg-[#faf7f2]"
                  />
                </div>
                <div className="flex justify-end sm:block">
                  <button 
                    onClick={() => removeItemRow(index)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t-2 border-[#FBEDD6] gap-3">
          <div className="text-sm font-black text-[#2d3748]">
            ยอดรวมทั้งสิ้น: <span className="text-[#BF7E46] text-lg font-black">฿{totalAmount.toLocaleString()}</span> บาท
          </div>
          <button 
            onClick={handleSaveAndPrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#BF7E46] hover:bg-[#a06838] text-white text-xs font-black rounded-xl transition shadow-md"
          >
            <Printer className="w-4 h-4" /> บันทึกและพิมพ์ใบเสร็จ ({selectedWallet})
          </button>
        </div>
      </div>

      {/* ประวัติใบเสร็จทั้งหมด */}
      <div className="bg-white rounded-2xl border-2 border-[#97C6E0]/50 shadow-md overflow-hidden">
        <div className="bg-[#97C6E0]/30 p-4 border-b-2 border-[#97C6E0] flex items-center justify-between">
          <h3 className="font-black text-sm text-[#1a365d]">ประวัติใบเสร็จทั้งหมด ({invoices.length} รายการ)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="bg-[#97C6E0]/20 border-b-2 border-[#cbd5e0] text-[#1a365d] font-black">
                <th className="p-3">เลขที่</th>
                <th className="p-3">วันที่</th>
                <th className="p-3">ลูกค้า</th>
                <th className="p-3">ช่องทางชำระเงิน</th>
                <th className="p-3 text-right">ยอดเงิน (บาท)</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                    ยังไม่มีประวัติใบเสร็จในระบบ
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#faf7f2] transition font-medium text-[#2d3748]">
                    <td className="p-3 font-black text-[#BF7E46]">{inv.id}</td>
                    <td className="p-3 whitespace-nowrap text-[#4a5568]">{inv.date}</td>
                    <td className="p-3 font-bold text-[#2d3748]">{inv.customerName}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FBEDD6] text-[#7b341e] border border-[#f6ad55] shadow-xs">
                        💳 {inv.targetAccount || 'เงินสด'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-[#BF7E46]">฿{inv.total.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => printInvoice(inv)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#97C6E0] text-[#1a365d] hover:bg-[#7db4d4] rounded-xl transition font-bold shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" /> พิมพ์
                        </button>
                        <button 
                          onClick={() => deleteInvoice(inv)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
