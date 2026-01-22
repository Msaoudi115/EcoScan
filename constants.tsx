
import { HardwareOption, RegionOption } from './types';

export const HARDWARE_OPTIONS: HardwareOption[] = [
  { model: 'NVIDIA A100', watts: 400, embodied: 1500 },
  { model: 'NVIDIA V100', watts: 300, embodied: 1200 },
  { model: 'NVIDIA T4', watts: 70, embodied: 300 },
];

export const REGION_OPTIONS: RegionOption[] = [
  { name: 'France (Nuclear)', factor: 0.057 },
  { name: 'USA (Virginia/Coal)', factor: 0.380 },
  { name: 'China (Coal)', factor: 0.550 },
  { name: 'Global Avg', factor: 0.475 },
];

export const ENERGY_COST_PER_KWH = 0.15; // €

export const SCORE_COLORS: Record<string, string> = {
  A: 'bg-[#2E5936] text-white',
  B: 'bg-[#5B8C5A] text-white',
  C: 'bg-[#EBC03F] text-black',
  D: 'bg-[#E67E22] text-white',
  E: 'bg-[#D32F2F] text-white',
};

export const LCA_COLORS = {
  training: '#2E5936', // LVMH Green
  inference: '#B08D55', // Gold
  embodied: '#8C8C8C'  // Grey
};
