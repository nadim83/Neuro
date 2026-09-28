export interface PatientProfile {
  name: string;
  photoUrl?: string; // Client photo (data URL / uploaded image)
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiCategory: string;
  bloodPressure: string;
  fastingSugar: string;
  primaryGoal: string;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  allergies: string;
  medicalConditions: string;
  phone?: string;
}

export interface DoctorProfile {
  doctorName: string;
  coachTitle?: string; // e.g. Senior Clinical Nutritionist & Fitness Coach
  degrees: string;
  specialization: string;
  registrationNumber: string;
  clinicHospitalName: string;
  clinicAddress: string;
  contactNumber: string;
  email: string;
  consultationDate: string;
  prescriptionId: string;
  consultationHours?: string;
  signatureText?: string;
}

export interface MealItem {
  id: string;
  name: string;
  portion: string;
  grams: number;       // Grams input for real-time accurate nutrition math
  calories: number;    // Calculated energy
  protein: number;     // in grams
  carbs: number;       // in grams
  fat: number;         // in grams
  notes?: string;
  baseCaloriesPer100g?: number;
  baseProteinPer100g?: number;
  baseCarbsPer100g?: number;
  baseFatPer100g?: number;
}

export interface MealSlot {
  id: string;
  title: string;
  bengaliTitle?: string;
  timeWindow: string;
  items: MealItem[];
  clinicalNote?: string;
}

export interface ClinicalAdvice {
  waterLiters: number;
  waterScheduleNote: string;
  physicalActivity: string;
  sleepHours: string;
  prohibitedFoods: string[];
  recommendedFoods: string[];
  clinicalInstructions: string;
  followUpDate: string;
}

export interface DietPlan {
  id: string;
  planTitle: string;
  prescriptionDate: string;
  doctor: DoctorProfile;
  patient: PatientProfile;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  slots: MealSlot[];
  advice: ClinicalAdvice;
}

export interface LibraryFoodItem {
  id: string;
  name: string;
  bengaliName?: string;
  category: 'Grains & Carbs' | 'Protein & Dairy' | 'Vegetables & Greens' | 'Fruits' | 'Healthy Fats & Nuts' | 'Beverages & Soups';
  serving: string;
  defaultGrams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  glycemicIndex?: 'Low' | 'Medium' | 'High';
}

export interface ClientHistoryRecord {
  id: string;
  clientName: string;
  clientPhotoUrl?: string;
  createdAt: string;
  doctorName: string;
  planTitle: string;
  targetCalories: number;
  patientAge: number;
  patientWeight: number;
  primaryGoal: string;
  dietPlan: DietPlan;
}

