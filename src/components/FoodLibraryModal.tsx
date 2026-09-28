import React, { useState, useMemo } from 'react';
import { FOOD_LIBRARY, calculateMacrosForGrams } from '../data/foodLibrary';
import { LibraryFoodItem, MealItem } from '../types/diet';
import { Search, Plus, X, Utensils, Filter, Scale, Check } from 'lucide-react';

interface FoodLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (item: MealItem) => void;
  targetSlotName: string;
}

export const FoodLibraryModal: React.FC<FoodLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectFood,
  targetSlotName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Currently focused food for Grams adjustment
  const [activeFood, setActiveFood] = useState<LibraryFoodItem | null>(null);
  const [inputGrams, setInputGrams] = useState<number>(100);

  // Custom Item Form State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPortionLabel, setCustomPortionLabel] = useState('');
  const [customGrams, setCustomGrams] = useState<number>(100);
  const [customCalPer100g, setCustomCalPer100g] = useState<number | ''>(150);
  const [customProtPer100g, setCustomProtPer100g] = useState<number | ''>(10);
  const [customCarbPer100g, setCustomCarbPer100g] = useState<number | ''>(20);
  const [customFatPer100g, setCustomFatPer100g] = useState<number | ''>(3);
  const [customNotes, setCustomNotes] = useState('');

  const categories = useMemo(() => {
    return ['All', 'Grains & Carbs', 'Protein & Dairy', 'Vegetables & Greens', 'Fruits', 'Healthy Fats & Nuts', 'Beverages & Soups'];
  }, []);

  const filteredFoods = useMemo(() => {
    return FOOD_LIBRARY.filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (food.bengaliName && food.bengaliName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'All' || food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleSelectFoodItem = (food: LibraryFoodItem) => {
    setActiveFood(food);
    setInputGrams(food.defaultGrams || 100);
  };

  const calculatedLiveMacros = useMemo(() => {
    if (!activeFood) return null;
    return calculateMacrosForGrams(
      activeFood.caloriesPer100g,
      activeFood.proteinPer100g,
      activeFood.carbsPer100g,
      activeFood.fatPer100g,
      inputGrams
    );
  }, [activeFood, inputGrams]);

  const handleConfirmAddFood = () => {
    if (!activeFood || !calculatedLiveMacros) return;

    const newItem: MealItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: activeFood.name,
      portion: `${inputGrams}g (${activeFood.serving.split('(')[0].trim() || '1 Serving'})`,
      grams: inputGrams,
      calories: calculatedLiveMacros.calories,
      protein: calculatedLiveMacros.protein,
      carbs: calculatedLiveMacros.carbs,
      fat: calculatedLiveMacros.fat,
      notes: activeFood.bengaliName ? `${activeFood.bengaliName}` : undefined,
      baseCaloriesPer100g: activeFood.caloriesPer100g,
      baseProteinPer100g: activeFood.proteinPer100g,
      baseCarbsPer100g: activeFood.carbsPer100g,
      baseFatPer100g: activeFood.fatPer100g,
    };

    onSelectFood(newItem);
    setActiveFood(null);
    onClose();
  };

  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const cal100 = Number(customCalPer100g) || 0;
    const p100 = Number(customProtPer100g) || 0;
    const c100 = Number(customCarbPer100g) || 0;
    const f100 = Number(customFatPer100g) || 0;
    const grams = Number(customGrams) || 100;

    const computed = calculateMacrosForGrams(cal100, p100, c100, f100, grams);

    const newItem: MealItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      portion: `${grams}g ${customPortionLabel ? `(${customPortionLabel})` : ''}`,
      grams: grams,
      calories: computed.calories,
      protein: computed.protein,
      carbs: computed.carbs,
      fat: computed.fat,
      notes: customNotes.trim() || undefined,
      baseCaloriesPer100g: cal100,
      baseProteinPer100g: p100,
      baseCarbsPer100g: c100,
      baseFatPer100g: f100,
    };

    onSelectFood(newItem);
    // Reset custom form
    setCustomName('');
    setCustomPortionLabel('');
    setCustomGrams(100);
    setCustomCalPer100g(150);
    setCustomProtPer100g(10);
    setCustomCarbPer100g(20);
    setCustomFatPer100g(3);
    setCustomNotes('');
    setIsCustomMode(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fcfbfa] rounded-lg border border-[#c8c2b7] shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ded7cc] flex items-center justify-between bg-gradient-to-b from-[#ffffff] to-[#f4f0e8]">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-800" />
              <span>Add Meal to &ldquo;{targetSlotName}&rdquo;</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select food and set exact Grams (গ্রাম) for automatic Protein, Carbs, Fat, and Calories calculation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Database vs Custom Item */}
        <div className="flex border-b border-[#ded7cc] px-5 pt-2 bg-[#f8f5ee]">
          <button
            onClick={() => {
              setIsCustomMode(false);
              setActiveFood(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              !isCustomMode
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Clinical Food Database ({FOOD_LIBRARY.length} items)
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              isCustomMode
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            + Create Custom Food / Recipe
          </button>
        </div>

        {/* Content Body */}
        {!isCustomMode ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="p-3.5 border-b border-[#ded7cc] bg-white space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search in English or Bengali (e.g., লাল চাল, ওটস, ডিম, chicken, fish, ডাল)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 skeuo-inset rounded text-xs text-slate-800 focus:outline-hidden focus:border-emerald-700"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 shrink-0 flex items-center gap-1 text-[11px] pr-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-800 text-white shadow-2xs font-semibold'
                        : 'bg-[#ede8df] text-slate-700 hover:bg-[#ded7cb]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Items List & Interactive Gram Calculator Tray */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-[#ece7de]">
              {filteredFoods.map((food) => {
                const isSelected = activeFood?.id === food.id;

                return (
                  <div
                    key={food.id}
                    className={`pt-2.5 first:pt-0 rounded transition-all p-2.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 border border-emerald-700/50 shadow-xs'
                        : 'hover:bg-slate-100/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {food.name}
                          </span>
                          {food.glycemicIndex && (
                            <span className="text-[10px] text-slate-500 font-mono-numbers">
                              GI: {food.glycemicIndex}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-slate-800">{food.serving}</span>
                          <span>·</span>
                          <span className="font-mono-numbers text-emerald-900 font-bold">
                            {food.calories} kcal
                          </span>
                          <span>·</span>
                          <span className="font-mono-numbers text-slate-600">
                            P: {food.protein}g / C: {food.carbs}g / F: {food.fat}g
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectFoodItem(food)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'skeuo-button text-slate-800 hover:text-emerald-950'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isSelected ? 'Calculating' : 'Select & Grams'}</span>
                      </button>
                    </div>

                    {/* SKEUOMORPHIC GRAMS ADJUSTER TRAY */}
                    {isSelected && (
                      <div className="mt-3 p-3 bg-white rounded border border-emerald-600/30 shadow-inner animate-in fade-in duration-100 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              Portion Weight (গ্রাম):
                            </span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="5"
                                max="2000"
                                step="5"
                                value={inputGrams}
                                onChange={(e) => setInputGrams(Math.max(1, Number(e.target.value)))}
                                className="w-20 px-2 py-1 skeuo-inset rounded text-center text-xs font-bold font-mono-numbers text-slate-900"
                              />
                              <span className="text-xs font-bold text-slate-700">grams</span>
                            </div>
                          </div>

                          {/* Quick Gram Buttons */}
                          <div className="flex items-center gap-1">
                            {[30, 50, 100, 150, 200].map((gm) => (
                              <button
                                key={gm}
                                onClick={() => setInputGrams(gm)}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono-numbers cursor-pointer ${
                                  inputGrams === gm
                                    ? 'bg-emerald-800 text-white font-bold'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {gm}g
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Real-time Calculated Output Cards */}
                        {calculatedLiveMacros && (
                          <div className="grid grid-cols-4 gap-2 text-center p-2 rounded bg-emerald-50/50 border border-emerald-200 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block">Energy</span>
                              <span className="font-mono-numbers font-bold text-emerald-950 text-sm">
                                {calculatedLiveMacros.calories} <span className="text-[10px]">kcal</span>
                              </span>
                            </div>
                            <div className="border-l border-emerald-200">
                              <span className="text-[10px] text-slate-500 uppercase block">Protein</span>
                              <span className="font-mono-numbers font-bold text-slate-900 text-sm">
                                {calculatedLiveMacros.protein}g
                              </span>
                            </div>
                            <div className="border-l border-emerald-200">
                              <span className="text-[10px] text-slate-500 uppercase block">Carbs</span>
                              <span className="font-mono-numbers font-bold text-slate-900 text-sm">
                                {calculatedLiveMacros.carbs}g
                              </span>
                            </div>
                            <div className="border-l border-emerald-200">
                              <span className="text-[10px] text-slate-500 uppercase block">Fats</span>
                              <span className="font-mono-numbers font-bold text-slate-900 text-sm">
                                {calculatedLiveMacros.fat}g
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveFood(null)}
                            className="px-3 py-1.5 skeuo-button rounded text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmAddFood}
                            className="px-4 py-1.5 skeuo-button-emerald rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Add {inputGrams}g to Meal Slot (যুক্ত করুন)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddCustomFood} className="p-5 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Custom Food / Recipe Name (খাবারের নাম) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Steamed Salmon / লাউ শাকের তরকারি / Chia Oats Bowl"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 skeuo-inset rounded text-xs text-slate-900 font-medium focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Serving Weight in Grams (গ্রাম) *
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    required
                    value={customGrams}
                    onChange={(e) => setCustomGrams(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 skeuo-inset rounded text-xs font-mono-numbers font-bold text-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-medium">grams</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Portion Description (পরিমাপ লেবেল)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Medium Cup, 2 Pieces, 1 Bowl"
                  value={customPortionLabel}
                  onChange={(e) => setCustomPortionLabel(e.target.value)}
                  className="w-full px-3 py-2 skeuo-inset rounded text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Base Nutrition per 100g */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block uppercase">
                Nutritional Values per 100g (প্রতি ১০০ গ্রামে মান)
              </span>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCalPer100g}
                    onChange={(e) => setCustomCalPer100g(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-1 skeuo-inset rounded text-xs font-mono-numbers text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customProtPer100g}
                    onChange={(e) => setCustomProtPer100g(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-1 skeuo-inset rounded text-xs font-mono-numbers text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customCarbPer100g}
                    onChange={(e) => setCustomCarbPer100g(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-1 skeuo-inset rounded text-xs font-mono-numbers text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customFatPer100g}
                    onChange={(e) => setCustomFatPer100g(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2 py-1 skeuo-inset rounded text-xs font-mono-numbers text-slate-900"
                  />
                </div>
              </div>

              {/* Real time output summary */}
              <div className="text-[11px] text-emerald-900 pt-1 font-semibold">
                Will calculate for {customGrams}g:{' '}
                {Math.round(((Number(customCalPer100g) || 0) * customGrams) / 100)} kcal · Protein:{' '}
                {Math.round(((Number(customProtPer100g) || 0) * customGrams) / 10) / 10}g
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Preparation / Clinical Instruction Notes (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="e.g. Cook with minimal oil, avoid table salt, chew well"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3 py-2 skeuo-inset rounded text-xs text-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="pt-3 border-t border-[#ded7cc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="px-4 py-2 skeuo-button rounded text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Back to Database
              </button>
              <button
                type="submit"
                className="px-4 py-2 skeuo-button-emerald rounded text-xs font-bold cursor-pointer"
              >
                Add Custom Food ({customGrams}g)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
