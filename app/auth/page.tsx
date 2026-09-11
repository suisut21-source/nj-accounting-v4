'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'auth' | 'welcome'>('auth');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              shop_name: shopName,
            },
          },
        });

        if (error) throw error;
        setStep('welcome');
      }
    } catch (err: any) {
      console.error('Auth Error:', err.message);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งครับ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-[32px] max-w-md w-full p-8 sm:p-10 shadow-2xl shadow-amber-100/50 border-2 border-[#FBEDD6]/60 animate-in fade-in zoom-in duration-300">
        
        {step === 'auth' ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#FBEDD6] flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#BF7E46]/20">
                <span className="text-4xl filter drop-shadow-md">🐕</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-[#2d3748] tracking-tighter mb-2">
                {isLogin ? 'ยินดีต้อนรับกลับครับพี่! 👋' : 'มาสร้างร้านค้ากัน! 🚀'}
              </h1>
              <p className="text-xs sm:text-sm text-[#4a5568] font-medium max-w-sm mx-auto leading-relaxed">
                {isLogin 
                  ? 'เข้าสู่ระบบเพื่อจัดการร้านค้าและดูยอดขายแบบเรียลไทม์ได้เลยครับ' 
                  : 'กรอกข้อมูลเพื่อเปิดบัญชีร้านค้า แยกบัญชีใครบัญชีมัน ปลอดภัยแน่นอน'
                }
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-bold text-center">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="shopName" className="block text-xs font-bold text-slate-600 pl-1">ชื่อร้านค้า</label>
                  <input
                    id="shopName"
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="เช่น ร้านข้าวพันผัก"
                    className="w-full px-5 py-3.5 rounded-2xl bg-[#faf7f2] border border-[#FBEDD6] focus:border-[#BF7E46]/60 focus:ring-2 focus:ring-[#BF7E46]/20 focus:outline-none transition text-sm font-semibold placeholder:text-slate-400 text-slate-700"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-slate-600 pl-1">อีเมล</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-5 py-3.5 rounded-2xl bg-[#faf7f2] border border-[#FBEDD6] focus:border-[#BF7E46]/60 focus:ring-2 focus:ring-[#BF7E46]/20 focus:outline-none transition text-sm font-semibold placeholder:text-slate-400 text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" class="block text-xs font-bold text-slate-600 pl-1">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 rounded-2xl bg-[#faf7f2] border border-[#FBEDD6] focus:border-[#BF7E46]/60 focus:ring-2 focus:ring-[#BF7E46]/20 focus:outline-none transition text-sm font-semibold placeholder:text-slate-400 text-slate-700"
                />
              </div>

              {isLogin && (
                <div className="flex justify-end pt-1">
                  <a href="#" className="text-xs font-bold text-[#BF7E46] hover:text-[#a66b3b] transition">ลืมรหัสผ่าน?</a>
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#BF7E46] hover:bg-[#a66b3b] text-white font-black text-sm rounded-2xl shadow-sm shadow-[#BF7E46]/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isLogin ? (
                    'เข้าสู่ระบบ'
                  ) : (
                    'สมัครสมาชิก & เริ่มต้นใช้งาน 🐕'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-6 sm:mt-8 border-t border-[#FBEDD6] pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShopName(''); setEmail(''); setPassword('');
                  setErrorMessage('');
                }}
                className="text-xs font-bold text-slate-700 hover:text-[#BF7E46] transition"
              >
                {isLogin 
                  ? 'ยังไม่มีบัญชีร้านค้า? สร้างบัญชีเลย' 
                  : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'
                }
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-2 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-[#FBEDD6] flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-[#BF7E46]/30">
              <span className="text-4xl">🐕</span>
            </div>

            <h2 className="text-2xl font-black text-[#2d3748] tracking-tight mb-2">
              ยินดีต้อนรับสู่ครอบครัว NJ Accounting ครับพี่!
            </h2>
            <p className="text-xs text-slate-600 font-medium mb-5 leading-relaxed">
              ระบบผู้ช่วยจัดการร้านค้า บัญชี และภาษี ที่ออกแบบมาเพื่อพี่โดยเฉพาะ ข้อมูลร้านค้าของคุณถูกแยกเก็บเป็นส่วนตัวปลอดภัย
            </p>

            <div className="bg-[#faf7f2] rounded-2xl p-4 border-2 border-[#FBEDD6] text-left mb-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#BF7E46]">
                <span>🎁</span>
                <span>สิทธิพิเศษสำหรับพี่:</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2 font-semibold">
                <li className="flex items-center justify-between">
                  <span>• ทดลองใช้งานฟรีเต็มระบบ</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">1 เดือนเต็ม</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>• หลังจากนั้นแพ็กเกจรายเดือน</span>
                  <span className="text-[#BF7E46] font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">เพียง 199 บาท/เดือน</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 text-center mb-6">
              <p className="text-xs font-bold text-emerald-800 mb-1">💬 ติดปัญหาตรงไหนทักมาได้ตลอดเลยนะครับ</p>
              <p className="text-xs font-semibold text-emerald-700">Line ID: <span className="font-bold underline">@aree-support</span></p>
            </div>

            <button
              onClick={() => router.push('/settings')}
              className="w-full py-4 bg-[#BF7E46] hover:bg-[#a66b3b] text-white font-black text-sm rounded-2xl shadow-sm shadow-[#BF7E46]/30 transition duration-200 flex items-center justify-center gap-2"
            >
              ⚙️ ไปตั้งค่าข้อมูลร้านค้ากันก่อนเลย!
            </button>
          </div>
        )}

        <div className="text-center mt-6 text-[10px] font-medium text-slate-500">
          ระบบจัดการร้านค้า NJ Accounting v1.0.0 • ดูแลร้านค้าด้วยใจ 🐕✨
        </div>
      </div>
    </div>
  );
}