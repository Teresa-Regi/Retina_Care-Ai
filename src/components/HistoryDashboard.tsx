import React, { useState } from 'react';
import { History, Search, Download, Trash2, Eye, FileText, Filter, CheckCircle2, AlertTriangle, ShieldCheck, Database, Calendar } from 'lucide-react';
import { ScreeningRecord, DRGrade } from '../types/screening';
import { DR_SEVERITY_SCALE } from '../data/demoCases';
import { exportToCSV } from '../utils/storage';
import { generateClinicalPDF } from '../utils/pdfGenerator';

interface HistoryDashboardProps {
  records: ScreeningRecord[];
  onDeleteRecord: (id: string) => void;
  onViewRecord: (record: ScreeningRecord) => void;
  onClearAll: () => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  records,
  onDeleteRecord,
  onViewRecord,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Filtered list
  const filtered = records.filter((r) => {
    const matchesSearch =
      r.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = gradeFilter === 'all' || r.result.predictedGrade.toString() === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  // Calculate metrics
  const totalScreened = records.length;
  const normalCount = records.filter((r) => r.result.predictedGrade === 0).length;
  const referralCount = records.filter((r) => r.result.predictedGrade > 0).length;
  const highRiskCount = records.filter((r) => r.result.predictedGrade >= 3).length;
  const avgConfidence =
    totalScreened > 0
      ? (records.reduce((acc, r) => acc + r.result.confidence, 0) / totalScreened).toFixed(1)
      : '0';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Screening History & Tele-Triage Dashboard</h2>
            <p className="text-xs text-slate-500">
              Offline records stored securely on this device. Exportable to CSV for hospital health management systems.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(records)}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          {records.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all screening records from local storage?')) {
                  onClearAll();
                }
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Clear all records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Analytics Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Screened</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalScreened}</div>
          <p className="text-[10px] text-slate-400">All local patient sessions</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Normal (Grade 0)</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {normalCount} <span className="text-xs font-normal text-slate-400">({totalScreened ? Math.round((normalCount/totalScreened)*100) : 0}%)</span>
          </div>
          <p className="text-[10px] text-slate-400">Routine annual follow-up</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Referral Advised</span>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {referralCount} <span className="text-xs font-normal text-slate-400">({totalScreened ? Math.round((referralCount/totalScreened)*100) : 0}%)</span>
          </div>
          <p className="text-[10px] text-slate-400">Grade 1 to 4 detected</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">High Risk / Urgent</span>
          <div className="text-2xl font-black text-red-700 font-mono">{highRiskCount}</div>
          <p className="text-[10px] text-slate-400">Grade 3 & 4 (Expedited Triage)</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All DR Grades</option>
            <option value="0">Grade 0: Normal</option>
            <option value="1">Grade 1: Mild NPDR</option>
            <option value="2">Grade 2: Moderate NPDR</option>
            <option value="3">Grade 3: Severe NPDR</option>
            <option value="4">Grade 4: Proliferative DR</option>
          </select>
        </div>
      </div>

      {/* Records Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No screening records found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run a new screening in the "Screening" tab or choose a 1-click Judge Preset to populate records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Fundus</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Eye</th>
                  <th className="p-3.5">AI Prediction</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Referral Urgency</th>
                  <th className="p-3.5">Review Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((rec) => {
                  const sevInfo = DR_SEVERITY_SCALE[rec.result.predictedGrade];
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="w-12 h-12 rounded-lg bg-black overflow-hidden border border-slate-200 flex-shrink-0">
                          <img
                            src={rec.preprocessedImages.clahe || rec.preprocessedImages.original}
                            alt="Fundus"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{rec.patient.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {rec.patient.id} • {rec.patient.age}y / {rec.patient.gender}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(rec.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 text-[10px]">
                          {rec.patient.eyeExamined}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-[11px] border ${sevInfo.badgeBg}`}>
                          {sevInfo.shortCode}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">{rec.result.confidence}%</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700">{sevInfo.followUpTimeframe}</span>
                      </td>
                      <td className="p-3.5">
                        {rec.ophthalmologistReview?.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Doctor Verified
                          </span>
                        ) : (
                          <span className="text-amber-600 text-[11px] font-medium">Pending Review</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewRecord(rec)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="View Full Triage Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generateClinicalPDF(rec)}
                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
                            title="Download Clinical PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(rec.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
