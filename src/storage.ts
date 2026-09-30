import type { Dog } from "./types";

const KEY = "paw-ridge-dogs-v1";

export function loadDogs(): Dog[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Dog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDogs(dogs: Dog[]): void {
  localStorage.setItem(KEY, JSON.stringify(dogs));
}

export function nextId(dogs: Dog[]): string {
  const n = dogs.length + 1;
  return `PR-${String(n).padStart(3, "0")}`;
}
