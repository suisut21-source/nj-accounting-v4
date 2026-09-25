'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StoreItem {
  id: string;
  phone_number: string;
  shop_name: string;
  subscription_status: string;
  package_name: string;
  created_at: string;
}

export default function AdminPricingPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลร้านค้าทั้งหมดจาก Supabase
  const fetchStores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stores:', error);
    } else {
      setStores(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // ฟังก์ชันกดอนุมัติสิทธิ์แพ็กเกจให้ร้านค้า
  const handleApprove = async (phone_number: string, shop_name: string) => {
    if (confirm(`คุณต้องการอนุมัติแพ็กเกจให้กับร้าน "${shop_name || phone_number}" ใช่หรือไม่?`)) {
      const { error } = await supabase
        .from('stores')
        .update({ 
          subscription_status: 'active', 
          package_name: 'แพ็กเกจพรีเมียม (ใช้งานได้เต็มระบบ)' 
        })
        .eq('phone_number', phone_number);

      if (error) {
        alert('⚠️ เกิดข้อผิดพลาดในการอนุมัติ กรุณาลองใหม่อีกครั้ง');
        console.error(error);
      } else {
        alert('อนุมัติแพ็คเกจเรียบร้อยแล้วครับ! ร้านค้านี้ได้รับการปลดล็อกสิทธิ์ใช้งาน 🐾');
        fetchStores(); // รีเฟรชข้อมูลใหม่
      }
    }
  };

  // ฟังก์ชันลบร้านค้าออกจากระบบ
  const handleDelete = async (phone_number: string, shop_name: string) => {
    if (confirm(`ต้องการลบบัญชีร้าน "${shop_name || phone_number}" ออกจากระบบใช่หรือไม่?`)) {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('phone_number', phone_number);

      if (error) {
        alert('⚠️ เกิดข้อผิดพลาดในการลบข้อมูล');
        console.error(error);
      } else {
        fetchStores(); // รีเฟรชข้อมูลใหม่
      }
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
              Admin Control Center (Cloud DB)
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ตรวจสอบสลิปและอนุมัติแพ็คเกจร้านค้า
            </h1>
            <p className="text-xs text-slate-500">จัดการคำขอสมัครสมาชิกและตรวจสอบสถานะร้านค้าแบบเรียลไทม์</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchStores}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-2xl transition cursor-pointer"
          >
            🔄 รีเฟรช
          </button>
          <Link 
            href="/pricing"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> ไปหน้าเลือกแพ็คเกจ
          </Link>
        </div>
      </div>

      {/* รายการร้านค้าที่สมัครเข้ามา */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
        <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          รายการแจ้งชำระเงินทั้งหมดจากคลาวด์ ({stores.length} รายการ)
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold space-y-2">
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold space-y-2">
            <p className="text-3xl">📭</p>
            <p>ยังไม่มีรายการแจ้งโอนเงินเข้ามาในระบบครับ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-slate-50/80 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">📅 สมัครเมื่อ: {new Date(store.created_at).toLocaleString('th-TH')}</span>
                    <h3 className="font-black text-base text-slate-900 mt-0.5">🏪 {store.shop_name || 'ร้านค้าไม่มีชื่อ'}</h3>
                    <p className="text-xs text-slate-600 font-medium">📞 โทร: {store.phone_number}</p>
                  </div>
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full ${
                    store.subscription_status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {store.subscription_status === 'active' ? 'อนุมัติแล้ว ✅' : 'รอตรวจสอบ ⏳'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-400 font-bold">แพ็กเกจที่เลือก:</span>
                  <p className="font-black text-[#BF7E46]">{store.package_name || 'ทดลองใช้ฟรี'}</p>
                </div>

                {/* ปุ่มจัดการ */}
                <div className="flex items-center gap-3 pt-2">
                  {store.subscription_status !== 'active' && (
                    <button
                      onClick={() => handleApprove(store.phone_number, store.shop_name)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" /> อนุมัติแพ็คเกจ
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(store.phone_number, store.shop_name)}
                    className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1 cursor-pointer"
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