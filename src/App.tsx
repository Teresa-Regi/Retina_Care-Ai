import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { PatientForm } from './components/PatientForm';
import { ImageCapture } from './components/ImageCapture';
import { QualityCheck } from './components/QualityCheck';
import { PreprocessingView } from './components/PreprocessingView';
import { ScreeningResult } from './components/ScreeningResult';
import { GradCamOverlay } from './components/GradCamOverlay';
import { ReferralCard } from './components/ReferralCard';
import { HistoryDashboard } from './components/HistoryDashboard';
import { TechSpecsModal } from './components/TechSpecsModal';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import {
  AppStep,
  DRGrade,
  ImageQualityAssessment,
  PatientDetails,
  PreprocessingStages,
  AIScreeningResult,
  ScreeningRecord,
} from './types/screening';
import { DEMO_CASES, DemoCase } from './data/demoCases';
import { processAllStages, assessImageQuality } from './utils/imageProcessing';
import { runAIScreening } from './utils/aiInference';
import { getStoredRecords, saveRecord, deleteRecord, clearAllRecords, seedDemoRecordsIfEmpty } from './utils/storage';

const INITIAL_PATIENT: PatientDetails = {
  id: 'RC-2026-1082',
  name: 'Ramesh Patel',
  age: 52,
  gender: 'Male',
  diabetesDurationYears: 6,
  hba1c: 7.2,
  eyeExamined: 'OD',
  symptoms: ['Asymptomatic'],
  screenerName: 'Nurse Priya (PHC Vision Unit)',
  clinicLocation: 'Community Health Centre - Sector 9',
  notes: 'Routine community diabetic retinopathy screening intake.',
};

export function App() {
  const [activeTab, setActiveTab] = useState<'screening' | 'history'>('screening');
  const [currentStep, setCurrentStep] = useState<AppStep>('patient');

  // Clinical workflow states
  const [patient, setPatient] = useState<PatientDetails>(INITIAL_PATIENT);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<ImageQualityAssessment | null>(null);
  const [stages, setStages] = useState<PreprocessingStages | null>(null);
  const [screeningResult, setScreeningResult] = useState<AIScreeningResult | null>(null);
  const [selectedDemoGrade, setSelectedDemoGrade] = useState<DRGrade | null>(null);

  // Local storage records
  const [records, setRecords] = useState<ScreeningRecord[]>([]);
  const [techSpecsOpen, setTechSpecsOpen] = useState<boolean>(false);
  const [isAiRunning, setIsAiRunning] = useState<boolean>(false);

  // Initialize storage & demo seeds on mount
  useEffect(() => {
    async function initRecords() {
      const stored = await seedDemoRecordsIfEmpty();
      setRecords(stored);
    }
    initRecords();

    // Default load Grade 0 demo image into the canvas
    const g0Img = DEMO_CASES[0].getImage();
    setCurrentImage(g0Img);
    setSelectedDemoGrade(0);
  }, []);

  // Step validation
  const canNavigate = (step: AppStep): boolean => {
    if (step === 'patient') return true;
    if (step === 'image') return patient.name.trim() !== '' && patient.age !== '';
    if (step === 'quality') return canNavigate('image') && currentImage !== null;
    if (step === 'preprocess') return canNavigate('quality') && quality !== null;
    if (step === 'ai') return canNavigate('preprocess') && stages !== null;
    if (step === 'report') return canNavigate('ai') && screeningResult !== null;
    return false;
  };

  // 1-Click Judge Preset Trigger (Direct jump to results)
  const handleSelectJudgeDemo = async (grade: DRGrade) => {
    const demo = DEMO_CASES.find((d) => d.grade === grade) || DEMO_CASES[0];
    setPatient(demo.patient);
    setSelectedDemoGrade(grade);

    const img = demo.getImage();
    setCurrentImage(img);

    // Run pipeline smoothly
    const iqa = await assessImageQuality(img);
    setQuality(iqa);

    const prep = await processAllStages(img);
    setStages(prep);

    const ai = await runAIScreening(prep.clahe, { forcedGrade: grade, isDemoCase: true });
    setScreeningResult(ai);

    // Save record to local storage
    const newRecord: ScreeningRecord = {
      id: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      patient: demo.patient,
      quality: iqa,
      result: ai,
      preprocessedImages: prep,
    };
    saveRecord(newRecord);
    setRecords(getStoredRecords());

    setActiveTab('screening');
    setCurrentStep('ai');
  };

  // Demo card clicked in Step 2
  const handleSelectDemoCase = (demo: DemoCase) => {
    setPatient(demo.patient);
    setSelectedDemoGrade(demo.grade);
    const img = demo.getImage();
    setCurrentImage(img);
    // Reset downstream
    setQuality(null);
    setStages(null);
    setScreeningResult(null);
  };

  // Image selected (Upload or Camera)
  const handleImageSelected = (imageSrc: string, demoGrade?: DRGrade) => {
    setCurrentImage(imageSrc);
    setSelectedDemoGrade(demoGrade ?? null);
    // Reset downstream
    setQuality(null);
    setStages(null);
    setScreeningResult(null);
  };

  // Trigger AI Screening when moving from preprocess to AI
  const handleRunAIScreening = async () => {
    if (!stages) return;
    setIsAiRunning(true);
    setCurrentStep('ai');
    try {
      const ai = await runAIScreening(stages.clahe, {
        forcedGrade: selectedDemoGrade ?? 2,
        isDemoCase: selectedDemoGrade !== null,
      });
      setScreeningResult(ai);

      // Save to local records
      if (quality) {
        const newRec: ScreeningRecord = {
          id: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
          timestamp: new Date().toISOString(),
          patient,
          quality,
          result: ai,
          preprocessedImages: stages,
        };
        saveRecord(newRec);
        setRecords(getStoredRecords());
      }
    } catch (e) {
      console.error('AI inference failed', e);
    } finally {
      setIsAiRunning(false);
    }
  };

  // Reset for new patient
  const handleStartNewPatient = () => {
    const randomId = `RC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setPatient({
      id: randomId,
      name: '',
      age: '',
      gender: 'Male',
      diabetesDurationYears: '',
      hba1c: '',
      eyeExamined: 'OD',
      symptoms: ['Asymptomatic'],
      screenerName: 'Community Screener',
      clinicLocation: 'Primary Health Centre',
      notes: '',
    });
    setCurrentImage(null);
    setQuality(null);
    setStages(null);
    setScreeningResult(null);
    setSelectedDemoGrade(null);
    setCurrentStep('patient');
  };

  // Record viewed from History Dashboard
  const handleViewRecord = (rec: ScreeningRecord) => {
    setPatient(rec.patient);
    setQuality(rec.quality);
    setStages(rec.preprocessedImages);
    setScreeningResult(rec.result);
    setCurrentImage(rec.preprocessedImages.original);
    setActiveTab('screening');
    setCurrentStep('report');
  };

  const handleDeleteRecord = (id: string) => {
    deleteRecord(id);
    setRecords(getStoredRecords());
  };

  const handleClearAllRecords = () => {
    clearAllRecords();
    setRecords([]);
  };

  const handleUpdateCurrentRecord = (updated: ScreeningRecord) => {
    saveRecord(updated);
    setRecords(getStoredRecords());
  };

  // Current active screening record for report
  const currentRecord: ScreeningRecord | null =
    quality && stages && screeningResult
      ? {
          id: `REC-2026-LIVE`,
          timestamp: new Date().toISOString(),
          patient,
          quality,
          result: screeningResult,
          preprocessedImages: stages,
        }
      : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectJudgeDemo={handleSelectJudgeDemo}
        onOpenTechSpecs={() => setTechSpecsOpen(true)}
        historyCount={records.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'screening' ? (
          <div className="space-y-6">
            {/* Step Navigation Bar */}
            <Stepper currentStep={currentStep} setStep={setCurrentStep} canNavigate={canNavigate} />

            {/* Step 1: Patient Intake Form */}
            {currentStep === 'patient' && (
              <PatientForm
                patient={patient}
                setPatient={setPatient}
                onNext={() => setCurrentStep('image')}
              />
            )}

            {/* Step 2: Fundus Image Capture */}
            {currentStep === 'image' && (
              <ImageCapture
                currentImage={currentImage}
                onImageSelected={handleImageSelected}
                eyeTested={patient.eyeExamined}
                onNext={() => setCurrentStep('quality')}
                onBack={() => setCurrentStep('patient')}
                onSelectDemoCase={handleSelectDemoCase}
              />
            )}

            {/* Step 3: Retinal Image Quality Check (IQA) */}
            {currentStep === 'quality' && currentImage && (
              <QualityCheck
                imageSrc={currentImage}
                quality={quality}
                setQuality={setQuality}
                onNext={() => setCurrentStep('preprocess')}
                onBack={() => setCurrentStep('image')}
                onRetake={() => setCurrentStep('image')}
              />
            )}

            {/* Step 4: OpenCV Computer Vision Preprocessing */}
            {currentStep === 'preprocess' && currentImage && (
              <PreprocessingView
                imageSrc={currentImage}
                stages={stages}
                setStages={setStages}
                onNext={handleRunAIScreening}
                onBack={() => setCurrentStep('quality')}
              />
            )}

            {/* Step 5: AI Screening & Explainable Grad-CAM Heatmap */}
            {currentStep === 'ai' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                {isAiRunning || !screeningResult ? (
                  <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 animate-pulse">
                      <div className="w-8 h-8 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"></div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">Running EfficientNet-B0 Edge Inference</h3>
                      <p className="text-xs text-slate-500 max-w-md">
                        Extracting multi-scale spatial representations and generating gradient class activation heatmaps (Grad-CAM)...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Severity Classification Result */}
                    <ScreeningResult result={screeningResult} />

                    {/* Grad-CAM Heatmap Visualizer */}
                    {stages && (
                      <GradCamOverlay
                        baseImageSrc={stages.clahe || stages.original}
                        screeningResult={screeningResult}
                      />
                    )}

                    {/* Action button to proceed to Clinical Report */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <button
                        onClick={() => setCurrentStep('preprocess')}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        ← Re-inspect Preprocessing
                      </button>
                      <button
                        onClick={() => setCurrentStep('report')}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Proceed to Clinical Report & Referral →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 6: Clinical Referral Card & PDF Report */}
            {currentStep === 'report' && currentRecord && (
              <div className="max-w-5xl mx-auto space-y-6">
                <ReferralCard
                  record={currentRecord}
                  onUpdateRecord={handleUpdateCurrentRecord}
                  onStartNewPatient={handleStartNewPatient}
                />
              </div>
            )}
          </div>
        ) : (
          /* History & Analytics Dashboard */
          <HistoryDashboard
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onViewRecord={handleViewRecord}
            onClearAll={handleClearAllRecords}
          />
        )}
      </main>

      {/* Sticky Bottom Medical Disclaimer Notice */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">RetinaCare AI</span>
            <span>•</span>
            <span>SIH 2026 Project: Diabetic Retinopathy Automated Tele-Screening</span>
          </div>
          <div className="text-center sm:text-right text-[11px] font-medium text-amber-800">
            <strong>Medical Notice:</strong> AI screening support only — final diagnosis must be done by a qualified ophthalmologist.
          </div>
        </div>
      </footer>

      {/* Tech Specs Modal for SIH Judges */}
      <TechSpecsModal isOpen={techSpecsOpen} onClose={() => setTechSpecsOpen(false)} />
    </div>
  );
}

export default App;
