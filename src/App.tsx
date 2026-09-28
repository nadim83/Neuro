import React, { useState, useEffect } from 'react';
import { CLINICAL_TEMPLATES } from './data/templates';
import { DietPlan, ClientHistoryRecord } from './types/diet';
import { sanitizeDietPlan } from './utils/sanitizeDietPlan';
import { TopNav } from './components/TopNav';
import { DietChartEditor } from './components/DietChartEditor';
import { PrescriptionView } from './components/PrescriptionView';
import { MobileDownloadModal } from './components/MobileDownloadModal';
import { exportPrescriptionToPDF, triggerNativePrint, PDFExportResult } from './utils/pdfExport';
import { sumSlotNutrition } from './utils/nutritionCalculators';
import { 
  Download, 
  Printer, 
  Eye, 
  FileCheck2, 
  CheckCircle,
  ArrowLeft,
  Calendar,
  Sparkles,
  History
} from 'lucide-react';

const STORAGE_KEY = 'nutrirx_client_history_v2';

// Initial safe pre-seeded records (no external cross-origin images to prevent canvas tainting)
const INITIAL_SAMPLE_HISTORY: ClientHistoryRecord[] = [
  {
    id: 'hist-sample-1',
    clientName: 'Farzana Begum',
    clientPhotoUrl: undefined,
    createdAt: '2026-09-28T08:15:00.000Z',
    doctorName: 'Coach Tanvir Hossain',
    planTitle: 'Clinical Fat Loss & Body Composition Recomposition Diet Plan',
    targetCalories: 1400,
    patientAge: 34,
    patientWeight: 73,
    primaryGoal: 'Sustainable Fat Loss (-10 kg target)',
    dietPlan: CLINICAL_TEMPLATES[1].plan,
  },
  {
    id: 'hist-sample-2',
    clientName: 'Mohammad Rafiqul Islam',
    clientPhotoUrl: undefined,
    createdAt: '2026-09-27T10:30:00.000Z',
    doctorName: 'Dr. Nusrat Jahan, RD',
    planTitle: 'Clinical Glycemic Management & Metabolic Care Diet Chart',
    targetCalories: 1500,
    patientAge: 52,
    patientWeight: 78,
    primaryGoal: 'Type 2 Diabetes Management & Blood Glucose Stability',
    dietPlan: CLINICAL_TEMPLATES[0].plan,
  },
];

const DEFAULT_INITIAL_PLAN: DietPlan = {
  id: 'plan-nadim-khan-default',
  planTitle: 'Prescribed Nutritional Plan & Meal Breakdown',
  prescriptionDate: new Date().toISOString().split('T')[0],
  targetCalories: 1550,
  targetProtein: 85,
  targetCarbs: 180,
  targetFat: 42,
  patient: {
    name: 'Asif',
    age: 15,
    gender: 'male',
    heightCm: 165,
    weightKg: 58,
    bmi: 21.3,
    bmiCategory: 'Healthy Weight',
    bloodPressure: '118/76 mmHg',
    fastingSugar: '5.2 mmol/L',
    allergies: 'None',
    medicalConditions: 'None',
    primaryGoal: 'Sports Nutrition & Metabolic Conditioning',
    activityLevel: 'moderately_active',
  },
  doctor: {
    doctorName: 'MD. NADIM KHAN',
    coachTitle: 'CERTIFIED SPORTS NUTRITIONIST & CLINICAL COACH',
    degrees: 'ISSA Master Trainer | Advanced Dietetics & Metabolic Conditioning',
    specialization: 'Advanced Dietetics & Metabolic Conditioning',
    registrationNumber: '#PRF-2026',
    clinicHospitalName: 'PRO-FIT CLINICAL METABOLIC CENTER',
    clinicAddress: 'Middle Badda, Dhaka, Bangladesh',
    contactNumber: '+880 1850085185',
    email: 'nadimhasan83292@gmail.com',
    consultationDate: new Date().toISOString().split('T')[0],
    prescriptionId: '#PRF-2026',
    consultationHours: 'Sat - Thu | 10:00 AM - 08:00 PM',
  },
  slots: [
    {
      id: 'slot-1',
      title: 'Meal 1: Breakfast',
      timeWindow: '08:00 AM - 08:30 AM',
      items: [
        {
          id: 'item-1-1',
          name: 'Rice',
          portion: '1 cup',
          grams: 100,
          calories: 130,
          protein: 2.7,
          carbs: 28,
          fat: 0.3,
          notes: 'Boiled white or brown rice',
        },
        {
          id: 'item-1-2',
          name: 'Boiled Egg (Whole)',
          portion: '1 piece',
          grams: 50,
          calories: 78,
          protein: 6.3,
          carbs: 0.6,
          fat: 5.3,
          notes: 'High biological value protein',
        },
      ],
    },
    {
      id: 'slot-2',
      title: 'Meal 2: Lunch',
      timeWindow: '01:30 PM - 02:00 PM',
      items: [
        {
          id: 'item-2-1',
          name: 'Rice',
          portion: '1.5 cups',
          grams: 150,
          calories: 195,
          protein: 4.1,
          carbs: 42,
          fat: 0.5,
        },
        {
          id: 'item-2-2',
          name: 'Chicken Breast (Cooked)',
          portion: 'Medium piece',
          grams: 100,
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          notes: 'Skinless, light olive oil curry',
        },
        {
          id: 'item-2-3',
          name: 'Mixed Fresh Salad',
          portion: '1 bowl',
          grams: 100,
          calories: 25,
          protein: 1.2,
          carbs: 4.5,
          fat: 0.2,
          notes: 'Cucumber, tomato & lemon juice',
        },
      ],
    },
    {
      id: 'slot-3',
      title: 'Meal 3: Evening Snack',
      timeWindow: '05:30 PM - 06:00 PM',
      items: [
        {
          id: 'item-3-1',
          name: 'Green Apple / Seasonal Fruit',
          portion: '1 medium',
          grams: 120,
          calories: 62,
          protein: 0.4,
          carbs: 16,
          fat: 0.2,
        },
      ],
    },
    {
      id: 'slot-4',
      title: 'Meal 4: Dinner',
      timeWindow: '08:30 PM - 09:00 PM',
      items: [
        {
          id: 'item-4-1',
          name: 'Atta Roti (Handmade)',
          portion: '2 rotis',
          grams: 80,
          calories: 208,
          protein: 6.4,
          carbs: 42,
          fat: 1.2,
        },
        {
          id: 'item-4-2',
          name: 'Fish Curry (Rui / Katla)',
          portion: '1 piece',
          grams: 90,
          calories: 120,
          protein: 18,
          carbs: 0,
          fat: 4.5,
        },
      ],
    },
  ],
  advice: {
    waterLiters: 3.0,
    waterScheduleNote: 'খাবার খাওয়ার ৩০ মিনিট পূর্বে পানি পান করুন।',
    physicalActivity: 'প্রতিদিন ৩০-৪৫ মিনিট হাঁটা বা স্বাভাবিক ব্যায়াম।',
    sleepHours: 'রাতে ৭-৮ ঘণ্টা নিয়মিত পর্যাপ্ত ঘুম।',
    prohibitedFoods: [
      'অতিরিক্ত চিনি, কোল্ড ড্রিংকস ও ফাস্টফুড',
      'ডিপ ফ্রাইড ও অতিরিক্ত তেল-মসলাযুক্ত খাবার',
      'প্রক্রিয়াজাত প্যাকেটজাত স্ন্যাক্স',
    ],
    recommendedFoods: [
      'সবুজ শাকসবজি ও সালাদ',
      'ডিম, মাছ ও লীন চিকেন',
      'পর্যাপ্ত বিশুদ্ধ পানি',
    ],
    clinicalInstructions: 'খাবার ওজন স্কেলে পরিমাপ করে সময়মতো গ্রহণ করবেন। খাবারের সাথে অতিরিক্ত পানি পান এড়িয়ে চলুন।',
    followUpDate: 'After 3 Weeks',
  },
};

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<DietPlan>(() => {
    return sanitizeDietPlan(DEFAULT_INITIAL_PLAN);
  });

  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile PDF download modal state
  const [mobileModalResult, setMobileModalResult] = useState<PDFExportResult | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);

  // Client History state with localStorage persistence
  const [clientHistory, setClientHistory] = useState<ClientHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            dietPlan: sanitizeDietPlan(item.dietPlan),
          }));
        }
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
    return INITIAL_SAMPLE_HISTORY;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clientHistory));
    } catch (e) {
      console.error('Error saving history to localStorage:', e);
    }
  }, [clientHistory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApplyTemplate = (templatePlan: DietPlan) => {
    const today = new Date().toISOString().split('T')[0];
    const sanitized = sanitizeDietPlan({
      ...templatePlan,
      prescriptionDate: today,
      doctor: {
        ...templatePlan.doctor,
        consultationDate: today,
      },
    });
    setCurrentPlan(sanitized);
    showToast(`Template "${templatePlan.planTitle}" loaded into editor!`);
  };

  // Save to Client History
  const commitToHistory = (planToSave: DietPlan) => {
    const safePlan = sanitizeDietPlan(planToSave);
    const newRecord: ClientHistoryRecord = {
      id: `hist-${Date.now()}`,
      clientName: safePlan.patient.name || 'Unnamed Client',
      clientPhotoUrl: safePlan.patient.photoUrl,
      createdAt: new Date().toISOString(),
      doctorName: safePlan.doctor.doctorName,
      planTitle: safePlan.planTitle,
      targetCalories: safePlan.targetCalories,
      patientAge: safePlan.patient.age,
      patientWeight: safePlan.patient.weightKg,
      primaryGoal: safePlan.patient.primaryGoal,
      dietPlan: JSON.parse(JSON.stringify(safePlan)),
    };

    setClientHistory((prev) => [newRecord, ...prev]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setClientHistory((prev) => prev.filter((item) => item.id !== id));
    showToast('Client record removed from history.');
  };

  const handleLoadHistoryPlan = (record: ClientHistoryRecord) => {
    setCurrentPlan(sanitizeDietPlan(record.dietPlan));
    setViewMode('editor');
    showToast(`Loaded prescription for client: ${record.clientName}`);
  };

  const handleDownloadHistoryPDF = async (record: ClientHistoryRecord) => {
    setCurrentPlan(sanitizeDietPlan(record.dietPlan));
    setViewMode('preview');
    setTimeout(() => {
      handleDownloadPDF();
    }, 300);
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    const safeName = currentPlan.patient.name.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Patient';
    const fileName = `Diet_Prescription_${safeName}_${currentPlan.prescriptionDate}.pdf`;

    const result = await exportPrescriptionToPDF('prescription-pad-document', {
      fileName,
      onSuccess: (res) => {
        setIsExporting(false);
        setExportSuccess(true);
        // Automatically save to Client History
        commitToHistory(currentPlan);
        setMobileModalResult(res);
        setIsMobileModalOpen(true);
        showToast(`✓ ১ পেইজের চার্ট পিডিএফ ফোনে প্রস্তুত (${currentPlan.patient.name})!`);
        setTimeout(() => setExportSuccess(false), 3000);
      },
      onError: (err) => {
        setIsExporting(false);
        console.error(err);
        showToast('Direct capture failed. Opening native browser print dialog...');
        commitToHistory(currentPlan);
        triggerNativePrint();
      },
    });

    if (!result.success) {
      setIsExporting(false);
    }
  };

  const handleNativePrint = () => {
    commitToHistory(currentPlan);
    triggerNativePrint();
  };

  const totals = sumSlotNutrition(currentPlan.slots);

  return (
    <div className="min-h-screen skeuo-bg text-slate-900 flex flex-col font-sans">
      {/* 1. TOP SKEUOMORPHIC NAVIGATION */}
      <TopNav
        currentView={viewMode}
        onChangeView={(view) => setViewMode(view)}
        onDownloadPDF={handleDownloadPDF}
        onPrint={handleNativePrint}
        isExporting={isExporting}
        exportSuccess={exportSuccess}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-semibold py-3 px-4 rounded-lg shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500/40">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-header Ribbon with Active Client Quick Stats */}
      <div className="no-print bg-[#ede7de] border-b border-[#c8c1b3] shadow-xs py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Active Client:</span>
            {currentPlan.patient?.photoUrl && (
              <img
                src={currentPlan.patient.photoUrl}
                alt={currentPlan.patient?.name || 'Client'}
                className="w-5 h-5 rounded-full object-cover border border-slate-400 shadow-2xs"
              />
            )}
            <span className="font-extrabold text-slate-900">{currentPlan.patient?.name || 'Client'}</span>
            {currentPlan.patient?.primaryGoal && (
              <>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-800 font-semibold">{currentPlan.patient.primaryGoal}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-700 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Target Calories:</span>
              <span className="font-mono-numbers font-bold text-slate-900">
                {currentPlan.targetCalories || 1500} kcal
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Live Charted:</span>
              <span className="font-mono-numbers font-bold text-emerald-900">
                {totals.totalCalories} kcal
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-slate-500">Coach / Nutritionist:</span>
              <span className="font-bold text-slate-900">
                {currentPlan.doctor?.doctorName || 'Coach'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SKEUOMORPHIC DESK SURFACE WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8">
        {viewMode === 'editor' ? (
          <div className="space-y-6">
            <DietChartEditor
              plan={currentPlan}
              onChangePlan={setCurrentPlan}
              onApplyTemplate={handleApplyTemplate}
              onGeneratePrescription={() => {
                setViewMode('preview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              clientHistory={clientHistory}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onLoadHistoryPlan={handleLoadHistoryPlan}
              onDownloadHistoryPDF={handleDownloadHistoryPDF}
            />
          </div>
        ) : (
          /* Full Screen Prescription Pad View */
          <div className="space-y-4 sm:space-y-6">
            {/* Top Action Toolbar */}
            <div className="no-print skeuo-panel rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-md border border-[#c9c1b3]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className="skeuo-button py-2 px-3 rounded-md text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[38px]"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                  <span>Back to Editor (এডিট)</span>
                </button>

                <div className="min-w-0">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                    <FileCheck2 className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Rx for {currentPlan.patient.name}</span>
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                    Letterhead formatted for A4 printing & PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleNativePrint}
                  className="hidden xs:flex flex-1 sm:flex-none items-center justify-center gap-1.5 skeuo-button py-2 px-3.5 rounded text-xs font-bold text-slate-800 cursor-pointer min-h-[38px]"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none items-center justify-center gap-2 skeuo-button-emerald py-2 px-4 rounded text-xs font-bold shadow-md cursor-pointer disabled:opacity-75 min-h-[38px]"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>{isExporting ? 'Generating...' : 'Download PDF & Save'}</span>
                </button>
              </div>
            </div>

            {/* High-fidelity Prescription Pad */}
            <div className="py-1 sm:py-2 flex justify-center">
              <PrescriptionView plan={currentPlan} elementId="prescription-pad-document" />
            </div>
          </div>
        )}

        {/* Properly rendered in viewport space for accurate html2canvas capture on mobile */}
        {viewMode === 'editor' && (
          <div
            className="no-print"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: -100,
              opacity: 0.01,
              pointerEvents: 'none',
              width: '840px',
            }}
          >
            <PrescriptionView plan={currentPlan} elementId="prescription-pad-document" hideShadow />
          </div>
        )}
      </main>

      {/* Mobile-Friendly PDF Download Action Sheet / Modal */}
      <MobileDownloadModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        exportResult={mobileModalResult}
        clientName={currentPlan.patient.name}
      />

      {/* 3. FOOTER */}
      <footer className="no-print mt-auto border-t border-[#3b404a] bg-[#22252c] py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-300">
            NutriRx · Clinical & Sports Nutrition Studio
          </span>
          <span className="text-slate-400">
            Real-time Gram Nutrition Math · Client History · Instant PDF Download
          </span>
        </div>
      </footer>
    </div>
  );
}
