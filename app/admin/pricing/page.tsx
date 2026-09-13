'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Trash2, ShieldCheck, Clock } from 'lucide-react';

interface SlipItem {
  id: number;
  date: string;
  shopName: string;
  shopPhone: string;
  plan: string;
  slipImage: string;
  status: string;
}

export default function AdminPricingPage() {
  const [pendingSlips, setPendingSlips] = useState<SlipItem[]>([]);

  useEffect(() => {
    const savedSlips = JSON.parse(localStorage.getItem('adminPendingSlips') || '[]');
    setPendingSlips(savedSlips);
  }, []);

  // ฟังก์ชันกดอนุมัติสลิป
  const handleApprove = (id: number) => {
    if (confirm('คุณต้องการอนุมัติแพ็คเกจให้กับร้านค้านี้ใช่หรือไม่?')) {
      const updated = pendingSlips.map(slip => {
        if (slip.id === id) {
          return { ...slip, status: 'อนุมัติแล้ว ✅' };
        }
        return slip;
      });
      setPendingSlips(updated);
      localStorage.setItem('adminPendingSlips', JSON.stringify(updated));
      alert('อนุมัติแพ็คเกจเรียบร้อยแล้วครับ! ร้านค้านี้ได้รับการปลดล็อกสิทธิ์ใช้งาน 🐾');
    }
  };

  // ฟังก์ชันลบรายการ
  const handleDelete = (id: number) => {
    if (confirm('ต้องการลบรายการนี้ออกจากระบบใช่หรือไม่?')) {
      const updated = pendingSlips.filter(slip => slip.id !== id);
      setPendingSlips(updated);
      localStorage.setItem('adminPendingSlips', JSON.stringify(updated));
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 font-sans pb-24 text-slate-800">
      
      {/* Header แอดมิน */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm">
            🛡️
          </div>
          <div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              Admin Control Center
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ตรวจสอบสลิปและอนุมัติแพ็คเกจร้านค้า
            </h1>
            <p className="text-xs text-slate-500">จัดการคำขอสมัครสมาชิกและตรวจสอบหลักฐานการโอนเงินของลูกค้า</p>
          </div>
        </div>

        <Link 
          href="/pricing"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> ไปหน้าเลือกแพ็คเกจ
        </Link>
      </div>

      {/* รายการสลิปที่รอตรวจสอบ */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
        <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          รายการแจ้งชำระเงินทั้งหมด ({pendingSlips.length} รายการ)
        </h2>

        {pendingSlips.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold space-y-2">
            <p className="text-3xl">📭</p>
            <p>ยังไม่มีรายการแจ้งโอนเงินเข้ามาในระบบครับ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingSlips.map((item) => (
              <div key={item.id} className="bg-slate-50/80 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">📅 {item.date}</span>
                    <h3 className="font-black text-base text-slate-900 mt-0.5">{item.shopName}</h3>
                    <p className="text-xs text-slate-600 font-medium">📞 โทร: {item.shopPhone}</p>
                  </div>
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full ${
                    item.status.includes('อนุมัติ') 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-400 font-bold">แพ็กเกจที่เลือก:</span>
                  <p className="font-black text-[#BF7E46]">{item.plan}</p>
                </div>

                {/* รูปสลิป */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">📸 รูปสลิปโอนเงิน:</span>
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 flex justify-center">
                    <a href={item.slipImage} target="_blank" rel="noopener noreferrer">
                      <img src={item.slipImage} alt="Slip" className="h-48 rounded-xl object-contain hover:opacity-90 transition cursor-zoom-in" />
                    </a>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">(คลิกที่รูปเพื่อขยายดูสลิปขนาดใหญ่)</p>
                </div>

                {/* ปุ่มจัดการ */}
                <div className="flex items-center gap-3 pt-2">
                  {item.status !== 'อนุมัติแล้ว ✅' && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> อนุมัติแพ็คเกจ
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> ลบ
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}