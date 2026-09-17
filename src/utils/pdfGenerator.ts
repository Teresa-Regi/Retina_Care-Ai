import { jsPDF } from 'jspdf';
import { ScreeningRecord } from '../types/screening';
import { DR_SEVERITY_SCALE } from '../data/demoCases';

export async function generateClinicalPDF(record: ScreeningRecord): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  // Header Banner
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RetinaCare AI — Clinical Screening & Referral Report', margin, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Diabetic Retinopathy Tele-Ophthalmology Triage System (EfficientNet-B0 Edge Pipeline)', margin, 17);

  // Status pill in header
  doc.setFontSize(8);
  doc.text(`Report ID: ${record.id}  |  Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 80, 17);

  y = 30;

  // Medical Disclaimer Banner (Mandatory)
  doc.setFillColor(254, 242, 242); // Red-50
  doc.setDrawColor(248, 113, 113); // Red-400
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 10, 1.5, 1.5, 'FD');

  doc.setTextColor(185, 28, 28);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'IMPORTANT MEDICAL DISCLAIMER: AI screening support only — final diagnosis must be done by a qualified ophthalmologist.',
    margin + 4,
    y + 6.5
  );

  y += 15;

  // Two column layout: Patient Demographics & Exam Info
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 34, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Patient Information & Clinical Profile', margin + 4, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  const col1X = margin + 4;
  const col2X = margin + 65;
  const col3X = margin + 125;

  // Row 1
  doc.text(`Patient Name: ${record.patient.name}`, col1X, y + 13);
  doc.text(`Patient ID: ${record.patient.id}`, col2X, y + 13);
  doc.text(`Age / Gender: ${record.patient.age} yrs / ${record.patient.gender}`, col3X, y + 13);

  // Row 2
  doc.text(`Eye Examined: ${record.patient.eyeExamined === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}`, col1X, y + 20);
  doc.text(`Diabetes Duration: ${record.patient.diabetesDurationYears} years`, col2X, y + 20);
  doc.text(`Recent HbA1c: ${record.patient.hba1c ? record.patient.hba1c + '%' : 'Not Available'}`, col3X, y + 20);

  // Row 3
  doc.text(`Screener: ${record.patient.screenerName || 'Community Screener'}`, col1X, y + 27);
  doc.text(`Facility: ${record.patient.clinicLocation || 'Vision Centre / PHC'}`, col2X, y + 27);
  doc.text(`Symptoms: ${record.patient.symptoms.join(', ') || 'None reported'}`, col3X, y + 27);

  y += 39;

  // Tri-Image Panel: Original, Preprocessed CLAHE, Grad-CAM Heatmap
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Retinal Imaging & Computer Vision Pipeline', margin, y);
  y += 4;

  const imgBoxWidth = 56;
  const imgBoxHeight = 56;
  const gap = 7;

  // Image 1: Original
  try {
    doc.addImage(record.preprocessedImages.original, 'JPEG', margin, y, imgBoxWidth, imgBoxHeight);
  } catch {
    doc.rect(margin, y, imgBoxWidth, imgBoxHeight);
  }
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('(A) Original Fundus Scan', margin, y + imgBoxHeight + 4);

  // Image 2: CLAHE Preprocessed
  const img2X = margin + imgBoxWidth + gap;
  try {
    doc.addImage(record.preprocessedImages.clahe, 'JPEG', img2X, y, imgBoxWidth, imgBoxHeight);
  } catch {
    doc.rect(img2X, y, imgBoxWidth, imgBoxHeight);
  }
  doc.text('(B) OpenCV CLAHE Enhanced', img2X, y + imgBoxHeight + 4);

  // Image 3: Grad-CAM Heatmap
  const img3X = img2X + imgBoxWidth + gap;
  try {
    doc.addImage(record.result.gradCamOverlayUrl, 'JPEG', img3X, y, imgBoxWidth, imgBoxHeight);
  } catch {
    doc.rect(img3X, y, imgBoxWidth, imgBoxHeight);
  }
  doc.text('(C) Explainable Grad-CAM Heatmap', img3X, y + imgBoxHeight + 4);

  y += imgBoxHeight + 11;

  // AI Screening Severity Result Box
  const sevInfo = DR_SEVERITY_SCALE[record.result.predictedGrade];

  let badgeFill = [240, 253, 244]; // green
  if (record.result.predictedGrade === 1) badgeFill = [240, 249, 255];
  if (record.result.predictedGrade === 2) badgeFill = [254, 243, 199];
  if (record.result.predictedGrade === 3) badgeFill = [255, 237, 213];
  if (record.result.predictedGrade === 4) badgeFill = [254, 226, 226];

  doc.setFillColor(badgeFill[0], badgeFill[1], badgeFill[2]);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 32, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('3. AI Automated Screening Result', margin + 4, y + 6);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`Predicted Classification: ${sevInfo.shortCode}`, margin + 4, y + 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`AI Confidence: ${record.result.confidence}%  |  Inference Latency: ${record.result.latencyMs} ms  |  Architecture: ${record.result.modelArchitecture}`, margin + 4, y + 19);

  doc.setFontSize(8);
  doc.text(`ICDR Definition: ${sevInfo.icdrDefinition}`, margin + 4, y + 25, { maxWidth: pageWidth - 2 * margin - 8 });

  y += 37;

  // Key Lesions & Clinical Referral Pathway
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, (pageWidth - 2 * margin) / 2 - 3, 30, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Detected Retinal Lesions', margin + 4, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const lesions = record.result.lesions;
  doc.text(`• Microaneurysms: ${lesions.microaneurysms > 0 ? lesions.microaneurysms + ' detected' : 'None'}`, margin + 4, y + 12);
  doc.text(`• Dot/Blot Hemorrhages: ${lesions.hemorrhages > 0 ? lesions.hemorrhages + ' detected' : 'None'}`, margin + 4, y + 17);
  doc.text(`• Hard Lipid Exudates: ${lesions.hardExudates ? 'Present' : 'Absent'}`, margin + 4, y + 22);
  doc.text(`• Neovascularization: ${lesions.neovascularization ? 'ACTIVE (PDR)' : 'Absent'}`, margin + 4, y + 27);

  // Referral Recommendation Box
  const refX = margin + (pageWidth - 2 * margin) / 2 + 3;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(refX, y, (pageWidth - 2 * margin) / 2 - 3, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Referral Action', refX + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(`Urgency: ${sevInfo.followUpTimeframe}`, refX + 4, y + 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(sevInfo.referralRecommendation, refX + 4, y + 17, { maxWidth: (pageWidth - 2 * margin) / 2 - 10 });

  y += 35;

  // Clinician Sign-off & Verification Section
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 26, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Reviewing Clinician / Tele-Ophthalmologist Sign-off', margin + 4, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Verified By (Doctor Name & Reg. No.): ____________________________________', margin + 4, y + 14);
  doc.text('Tele-Consultation Notes: ____________________________________________________________________', margin + 4, y + 20);

  doc.text('Signature / Digital Stamp: ______________________', pageWidth - margin - 75, y + 14);
  doc.text(`Date of Review: ${new Date().toLocaleDateString()}`, pageWidth - margin - 75, y + 20);

  // Footer bar
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'RetinaCare AI v1.0 • Built for Smart India Hackathon (SIH) • Powered by Edge EfficientNet-B0 & MobileNetV3 • All data stored locally on device',
    margin,
    pageHeight - 6
  );

  doc.save(`RetinaCare_Report_${record.patient.id}_${record.patient.eyeExamined}.pdf`);
}
