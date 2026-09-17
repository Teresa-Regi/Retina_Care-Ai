import { DRGrade, DRSeverityInfo, PatientDetails } from '../types/screening';
import { generateRealisticFundusImage } from '../utils/retinaGenerator';

export interface DemoCase {
  id: string;
  grade: DRGrade;
  title: string;
  patient: PatientDetails;
  severityInfo: DRSeverityInfo;
  clinicalNotes: string;
  expectedFindings: {
    microaneurysms: number;
    hemorrhages: number;
    hardExudates: boolean;
    cottonWoolSpots: boolean;
    neovascularization: boolean;
    venousBeading: boolean;
  };
  getImage: () => string;
}

export const DR_SEVERITY_SCALE: Record<DRGrade, DRSeverityInfo> = {
  0: {
    grade: 0,
    name: 'No Apparent Diabetic Retinopathy',
    shortCode: 'Grade 0 (Normal)',
    icdrDefinition: 'No retinal abnormalities or lesions detected. Retinal vasculature, optic disc, and macula are healthy.',
    riskLevel: 'Normal',
    referralRecommendation: 'Annual rescreening at Primary Health Center. Continue routine diabetes care.',
    followUpTimeframe: '12 Months',
    primaryAction: 'Routine Annual Review',
    accentColor: '#10b981', // green-500
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: 'text-emerald-700',
    borderClass: 'border-emerald-500',
  },
  1: {
    grade: 1,
    name: 'Mild Non-Proliferative Diabetic Retinopathy (NPDR)',
    shortCode: 'Grade 1 (Mild NPDR)',
    icdrDefinition: 'Microaneurysms only. No overt retinal hemorrhages, hard exudates, or cotton-wool spots.',
    riskLevel: 'Low Risk',
    referralRecommendation: 'Rescreen in 6–12 months. Reinforce glycemic control (HbA1c < 7%) and blood pressure management with physician.',
    followUpTimeframe: '6–12 Months',
    primaryAction: 'Glycemic Optimization & 6-12 Mo Review',
    accentColor: '#0ea5e9', // sky-500
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
    badgeText: 'text-sky-700',
    borderClass: 'border-sky-500',
  },
  2: {
    grade: 2,
    name: 'Moderate Non-Proliferative Diabetic Retinopathy (NPDR)',
    shortCode: 'Grade 2 (Moderate NPDR)',
    icdrDefinition: 'More than just microaneurysms, but less than Severe NPDR. Features dot & blot hemorrhages and hard exudates.',
    riskLevel: 'Moderate Risk',
    referralRecommendation: 'Referral to General Comprehensive Ophthalmologist for dilated fundus evaluation and OCT (macular thickness).',
    followUpTimeframe: '2–3 Months',
    primaryAction: 'Ophthalmology Referral (2-3 Mo)',
    accentColor: '#f59e0b', // amber-500
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: 'text-amber-700',
    borderClass: 'border-amber-500',
  },
  3: {
    grade: 3,
    name: 'Severe Non-Proliferative Diabetic Retinopathy (NPDR)',
    shortCode: 'Grade 3 (Severe NPDR)',
    icdrDefinition: 'Meets 4-2-1 rule criteria: >20 intraretinal hemorrhages in each of 4 quadrants, definite venous beading in 2+ quadrants, or prominent IRMA in 1+ quadrant.',
    riskLevel: 'High Risk',
    referralRecommendation: 'Expedited referral to Vitreo-Retinal specialist. High 1-year progression risk to Proliferative DR (50%+).',
    followUpTimeframe: '2–4 Weeks',
    primaryAction: 'Expedited Retina Specialist (2-4 Wks)',
    accentColor: '#f97316', // orange-500
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
    badgeText: 'text-orange-700',
    borderClass: 'border-orange-500',
  },
  4: {
    grade: 4,
    name: 'Proliferative Diabetic Retinopathy (PDR)',
    shortCode: 'Grade 4 (PDR - Urgent)',
    icdrDefinition: 'Neovascularization of disc (NVD) or elsewhere (NVE), preretinal or vitreous hemorrhage, fibrovascular proliferation.',
    riskLevel: 'Critical Risk',
    referralRecommendation: 'URGENT referral to tertiary vitreoretinal center. Immediate evaluation for panretinal photocoagulation (PRP) or anti-VEGF.',
    followUpTimeframe: 'Within 24–72 Hours',
    primaryAction: 'URGENT Hospital Referral (24-72h)',
    accentColor: '#ef4444', // red-500
    badgeBg: 'bg-red-100 text-red-800 border-red-300 animate-pulse-subtle',
    badgeText: 'text-red-700',
    borderClass: 'border-red-500',
  },
};

export const DEMO_CASES: DemoCase[] = [
  {
    id: 'demo-g0',
    grade: 0,
    title: 'Grade 0: Normal Retina (No DR)',
    patient: {
      id: 'RC-2026-1082',
      name: 'Ramesh Patel',
      age: 48,
      gender: 'Male',
      diabetesDurationYears: 3,
      hba1c: 6.4,
      eyeExamined: 'OD',
      symptoms: ['Asymptomatic'],
      screenerName: 'Nurse Priya (ASHA/PHC)',
      clinicLocation: 'Community Health Centre - Zone 4',
      notes: 'Well-controlled Type 2 Diabetes on Metformin. Routine baseline screening visit.',
    },
    severityInfo: DR_SEVERITY_SCALE[0],
    clinicalNotes: 'Crisp optic disc margins, distinct foveal reflex, healthy arteriovenous caliber without microvascular abnormalities.',
    expectedFindings: {
      microaneurysms: 0,
      hemorrhages: 0,
      hardExudates: false,
      cottonWoolSpots: false,
      neovascularization: false,
      venousBeading: false,
    },
    getImage: () => generateRealisticFundusImage(0),
  },
  {
    id: 'demo-g1',
    grade: 1,
    title: 'Grade 1: Mild NPDR (Microaneurysms)',
    patient: {
      id: 'RC-2026-2144',
      name: 'Sunita Sharma',
      age: 54,
      gender: 'Female',
      diabetesDurationYears: 7,
      hba1c: 7.6,
      eyeExamined: 'OD',
      symptoms: ['Occasional mild strain'],
      screenerName: 'Tech Amit (Vision Centre)',
      clinicLocation: 'Sub-District Hospital Tele-Clinic',
      notes: 'Type 2 Diabetes for 7 years, mild hypertension. Patient reports no visual obscurations.',
    },
    severityInfo: DR_SEVERITY_SCALE[1],
    clinicalNotes: 'Few isolated microaneurysms in the temporal quadrant. No hard exudates or macular edema visible.',
    expectedFindings: {
      microaneurysms: 5,
      hemorrhages: 0,
      hardExudates: false,
      cottonWoolSpots: false,
      neovascularization: false,
      venousBeading: false,
    },
    getImage: () => generateRealisticFundusImage(1),
  },
  {
    id: 'demo-g2',
    grade: 2,
    title: 'Grade 2: Moderate NPDR (Exudates & Hemorrhages)',
    patient: {
      id: 'RC-2026-3490',
      name: 'Mohd. Farooq',
      age: 61,
      gender: 'Male',
      diabetesDurationYears: 12,
      hba1c: 8.9,
      eyeExamined: 'OD',
      symptoms: ['Mild Blurry Vision', 'Reading difficulty'],
      screenerName: 'Optometrist Deepa',
      clinicLocation: 'Rural Mobile Screening Van #3',
      notes: 'Suboptimal glycemic control. Complaining of gradual blurring when reading newsprint.',
    },
    severityInfo: DR_SEVERITY_SCALE[2],
    clinicalNotes: 'Multiple dot and blot hemorrhages along superior and inferior arcades with circinate lipid exudate ring near macula.',
    expectedFindings: {
      microaneurysms: 18,
      hemorrhages: 4,
      hardExudates: true,
      cottonWoolSpots: false,
      neovascularization: false,
      venousBeading: false,
    },
    getImage: () => generateRealisticFundusImage(2),
  },
  {
    id: 'demo-g3',
    grade: 3,
    title: 'Grade 3: Severe NPDR (4-2-1 Criteria)',
    patient: {
      id: 'RC-2026-4821',
      name: 'Kamala Devi',
      age: 67,
      gender: 'Female',
      diabetesDurationYears: 18,
      hba1c: 10.2,
      eyeExamined: 'OS',
      symptoms: ['Blurry Vision', 'Floaters', 'Diminished night contrast'],
      screenerName: 'Dr. Neha V. (Medical Officer)',
      clinicLocation: 'Primary Health Centre Taluk Unit',
      notes: 'Long-standing insulin-dependent diabetes with diabetic nephropathy. High risk of progression.',
    },
    severityInfo: DR_SEVERITY_SCALE[3],
    clinicalNotes: 'Extensive blot hemorrhages in all 4 quadrants, segmental venous beading, and prominent cotton wool spots in temporal arcade.',
    expectedFindings: {
      microaneurysms: 32,
      hemorrhages: 14,
      hardExudates: true,
      cottonWoolSpots: true,
      neovascularization: false,
      venousBeading: true,
    },
    getImage: () => generateRealisticFundusImage(3),
  },
  {
    id: 'demo-g4',
    grade: 4,
    title: 'Grade 4: Proliferative DR (Neovascularization)',
    patient: {
      id: 'RC-2026-5993',
      name: 'Harishankar Bose',
      age: 58,
      gender: 'Male',
      diabetesDurationYears: 20,
      hba1c: 11.5,
      eyeExamined: 'OD',
      symptoms: ['Sudden Vision Drop', 'Dark Shadow/Floaters', 'Distortion'],
      screenerName: 'Senior Screener Rajiv',
      clinicLocation: 'District Hospital Ophthalmology Screening Hub',
      notes: 'Sudden onset dark floaters 48 hours ago. Vitreous hemorrhage suspected. Urgent priority triage.',
    },
    severityInfo: DR_SEVERITY_SCALE[4],
    clinicalNotes: 'Active neovascular fronds at the disc margin (NVD) with prominent boat-shaped subhyaloid/preretinal hemorrhage.',
    expectedFindings: {
      microaneurysms: 45,
      hemorrhages: 25,
      hardExudates: true,
      cottonWoolSpots: true,
      neovascularization: true,
      venousBeading: true,
    },
    getImage: () => generateRealisticFundusImage(4),
  },
];
