import React from 'react';
import { User, RefreshCw, ArrowRight } from 'lucide-react';
import { PatientDetails } from '../types/screening';

interface PatientFormProps {
  patient: PatientDetails;
  setPatient: React.Dispatch<React.SetStateAction<PatientDetails>>;
  onNext: () => void;
}

const COMMON_SYMPTOMS = [
  'Asymptomatic',
  'Blurry Vision',
  'Floaters / Spots',
  'Distorted Vision',
  'Night Blindness',
  'Fluctuating Acuity',
];

export const PatientForm: React.FC<PatientFormProps> = ({ patient, setPatient, onNext }) => {
  const generateNewId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setPatient((prev) => ({ ...prev, id: `RC-2026-${randomNum}` }));
  };

  const handleSymptomToggle = (sym: string) => {
    setPatient((prev) => {
      let current = [...prev.symptoms];
      if (sym === 'Asymptomatic') {
        return { ...prev, symptoms: ['Asymptomatic'] };
      }
      current = current.filter((s) => s !== 'Asymptomatic');
      if (current.includes(sym)) {
        current = current.filter((s) => s !== sym);
      } else {
        current.push(sym);
      }
      return { ...prev, symptoms: current.length > 0 ? current : ['Asymptomatic'] };
    });
  };

  const isValid = patient.name.trim() !== '' && patient.age !== '' && Number(patient.age) > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 1: Patient Details & Clinical Profile</h2>
              <p className="text-xs text-slate-500">Record baseline patient demographics and diabetic history for the screening record.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={generateNewId}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate ID</span>
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patel"
              value={patient.name}
              onChange={(e) => setPatient((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Patient ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Unique Patient ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={patient.id}
                onChange={(e) => setPatient((p) => ({ ...p, id: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-mono font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Age (Years) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="120"
              placeholder="e.g. 54"
              value={patient.age}
              onChange={(e) => setPatient((p) => ({ ...p, age: e.target.value === '' ? '' : Number(e.target.value) }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Biological Sex
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Male', 'Female', 'Other'] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setPatient((p) => ({ ...p, gender: g }))}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    patient.gender === g
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Diabetes Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Known Diabetes Duration (Years)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              placeholder="e.g. 8"
              value={patient.diabetesDurationYears}
              onChange={(e) =>
                setPatient((p) => ({
                  ...p,
                  diabetesDurationYears: e.target.value === '' ? '' : Number(e.target.value),
                }))
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* HbA1c Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Recent HbA1c Level (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="4"
              max="18"
              placeholder="e.g. 7.8"
              value={patient.hba1c}
              onChange={(e) =>
                setPatient((p) => ({
                  ...p,
                  hba1c: e.target.value === '' ? '' : Number(e.target.value),
                }))
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Eye Examined Selection */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Eye Being Examined <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPatient((p) => ({ ...p, eyeExamined: 'OD' }))}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                patient.eyeExamined === 'OD'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  patient.eyeExamined === 'OD' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                OD
              </div>
              <div>
                <div className="font-bold text-sm">Right Eye (Oculus Dexter)</div>
                <div className={`text-xs ${patient.eyeExamined === 'OD' ? 'text-teal-100' : 'text-slate-500'}`}>
                  Nasal disc on left, temporal macula on right
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPatient((p) => ({ ...p, eyeExamined: 'OS' }))}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                patient.eyeExamined === 'OS'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  patient.eyeExamined === 'OS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                OS
              </div>
              <div>
                <div className="font-bold text-sm">Left Eye (Oculus Sinister)</div>
                <div className={`text-xs ${patient.eyeExamined === 'OS' ? 'text-teal-100' : 'text-slate-500'}`}>
                  Nasal disc on right, temporal macula on left
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Symptoms Checklist */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Reported Visual Symptoms
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((sym) => {
              const isSelected = patient.symptoms.includes(sym);
              return (
                <button
                  type="button"
                  key={sym}
                  onClick={() => handleSymptomToggle(sym)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-teal-50 text-teal-800 border-teal-500 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '} {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Screener & Clinic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Screener / Operator Name</label>
            <input
              type="text"
              placeholder="e.g. Nurse Priya (Vision Centre)"
              value={patient.screenerName}
              onChange={(e) => setPatient((p) => ({ ...p, screenerName: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Clinic / Vision Center Location</label>
            <input
              type="text"
              placeholder="e.g. Community Health Centre - Zone 4"
              value={patient.clinicLocation}
              onChange={(e) => setPatient((p) => ({ ...p, clinicLocation: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-500">
          Fields marked with <span className="text-red-500">*</span> are required.
        </div>
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
            isValid
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Continue to Fundus Image</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
