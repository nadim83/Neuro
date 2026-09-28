import { DietPlan } from '../types/diet';
import { CLINICAL_TEMPLATES } from '../data/templates';

const DEFAULT_ADVICE = {
  waterLiters: 3.0,
  waterScheduleNote: 'সকালে খালি পেটে ১ গ্লাস কুসুম গরম পানি ও সারাদিন পর্যাপ্ত পানি পান করুন।',
  physicalActivity: 'প্রতিদিন ৩০-৪৫ মিনিট হাঁটা বা স্বাভাবিক ব্যায়াম।',
  sleepHours: 'রাতে ৭-৮ ঘণ্টা নিয়মিত পর্যাপ্ত ঘুম।',
  prohibitedFoods: [
    'অতিরিক্ত চিনি, মিষ্টি ও কোল্ড ড্রিংকস',
    'ডিপ ফ্রাইড ও অতিরিক্ত তেল-মসলাযুক্ত ফাস্টফুড',
    'ময়দা ও বেকারি আইটেম (বিস্কুট, কেক)',
  ],
  recommendedFoods: [
    'সবুজ শাকসবজি ও রঙিন সালাদ',
    'পর্যাপ্ত প্রোটিন (ডিম, মুরগির মাংস, মাছ)',
    'চিয়া সিড ও পর্যাপ্ত পানি',
  ],
  clinicalInstructions: 'প্রতিদিনের চার্টটি সময়মতো মেনে চলার চেষ্টা করুন। খাবারের সাথে সাথে অতিরিক্ত পানি পান এড়িয়ে চলুন।',
  followUpDate: '',
};

export function sanitizeDietPlan(inputPlan: any): DietPlan {
  const fallback = CLINICAL_TEMPLATES[0]?.plan;

  if (!inputPlan || typeof inputPlan !== 'object') {
    return JSON.parse(JSON.stringify(fallback));
  }

  const patient = inputPlan.patient || {};
  const doctor = inputPlan.doctor || {};
  const advice = inputPlan.advice || {};

  return {
    id: String(inputPlan.id || fallback?.id || `plan-${Date.now()}`),
    planTitle: String(inputPlan.planTitle || fallback?.planTitle || 'Clinical Diet Prescription'),
    prescriptionDate: String(inputPlan.prescriptionDate || new Date().toISOString().split('T')[0]),
    targetCalories: Number(inputPlan.targetCalories) || fallback?.targetCalories || 1500,
    targetProtein: Number(inputPlan.targetProtein) || fallback?.targetProtein || 75,
    targetCarbs: Number(inputPlan.targetCarbs) || fallback?.targetCarbs || 165,
    targetFat: Number(inputPlan.targetFat) || fallback?.targetFat || 42,
    patient: {
      name: String(patient.name || 'Client Name'),
      photoUrl: patient.photoUrl || undefined,
      age: Number(patient.age) || 30,
      gender: patient.gender === 'female' ? 'female' : 'male',
      heightCm: Number(patient.heightCm) || 165,
      weightKg: Number(patient.weightKg) || 70,
      bmi: Number(patient.bmi) || 25.7,
      bmiCategory: String(patient.bmiCategory || 'Normal'),
      bloodPressure: String(patient.bloodPressure || '120/80 mmHg'),
      fastingSugar: String(patient.fastingSugar || '5.6 mmol/L'),
      primaryGoal: String(patient.primaryGoal || 'Health & Fitness'),
      activityLevel: patient.activityLevel || 'moderately_active',
      allergies: String(patient.allergies || 'None'),
      medicalConditions: String(patient.medicalConditions || 'None'),
      phone: patient.phone ? String(patient.phone) : undefined,
    },
    doctor: {
      doctorName: String(doctor.doctorName || 'MD. NADIM KHAN'),
      coachTitle: String(doctor.coachTitle || 'CERTIFIED SPORTS NUTRITIONIST & CLINICAL COACH'),
      degrees: String(doctor.degrees || 'ISSA Master Trainer | Advanced Dietetics & Metabolic Conditioning'),
      specialization: String(doctor.specialization || 'Advanced Dietetics & Metabolic Conditioning'),
      registrationNumber: String(doctor.registrationNumber || '#PRF-2026'),
      clinicHospitalName: String(doctor.clinicHospitalName || 'PRO-FIT CLINICAL METABOLIC CENTER'),
      clinicAddress: String(doctor.clinicAddress || 'Middle Badda, Dhaka, Bangladesh'),
      contactNumber: String(doctor.contactNumber || '+880 1850085185'),
      email: String(doctor.email || 'nadimhasan83292@gmail.com'),
      consultationDate: String(doctor.consultationDate || new Date().toISOString().split('T')[0]),
      prescriptionId: String(doctor.prescriptionId || '#PRF-2026'),
      consultationHours: String(doctor.consultationHours || 'Sat - Thu | 10:00 AM - 08:00 PM'),
      signatureText: doctor.signatureText ? String(doctor.signatureText) : undefined,
    },
    slots: Array.isArray(inputPlan.slots) && inputPlan.slots.length > 0
      ? inputPlan.slots.map((slot: any, idx: number) => ({
          id: String(slot?.id || `slot-${idx}`),
          title: String(slot?.title || `Meal ${idx + 1}`),
          bengaliTitle: slot?.bengaliTitle ? String(slot.bengaliTitle) : undefined,
          timeWindow: String(slot?.timeWindow || '08:00 AM - 08:30 AM'),
          clinicalNote: slot?.clinicalNote ? String(slot.clinicalNote) : undefined,
          items: Array.isArray(slot?.items)
            ? slot.items.map((it: any, iIdx: number) => ({
                id: String(it?.id || `item-${idx}-${iIdx}`),
                name: String(it?.name || 'Food item'),
                portion: String(it?.portion || '1 serving'),
                grams: Number(it?.grams) || 100,
                calories: Number(it?.calories) || 0,
                protein: Number(it?.protein) || 0,
                carbs: Number(it?.carbs) || 0,
                fat: Number(it?.fat) || 0,
                notes: it?.notes ? String(it.notes) : undefined,
                baseCaloriesPer100g: Number(it?.baseCaloriesPer100g) || undefined,
                baseProteinPer100g: Number(it?.baseProteinPer100g) || undefined,
                baseCarbsPer100g: Number(it?.baseCarbsPer100g) || undefined,
                baseFatPer100g: Number(it?.baseFatPer100g) || undefined,
              }))
            : [],
        }))
      : (fallback?.slots || []),
    advice: {
      waterLiters: Number(advice.waterLiters) || DEFAULT_ADVICE.waterLiters,
      waterScheduleNote: String(advice.waterScheduleNote || DEFAULT_ADVICE.waterScheduleNote),
      physicalActivity: String(advice.physicalActivity || DEFAULT_ADVICE.physicalActivity),
      sleepHours: String(advice.sleepHours || DEFAULT_ADVICE.sleepHours),
      prohibitedFoods: Array.isArray(advice.prohibitedFoods)
        ? advice.prohibitedFoods.map(String)
        : [...DEFAULT_ADVICE.prohibitedFoods],
      recommendedFoods: Array.isArray(advice.recommendedFoods)
        ? advice.recommendedFoods.map(String)
        : [...DEFAULT_ADVICE.recommendedFoods],
      clinicalInstructions: String(advice.clinicalInstructions || DEFAULT_ADVICE.clinicalInstructions),
      followUpDate: String(advice.followUpDate || ''),
    },
  };
}
