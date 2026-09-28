import React from 'react';
import { 
  Download, 
  Share2, 
  ExternalLink, 
  Printer, 
  CheckCircle2, 
  X,
  FileCheck2,
  Smartphone
} from 'lucide-react';
import { PDFExportResult, triggerNativePrint } from '../utils/pdfExport';

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportResult: PDFExportResult | null;
  clientName: string;
}

export const MobileDownloadModal: React.FC<MobileDownloadModalProps> = ({
  isOpen,
  onClose,
  exportResult,
  clientName,
}) => {
  if (!isOpen || !exportResult || !exportResult.blobUrl) return null;

  const handleShareToPhone = async () => {
    if (exportResult.pdfFile && navigator.canShare && navigator.canShare({ files: [exportResult.pdfFile] })) {
      try {
        await navigator.share({
          files: [exportResult.pdfFile],
          title: `Diet Chart - ${clientName}`,
          text: `Clinical & Sports Nutrition Diet Chart for ${clientName}`,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
    } else {
      // Fallback: trigger download link
      handleDirectDownload();
    }
  };

  const handleDirectDownload = () => {
    if (!exportResult.blobUrl) return;
    const a = document.createElement('a');
    a.href = exportResult.blobUrl;
    a.download = exportResult.fileName || `Diet_Chart_${clientName}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    if (exportResult.blobUrl) {
      window.open(exportResult.blobUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="skeuo-card bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-300 space-y-4 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              ১ পেইজের চার্ট তৈরি সম্পন্ন!
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {clientName} এর জন্য Clinical & Sports Nutrition ডায়েট চার্ট
            </p>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-950 flex items-start gap-2">
          <Smartphone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold block mb-0.5">ফোনে সহজে সেভ করার উপায়:</span>
            <span>নিচের যেকোনো একটি অপশনে চাপ দিয়ে আপনার ফোনের <strong>Downloads</strong> ফোল্ডার বা <strong>Files</strong>-এ চার্টটি সেভ করে নিন।</span>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="space-y-2.5 pt-1">
          {/* Primary Action 1: Save to Phone / Share */}
          <button
            type="button"
            onClick={handleShareToPhone}
            className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.99]"
          >
            <Share2 className="w-4 h-4" />
            <span>Save to Phone / Share (ফোনের ফাইলে সেভ করুন)</span>
          </button>

          {/* Action 2: Direct Download */}
          <button
            type="button"
            onClick={handleDirectDownload}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span>Direct Download (সরাসরি ডাউনলোড)</span>
          </button>

          {/* Action 3 & 4: Open in New Tab & Print */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Open in Tab (দেখুন)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                triggerNativePrint();
              }}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
