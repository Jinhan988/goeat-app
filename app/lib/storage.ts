// Device-local persistence (localStorage). There is no backend or login,
// so saved recipes, week picks and extra shopping items live on this device only.

import type { MealType } from "./feed";

export type SavedRecipe = {
  name: string;
  cuisine?: string;
  minutes?: number;
  tags?: string[];
  query?: string;
  savedAt: number;
};

export type WeekPick = { name: string; day: string; type: MealType };

export type ExtraItem = { name: string; qty: string; recipe: string };

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner"];

export const KEYS = {
  savedRecipes: "goeatai_saved_recipes",
  weekPicks: "goeatai_week_picks",
  extraItems: "goeatai_extra_items",
  lastResult: "goeatai_last_result",
  settings: "goeatai_settings",
  recipes: "goeatai_recipes_v2", // v2: English-only recipes (v1 could be in other languages)
};

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
