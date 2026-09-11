'use client';

import { useState, useEffect } from 'react';
import { Calculator, FileText, CheckCircle2, AlertCircle, Download, ShieldCheck, Heart, Home, Users } from 'lucide-react';

export default function TaxPage() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0); 
  const [expenseDeductionType, setExpenseDeductionType] = useState<'flat' | 'actual'>('flat');

  // State หมวดที่ 1: ส่วนตัวและครอบครัว
  const [hasSpouse, setHasSpouse] = useState(false);
  const [childrenCount1to2, setChildrenCount1to2] = useState(0);
  const [childrenCount3Plus, setChildrenCount3Plus] = useState(0);
  const [pregnancyCost, setPregnancyCost] = useState(0);
  const [parentCareCount, setParentCareCount] = useState(0);
  const [disabledCareCount, setDisabledCareCount] = useState(0);

  // State หมวดที่ 2: ประกันและการลงทุน
  const [socialSecurity, setSocialSecurity] = useState(0);
  const [lifeInsurance, setLifeInsurance] = useState(0);
  const [healthInsurance, setHealthInsurance] = useState(0);
  const [parentHealthInsurance, setParentHealthInsurance] = useState(0);
  const [rmfFund, setRmfFund] = useState(0);

  // State หมวดที่ 3: เงินบริจาค
  const [generalDonation, setGeneralDonation] = useState(0);
  const [eduHospitalDonation, setEduHospitalDonation] = useState(0);
  const [politicalDonation, setPoliticalDonation] = useState(0);

  // State หมวดที่ 4: กระตุ้นเศรษฐกิจและอสังหาฯ
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [easyEReceipt, setEasyEReceipt] = useState(0);

 useEffect(() => {
    try {
      // ดึงข้อมูลจาก LocalStorage ตามคีย์มาตรฐานเดียวกับหน้า Reports
      const savedIncome = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
      const savedExpense = JSON.parse(localStorage.getItem('expenseTransactions') || '[]');

      // 1. คำนวณยอดขายรวม (Gross Sales) และค่าหักต่างๆ ตามสูตรหน้า Reports เป๊ะๆ
      let totalGrossSales = 0;
      let totalDeductions = 0;

      savedIncome.forEach((item: any) => {
        const gross = Number(item.grossSales || item.total || item.net || item.amount || 0);
        const gpDeduction = Number(item.gpDeduction || item.gpAmount || 0);
        const adDeduction = Number(item.adDeduction || item.adAmount || 0);
        const debtDeduction = Number(item.debtDeduction || item.debtAmount || 0);
        const deductionSum = gpDeduction + adDeduction + debtDeduction;

        totalGrossSales += gross;
        totalDeductions += deductionSum;
      });

      // 2. คำนวณรายจ่ายร้านและรวมกับค่าหัก GP (Expenses + GP) ตามสูตรหน้า Reports
      const totalOtherExpenses = savedExpense.reduce((sum: number, item: any) => sum + (Number(item?.amount || 0)), 0);
      const totalAllExpenses = totalOtherExpenses + totalDeductions;

      // เซ็ตค่าลง State ของหน้า Tax ให้ตรงกันทันที
      setTotalIncome(totalGrossSales);
      setTotalExpense(totalAllExpenses);

    } catch (error) {
      console.error('Error loading tax calculation data from reports logic', error);
    }
  }, []);
  // การคำนวณรายได้และค่าใช้จ่าย
  const expenseFlat = totalIncome * 0.60;
  const selectedExpense = expenseDeductionType === 'flat' ? expenseFlat : Number(totalExpense);
  const incomeAfterExpense = Math.max(0, totalIncome - selectedExpense);

  // คำนวณค่าลดหย่อนแต่ละหมวด
  const basePersonal = 60000;
  const spouseDeduction = hasSpouse ? 60000 : 0;
  const childrenDeduction = (Number(childrenCount1to2) * 30000) + (Number(childrenCount3Plus) * 60000);
  const pregnancyDeduction = Math.min(Number(pregnancyCost), 60000);
  const parentCareDeduction = Number(parentCareCount) * 30000;
  const disabledCareDeduction = Number(disabledCareCount) * 60000;

  const totalFamilyDeduction = basePersonal + spouseDeduction + childrenDeduction + pregnancyDeduction + parentCareDeduction + disabledCareDeduction;

  const sscDeduction = Math.min(Number(socialSecurity), 9000);
  const lifeInsDeduction = Math.min(Number(lifeInsurance), 100000);
  const healthInsDeduction = Math.min(Number(healthInsurance), 25000);
  const combinedLifeHealth = Math.min(lifeInsDeduction + healthInsDeduction, 100000);
  const parentHealthDeduction = Math.min(Number(parentHealthInsurance), 15000);
  const rmfDeduction = Math.min(Number(rmfFund), incomeAfterExpense * 0.30, 500000);

  const totalInsuranceDeduction = sscDeduction + combinedLifeHealth + parentHealthDeduction + rmfDeduction;

  const incomeBeforeDonation = Math.max(0, incomeAfterExpense - totalFamilyDeduction - totalInsuranceDeduction);

  const politicalDed = Math.min(Number(politicalDonation), 10000);
  const eduHospDedActual = Math.min(Number(eduHospitalDonation) * 2, incomeBeforeDonation * 0.10);
  const generalDedActual = Math.min(Number(generalDonation), Math.max(0, (incomeBeforeDonation * 0.10) - eduHospDedActual));
  
  const totalDonationDeduction = generalDedActual + eduHospDedActual + politicalDed;

  const homeLoanDed = Math.min(Number(homeLoanInterest), 100000);
  const easyEReceiptDed = Math.min(Number(easyEReceipt), 50000);

  const totalOtherDeduction = homeLoanDed + easyEReceiptDed;

  const totalDeductions = totalFamilyDeduction + totalInsuranceDeduction + totalDonationDeduction + totalOtherDeduction;
  const netIncome = Math.max(0, incomeAfterExpense - totalDeductions);

  let calculatedTax = 0;
  if (netIncome > 5000000) {
    calculatedTax += (netIncome - 5000000) * 0.35 + 1265000;
  } else if (netIncome > 2000000) {
    calculatedTax += (netIncome - 2000000) * 0.30 + 365000;
  } else if (netIncome > 1000000) {
    calculatedTax += (netIncome - 1000000) * 0.20 + 165000;
  } else if (netIncome > 750000) {
    calculatedTax += (netIncome - 750000) * 0.15 + 65000;
  } else if (netIncome > 500000) {
    calculatedTax += (netIncome - 500000) * 0.10 + 40000;
  } else if (netIncome > 300000) {
    calculatedTax += (netIncome - 300000) * 0.05 + 10000;
  } else if (netIncome > 150000) {
    calculatedTax += (netIncome - 150000) * 0.05;
  }

  const fmt = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans p-4 sm:p-6 bg-[#fcfbfa]">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-[2.5rem] border border-[#e6dfd5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#fdf8f2] border border-[#f3e5d8] flex items-center justify-center text-xl shadow-sm">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800 tracking-tight">ระบบคำนวณภาษีอัตโนมัติ</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">ระบบคำนวณภาษี ภ.ง.ด.94 / ภ.ง.ด.90 ตามกฎหมายสรรพากรล่าสุด</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            กำหนด ภ.ง.ด.94: ภายใน 30 ก.ย. นี้
          </span>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Total Income */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#e6dfd5] shadow-sm space-y-3">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">รายได้สะสมทั้งปี (GROSS INCOME)</p>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-black text-slate-800">
              ฿{fmt(totalIncome)}
            </h2>
          </div>
          <p className="text-[11px] text-slate-400">ดึงข้อมูลจากยอดขายรวมอัตโนมัติ</p>
        </div>

        {/* Card 2: Expense Deduction Choice */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#e6dfd5] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ค่าใช้จ่ายที่ใช้หักภาษี</p>
            <div className="flex bg-[#f4efe6] p-1 rounded-xl text-[11px] font-bold">
              <button 
                onClick={() => setExpenseDeductionType('flat')}
                className={`px-3 py-1 rounded-lg transition ${expenseDeductionType === 'flat' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                เหมา 60%
              </button>
              <button 
                onClick={() => setExpenseDeductionType('actual')}
                className={`px-3 py-1 rounded-lg transition ${expenseDeductionType === 'actual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                ตามจริง
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <h2 className="text-2xl font-black text-[#b8621b]">
              ฿{fmt(selectedExpense)}
            </h2>
            <span className="text-xs font-bold text-[#b8621b] bg-[#fdf5ed] border border-[#f5dec8] px-2.5 py-1 rounded-full whitespace-nowrap">
              {expenseDeductionType === 'flat' ? 'วิธีเหมา (คุ้มค่า)' : 'วิธีหักตามจริง (จากระบบ)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {expenseDeductionType === 'flat' ? `คิดจาก 60% ของรายได้ = ฿${fmt(expenseFlat)}` : 'ดึงยอดรวมจากบันทึกรายจ่ายอัตโนมัติ'}
          </p>
        </div>

        {/* Card 3: Estimated Tax */}
        <div className="bg-gradient-to-br from-[#b8621b] to-[#924c13] text-white p-6 rounded-[2rem] shadow-md space-y-3 relative overflow-hidden flex flex-col justify-between border border-[#d67b2d]">
          <div className="absolute right-[-10px] bottom-[-10px] text-white opacity-10 text-8xl font-black pointer-events-none">
            🧾
          </div>
          <div>
            <p className="text-xs text-[#fdecdc] font-bold uppercase tracking-wider">ประมาณการภาษีที่ต้องชำระ</p>
          </div>
          <div className="flex items-baseline justify-between relative z-10 py-1">
            <h2 className="text-4xl sm:text-5xl font-black text-[#ffea88] tracking-tight">
              ฿{fmt(calculatedTax)}
            </h2>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#fdecdc] relative z-10">
            <span>หลังหักลดหย่อนรวม ฿{fmt(totalDeductions)}</span>
            <span className="font-bold bg-[#ffea88] text-[#7a410b] px-2.5 py-1 rounded-full text-[10px]">สุทธิ</span>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Summary Steps */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] border border-[#e6dfd5] shadow-sm p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-[#b8621b]" />
              <span>สรุปขั้นตอนการคำนวณภาษี</span>
            </h2>

            <div className="space-y-3 text-xs font-medium text-slate-700">
              <div className="flex justify-between p-3.5 bg-[#fcfbfa] border border-[#f3eee6] rounded-2xl">
                <span className="text-slate-500 font-bold">1. รายได้พึงประเมินทั้งปี</span>
                <span className="font-black text-slate-800">฿{fmt(totalIncome)}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-[#fcfbfa] border border-[#f3eee6] rounded-2xl">
                <span className="text-slate-500 font-bold">2. หัก ค่าใช้จ่าย</span>
                <span className="font-black text-rose-600">- ฿{fmt(selectedExpense)}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-[#fcfbfa] border border-[#f3eee6] rounded-2xl">
                <span className="text-slate-500 font-bold">3. เงินได้หลังหักค่าใช้จ่าย</span>
                <span className="font-black text-slate-800">฿{fmt(incomeAfterExpense)}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-[#fdf8f2] rounded-2xl border border-[#f5dec8]">
                <span className="text-[#8c460c] font-bold">4. หัก ค่าลดหย่อนรวมทั้ง 4 หมวด</span>
                <span className="font-black text-[#b8621b]">- ฿{fmt(totalDeductions)}</span>
              </div>
              <div className="flex justify-between p-4 bg-gradient-to-r from-[#b8621b] to-[#a05416] text-white rounded-2xl text-sm shadow-md border border-[#d67b2d]">
                <span className="font-black text-white">5. เงินได้สุทธิเพื่อคำนวณภาษี</span>
                <span className="font-black text-[#ffea88] text-base">฿{fmt(netIncome)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 4 Categories Allowance Inputs */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-[#e6dfd5] shadow-sm p-6 space-y-6">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#b8621b]" />
            <span>กรอกรายการลดหย่อนภาษี (แยกตาม 4 หมวดหลัก)</span>
          </h2>

          {/* หมวดที่ 1: ส่วนตัวและครอบครัว */}
          <div className="p-4 bg-[#fcfbfa] rounded-2xl border border-[#e6dfd5]/70 space-y-3">
            <p className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#b8621b]"></span>
              1. หมวดลดหย่อนส่วนตัวและครอบครัว (พื้นฐานส่วนตัว 60,000 ฿ รวมอัตโนมัติ)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#e6dfd5] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasSpouse}
                  onChange={(e) => setHasSpouse(e.target.checked)}
                  className="w-4 h-4 text-[#b8621b] rounded border-[#e6dfd5]"
                />
                <span className="font-bold text-slate-700">มีคู่สมรส (ไม่มีเงินได้) [+60,000 ฿]</span>
              </label>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บุตรคนที่ 1-2</label>
                <input 
                  type="number" 
                  value={childrenCount1to2 || ''}
                  onChange={(e) => setChildrenCount1to2(Number(e.target.value))}
                  placeholder="จำนวนคน"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บุตรคนที่ 3 ขึ้นไป</label>
                <input 
                  type="number" 
                  value={childrenCount3Plus || ''}
                  onChange={(e) => setChildrenCount3Plus(Number(e.target.value))}
                  placeholder="จำนวนคน"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">ฝากครรภ์/คลอดบุตร (สูงสุด 60k)</label>
                <input 
                  type="number" 
                  value={pregnancyCost || ''}
                  onChange={(e) => setPregnancyCost(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">อุปการะบิดามารดา (อายุ 60 ปีขึ้นไป)</label>
                <input 
                  type="number" 
                  value={parentCareCount || ''}
                  onChange={(e) => setParentCareCount(Number(e.target.value))}
                  placeholder="จำนวนคน (คนละ 30k)"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">อุปการะคนพิการ</label>
                <input 
                  type="number" 
                  value={disabledCareCount || ''}
                  onChange={(e) => setDisabledCareCount(Number(e.target.value))}
                  placeholder="จำนวนคน (คนละ 60k)"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
            </div>
          </div>

          {/* หมวดที่ 2: ประกันและการลงทุน */}
          <div className="p-4 bg-[#fcfbfa] rounded-2xl border border-[#e6dfd5]/70 space-y-3">
            <p className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
              2. หมวดประกันและการลงทุน
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">ประกันสังคม (สูงสุด 9,000 ฿)</label>
                <input 
                  type="number" 
                  value={socialSecurity || ''}
                  onChange={(e) => setSocialSecurity(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">เบี้ยประกันชีวิต (สูงสุด 100,000 ฿)</label>
                <input 
                  type="number" 
                  value={lifeInsurance || ''}
                  onChange={(e) => setLifeInsurance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">เบี้ยประกันสุขภาพตนเอง (สูงสุด 25,000 ฿)</label>
                <input 
                  type="number" 
                  value={healthInsurance || ''}
                  onChange={(e) => setHealthInsurance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">เบี้ยประกันสุขภาพพ่อแม่ (สูงสุด 15,000 ฿)</label>
                <input 
                  type="number" 
                  value={parentHealthInsurance || ''}
                  onChange={(e) => setParentHealthInsurance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-500 font-bold block mb-1">กองทุน RMF / กองทุนออมเพื่อเกษียณ (สูงสุด 30% / ไม่เกิน 500k)</label>
                <input 
                  type="number" 
                  value={rmfFund || ''}
                  onChange={(e) => setRmfFund(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
            </div>
          </div>

          {/* หมวดที่ 3: เงินบริจาค */}
          <div className="p-4 bg-[#fcfbfa] rounded-2xl border border-[#e6dfd5]/70 space-y-3">
            <p className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              3. หมวดเงินบริจาค
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บริจาคทั่วไป (ไม่เกิน 10%)</label>
                <input 
                  type="number" 
                  value={generalDonation || ''}
                  onChange={(e) => setGeneralDonation(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บริจาคการศึกษา/รพ. (ลดหย่อน 2 เท่า)</label>
                <input 
                  type="number" 
                  value={eduHospitalDonation || ''}
                  onChange={(e) => setEduHospitalDonation(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บริจาคพรรคการเมือง (สูงสุด 10k)</label>
                <input 
                  type="number" 
                  value={politicalDonation || ''}
                  onChange={(e) => setPoliticalDonation(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
            </div>
          </div>

          {/* หมวดที่ 4: อสังหาฯ และกระตุ้นเศรษฐกิจ */}
          <div className="p-4 bg-[#fcfbfa] rounded-2xl border border-[#e6dfd5]/70 space-y-3">
            <p className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8c460c]"></span>
              4. หมวดอสังหาฯ และกระตุ้นเศรษฐกิจ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">ดอกเบี้ยเงินกู้ยืมซื้อที่อยู่อาศัย (สูงสุด 100k)</label>
                <input 
                  type="number" 
                  value={homeLoanInterest || ''}
                  onChange={(e) => setHomeLoanInterest(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">มาตรการกระตุ้นเศรษฐกิจ (เช่น Easy E-Receipt)</label>
                <input 
                  type="number" 
                  value={easyEReceipt || ''}
                  onChange={(e) => setEasyEReceipt(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-[#e6dfd5] rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#b8621b]"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}