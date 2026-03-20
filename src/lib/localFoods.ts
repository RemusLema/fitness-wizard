// src/lib/localFoods.ts — Macro lookup for common Rwandan foods

export interface FoodMacro {
  label: string;          // Display name with local name
  serving: string;        // e.g. "per cup", "per 100g"
  protein: number;        // grams
  carbs: number;          // grams
  fat: number;            // grams
  kcal: number;
}

export const localFoodMacros: Record<string, FoodMacro> = {
  "ibishyimbo": {
    label: "Ibishyimbo (beans)",
    serving: "per cup",
    protein: 15,
    carbs: 40,
    fat: 1,
    kcal: 225,
  },
  "ibirayi": {
    label: "Ibirayi (sweet potatoes)",
    serving: "per cup",
    protein: 2,
    carbs: 41,
    fat: 0,
    kcal: 180,
  },
  "isombe": {
    label: "Isombe (cassava leaves)",
    serving: "per cup",
    protein: 5,
    carbs: 10,
    fat: 5,
    kcal: 95,
  },
  "ubugali": {
    label: "Ubugali / Ugali",
    serving: "per cup",
    protein: 3,
    carbs: 36,
    fat: 0,
    kcal: 160,
  },
  "inyama": {
    label: "Inyama y'inka (beef)",
    serving: "per 100g",
    protein: 26,
    carbs: 0,
    fat: 15,
    kcal: 250,
  },
  "amata": {
    label: "Amata (milk / dairy)",
    serving: "per cup",
    protein: 8,
    carbs: 12,
    fat: 8,
    kcal: 150,
  },
  "tilapia": {
    label: "Tilapia / Fish",
    serving: "per 100g",
    protein: 26,
    carbs: 0,
    fat: 3,
    kcal: 110,
  },
  "amagi": {
    label: "Amagi (eggs)",
    serving: "per egg",
    protein: 6,
    carbs: 0,
    fat: 5,
    kcal: 78,
  },
  "ibijumba": {
    label: "Ibijumba (sweet corn)",
    serving: "per cup",
    protein: 5,
    carbs: 30,
    fat: 2,
    kcal: 130,
  },
  "tropical_fruits": {
    label: "Tropical fruits",
    serving: "per cup",
    protein: 1,
    carbs: 25,
    fat: 0,
    kcal: 100,
  },
};

// All local food keys for the multi-select UI
export const localFoodOptions = Object.entries(localFoodMacros).map(([key, val]) => ({
  key,
  label: val.label,
}));

// Build a prompt block from selected food keys
export function buildLocalFoodPromptBlock(selectedKeys: string[]): string {
  if (!selectedKeys || selectedKeys.length === 0) return "";

  const lines = selectedKeys
    .filter((k) => localFoodMacros[k])
    .map((k) => {
      const f = localFoodMacros[k];
      return `  - ${f.label}: ${f.serving}: ${f.protein}g protein, ${f.carbs}g carbs, ${f.fat}g fat, ${f.kcal} kcal`;
    });

  if (lines.length === 0) return "";

  return `
LOCAL FOOD CONTEXT (Rwanda):
The user eats these local foods: ${selectedKeys.map(k => localFoodMacros[k]?.label).filter(Boolean).join(', ')}.
${lines.join('\n')}

Build ALL meal plans using these foods as primary ingredients.
Do NOT suggest foods unavailable in Rwanda (no kale, quinoa, Greek yogurt).
Use Rwandan meal timing: light breakfast, heavy lunch, moderate dinner.
`;
}
