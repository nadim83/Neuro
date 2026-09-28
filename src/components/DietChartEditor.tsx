import React, { useState, useRef } from 'react';
import { DietPlan, MealSlot, MealItem, ClientHistoryRecord } from '../types/diet';
import { sumSlotNutrition } from '../utils/nutritionCalculators';
import { calculateMacrosForGrams } from '../data/foodLibrary';
import { FoodLibraryModal } from './FoodLibraryModal';
import { 
  Plus, 
  Trash2, 
  Clock, 
  User, 
  Upload, 
  Camera, 
  Scale, 
  FileCheck2, 
  History, 
  ArrowRight,
  Download,
  Droplets,
  Moon,
  AlertTriangle,
  CheckCircle2,
  Activity,
  FileText,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface DietChartEditorProps {
  plan: DietPlan;
  onChangePlan: (updatedPlan: DietPlan) => void;
  onApplyTemplate: (templatePlan: DietPlan) => void;
  onGeneratePrescription: () => void;
  clientHistory: ClientHistoryRecord[];
  onDeleteHistoryItem: (id: string) => void;
  onLoadHistoryPlan: (record: ClientHistoryRecord) => void;
  onDownloadHistoryPDF: (record: ClientHistoryRecord) => void;
}

export const DietChartEditor: React.FC<DietChartEditorProps> = ({
  plan,
  onChangePlan,
  onGeneratePrescription,
  clientHistory,
  onDeleteHistoryItem,
  onLoadHistoryPlan,
  onDownloadHistoryPDF,
}) => {
  // Modal for Food Library
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);

  // Buffer text inputs for custom prohibited/recommended additions
  const [newProhibitedText, setNewProhibitedText] = useState('');
  const [newRecommendedText, setNewRecommendedText] = useState('');

  // File input ref for client image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const patient = plan?.patient || { name: '', age: 30, primaryGoal: '' };
  const doctor = plan?.doctor || { doctorName: '' };
  const slots = Array.isArray(plan?.slots) ? plan.slots : [];
  const prohibitedFoods = Array.isArray(advice.prohibitedFoods) ? advice.prohibitedFoods : [];
  const recommendedFoods = Array.isArray(advice.recommendedFoods) ? advice.recommendedFoods : [];

  const totals = sumSlotNutrition(slots);

  // Client image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ছবিটি ৫ মেগাবাইটের চেয়ে ছোট হতে হবে (Image size exceeds 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      onChangePlan({
        ...plan,
        patient: {
          ...plan.patient,
          photoUrl: base64Url,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onChangePlan({
      ...plan,
      patient: {
        ...plan.patient,
        photoUrl: undefined,
      },
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Patient field updater
  const updatePatient = (field: keyof DietPlan['patient'], value: any) => {
    onChangePlan({
      ...plan,
      patient: { ...plan.patient, [field]: value },
    });
  };

  // Doctor/Coach field updater
  const updateDoctor = (field: keyof DietPlan['doctor'], value: string) => {
    onChangePlan({
      ...plan,
      doctor: { ...plan.doctor, [field]: value },
    });
  };

  // Advice field updater
  const updateAdvice = (field: keyof DietPlan['advice'], value: any) => {
    onChangePlan({
      ...plan,
      advice: { ...advice, [field]: value },
    });
  };

  // Slot handlers
  const handleAddSlot = () => {
    const newSlot: MealSlot = {
      id: `slot-${Date.now()}`,
      title: 'New Meal Window',
      bengaliTitle: 'নতুন খাবার সময়',
      timeWindow: '12:00 PM - 12:30 PM',
      items: [],
      clinicalNote: '',
    };
    onChangePlan({
      ...plan,
      slots: [...slots, newSlot],
    });
  };

  const handleDeleteSlot = (slotIndex: number) => {
    const newSlots = slots.filter((_, idx) => idx !== slotIndex);
    onChangePlan({ ...plan, slots: newSlots });
  };

  const handleUpdateSlotField = (slotIndex: number, field: keyof MealSlot, value: string) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
    onChangePlan({ ...plan, slots: newSlots });
  };

  // Item handlers
  const handleOpenLibraryForSlot = (slotIndex: number) => {
    setSelectedSlotIndex(slotIndex);
    setIsLibraryOpen(true);
  };

  const handleAddItemToSlot = (item: MealItem) => {
    const newSlots = [...slots];
    const targetSlot = newSlots[selectedSlotIndex];
    if (targetSlot) {
      targetSlot.items = [...(targetSlot.items || []), item];
      onChangePlan({ ...plan, slots: newSlots });
    }
  };

  const handleDeleteItem = (slotIndex: number, itemIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex].items = (newSlots[slotIndex]?.items || []).filter((_, idx) => idx !== itemIndex);
    onChangePlan({ ...plan, slots: newSlots });
  };

  // Real-time Gram re-calculator in row
  const handleUpdateItemGrams = (slotIndex: number, itemIndex: number, newGrams: number) => {
    const safeGrams = Math.max(1, newGrams || 1);
    const newSlots = [...slots];
    const currentItem = newSlots[slotIndex].items[itemIndex];
    if (!currentItem) return;

    const baseCal = currentItem.baseCaloriesPer100g ?? (currentItem.calories / (currentItem.grams || 100)) * 100;
    const baseP = currentItem.baseProteinPer100g ?? (currentItem.protein / (currentItem.grams || 100)) * 100;
    const baseC = currentItem.baseCarbsPer100g ?? (currentItem.carbs / (currentItem.grams || 100)) * 100;
    const baseF = currentItem.baseFatPer100g ?? (currentItem.fat / (currentItem.grams || 100)) * 100;

    const recalculated = calculateMacrosForGrams(baseCal, baseP, baseC, baseF, safeGrams);

    newSlots[slotIndex].items[itemIndex] = {
      ...currentItem,
      grams: safeGrams,
      portion: `${safeGrams}g`,
      calories: recalculated.calories,
      protein: recalculated.protein,
      carbs: recalculated.carbs,
      fat: recalculated.fat,
      baseCaloriesPer100g: baseCal,
      baseProteinPer100g: baseP,
      baseCarbsPer100g: baseC,
      baseFatPer100g: baseF,
    };

    onChangePlan({ ...plan, slots: newSlots });
  };

  const handleUpdateItemName = (slotIndex: number, itemIndex: number, name: string) => {
    const newSlots = [...slots];
    if (!newSlots[slotIndex]?.items[itemIndex]) return;
    newSlots[slotIndex].items[itemIndex] = {
      ...newSlots[slotIndex].items[itemIndex],
      name,
    };
    onChangePlan({ ...plan, slots: newSlots });
  };

  // Prohibited & Recommended tag handlers
  const handleAddProhibited = () => {
    if (!newProhibitedText.trim()) return;
    onChangePlan({
      ...plan,
      advice: {
        ...advice,
        prohibitedFoods: [...prohibitedFoods, newProhibitedText.trim()],
      },
    });
    setNewProhibitedText('');
  };

  const handleRemoveProhibited = (index: number) => {
    const updated = prohibitedFoods.filter((_, i) => i !== index);
    onChangePlan({
      ...plan,
      advice: { ...advice, prohibitedFoods: updated },
    });
  };

  const handleAddRecommended = () => {
    if (!newRecommendedText.trim()) return;
    onChangePlan({
      ...plan,
      advice: {
        ...advice,
        recommendedFoods: [...recommendedFoods, newRecommendedText.trim()],
      },
    });
    setNewRecommendedText('');
  };

  const handleRemoveRecommended = (index: number) => {
    const updated = recommendedFoods.filter((_, i) => i !== index);
    onChangePlan({
      ...plan,
      advice: { ...advice, recommendedFoods: updated },
    });
  };

  // 1-Click Valo Instruction Presets
  const applyInstructionPreset = (presetType: 'fatloss' | 'diabetes' | 'muscle' | 'healthy') => {
    if (presetType === 'fatloss') {
      onChangePlan({
        ...plan,
        advice: {
          ...plan.advice,
          waterLiters: 3.5,
          waterScheduleNote: 'প্রতিদিন ৩.৫ থেকে ৪ লিটার বিশুদ্ধ পানি পান করবেন। খাবার খাওয়ার ৩০ মিনিট আগে পানি পান করুন, খাওয়ার মাঝে বা ঠিক পরে পানি পান করবেন না।',
          sleepHours: 'রাতে ৭-৮ ঘণ্টা নিয়মিত পর্যাপ্ত ঘুম',
          physicalActivity: 'প্রতিদিন সকালে বা বিকালে অন্তত ৪৫ মিনিট দ্রুত হাঁটা (Brisk Walking) বা কার্ডিও।',
          prohibitedFoods: [
            'অতিরিক্ত চিনি, মিষ্টি ও কোল্ড ড্রিংকস',
            'ডুবো তেলে ভাজা খাবার ও ফাস্টফুড',
            'ময়দা ও বেকারি প্যাকেটজাত স্ন্যাকস',
            'অতিরিক্ত লবণ ও চিপস',
            'দেরি করে রাতের ভারী খাবার'
          ],
          recommendedFoods: [
            'সবুজ শাকসবজি ও পর্যাপ্ত সালাদ',
            'সিদ্ধ ডিমের সাদা অংশ ও মুরগির বুকের মাংস',
            'চিয়া সিডস ও ইসুবগুলের ভুসি',
            'টক দই ও গ্রিন টি',
            'লেবু পানি ও শসা'
          ],
          clinicalInstructions: 'ডায়েট চার্টটি নিষ্ঠার সাথে মেনে চলুন। কোনো প্রধান মিল স্কিপ করবেন না। রাতে ঘুমানোর অন্তত ২ ঘণ্টা আগে রাতের খাবার শেষ করুন।',
        }
      });
    } else if (presetType === 'diabetes') {
      onChangePlan({
        ...plan,
        advice: {
          ...plan.advice,
          waterLiters: 3.0,
          waterScheduleNote: 'প্রতিদিন ৩ লিটার পানি। সকালে খালি পেটে মেথি ভেজানো পানি পান করতে পারেন।',
          sleepHours: 'রাতে ৭-৮ ঘণ্টা পর্যাপ্ত ঘুম',
          physicalActivity: 'প্রতিটি প্রধান খাবারের পর ১৫ মিনিট ধীর গতিতে হাঁটা এবং সকালে ৩০ মিনিট brisk walking।',
          prohibitedFoods: [
            'চিনি, গুড়, মধু ও মিষ্টি পানীয়',
            'সাদা চাল ও ময়দার খাবার',
            'অতিরিক্ত মিষ্টি ফল ও আলুর পদ',
            'প্যাকেটজাত ফলের জুস',
            'ডালডা ও ঘি-তে ভাজা খাবার'
          ],
          recommendedFoods: [
            'লাল চাল ও ওটস',
            'করলা, মেথি ও সবুজ শাক',
            'ডাল ও কাঁচা শসা-টমেটো সালাদ',
            'কাঠবাদাম ও আখরোট',
            'টক ফল (পেয়ারা, আমলকী, জাম্বুরা)'
          ],
          clinicalInstructions: 'নিয়মিত ব্লাড সুগার মনিটর করুন। খাবার নির্দিষ্ট সময়ে গ্রহণ করবেন, দীর্ঘক্ষণ না খেয়ে থাকবেন না।',
        }
      });
    } else if (presetType === 'muscle') {
      onChangePlan({
        ...plan,
        advice: {
          ...plan.advice,
          waterLiters: 4.0,
          waterScheduleNote: 'প্রতিদিন ৪ লিটার পানি। ওয়ার্কআউটের সময় এবং সারাদিনে পর্যাপ্ত হাইড্রেটেড থাকুন।',
          sleepHours: 'রাতে ৮ ঘণ্টা গভীর ঘুম (মাসল রিকভারির জন্য অপরিহার্য)',
          physicalActivity: 'সপ্তাহে ৪-৫ দিন প্রগ্রেসিভ ওয়েট ট্রেনিং ও স্ট্রেচিং ব্যায়াম।',
          prohibitedFoods: [
            'অ্যালকোহল ও ধূমপান',
            'অতিরিক্ত চিনিযুক্ত খাবার ও কোমল পানীয়',
            'তেলে ভাজা জাঙ্ক ফুড',
            'প্রসেসড মাংস ও অতিরিক্ত সোডা'
          ],
          recommendedFoods: [
            'সিদ্ধ ডিম (কুসুমসহ ও সাদা অংশ)',
            'মুরগির মাংস, মাছ ও ছানা',
            'ওটস, কলা ও চিনাবাদাম',
            'মিষ্টি আলু ও ব্রাউন রাইস',
            'দুধ ও চিয়া সিড'
          ],
          clinicalInstructions: 'প্রতিটি মিলে পর্যাপ্ত প্রোটিন নিশ্চিত করুন। ওয়ার্কআউটের ৩০-৪৫ মিনিটের মধ্যে প্রোটিন সমৃদ্ধ খাবার বা শেক গ্রহণ করুন।',
        }
      });
    } else {
      onChangePlan({
        ...plan,
        advice: {
          ...plan.advice,
          waterLiters: 3.0,
          waterScheduleNote: 'প্রতিদিন ৩ লিটার পানি। সকালে ঘুম থেকে উঠে এক গ্লাস কুসুম গরম পানি পান করুন।',
          sleepHours: 'রাতে ৭-৮ ঘণ্টা নিরবচ্ছিন্ন ঘুম',
          physicalActivity: 'প্রতিদিন ৩০-৪০ মিনিট হাঁটা, ফ্রি-হ্যান্ড এক্সারসাইজ বা ইয়োগা।',
          prohibitedFoods: [
            'অতিরিক্ত তেল ও ঝাল-মশলাযুক্ত খাবার',
            'রাস্তার অস্বাস্থ্যকর খোলা খাবার',
            'অতিরিক্ত চা/কফি ও কোল্ড ড্রিংকস',
            'প্রিজারভেটিভযুক্ত প্যাকেট খাবার'
          ],
          recommendedFoods: [
            'মৌসুমি তাজা ফল ও রঙিন শাকসবজি',
            'ঘরে তৈরি টাটকা পুষ্টিকর খাবার',
            'বাদাম ও বীজ',
            'পর্যাপ্ত লেবু ও টক দই'
          ],
          clinicalInstructions: 'খাবার সময়মত গ্রহণ করুন এবং ধীরে চিবিয়ে খান। হাসিখুশি থাকুন ও মানসিক চাপ মুক্ত জীবনযাপন করুন।',
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. CLIENT IMAGE UPLOAD + CLIENT NAME & COACH NAME                         */}
      {/* ========================================================================= */}
      <section className="skeuo-panel rounded-lg p-5 sm:p-6 shadow-md border border-[#c9c1b3] space-y-5">
        <div className="flex items-center gap-2 border-b border-[#ded7cc] pb-3">
          <User className="w-5 h-5 text-emerald-800" />
          <h2 className="text-base font-bold text-slate-900">
            Client & Coach Information (ক্লায়েন্ট ও কোচের তথ্য)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* CLIENT PHOTO UPLOAD */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="w-full max-w-[220px] skeuo-card p-3 rounded-md flex flex-col items-center border border-[#d6cfc5] shadow-md bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                Client Photo (ক্লায়েন্টের ছবি)
              </span>

              {/* Photo Area */}
              <div className="relative w-36 h-40 bg-[#f4f0e8] border-2 border-dashed border-[#b8b0a2] rounded flex flex-col items-center justify-center overflow-hidden shadow-inner">
                {plan.patient.photoUrl ? (
                  <>
                    <img
                      src={plan.patient.photoUrl}
                      alt={plan.patient.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      title="Remove Photo"
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-700 hover:bg-rose-800 text-white rounded-full flex items-center justify-center text-xs shadow-md cursor-pointer"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-3 text-slate-500">
                    <Camera className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[11px] font-medium leading-tight text-slate-700">No Photo</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG / PNG</span>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="w-full mt-3 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-3 skeuo-button rounded text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{plan.patient.photoUrl ? 'Change Photo (ছবি পরিবর্তন)' : 'Upload Photo (ছবি আপলোড)'}</span>
                </button>
                {plan.patient.photoUrl && (
                  <span className="text-[10px] text-emerald-800 text-center font-medium">
                    ✓ Photo will appear on PDF prescription
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CLIENT NAME & COACH NAME INPUTS */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label className="block text-slate-800 font-bold text-xs uppercase tracking-wide mb-1.5">
                Client / Patient Name (ক্লায়েন্টের নাম) *
              </label>
              <input
                type="text"
                required
                value={plan.patient.name}
                onChange={(e) => updatePatient('name', e.target.value)}
                placeholder="ক্লায়েন্টের নাম লিখুন (e.g. Farzana Begum / Mohammad Rafiqul)"
                className="w-full px-3.5 py-2.5 skeuo-inset rounded-md text-slate-900 font-bold text-sm focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold text-xs uppercase tracking-wide mb-1.5">
                Coach / Nutritionist Name (নিউট্রিশনিস্ট / কোচের নাম) *
              </label>
              <input
                type="text"
                required
                value={plan.doctor.doctorName}
                onChange={(e) => updateDoctor('doctorName', e.target.value)}
                placeholder="কোচের নাম লিখুন (e.g. Dr. Nusrat Jahan / Coach Tanvir)"
                className="w-full px-3.5 py-2.5 skeuo-inset rounded-md text-slate-900 font-bold text-sm focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">
                  Primary Goal / Target (লক্ষ্য)
                </label>
                <input
                  type="text"
                  value={plan.patient.primaryGoal}
                  onChange={(e) => updatePatient('primaryGoal', e.target.value)}
                  placeholder="e.g. Fat Loss / Muscle Gain / Diabetes Care"
                  className="w-full px-3 py-1.5 skeuo-inset rounded text-slate-900 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">
                  Target Daily Calories (দৈনিক ক্যালোরি লক্ষ্য)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={plan.targetCalories}
                    onChange={(e) => onChangePlan({ ...plan, targetCalories: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 skeuo-inset rounded font-mono-numbers text-slate-900 text-xs font-bold"
                  />
                  <span className="text-xs font-bold text-slate-600">kcal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CLIENT HISTORY (SAVED & PREVIOUSLY ISSUED CHARTS)                     */}
      {/* ========================================================================= */}
      <section className="skeuo-panel rounded-lg p-5 sm:p-6 shadow-md border border-[#c9c1b3] space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-[#ded7cc] pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Client History (পূর্ববর্তী ক্লায়েন্ট হিস্টোরি)
              </h2>
              <p className="text-xs text-slate-600">
                যাদের জন্য চার্ট তৈরি করা হয়েছে তাদের নাম ও ছবি এখানে সংরক্ষিত থাকে। চাইলে লোড, পিডিএফ ডাউনলোড বা ডিলিট করতে পারবেন।
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-numbers font-bold px-2.5 py-1 rounded bg-[#ede7de] text-slate-800 border border-[#d6cfc5]">
            {clientHistory.length} Saved Clients
          </span>
        </div>

        {clientHistory.length === 0 ? (
          <div className="text-center py-7 bg-[#faf8f4] border border-dashed border-[#c8c1b3] rounded-md text-xs text-slate-500">
            এখনো কোনো ক্লায়েন্ট হিস্টোরি নেই। নিচে চার্ট এডিট করে পিডিএফ ডাউনলোড করলে স্বয়ংক্রিয়ভাবে এখানে সেভ হয়ে থাকবে।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clientHistory.map((record) => (
              <div
                key={record.id}
                className="skeuo-card rounded-md p-3.5 border border-[#d6cfc5] shadow-xs flex flex-col justify-between space-y-3 bg-white"
              >
                <div className="flex items-start gap-3">
                  {/* Client Avatar / Photo */}
                  <div className="shrink-0 w-12 h-14 bg-slate-100 border border-slate-300 rounded overflow-hidden shadow-2xs">
                    {record.clientPhotoUrl ? (
                      <img
                        src={record.clientPhotoUrl}
                        alt={record.clientName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-base bg-slate-200">
                        {record.clientName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">
                      {record.clientName}
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium truncate">
                      {record.primaryGoal || 'Custom Diet Plan'}
                    </p>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-mono-numbers font-semibold text-slate-700">
                        {record.targetCalories} kcal
                      </span>
                      <span>·</span>
                      <span>{record.createdAt.split('T')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#ded7cc] flex items-center justify-between gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => onLoadHistoryPlan(record)}
                    className="flex-1 py-1 px-2.5 skeuo-button rounded text-[11px] font-bold text-slate-800 hover:text-emerald-950 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Load (লোড)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDownloadHistoryPDF(record)}
                    title="Download Prescription PDF"
                    className="py-1 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(record.id)}
                    title="Delete record from history"
                    className="p-1.5 text-slate-400 hover:text-rose-700 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. MEAL EDIT OPTION (GRAMS-BASED REAL-TIME NUTRITION CALCULATION)          */}
      {/* ========================================================================= */}
      <section className="skeuo-panel rounded-lg p-5 sm:p-6 shadow-md border border-[#c9c1b3] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded7cc] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-800" />
              <h2 className="text-base font-bold text-slate-900">
                Meal Edit Option (খাবার তালিকা এডিট ও গ্রামের হিসাব)
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              খাবার যোগ করুন এবং গ্রাম (grams) পরিবর্তন করলে রিয়েল-টাইমে ক্যালোরি, প্রোটিন, কার্বস ও ফ্যাটের সঠিক হিসাব দেখাবে।
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSlot}
            className="skeuo-button py-1.5 px-3.5 rounded text-xs font-bold text-slate-900 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-800" />
            <span>+ Add Meal Time (নতুন খাবার সময়)</span>
          </button>
        </div>

        {/* Live Total Macro Energy Dashboard */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-[#f6fbf7] border border-emerald-300 rounded-md shadow-inner flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
              Total Charted Energy (মোট ক্যালোরি)
            </span>
            <span className="font-mono-numbers font-black text-emerald-950 text-xl">
              {totals.totalCalories}{' '}
              <span className="text-xs font-normal text-slate-600">
                / {plan.targetCalories} kcal Target
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Protein (প্রোটিন)</span>
              <span className="font-mono-numbers font-bold text-slate-900 text-sm">
                {totals.totalProtein}g
              </span>
            </div>
            <div className="border-l border-emerald-200 pl-4">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Carbs (কার্বস)</span>
              <span className="font-mono-numbers font-bold text-slate-900 text-sm">
                {totals.totalCarbs}g
              </span>
            </div>
            <div className="border-l border-emerald-200 pl-4">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Fat (ফ্যাট)</span>
              <span className="font-mono-numbers font-bold text-slate-900 text-sm">
                {totals.totalFat}g
              </span>
            </div>
          </div>
        </div>

        {/* Meal Slots List */}
        <div className="space-y-4">
          {plan.slots.map((slot, slotIndex) => {
            const slotCalories = slot.items.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
            const slotProtein = slot.items.reduce((acc, curr) => acc + (Number(curr.protein) || 0), 0);

            return (
              <div
                key={slot.id || slotIndex}
                className="skeuo-card rounded-md border border-[#c9c1b3] overflow-hidden bg-white shadow-xs"
              >
                {/* Slot Header Bar */}
                <div className="bg-[#ede8df] px-3 sm:px-3.5 py-2.5 border-b border-[#ded7cc] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono-numbers font-bold text-[11px] flex items-center justify-center shrink-0">
                      {slotIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={slot.title}
                      onChange={(e) => handleUpdateSlotField(slotIndex, 'title', e.target.value)}
                      placeholder="Meal Name (e.g. Breakfast / সকালের নাস্তা)"
                      className="px-2.5 py-1 font-bold text-slate-900 skeuo-inset rounded text-xs flex-1 sm:flex-none sm:w-48 min-w-[120px]"
                    />
                    <div className="flex items-center gap-1 text-slate-600 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <input
                        type="text"
                        value={slot.timeWindow}
                        onChange={(e) => handleUpdateSlotField(slotIndex, 'timeWindow', e.target.value)}
                        placeholder="08:30 AM - 09:00 AM"
                        className="px-2 py-1 text-slate-700 font-mono-numbers skeuo-inset rounded text-xs w-32 sm:w-36"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                    <span className="text-[10px] sm:text-[11px] font-mono-numbers font-bold text-slate-700 bg-white px-2 py-1 rounded border border-[#ded7cc] shadow-2xs">
                      {slotCalories} kcal · P: {Math.round(slotProtein * 10) / 10}g
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenLibraryForSlot(slotIndex)}
                        className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Food</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slotIndex)}
                        title="Delete Meal Slot"
                        className="p-1.5 text-slate-400 hover:text-rose-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items in Slot */}
                {slot.items.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-[#fbf9f6]">
                    এই খাবার সময়ে কোনো আইটেম নেই। &quot;+ Add Food&quot; বাটনে ক্লিক করে খাবার যুক্ত করুন।
                  </div>
                ) : (
                  <div className="overflow-x-auto touch-pan-x">
                    <table className="w-full min-w-[500px] sm:min-w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#eee] bg-[#f8f6f0] text-[11px] text-slate-600 font-bold">
                          <th className="py-2 px-3">Food Item Name (খাবারের নাম)</th>
                          <th className="py-2 px-3 w-32">Grams (গ্রাম)</th>
                          <th className="py-2 px-3 w-20 text-right">Calories</th>
                          <th className="py-2 px-3 w-16 text-right">Protein</th>
                          <th className="py-2 px-3 w-16 text-right">Carbs</th>
                          <th className="py-2 px-3 w-16 text-right">Fat</th>
                          <th className="py-2 px-2 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {slot.items.map((item, itemIndex) => (
                          <tr key={item.id || itemIndex} className="hover:bg-slate-50/60">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateItemName(slotIndex, itemIndex, e.target.value)}
                                className="w-full px-2 py-1 font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-hidden"
                              />
                            </td>

                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="1"
                                  max="5000"
                                  value={item.grams || 100}
                                  onChange={(e) =>
                                    handleUpdateItemGrams(slotIndex, itemIndex, Number(e.target.value))
                                  }
                                  className="w-20 px-2 py-1 skeuo-inset rounded font-mono-numbers text-slate-900 font-bold text-center"
                                />
                                <span className="text-[11px] font-bold text-slate-500">g</span>
                              </div>
                            </td>

                            <td className="py-2 px-3 text-right font-mono-numbers font-bold text-slate-900">
                              {item.calories} <span className="text-[10px] font-normal text-slate-500">kcal</span>
                            </td>

                            <td className="py-2 px-3 text-right font-mono-numbers text-slate-700">
                              {item.protein}g
                            </td>

                            <td className="py-2 px-3 text-right font-mono-numbers text-slate-700">
                              {item.carbs}g
                            </td>

                            <td className="py-2 px-3 text-right font-mono-numbers text-slate-700">
                              {item.fat}g
                            </td>

                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(slotIndex, itemIndex)}
                                className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete item"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. VALO INSTRUCTIONS (ভালো নির্দেশনাবলী / BEST GUIDELINES FOR CLIENT)     */}
      {/* ========================================================================= */}
      <section className="skeuo-panel rounded-lg p-5 sm:p-6 shadow-md border border-[#c9c1b3] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded7cc] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              <h2 className="text-base font-bold text-slate-900">
                Client Guidelines & Instructions (ভালো নির্দেশনাবলী)
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              প্রেসক্রিপশনে ক্লায়েন্টের জন্য পানি পানের পরিমাণ, ঘুম, ব্যায়াম, বর্জনীয় ও উপকারী খাবারের স্পষ্ট নিয়মাবলী যুক্ত করুন।
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600 mr-1">১-ক্লিক নির্দেশিকা:</span>
            <button
              type="button"
              onClick={() => applyInstructionPreset('fatloss')}
              className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded text-[11px] font-semibold cursor-pointer shadow-2xs"
            >
              Fat Loss
            </button>
            <button
              type="button"
              onClick={() => applyInstructionPreset('diabetes')}
              className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded text-[11px] font-semibold cursor-pointer shadow-2xs"
            >
              Diabetes
            </button>
            <button
              type="button"
              onClick={() => applyInstructionPreset('muscle')}
              className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 rounded text-[11px] font-semibold cursor-pointer shadow-2xs"
            >
              Muscle Gain
            </button>
            <button
              type="button"
              onClick={() => applyInstructionPreset('healthy')}
              className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 rounded text-[11px] font-semibold cursor-pointer shadow-2xs"
            >
              Healthy Life
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* WATER INTAKE */}
          <div className="p-3.5 bg-white rounded border border-[#d6cfc5] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Daily Water (পানি পানের নিয়ম)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={advice.waterLiters || 3.0}
                onChange={(e) => updateAdvice('waterLiters', Number(e.target.value))}
                className="w-18 px-2 py-1 skeuo-inset rounded font-mono-numbers text-slate-900 font-bold text-center"
              />
              <span className="text-xs font-bold text-slate-700">Liters / Day (লিটার)</span>
            </div>
            <textarea
              rows={2}
              value={advice.waterScheduleNote || ''}
              onChange={(e) => updateAdvice('waterScheduleNote', e.target.value)}
              placeholder="পানি পানের সময় বা বিশেষ নোট..."
              className="w-full px-2.5 py-1.5 skeuo-inset rounded text-[11px] text-slate-800"
            />
          </div>

          {/* SLEEP */}
          <div className="p-3.5 bg-white rounded border border-[#d6cfc5] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Sleep & Rest (ঘুম ও বিশ্রাম)</span>
            </div>
            <input
              type="text"
              value={advice.sleepHours || ''}
              onChange={(e) => updateAdvice('sleepHours', e.target.value)}
              placeholder="e.g. রাতে ৭-৮ ঘণ্টা নিয়মিত পর্যাপ্ত ঘুম"
              className="w-full px-2.5 py-1.5 skeuo-inset rounded text-xs font-semibold text-slate-900"
            />
            <p className="text-[10px] text-slate-500 leading-tight">
              নিয়মিত ঘুমের রুটিন শারীরিক হরমোন ব্যালেন্স এবং মেটাবলিজম ঠিক রাখতে সাহায্য করে।
            </p>
          </div>

          {/* PHYSICAL ACTIVITY */}
          <div className="p-3.5 bg-white rounded border border-[#d6cfc5] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Exercise & Walking (ব্যায়াম/হাঁটা)</span>
            </div>
            <input
              type="text"
              value={advice.physicalActivity || ''}
              onChange={(e) => updateAdvice('physicalActivity', e.target.value)}
              placeholder="e.g. প্রতিদিন ৩০-৪৫ মিনিট স্বাভাবিক হাঁটা বা ব্যায়াম"
              className="w-full px-2.5 py-1.5 skeuo-inset rounded text-xs text-slate-900"
            />
            <p className="text-[10px] text-slate-500 leading-tight">
              খাবারের পর হালকা হাঁটা এবং দৈনিক শরীরচর্চা হজমশক্তি বাড়ায়।
            </p>
          </div>
        </div>

        {/* PROHIBITED & RECOMMENDED FOODS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Strictly Prohibited */}
          <div className="p-3.5 bg-rose-50/50 rounded border border-rose-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-rose-950 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Strictly Avoid / Prohibited Foods (সম্পূর্ণ বর্জনীয় খাবার)</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="বর্জনীয় খাবার লিখুন (যেমন: কোল্ড ড্রিংকস, ফাস্টফুড)..."
                value={newProhibitedText}
                onChange={(e) => setNewProhibitedText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddProhibited()}
                className="flex-1 px-3 py-1.5 skeuo-inset rounded text-xs bg-white text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddProhibited}
                className="px-3 py-1.5 bg-rose-800 hover:bg-rose-900 text-white rounded text-xs font-bold cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {prohibitedFoods.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-rose-200 rounded text-xs text-rose-900 shadow-2xs"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProhibited(idx)}
                    className="text-slate-400 hover:text-rose-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Recommended & Beneficial Foods */}
          <div className="p-3.5 bg-emerald-50/50 rounded border border-emerald-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Recommended Foods (বিশেষ উপকারী খাবার ও অভ্যাস)</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="উপকারী খাবার লিখুন (যেমন: সবুজ শাকসবজি, ডিম, চিয়া সিড)..."
                value={newRecommendedText}
                onChange={(e) => setNewRecommendedText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRecommended()}
                className="flex-1 px-3 py-1.5 skeuo-inset rounded text-xs bg-white text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddRecommended}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-bold cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {recommendedFoods.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-emerald-200 rounded text-xs text-emerald-900 shadow-2xs"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecommended(idx)}
                    className="text-slate-400 hover:text-emerald-950 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Special Instructions & Coach Note */}
        <div>
          <label className="block text-slate-800 font-bold text-xs mb-1">
            Coach&apos;s Special Instructions & Notes (কোচের বিশেষ পরামর্শ)
          </label>
          <textarea
            rows={2}
            value={advice.clinicalInstructions || ''}
            onChange={(e) => updateAdvice('clinicalInstructions', e.target.value)}
            placeholder="ক্লায়েন্টের জন্য বিশেষ নির্দেশনা..."
            className="w-full px-3 py-2 skeuo-inset rounded text-slate-900 text-xs font-medium"
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. GENERATE PRESCRIPTION CHART & DOWNLOAD PDF BUTTON                      */}
      {/* ========================================================================= */}
      <div className="skeuo-panel rounded-lg p-5 sm:p-6 shadow-md border border-[#c9c1b3] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            চার্ট প্রস্তুত! ১ পেইজের প্রেসক্রিপশন ভিউ দেখুন ও ডাউনলোড করুন
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            নিচের বাটনে ক্লিক করলে ক্লায়েন্টের ছবি, নাম, কোচের নাম এবং পরিমাপকৃত গ্রামের খাবারের চার্টটি ঠিক ১ পেইজে সুন্দরভাবে তৈরি হবে।
          </p>
        </div>

        <button
          type="button"
          onClick={onGeneratePrescription}
          className="w-full sm:w-auto px-7 py-3.5 skeuo-button-emerald rounded-lg text-sm font-bold flex items-center justify-center gap-2.5 shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-[0.99] transition-all"
        >
          <FileCheck2 className="w-5 h-5 text-emerald-300" />
          <span>Generate 1-Page Chart (১ পেইজে চার্ট তৈরি করুন)</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Modal for adding from food library with gram calculator */}
      <FoodLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectFood={handleAddItemToSlot}
        targetSlotName={plan.slots[selectedSlotIndex]?.title || 'Meal Window'}
      />
    </div>
  );
};
