'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Trash2, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StoreItem {
  id: string;
  phone_number: string | null;
  shop_name: string | null;
  subscription_status: string | null;
  package_name: string | null;
  created_at: string;
  expire_date: string | null;
  line_user_id: string;
}

type Group = 'pending' | 'active' | 'new';
type Tab = Group | 'all';

// แพ็กเกจจริงต้องเป็น NJ Start / NJ Plus
// (ค่าเริ่มต้นเก่า "ทดลองใช้ฟรี 30 วัน" ที่หน้าล็อกอินเคยสร้างไว้ ไม่นับว่าเลือกแพ็กเกจแล้ว)
const isRealPackage = (p?: string | null) => !!p && p.includes('NJ ');

// จัดกลุ่มร้านจากข้อมูลจริง
// active = อนุมัติแล้ว | pending = เลือกแพ็กเกจแล้วรออนุมัติ | new = แค่ล็อกอิน ยังไม่เลือกแพ็กเกจ
const getGroup = (s: StoreItem): Group => {
  if (s.subscription_status === 'active') return 'active';
  if (isRealPackage(s.package_name)) return 'pending';
  return 'new';
};

const getDaysLeft = (d?: string | null) => {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

const BADGE: Record<Group, { text: string; cls: string }> = {
  pending: { text: 'รอตรวจสอบ ⏳', cls: 'bg-amber-100 text-amber-800' },
  active: { text: 'อนุมัติแล้ว ✅', cls: 'bg-emerald-100 text-emerald-700' },
  new: { text: 'ยังไม่เลือกแพ็กเกจ', cls: 'bg-slate-200 text-slate-600' },
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'รอตรวจสอบ' },
  { key: 'active', label: 'อนุมัติแล้ว' },
  { key: 'new', label: 'ยังไม่เลือกแพ็กเกจ' },
  { key: 'all', label: 'ทั้งหมด' },
];

const EMPTY_TEXT: Record<Tab, string> = {
  pending: 'ไม่มีร้านที่รอตรวจสอบในตอนนี้ครับ',
  active: 'ยังไม่มีร้านที่อนุมัติแล้วครับ',
  new: 'ไม่มีร้านที่ยังไม่เลือกแพ็กเกจครับ',
  all: 'ยังไม่มีร้านค้าในระบบครับ',
};

export default function AdminPricingPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);

  // ดึงข้อมูลร้านค้าทั้งหมดจาก Supabase
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

  // อนุมัติแพ็กเกจ (อนุมัติได้เฉพาะร้านที่เลือกแพ็กเกจแล้ว)
  const handleApprove = async (store: StoreItem) => {
    if (busyId) return;

    if (!isRealPackage(store.package_name)) {
      alert('⚠️ ร้านนี้ยังไม่ได้เลือกแพ็กเกจ จึงยังอนุมัติไม่ได้');
      return;
    }

    if (!confirm(`อนุมัติแพ็กเกจ "${store.package_name}" ให้ร้าน "${store.shop_name || 'ร้านค้า'}" ใช่หรือไม่?`)) {
      return;
    }

    setBusyId(store.id);
    const { data, error } = await supabase
      .from('stores')
      .update({ subscription_status: 'active' })
      .eq('id', store.id)
      .select('id');
    setBusyId(null);

    if (error) {
      alert('⚠️ เกิดข้อผิดพลาดในการอนุมัติ กรุณาลองใหม่อีกครั้ง');
      console.error(error);
    } else if (!data || data.length === 0) {
      // Supabase ไม่ฟ้อง error เมื่อ RLS กรองแถวออก จึงต้องเช็กว่ามีแถวถูกอัปเดตจริงหรือไม่
      alert('⚠️ ไม่มีข้อมูลถูกอัปเดต (อาจถูกจำกัดสิทธิ์ใน Supabase) กรุณาตรวจสอบ');
    } else {
      alert('อนุมัติแพ็คเกจเรียบร้อยแล้วครับ! ร้านค้านี้ได้รับการปลดล็อกสิทธิ์ใช้งาน 🐾');
      fetchStores();
    }
  };

  // ลบร้านค้าออกจากระบบ
  const handleDelete = async (store: StoreItem) => {
    if (busyId) return;

    const warn = getGroup(store) === 'active' ? '\n\n⚠️ ร้านนี้อนุมัติแล้วและอาจกำลังใช้งานอยู่' : '';
    if (!confirm(`ต้องการลบบัญชีร้าน "${store.shop_name || 'ร้านค้า'}" ออกจากระบบใช่หรือไม่?${warn}`)) {
      return;
    }

    setBusyId(store.id);
    const { data, error } = await supabase
      .from('stores')
      .delete()
      .eq('id', store.id)
      .select('id');
    setBusyId(null);

    if (error) {
      alert('⚠️ เกิดข้อผิดพลาดในการลบข้อมูล');
      console.error(error);
    } else if (!data || data.length === 0) {
      alert('⚠️ ไม่มีข้อมูลถูกลบ (อาจถูกจำกัดสิทธิ์ใน Supabase) กรุณาตรวจสอบ');
    } else {
      alert('ลบข้อมูลร้านค้าเรียบร้อยแล้วครับ');
      fetchStores();
    }
  };

  const counts: Record<Tab, number> = {
    pending: stores.filter((s) => getGroup(s) === 'pending').length,
    active: stores.filter((s) => getGroup(s) === 'active').length,
    new: stores.filter((s) => getGroup(s) === 'new').length,
    all: stores.length,
  };

  const visibleStores = tab === 'all' ? stores : stores.filter((s) => getGroup(s) === tab);

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
              ตรวจสอบและอนุมัติแพ็คเกจร้านค้า
            </h1>
            <p className="text-xs text-slate-500">
              {counts.pending > 0
                ? `มี ${counts.pending} ร้านรอการตรวจสอบ`
                : 'ไม่มีร้านรอการตรวจสอบในตอนนี้'}
            </p>
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

      {/* รายการร้านค้า */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            รายชื่อร้านค้า ({visibleStores.length} รายการ)
          </h2>

          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition cursor-pointer ${
                  tab === t.key
                    ? 'bg-[#BF7E46] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label} ({counts[t.key]})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold space-y-2">
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : visibleStores.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold space-y-2">
            <p className="text-3xl">📭</p>
            <p>{EMPTY_TEXT[tab]}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleStores.map((store) => {
              const group = getGroup(store);
              const daysLeft = getDaysLeft(store.expire_date);
              const busy = busyId === store.id;

              return (
                <div key={store.id} className="bg-slate-50/80 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">

                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">
                        📅 สร้างบัญชีเมื่อ: {store.created_at ? new Date(store.created_at).toLocaleString('th-TH') : '-'}
                      </span>
                      <h3 className="font-black text-base text-slate-900 mt-0.5">
                        🏪 {store.shop_name || 'ร้านค้าไม่มีชื่อ'}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        📞 โทร: {store.phone_number || 'ยังไม่ได้ระบุ'}
                      </p>
                    </div>
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full whitespace-nowrap ${BADGE[group].cls}`}>
                      {BADGE[group].text}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <span className="text-slate-400 font-bold">แพ็กเกจที่เลือก:</span>
                    <p className="font-black text-[#BF7E46]">
                      {group === 'new' ? 'ยังไม่ได้เลือกแพ็กเกจ' : store.package_name}
                    </p>
                    {group !== 'new' && store.expire_date && (
                      <p className="text-slate-500 font-medium pt-1">
                        ⏳ ทดลองใช้ถึง {new Date(store.expire_date).toLocaleDateString('th-TH')}
                        {daysLeft !== null && (daysLeft > 0 ? ` (เหลือ ${daysLeft} วัน)` : ' (ครบกำหนดแล้ว)')}
                      </p>
                    )}
                  </div>

                  {/* ปุ่มจัดการ */}
                  <div className="flex items-center gap-3 pt-2">
                    {group === 'pending' && (
                      <button
                        onClick={() => handleApprove(store)}
                        disabled={busy}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" /> {busy ? 'กำลังบันทึก...' : 'อนุมัติแพ็คเกจ'}
                      </button>
                    )}
                    {group === 'new' && (
                      <p className="flex-1 text-[11px] text-slate-400 font-medium">
                        รอลูกค้ากดยืนยันรับสิทธิ์ในหน้าเลือกแพ็กเกจ
                      </p>
                    )}
                    <button
                      onClick={() => handleDelete(store)}
                      disabled={busy}
                      className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> ลบ
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
