import React from 'react';
import { DietPlan } from '../types/diet';
import { sumSlotNutrition } from '../utils/nutritionCalculators';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Droplets,
  Heart,
  Moon,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface PrescriptionViewProps {
  plan: DietPlan;
  elementId?: string;
  hideShadow?: boolean;
}

export const PrescriptionView: React.FC<PrescriptionViewProps> = ({
  plan,
  elementId = 'prescription-pad-document',
  hideShadow = false,
}) => {
  const patient = plan?.patient || { name: 'Asif', age: 15, gender: 'male', primaryGoal: 'Fitness' };
  const doctor = plan?.doctor || {
    doctorName: 'MD. NADIM KHAN',
    coachTitle: 'CERTIFIED SPORTS NUTRITIONIST & CLINICAL COACH',
    degrees: 'ISSA Master Trainer | Advanced Dietetics & Metabolic Conditioning',
    clinicHospitalName: 'PRO-FIT CLINICAL METABOLIC CENTER',
    clinicAddress: 'Middle Badda, Dhaka, Bangladesh',
    contactNumber: '+880 1850085185',
    email: 'nadimhasan83292@gmail.com',
    prescriptionId: '#PRF-2026',
    consultationHours: 'Sat - Thu | 10:00 AM - 08:00 PM',
  };

  const advice = plan?.advice || {
    waterLiters: 3.0,
    waterScheduleNote: '',
    physicalActivity: '',
    sleepHours: '',
    prohibitedFoods: [],
    recommendedFoods: [],
    clinicalInstructions: '',
    followUpDate: '',
  };

  const slots = Array.isArray(plan?.slots) ? plan.slots : [];
  const totals = sumSlotNutrition(slots);

  const prohibitedList = Array.isArray(advice.prohibitedFoods) ? advice.prohibitedFoods : [];
  const recommendedList = Array.isArray(advice.recommendedFoods) ? advice.recommendedFoods : [];
  const hasAdviceNotes = Boolean(
    advice.waterLiters ||
    advice.physicalActivity ||
    advice.sleepHours ||
    prohibitedList.length > 0 ||
    recommendedList.length > 0 ||
    advice.clinicalInstructions
  );

  // Format date nicely (e.g. 9/29/2026)
  const displayDate = React.useMemo(() => {
    if (!plan?.prescriptionDate) {
      const d = new Date();
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }
    const parts = plan.prescriptionDate.split('-');
    if (parts.length === 3) {
      return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}/${parts[0]}`;
    }
    return plan.prescriptionDate;
  }, [plan?.prescriptionDate]);

  return (
    <div className="relative w-full max-w-[820px] mx-auto font-sans">
      {/* Top Clip on Screen (hidden on print) */}
      <div 
        className="no-print mx-auto w-28 h-5 rounded-b-md skeuo-clip flex items-center justify-center gap-2 relative z-10 shadow-md -mb-2 select-none"
        aria-hidden="true"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-600 shadow-inner" />
        <span className="text-[8px] uppercase tracking-widest font-mono font-bold text-slate-200">
          PRO-FIT RX
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-600 shadow-inner" />
      </div>

      {/* Main Prescription Card (Exactly matching the user's reference report) */}
      <div
        id={elementId}
        className={`print-prescription-root bg-white text-slate-800 mx-auto w-full max-w-[820px] rounded-xl sm:rounded-2xl border border-slate-200 ${
          hideShadow ? '' : 'shadow-xl shadow-slate-200/70'
        } p-3.5 sm:p-8 flex flex-col justify-between`}
        style={{ 
          minHeight: '1050px',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff'
        }}
      >
        <div>
          {/* ========================================================================= */}
          {/* 1. TOP HEADER: Apple Logo + Doctor Info + Patient Profile Photo Box        */}
          {/* ========================================================================= */}
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            {/* Left: Green Apple Logo & Professional Titles */}
            <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
              {/* Vibrant Green Apple Vector Icon */}
              <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 mt-0.5">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xs">
                  {/* Stem and Leaf */}
                  <path
                    d="M 50 22 C 50 14, 55 8, 62 6"
                    stroke="#5c3818"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 52 14 C 62 10, 72 14, 74 22 C 64 24, 56 20, 52 14 Z"
                    fill="#4ade80"
                    stroke="#16a34a"
                    strokeWidth="1.5"
                  />
                  {/* Apple Body with rich fresh green gradient */}
                  <defs>
                    <linearGradient id="appleGradient" x1="20%" y1="20%" x2="80%" y2="90%">
                      <stop offset="0%" stopColor="#86efac" />
                      <stop offset="45%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#15803d" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 28 C 42 22, 24 22, 18 34 C 10 50, 16 78, 38 88 C 44 91, 48 89, 50 87 C 52 89, 56 91, 62 88 C 84 78, 90 50, 82 34 C 76 22, 58 22, 50 28 Z"
                    fill="url(#appleGradient)"
                  />
                  {/* Glossy highlight */}
                  <path
                    d="M 28 35 C 22 45, 23 60, 27 68"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                </svg>
              </div>

              {/* Doctor / Coach Typography */}
              <div className="min-w-0">
                <h1 className="text-base sm:text-2xl font-black tracking-tight text-[#1d4ed8] uppercase leading-none font-sans truncate sm:overflow-visible">
                  {doctor.doctorName || 'MD. NADIM KHAN'}
                </h1>
                <p className="text-[10px] sm:text-[13px] font-extrabold tracking-wide text-[#059669] uppercase mt-1 leading-tight">
                  {doctor.coachTitle || 'CERTIFIED SPORTS NUTRITIONIST & CLINICAL COACH'}
                </p>
                <p className="text-[8.5px] sm:text-[11px] text-slate-500 font-medium mt-0.5 tracking-tight leading-tight">
                  {doctor.degrees || 'ISSA Master Trainer | Advanced Dietetics & Metabolic Conditioning'}
                </p>
              </div>
            </div>

            {/* Right: Patient Profile Box & ID */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="text-right">
                <div className="text-[8px] sm:text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-tight">
                  PATIENT PROFILE
                </div>
                <div className="text-[11px] sm:text-sm font-bold text-slate-800 font-mono tracking-tight mt-0.5">
                  ID: {doctor.prescriptionId || '#PRF-2026'}
                </div>
              </div>

              {/* Photo Box: photo if uploaded, otherwise neat "Photo" frame like reference */}
              <div className="w-12 h-14 sm:w-16 sm:h-18 rounded-lg border-2 border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50/80 shadow-2xs">
                {patient.photoUrl ? (
                  <img
                    src={patient.photoUrl}
                    alt={patient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 select-none">
                    Photo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Horizontal Blue Dividing Line (exact match) */}
          <div className="w-full h-[2px] sm:h-[2.5px] bg-[#3b82f6] rounded-full my-2.5 sm:my-3.5" />

          {/* ========================================================================= */}
          {/* 2. PATIENT INFO CARD: PATIENT NAME, AGE/SEX, DATE & Rx. SYMBOL            */}
          {/* ========================================================================= */}
          <div className="bg-[#f8fafc] border border-slate-200/90 rounded-xl p-2.5 sm:px-5 sm:py-3.5 mb-3.5 sm:mb-5 flex items-center justify-between gap-2">
            {/* Left: Name and Age/Sex */}
            <div className="space-y-0.5 sm:space-y-1 min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
                  PATIENT NAME:
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 font-sans truncate">
                  {patient.name || 'Asif'}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
                  AGE / SEX:
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 font-sans">
                  {patient.age || 15} Years / {patient.gender === 'female' ? 'Female' : 'Male'}
                  {patient.weightKg ? ` · ${patient.weightKg} kg` : ''}
                </span>
              </div>
            </div>

            {/* Right: Date & Classic Blue Rx. */}
            <div className="text-right shrink-0">
              <div className="text-[10px] sm:text-xs font-bold text-slate-700 font-mono tracking-wide">
                DATE: {displayDate}
              </div>
              <div className="text-xl sm:text-3xl font-black font-serif italic text-[#2563eb] leading-tight tracking-tight mt-0.5 pr-0.5 sm:pr-1">
                Rx.
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. SECTION TITLE: PRESCRIBED NUTRITIONAL PLAN & MEAL BREAKDOWN            */}
          {/* ========================================================================= */}
          <h2 className="text-[11px] sm:text-[13px] font-black uppercase tracking-wider text-[#1e40af] mb-1.5 sm:mb-2 font-sans">
            PRESCRIBED NUTRITIONAL PLAN & MEAL BREAKDOWN
          </h2>

          {/* ========================================================================= */}
          {/* 4. MEAL BREAKDOWN TABLE (WITH RESPONSIVE HORIZONTAL SCROLL ON PHONE)      */}
          {/* ========================================================================= */}
          <div className="w-full rounded-xl border border-slate-200 bg-white mb-3.5 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto touch-pan-x">
              <div className="min-w-[550px] sm:min-w-full">
                {/* Table Header Row (Soft Light Blue background with colored nutrient headers) */}
                <div className="bg-[#e0f2fe] px-3 py-2 flex items-center text-xs font-black uppercase tracking-wider border-b border-slate-200">
                  <div className="w-[28%] text-left text-[#0369a1] pl-1">
                    Meal Timing
                  </div>
                  <div className="w-[30%] text-left text-[#0369a1]">
                    Food Item
                  </div>
                  <div className="w-[14%] text-center text-[#0369a1]">
                    Quantity
                  </div>
                  <div className="w-[10%] text-center text-[#0284c7]">
                    Calories
                  </div>
                  <div className="w-[6%] text-center text-[#059669]">
                    Protein
                  </div>
                  <div className="w-[6%] text-center text-[#d97706]">
                    Carbs
                  </div>
                  <div className="w-[6%] text-center text-[#e11d48] pr-1">
                    Fat
                  </div>
                </div>

                {/* Table Rows Grouped by Meal Slot */}
                <div className="divide-y divide-slate-100 text-xs">
                  {slots.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 italic text-xs">
                      No meals prescribed yet.
                    </div>
                  ) : (
                    slots.map((slot, sIdx) => {
                      const items = Array.isArray(slot.items) ? slot.items : [];
                      if (items.length === 0) {
                        return (
                          <div key={slot.id || sIdx} className="px-3 py-2.5 flex items-center hover:bg-slate-50/50">
                            <div className="w-[28%] text-left pl-1 font-bold text-[#1e3a8a]">
                              {slot.title || `Meal ${sIdx + 1}`}
                              {slot.timeWindow && (
                                <span className="block text-[10px] font-normal text-slate-500 font-mono">
                                  {slot.timeWindow}
                                </span>
                              )}
                            </div>
                            <div className="w-[72%] text-slate-400 italic text-[11px]">
                              No food items added.
                            </div>
                          </div>
                        );
                      }

                      return items.map((item, iIdx) => (
                        <div
                          key={item.id || `${sIdx}-${iIdx}`}
                          className={`px-3 py-2 flex items-center hover:bg-slate-50/60 transition-colors ${
                            iIdx === 0 && sIdx !== 0 ? 'border-t border-slate-100' : ''
                          }`}
                        >
                          {/* Meal Timing (Show title on first item of each slot) */}
                          <div className="w-[28%] text-left pl-1">
                            {iIdx === 0 ? (
                              <div>
                                <span className="font-extrabold text-[#1e3a8a] text-[12px] block leading-tight">
                                  {slot.title || `Meal ${sIdx + 1}`}
                                </span>
                                {slot.timeWindow && (
                                  <span className="text-[10px] font-semibold text-slate-500 font-mono">
                                    {slot.timeWindow}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 select-none pl-2">↳</span>
                            )}
                          </div>

                          {/* Food Item Name */}
                          <div className="w-[30%] text-left font-bold text-slate-800 text-[12px]">
                            <span>{item.name}</span>
                            {item.notes && (
                              <span className="block text-[10px] font-normal text-slate-500 italic leading-tight">
                                ({item.notes})
                              </span>
                            )}
                          </div>

                          {/* Quantity / Weight in grams */}
                          <div className="w-[14%] text-center font-mono font-bold text-slate-700 text-[11px]">
                            {item.grams ? `${item.grams}g` : item.portion || '1 serving'}
                          </div>

                          {/* Calories (Blue) */}
                          <div className="w-[10%] text-center font-mono font-bold text-[#0284c7] text-[11px]">
                            {item.calories} <span className="text-[9px] font-normal text-slate-400">kcal</span>
                          </div>

                          {/* Protein (Green) */}
                          <div className="w-[6%] text-center font-mono font-bold text-[#059669] text-[11px]">
                            {item.protein}g
                          </div>

                          {/* Carbs (Amber) */}
                          <div className="w-[6%] text-center font-mono font-bold text-[#d97706] text-[11px]">
                            {item.carbs}g
                          </div>

                          {/* Fat (Rose) */}
                          <div className="w-[6%] text-center font-mono font-bold text-[#e11d48] text-[11px] pr-1">
                            {item.fat}g
                          </div>
                        </div>
                      ));
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Mobile swipe hint banner (hidden on desktop and print) */}
            <div className="sm:hidden no-print text-[9.5px] text-slate-500 bg-slate-50 px-2.5 py-1 text-center font-medium border-t border-slate-100 flex items-center justify-center gap-1 select-none">
              <span>👉 বাম-ডানে সোয়াইপ করে সম্পূর্ণ ম্যাক্রো ও গ্রাম দেখুন</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. DAILY MACRO SUMMARY TARGET BANNER (Exact light-mint styling)           */}
          {/* ========================================================================= */}
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-4 py-2.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="text-xs font-black uppercase tracking-wider text-[#059669] shrink-0 font-sans">
              DAILY MACRO SUMMARY TARGET:
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-800 font-sans">
              <div className="flex items-center gap-1 font-bold">
                <span>🔥</span>
                <span>Total Calories:</span>
                <span className="font-mono text-[#0284c7] font-black">{totals.totalCalories} kcal</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">|</span>

              <div className="flex items-center gap-1 font-bold">
                <span>🥩</span>
                <span>Protein:</span>
                <span className="font-mono text-[#059669] font-black">{totals.totalProtein}g</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">|</span>

              <div className="flex items-center gap-1 font-bold">
                <span>🌾</span>
                <span>Carbs:</span>
                <span className="font-mono text-[#d97706] font-black">{totals.totalCarbs}g</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">|</span>

              <div className="flex items-center gap-1 font-bold">
                <span>🥑</span>
                <span>Fat:</span>
                <span className="font-mono text-[#e11d48] font-black">{totals.totalFat}g</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. CLINICAL INSTRUCTIONS & LIFESTYLE GUIDANCE (Compact & Professional)     */}
          {/* ========================================================================= */}
          {hasAdviceNotes && (
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-2.5 sm:p-3 mb-3.5 sm:mb-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                {advice.waterLiters ? (
                  <div className="bg-white border border-blue-100 rounded-lg p-2 shadow-2xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-blue-900">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>Water Target:</span>
                    </div>
                    <p className="font-mono font-bold text-xs text-blue-700 mt-0.5">
                      {advice.waterLiters} L / Day
                    </p>
                    {advice.waterScheduleNote && (
                      <p className="text-[9px] text-slate-500 leading-tight truncate mt-0.5">
                        {advice.waterScheduleNote}
                      </p>
                    )}
                  </div>
                ) : null}

                {advice.physicalActivity ? (
                  <div className="bg-white border border-emerald-100 rounded-lg p-2 shadow-2xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900">
                      <Heart className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Activity / Cardio:</span>
                    </div>
                    <p className="font-medium text-[11px] text-slate-800 mt-0.5 leading-tight truncate">
                      {advice.physicalActivity}
                    </p>
                  </div>
                ) : null}

                {advice.sleepHours ? (
                  <div className="bg-white border border-indigo-100 rounded-lg p-2 shadow-2xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900">
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sleep Rest:</span>
                    </div>
                    <p className="font-medium text-[11px] text-slate-800 mt-0.5 leading-tight">
                      {advice.sleepHours}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Prohibited & Recommended Tags */}
              {(prohibitedList.length > 0 || recommendedList.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-200">
                  {prohibitedList.length > 0 && (
                    <div className="text-rose-900">
                      <span className="font-bold flex items-center gap-1 mb-0.5 text-rose-700">
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                        Avoid / বর্জনীয়:
                      </span>
                      <p className="text-slate-600 truncate">
                        {prohibitedList.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  )}

                  {recommendedList.length > 0 && (
                    <div className="text-emerald-900">
                      <span className="font-bold flex items-center gap-1 mb-0.5 text-emerald-700">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        Recommended / উপকারী:
                      </span>
                      <p className="text-slate-600 truncate">
                        {recommendedList.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {advice.clinicalInstructions && (
                <p className="mt-1.5 pt-1 border-t border-slate-200 text-[10px] text-slate-600 italic">
                  <strong className="text-slate-800 not-italic">Coach Note:</strong> {advice.clinicalInstructions}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 7. FOOTER: Center Details, Contact, Address & Consultation Hours           */}
        {/* ========================================================================= */}
        <div className="mt-auto pt-4 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-xs">
          {/* Left: Center Name and Contact Information */}
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 uppercase tracking-wide text-xs">
              {doctor.clinicHospitalName || 'PRO-FIT CLINICAL METABOLIC CENTER'}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                <strong className="font-mono text-slate-800">{doctor.contactNumber || '+880 1850085185'}</strong>
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-600" />
                <span>Email: <strong className="text-slate-800 font-sans">{doctor.email || 'nadimhasan83292@gmail.com'}</strong></span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{doctor.clinicAddress || 'Middle Badda, Dhaka, Bangladesh'}</span>
            </div>
          </div>

          {/* Right: Consultation Hours */}
          <div className="text-left sm:text-right text-[11px] text-slate-600">
            <div className="font-bold text-slate-700">
              Consultation Hours: Sat - Thu
            </div>
            <div className="font-mono font-semibold text-slate-800 mt-0.5">
              10:00 AM - 08:00 PM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
