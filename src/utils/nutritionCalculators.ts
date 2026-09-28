import { MealSlot } from '../types/diet';

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return { bmi: 0, category: 'N/A' };
  }
  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category = 'Normal';
  // South Asian & WHO Recommended Clinical Cut-offs
  if (bmi < 18.5) {
    category = 'Underweight (ক্ষীণকায়)';
  } else if (bmi < 23.0) {
    category = 'Normal Weight (আদর্শ ওজন)';
  } else if (bmi < 27.5) {
    category = 'Overweight (অতিরিক্ত ওজন)';
  } else {
    category = 'Obese (স্থূলতা)';
  }

  return { bmi, category };
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  if (!weightKg || !heightCm || !age) return 1500;
  // Mifflin-St Jeor Formula
  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
): number {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

export function sumSlotNutrition(slots?: MealSlot[]) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (!slots || !Array.isArray(slots)) {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    };
  }

  for (const slot of slots) {
    if (!slot || !Array.isArray(slot.items)) continue;
    for (const item of slot.items) {
      if (!item) continue;
      totalCalories += Number(item.calories) || 0;
      totalProtein += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFat += Number(item.fat) || 0;
    }
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
  };
}
