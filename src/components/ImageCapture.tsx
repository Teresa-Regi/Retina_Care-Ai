import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, Check, RefreshCw, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { DRGrade, EyeTested } from '../types/screening';
import { DEMO_CASES, DemoCase } from '../data/demoCases';

interface ImageCaptureProps {
  currentImage: string | null;
  onImageSelected: (imageSrc: string, demoGrade?: DRGrade) => void;
  eyeTested: EyeTested;
  onNext: () => void;
  onBack: () => void;
  onSelectDemoCase: (demoCase: DemoCase) => void;
}

export const ImageCapture: React.FC<ImageCaptureProps> = ({
  currentImage,
  onImageSelected,
  eyeTested,
  onNext,
  onBack,
  onSelectDemoCase,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'demo'>('demo');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid retinal image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        onImageSelected(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Camera Handlers
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable. Ensure permissions are granted or use Demo Presets.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    onImageSelected(dataUrl);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Fundus Image Capture & Selection</h2>
              <p className="text-xs text-slate-500">
                Provide a 45° macular-centered fundus photograph for eye <strong>{eyeTested === 'OD' ? 'OD (Right Eye)' : 'OS (Left Eye)'}</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('demo');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'demo' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Demo Cases
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('upload');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'upload' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'camera' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Camera
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: 5 DEMO PRESETS (PRIMARY FOR SIH JUDGES) */}
      {activeTab === 'demo' && (
        <div className="space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>
                <strong>SIH Judge Fast Track:</strong> Select any clinical grade below to load high-resolution retinal fundus scans generated with real anatomical structures.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-teal-100 font-bold rounded text-[10px]">
              Offline Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_CASES.map((demo) => {
              const previewImg = demo.getImage();
              const isSelected = currentImage === previewImg;

              return (
                <div
                  key={demo.id}
                  onClick={() => onSelectDemoCase(demo)}
                  className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-md bg-teal-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-900 flex items-center justify-center">
                    <img src={previewImg} alt={demo.title} className="w-full h-full object-contain" />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${demo.severityInfo.badgeBg}`}>
                        Grade {demo.grade}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-1 bg-teal-600 text-white rounded-full shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{demo.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{demo.clinicalNotes}</p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100">
                      <span>Patient: {demo.patient.name}</span>
                      <span className="font-semibold text-teal-700">HbA1c: {demo.patient.hba1c}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: FILE UPLOAD */}
      {activeTab === 'upload' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging
                ? 'border-teal-500 bg-teal-50/50'
                : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/tiff"
              className="hidden"
            />
            <div className="p-4 bg-teal-50 text-teal-700 rounded-full mb-3">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Click to upload or drag & drop fundus scan</h3>
            <p className="text-xs text-slate-500 mt-1">Supports standard digital fundus camera images (JPG, PNG, WebP up to 25MB)</p>
          </div>
        </div>
      )}

      {/* Mode 3: LIVE CAMERA */}
      {activeTab === 'camera' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {cameraError ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-xs border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{cameraError}</span>
            </div>
          ) : (
            <div className="relative aspect-video max-w-lg mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {/* Fundus Reticle Retinal Viewfinder Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border-2 border-dashed border-teal-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full border border-teal-300"></div>
                </div>
              </div>
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={captureFrame}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Frame</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Selected Image Preview */}
      {currentImage && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-teal-500 flex-shrink-0 bg-black">
              <img src={currentImage} alt="Selected Fundus" className="w-full h-full object-contain" />
              <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-teal-700 text-white text-[9px] font-bold rounded">
                {eyeTested}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-teal-300">Retinal Image Loaded</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-semibold rounded border border-emerald-800">
                  Ready for IQA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: {eyeTested === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'} • Format: RGB 24-bit 512×512
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>Proceed to Quality Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Details</span>
        </button>
      </div>
    </div>
  );
};
