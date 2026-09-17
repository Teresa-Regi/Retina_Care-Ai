import React, { useState } from 'react';
import { Download, FileCheck, AlertTriangle, ShieldCheck, Stethoscope, UserCheck, ArrowRight, Printer } from 'lucide-react';
import { ScreeningRecord } from '../types/screening';
import { DR_SEVERITY_SCALE } from '../data/demoCases';
import { generateClinicalPDF } from '../utils/pdfGenerator';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface ReferralCardProps {
  record: ScreeningRecord;
  onUpdateRecord: (updated: ScreeningRecord) => void;
  onStartNewPatient: () => void;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({
  record,
  onUpdateRecord,
  onStartNewPatient,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [doctorName, setDoctorName] = useState(record.ophthalmologistReview?.reviewedBy || '');
  const [doctorNotes, setDoctorNotes] = useState(record.ophthalmologistReview?.clinicalNotes || '');
  const [isVerified, setIsVerified] = useState(record.ophthalmologistReview?.verified || false);
  const [signOffSaved, setSignOffSaved] = useState(!!record.ophthalmologistReview?.verified);

  const sevInfo = DR_SEVERITY_SCALE[record.result.predictedGrade];

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await generateClinicalPDF(record);
    } catch (err) {
      console.error('PDF Generation failed', err);
      alert('Failed to generate PDF. Check console.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveSignOff = () => {
    const updated: ScreeningRecord = {
      ...record,
      ophthalmologistReview: {
        reviewedBy: doctorName || 'Dr. Reviewing Ophthalmologist',
        verified: isVerified,
        clinicalNotes: doctorNotes,
        signOffDate: new Date().toLocaleDateString(),
      },
    };
    onUpdateRecord(updated);
    setSignOffSaved(true);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Step 5: Clinical Referral & Official Report</h3>
            <p className="text-xs text-slate-500">
              Guideline-directed triage referral pathway and exportable documentation for patient records.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Compiling PDF...' : 'Download Clinical PDF Report'}</span>
        </button>
      </div>

      {/* Referral Urgency Alert Box */}
      <div
        className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          record.result.predictedGrade >= 3
            ? 'bg-red-50/80 border-red-500 text-red-950'
            : record.result.predictedGrade === 2
            ? 'bg-amber-50/80 border-amber-500 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-500 text-emerald-950'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider">Referral Timeline:</span>
            <span className="px-2.5 py-0.5 rounded-full font-black text-xs bg-white shadow-xs border border-current">
              {sevInfo.followUpTimeframe}
            </span>
          </div>
          <h4 className="text-base font-bold">{sevInfo.primaryAction}</h4>
          <p className="text-xs opacity-90 max-w-2xl">{sevInfo.referralRecommendation}</p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">Triage Level</span>
          <span className="text-sm font-black">{sevInfo.riskLevel}</span>
        </div>
      </div>

      {/* Ophthalmologist Tele-Signoff Section */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Ophthalmologist / Clinician Verification Sign-Off
            </h4>
          </div>
          {signOffSaved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Sign-Off Recorded
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reviewing Ophthalmologist Name & Reg. No.</label>
            <input
              type="text"
              placeholder="e.g. Dr. A. K. Swaminathan, MD (AIIMS Reg: 84920)"
              value={doctorName}
              onChange={(e) => {
                setDoctorName(e.target.value);
                setSignOffSaved(false);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tele-Consultation Clinical Notes</label>
            <input
              type="text"
              placeholder="e.g. Verified Grade 2 lesions. Dilated OCT advised in 6 weeks."
              value={doctorNotes}
              onChange={(e) => {
                setDoctorNotes(e.target.value);
                setSignOffSaved(false);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 flex-wrap gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => {
                setIsVerified(e.target.checked);
                setSignOffSaved(false);
              }}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span>I have verified the AI screening images and approve this clinical referral report.</span>
          </label>

          <button
            type="button"
            onClick={handleSaveSignOff}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Save Verification
          </button>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer */}
      <MedicalDisclaimer />

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200"
        >
          <Printer className="w-4 h-4 text-teal-600" />
          <span>Print / Export PDF</span>
        </button>

        <button
          type="button"
          onClick={onStartNewPatient}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
        >
          <span>Screen Next Patient</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
