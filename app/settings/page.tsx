'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [shopName, setShopName] = useState('Aree');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  const supportContact = '@579mimsm (Admin Support / NJ ยินดีบริการ)';

  // โหลดข้อมูลที่เคยบันทึกไว้ขึ้นมาแสดงตอนเปิดหน้าตั้งค่า
  useEffect(() => {
    const savedShopName = localStorage.getItem('shop_name');
    const savedTaxId = localStorage.getItem('shop_tax_id');
    const savedAddress = localStorage.getItem('shop_address');
    const savedPhone = localStorage.getItem('shop_phone');

    if (savedShopName) setShopName(savedShopName);
    if (savedTaxId) setTaxId(savedTaxId);
    if (savedAddress) setAddress(savedAddress);
    if (savedPhone) setPhone(savedPhone);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // บันทึกลงหน่วยความจำเครื่อง (localStorage) เพื่อให้ทุกหน้าเรียกใช้ได้
    localStorage.setItem('shop_name', shopName);
    localStorage.setItem('shop_tax_id', taxId);
    localStorage.setItem('shop_address', address);
    localStorage.setItem('shop_phone', phone);

    alert(`บันทึกข้อมูลสำเร็จ! เปลี่ยนชื่อร้านเป็น "${shopName}" เรียบร้อยแล้วครับพี่ 🎉`);
    
    // สั่งรีโหลดหน้าเว็บเบาๆ เพื่อให้ Sidebar หรือส่วนอื่นๆ อัปเดตชื่อตามทันที
    window.location.reload();
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Header คุมโทนด้วยสี Papaya Whip และ Caramel */}
      <div 
        className="p-6 rounded-3xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-slate-800"
        style={{ backgroundColor: '#FBEDD6', borderColor: '#f3dcbc' }}
      >
        <div className="flex items-center gap-3.5">
          <div 
            className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-sm bg-white"
            style={{ borderColor: '#e6ccab' }}
          >
            ⚙️
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">
              ตั้งค่าร้านค้า & ระบบ ({shopName}) 🍜
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">จัดการข้อมูลร้านค้าสำหรับออกใบเสร็จและตั้งค่าระบบภายในร้าน</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* การ์ดข้อมูลร้านค้าทั่วไป */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="border-b pb-3 flex items-center gap-2 border-slate-100">
            <span className="text-lg">🏪</span>
            <h2 className="font-black text-base text-slate-800">ข้อมูลร้านค้าสำหรับออกใบเสร็จ / ใบกำกับภาษี</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อร้าน / ชื่อกิจการ</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none text-slate-800 text-xs font-bold shadow-sm focus:border-[#BF7E46]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="กรอกเลขผู้เสียภาษี (ถ้ามี)"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none text-slate-800 text-xs shadow-sm focus:border-[#BF7E46]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">ที่อยู่ร้านค้า</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ระบุที่อยู่เพื่อแสดงบนหัวบิลและใบเสร็จรับเงิน"
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none text-slate-800 text-xs shadow-sm focus:border-[#BF7E46]"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อร้าน</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08x-xxx-xxxx"
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none text-slate-800 text-xs md:w-1/2 shadow-sm focus:border-[#BF7E46]"
            />
          </div>
        </div>

        {/* ปุ่มบันทึกข้อมูล */}
        <div>
          <button
            type="submit"
            className="w-full py-3.5 text-xs font-bold rounded-2xl shadow-sm transition hover:opacity-90 flex items-center justify-center gap-2 text-white"
            style={{ backgroundColor: '#BF7E46' }}
          >
            💾 บันทึกการตั้งค่าร้านค้า (อัปเดตทุกหน้า)
          </button>
        </div>

        {/* การ์ดช่องทางติดต่อผู้ดูแลระบบ */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="border-b pb-3 flex items-center gap-2 border-slate-100">
            <span className="text-lg">🐶</span>
            <h2 className="font-black text-base text-slate-800">ช่องทางติดต่อผู้ดูแลระบบ (แจ้งปัญหาแอป)</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-3">
            หากพบปัญหาการใช้งานระบบ บั๊ก หรืออยากให้สอนการกรอกข้อมูล ทักมาได้ตลอด <strong>NJ ยินดีบริการ</strong> ครับพี่! 🐾
          </p>
          
          <div 
            className="p-4 rounded-2xl border shadow-sm flex items-center justify-between mt-4"
            style={{ backgroundColor: '#FBEDD6', borderColor: '#f3dcbc' }}
          >
            <div>
              <span className="text-[11px] font-bold block mb-0.5 text-slate-700">ช่องทางติดต่อซัพพอร์ต (Official)</span>
              <span className="text-slate-900 font-black text-sm">{supportContact}</span>
            </div>
            <span 
              className="text-[10px] px-3 py-1 rounded-full font-bold text-white shadow-sm"
              style={{ backgroundColor: '#BF7E46' }}
            >
              🔒 ปลอดภัย (แก้ไขไม่ได้)
            </span>
          </div>
        </div>

      </form>
    </div>
  );
}