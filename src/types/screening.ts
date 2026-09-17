export type DRGrade = 0 | 1 | 2 | 3 | 4;

export type EyeTested = 'OD' | 'OS'; // OD = Right Eye, OS = Left Eye

export interface PatientDetails {
  id: string;
  name: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other';
  diabetesDurationYears: number | string;
  hba1c: number | string;
  eyeExamined: EyeTested;
  symptoms: string[];
  screenerName: string;
  clinicLocation: string;
  notes: string;
}

export interface DRSeverityInfo {
  grade: DRGrade;
  name: string;
  shortCode: string;
  icdrDefinition: string;
  riskLevel: 'Normal' | 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  referralRecommendation: string;
  followUpTimeframe: string;
  primaryAction: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

export interface ImageQualityAssessment {
  overall: 'Pass' | 'Warning' | 'Fail';
  sharpnessScore: number;
  illuminationScore: number;
  contrastScore: number;
  fieldOfViewScore: number;
  feedbackMessages: string[];
}

export interface PreprocessingStages {
  original: string;
  greenChannel: string;
  clahe: string;
  circularCrop: string;
}

export interface DetectedLesions {
  microaneurysms: number;
  hemorrhages: number;
  hardExudates: boolean;
  cottonWoolSpots: boolean;
  neovascularization: boolean;
  venousBeading: boolean;
  macularEdemaSuspected: boolean;
}

export interface AttentionHotspot {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius: number;
  label: string;
  significance: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface AIScreeningResult {
  predictedGrade: DRGrade;
  confidence: number; // 0 to 100 percentage
  classProbabilities: {
    grade: DRGrade;
    label: string;
    probability: number;
  }[];
  latencyMs: number;
  modelArchitecture: string;
  lesions: DetectedLesions;
  gradCamHeatmapUrl: string;
  gradCamOverlayUrl: string;
  attentionHotspots: AttentionHotspot[];
  clinicalSummary: string;
}

export interface ScreeningRecord {
  id: string;
  timestamp: string;
  patient: PatientDetails;
  quality: ImageQualityAssessment;
  result: AIScreeningResult;
  preprocessedImages: PreprocessingStages;
  ophthalmologistReview?: {
    reviewedBy: string;
    verified: boolean;
    clinicalNotes: string;
    signOffDate: string;
  };
}

export type AppStep = 'patient' | 'image' | 'quality' | 'preprocess' | 'ai' | 'report';
