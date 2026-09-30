export type Sex = "female" | "male" | "unknown";
export type Coat = "tan" | "brown" | "black" | "white" | "brindle" | "mixed";
export type Size = "small" | "medium" | "large";

export type SterilizationStatus =
  | "needs_surgery"
  | "camp_scheduled"
  | "sterilized";

export type AdoptionStatus =
  | "community"
  | "available"
  | "foster"
  | "adopted";

export type Dog = {
  id: string;
  localName: string;
  photoDataUrl: string | null;
  sex: Sex;
  coat: Coat;
  size: Size;
  marks: string;
  area: string;
  landmark: string;
  earNotch: boolean;
  sterilization: SterilizationStatus;
  sterilizationDate: string;
  campNote: string;
  adoption: AdoptionStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type MatchHint = {
  dog: Dog;
  score: number;
  reasons: string[];
};

export const sterilizationLabels: Record<SterilizationStatus, string> = {
  needs_surgery: "Needs sterilization",
  camp_scheduled: "Camp scheduled",
  sterilized: "Sterilized",
};

export const adoptionLabels: Record<AdoptionStatus, string> = {
  community: "Community dog",
  available: "Ready for adoption",
  foster: "In foster",
  adopted: "Adopted",
};
