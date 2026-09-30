import type { AdoptionStatus, Coat, Dog, Sex, Size, SterilizationStatus } from "./types";

const now = () => new Date().toISOString();

export const seedDogs: Dog[] = [
  {
    id: "PR-001",
    localName: "Gulab",
    photoDataUrl: null,
    sex: "female",
    coat: "tan",
    size: "medium",
    marks: "White chest patch, limp on left hind",
    area: "Ridge Road, Ward 12",
    landmark: "Tea stall near the water tank",
    earNotch: false,
    sterilization: "needs_surgery",
    sterilizationDate: "",
    campNote: "Priority — in heat last month, feeding 4 pups nearby",
    adoption: "community",
    notes: "Friendly with regular feeders. Pups are ~8 weeks.",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "PR-002",
    localName: "Kalu",
    photoDataUrl: null,
    sex: "male",
    coat: "black",
    size: "large",
    marks: "Torn right ear, yellow collar remnant",
    area: "Market lane",
    landmark: "Behind vegetable mandi",
    earNotch: true,
    sterilization: "sterilized",
    sterilizationDate: "2026-03-12",
    campNote: "ABC camp, municipal van",
    adoption: "community",
    notes: "Already sterilized. Keep on feeder map.",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "PR-003",
    localName: "Moti",
    photoDataUrl: null,
    sex: "male",
    coat: "white",
    size: "small",
    marks: "Brown spot over left eye",
    area: "Ridge Road, Ward 12",
    landmark: "School gate",
    earNotch: false,
    sterilization: "camp_scheduled",
    sterilizationDate: "2026-10-04",
    campNote: "Saturday camp at community hall, 7am catch",
    adoption: "available",
    notes: "Good with children. Looking for a home after surgery recovery.",
    createdAt: now(),
    updatedAt: now(),
  },
];

export const emptyDraft: Omit<Dog, "id" | "createdAt" | "updatedAt"> = {
  localName: "",
  photoDataUrl: null,
  sex: "unknown",
  coat: "tan",
  size: "medium",
  marks: "",
  area: "",
  landmark: "",
  earNotch: false,
  sterilization: "needs_surgery",
  sterilizationDate: "",
  campNote: "",
  adoption: "community",
  notes: "",
};

export const sexOptions: Sex[] = ["female", "male", "unknown"];
export const coatOptions: Coat[] = ["tan", "brown", "black", "white", "brindle", "mixed"];
export const sizeOptions: Size[] = ["small", "medium", "large"];
export const sterilizationOptions: SterilizationStatus[] = [
  "needs_surgery",
  "camp_scheduled",
  "sterilized",
];
export const adoptionOptions: AdoptionStatus[] = [
  "community",
  "available",
  "foster",
  "adopted",
];
