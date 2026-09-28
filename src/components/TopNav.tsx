import React from 'react';
import { Download, Printer, Eye, Edit3, Sparkles, Loader2, Check } from 'lucide-react';

interface TopNavProps {
  currentView: 'editor' | 'preview';
  onChangeView: (view: 'editor' | 'preview') => void;
  onDownloadPDF: () => void;
  onPrint: () => void;
  isExporting: boolean;
  exportSuccess: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onChangeView,
  onDownloadPDF,
  onPrint,
  isExporting,
  exportSuccess,
}) => {
  return (
    <>
      <header className="no-print sticky top-0 z-40 bg-[#fbfaf8]/95 backdrop-blur-md border-b border-[#d8d2c6] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Brand Wordmark with Classic Medical Caduceus / Rx */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onChangeView('editor');
              }}
              className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-b from-[#1e40af] to-[#1e3a8a] text-white flex items-center justify-center font-serif-prescription text-xl sm:text-2xl font-black shadow-inner border border-blue-900/40 select-none">
                ℞
              </span>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight leading-none text-slate-900 font-sans">
                  NutriRx
                </span>
                <span className="text-[8.5px] sm:text-[10px] text-slate-500 font-medium tracking-tight leading-tight hidden xs:block">
                  Clinical Dietetics
                </span>
              </div>
            </a>
            <span className="hidden md:inline-block text-xs text-slate-300 font-light">|</span>
            <span className="hidden md:inline-block text-xs text-slate-500 font-medium truncate max-w-[200px] lg:max-w-none">
              Pro-Fit Clinical & Sports Metabolic Center
            </span>
          </div>

          {/* Zone 2: Navigation / View Switcher (Tactile Segmented Control) */}
          <nav className="flex items-center gap-1 bg-[#ede8df] p-1 rounded-lg border border-[#d6cfc5] shadow-inner text-xs">
            <button
              type="button"
              onClick={() => onChangeView('editor')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                currentView === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs border border-[#d6cfc5]/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden xs:inline">Diet Editor</span>
              <span className="xs:hidden">Edit</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeView('preview')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                currentView === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs border border-[#d6cfc5]/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden xs:inline">Rx Preview</span>
              <span className="xs:hidden">Rx Pad</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Tactile Print & Download PDF) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Print Button (Desktop / Tablet) */}
            <button
              type="button"
              onClick={onPrint}
              title="Open browser print dialog to save vector PDF"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 skeuo-button rounded-md text-xs font-bold text-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            {/* Download Prescription PDF */}
            <button
              type="button"
              onClick={onDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 skeuo-button-emerald rounded-md text-xs font-bold whitespace-nowrap disabled:opacity-75 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden xs:inline">Generating...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="hidden xs:inline">Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Download PDF</span>
                  <span className="xs:hidden">PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Ergonomic Mobile Sticky Bottom Thumb Bar (< 640px) */}
      <div 
        className="no-print sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fbfaf8]/95 backdrop-blur-md border-t border-[#d8d2c6] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-3 py-2 flex items-center justify-between gap-2"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => onChangeView('editor')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
            currentView === 'editor'
              ? 'bg-[#ede8df] text-blue-900 border border-[#d6cfc5] shadow-inner'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4 mb-0.5 text-blue-700" />
          <span>Edit Plan</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('preview')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
            currentView === 'preview'
              ? 'bg-[#ede8df] text-emerald-950 border border-[#d6cfc5] shadow-inner'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4 mb-0.5 text-emerald-700" />
          <span>Rx Preview</span>
        </button>

        <button
          type="button"
          onClick={onDownloadPDF}
          disabled={isExporting}
          className="flex-1.2 flex items-center justify-center gap-1.5 py-2 px-3 skeuo-button-emerald rounded-lg text-xs font-black shadow-md cursor-pointer disabled:opacity-75"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4 text-white" />
          )}
          <span>{isExporting ? 'Creating...' : 'PDF Save'}</span>
        </button>
      </div>
    </>
  );
};
