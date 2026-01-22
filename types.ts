
export enum Maison {
  LV = 'Louis Vuitton',
  DIOR = 'Dior',
  SEPHORA = 'Sephora',
  MOET = 'Moët & Chandon',
  FENDI = 'Fendi',
  CELINE = 'Celine'
}

export enum ProjectType {
  GEN_AI = 'Generative AI',
  PREDICTIVE = 'Predictive Analytics',
  CV = 'Computer Vision'
}

export type Step = 'login' | 'home' | 'library' | 'assessment' | 'optimization' | 'report' | 'settings' | 'profile';

export interface HardwareOption {
  model: string;
  watts: number;
  embodied: number; // kgCO2 per unit
}

export interface RegionOption {
  name: string;
  factor: number; // kgCO2/kWh
}

export type Score = 'A' | 'B' | 'C' | 'D' | 'E';

export interface LCABreakdown {
  co2: number;
  energy: number;
}

export interface LCAData {
  training: LCABreakdown;
  inference: LCABreakdown;
  embodied: { co2: number };
  totalCo2: number;
  totalCost: number;
  score: Score;
}

export interface ProjectState {
  hardware: string;
  numGpus: number;
  trainingHours: number;
  trainingRegion: string;
  inferenceRegion: string;
  requestsPerMonth: number;
  avgLatency: number;
  projectYears: number;
  // New AI Fields
  recommendations: string[];
  auditLog: string[];
}

export interface SavedProject {
  id: string;
  name: string;
  date: string;
  maison: Maison;
  originalScore: Score;
  finalScore: Score;
  originalCo2: number;
  finalCo2: number;
  savings: number;
  // Store full state for deep dive
  state: ProjectState;
  lca: LCAData;
}

export interface User {
  name: string;
  role: string;
  maison: Maison;
  email: string;
  bio: string;
  password?: string; // Added for mock auth
}
