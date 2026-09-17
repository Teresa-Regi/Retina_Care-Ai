import { ScreeningRecord } from '../types/screening';
import { DEMO_CASES } from '../data/demoCases';
import { processAllStages } from './imageProcessing';
import { runAIScreening } from './aiInference';

const STORAGE_KEY = 'retinacare_screenings_v1';

export function getStoredRecords(): ScreeningRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load records from localStorage', err);
    return [];
  }
}

export function saveRecord(record: ScreeningRecord): void {
  try {
    const existing = getStoredRecords();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save record to localStorage', err);
  }
}

export function deleteRecord(id: string): void {
  try {
    const existing = getStoredRecords();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete record', err);
  }
}

export function clearAllRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Pre-seed sample records for SIH demo if localStorage is empty
export async function seedDemoRecordsIfEmpty(): Promise<ScreeningRecord[]> {
  const current = getStoredRecords();
  if (current.length > 0) return current;

  // Generate 2 pre-seeded records for demo showcase (e.g. Grade 0 & Grade 2)
  try {
    const case0 = DEMO_CASES[0];
    const img0 = case0.getImage();
    const prep0 = await processAllStages(img0);
    const ai0 = await runAIScreening(prep0.clahe, { forcedGrade: 0, isDemoCase: true });

    const rec0: ScreeningRecord = {
      id: 'REC-2026-001',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      patient: case0.patient,
      quality: {
        overall: 'Pass',
        sharpnessScore: 92,
        illuminationScore: 89,
        contrastScore: 90,
        fieldOfViewScore: 95,
        feedbackMessages: ['Retinal landmarks clear.'],
      },
      result: ai0,
      preprocessedImages: prep0,
      ophthalmologistReview: {
        reviewedBy: 'Dr. S. K. Ramanathan, MD (Ophth)',
        verified: true,
        clinicalNotes: 'Normal fundus confirmed. Schedule annual screening.',
        signOffDate: new Date(Date.now() - 3600000 * 24 * 2).toLocaleDateString(),
      },
    };

    const case2 = DEMO_CASES[2];
    const img2 = case2.getImage();
    const prep2 = await processAllStages(img2);
    const ai2 = await runAIScreening(prep2.clahe, { forcedGrade: 2, isDemoCase: true });

    const rec2: ScreeningRecord = {
      id: 'REC-2026-002',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      patient: case2.patient,
      quality: {
        overall: 'Pass',
        sharpnessScore: 84,
        illuminationScore: 80,
        contrastScore: 86,
        fieldOfViewScore: 91,
        feedbackMessages: ['Sufficient contrast for screening.'],
      },
      result: ai2,
      preprocessedImages: prep2,
    };

    saveRecord(rec0);
    saveRecord(rec2);
    return [rec2, rec0];
  } catch (e) {
    console.error('Error seeding records', e);
    return [];
  }
}

// Export records to CSV
export function exportToCSV(records: ScreeningRecord[]): void {
  if (records.length === 0) return;

  const headers = [
    'Record ID',
    'Date',
    'Patient Name',
    'Patient ID',
    'Age',
    'Gender',
    'Eye',
    'Diabetes Duration (Yrs)',
    'HbA1c',
    'AI Predicted Grade',
    'Severity Label',
    'Confidence (%)',
    'Referral Urgency',
    'Microaneurysms',
    'Hemorrhages',
    'Hard Exudates',
    'Neovascularization',
    'Doctor Verified',
  ];

  const rows = records.map((r) => [
    `"${r.id}"`,
    `"${new Date(r.timestamp).toLocaleDateString()}"`,
    `"${r.patient.name}"`,
    `"${r.patient.id}"`,
    r.patient.age,
    `"${r.patient.gender}"`,
    `"${r.patient.eyeExamined}"`,
    r.patient.diabetesDurationYears,
    r.patient.hba1c || 'N/A',
    r.result.predictedGrade,
    `"Grade ${r.result.predictedGrade}"`,
    r.result.confidence,
    `"${r.result.predictedGrade >= 3 ? 'Expedited / Urgent' : r.result.predictedGrade === 2 ? 'Routine Ophthalmology' : 'Annual PHC Review'}"`,
    r.result.lesions.microaneurysms,
    r.result.lesions.hemorrhages,
    r.result.lesions.hardExudates ? 'Yes' : 'No',
    r.result.lesions.neovascularization ? 'Yes' : 'No',
    r.ophthalmologistReview?.verified ? 'Verified' : 'Pending',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `RetinaCare_Screenings_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
