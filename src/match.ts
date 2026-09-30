import type { Dog, MatchHint } from "./types";

function norm(value: string): string {
  return value.trim().toLowerCase();
}

function overlap(a: string, b: string): boolean {
  const left = norm(a);
  const right = norm(b);
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left);
}

export function matchDogs(candidate: Partial<Dog>, dogs: Dog[], excludeId?: string): MatchHint[] {
  return dogs
    .filter((dog) => dog.id !== excludeId)
    .map((dog) => {
      let score = 0;
      const reasons: string[] = [];

      if (candidate.area && overlap(candidate.area, dog.area)) {
        score += 3;
        reasons.push("same area");
      }
      if (candidate.coat && candidate.coat === dog.coat) {
        score += 2;
        reasons.push("same coat");
      }
      if (candidate.sex && candidate.sex !== "unknown" && candidate.sex === dog.sex) {
        score += 1;
        reasons.push("same sex");
      }
      if (candidate.size && candidate.size === dog.size) {
        score += 1;
        reasons.push("same size");
      }
      if (candidate.marks && overlap(candidate.marks, dog.marks)) {
        score += 3;
        reasons.push("matching marks");
      }
      if (candidate.landmark && overlap(candidate.landmark, dog.landmark)) {
        score += 2;
        reasons.push("same landmark");
      }
      if (candidate.earNotch && dog.earNotch) {
        score += 1;
        reasons.push("ear notch");
      }

      return { dog, score, reasons };
    })
    .filter((hint) => hint.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
