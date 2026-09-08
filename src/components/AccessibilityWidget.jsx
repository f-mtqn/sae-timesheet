import React, { useEffect, useState } from 'react';
import { Type, ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react';

export function AccessibilityWidget({ inline = false, tone = 'dark' }) {
  // Font scale percentages: 90%, 100% (default), 112%, 125%
  const scaleLevels = [
    { label: 'Kecil', value: 90 },
    { label: 'Normal', value: 100 },
    { label: 'Besar', value: 112 },
    { label: 'Sangat Besar', value: 125 },
  ];

  const [currentScale, setCurrentScale] = useState(() => {
    const saved = localStorage.getItem('sae_font_scale');
    return saved ? Number(saved) : 100;
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Terapkan ke elemen root HTML agar seluruh satuan rem menyesuaikan proporsional
    document.documentElement.style.fontSize = `${currentScale}%`;
    localStorage.setItem('sae_font_scale', String(currentScale));
  }, [currentScale]);

  const handleZoomIn = () => {
    const next = scaleLevels.find(s => s.value > currentScale);
    if (next) setCurrentScale(next.value);
  };

  const handleZoomOut = () => {
    const prev = [...scaleLevels].reverse().find(s => s.value < currentScale);
    if (prev) setCurrentScale(prev.value);
  };

  const handleReset = () => {
    setCurrentScale(100);
  };

  if (inline) {
    const isLight = tone === 'light';
    return (
      <div className={`inline-flex items-center gap-1 p-1 rounded-full border text-xs ${
        isLight
          ? 'bg-white/80 border-slate-200 text-slate-600'
          : 'bg-white/8 border-white/15 text-slate-200'
      }`}>
        <span className={`flex items-center gap-1 px-2 text-[11px] font-medium ${
          isLight ? 'text-slate-500' : 'text-slate-300'
        }`}>
          <Type className={`w-3.5 h-3.5 ${isLight ? 'text-[#1B365D]' : 'text-sky-300'}`} />
          <span className="hidden sm:inline">Ukuran teks</span>
        </span>
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={currentScale <= 90}
          className={`p-1 px-2 rounded-full disabled:opacity-40 cursor-pointer font-semibold ${
            isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-300'
          }`}
          title="Kecilkan ukuran teks"
        >
          A-
        </button>
        <span className={`px-1.5 py-0.5 rounded-full font-semibold text-[11px] ${
          isLight ? 'bg-sky-50 text-[#1B365D]' : 'bg-sky-400/15 text-sky-200'
        }`}>
          {currentScale}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={currentScale >= 125}
          className={`p-1 px-2 rounded-full disabled:opacity-40 cursor-pointer font-semibold ${
            isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-300'
          }`}
          title="Besarkan ukuran teks"
        >
          A+
        </button>
        {currentScale !== 100 && (
          <button
            type="button"
            onClick={handleReset}
            className={`p-1 px-1.5 rounded-full cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-white/10 text-slate-400'
            }`}
            title="Kembalikan ke ukuran standar (100%)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 no-print">
      {isOpen ? (
        <div className="bg-white text-slate-700 p-3 rounded-2xl shadow-[0_16px_40px_-16px_rgba(27,54,93,0.28)] border border-slate-200/80 space-y-2.5 max-w-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="font-semibold flex items-center gap-1.5 text-[#1B365D]">
              <Eye className="w-4 h-4 text-sky-500" />
              Aksesibilitas & tampilan
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-500 block font-medium">
              Ukuran teks layar ({currentScale}%)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={currentScale <= 90}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" /> A-
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold border cursor-pointer ${
                  currentScale === 100
                    ? 'bg-[#1B365D] text-white border-[#1B365D]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={currentScale >= 125}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
              >
                A+ <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-white text-[#1B365D] rounded-full shadow-[0_10px_24px_-12px_rgba(27,54,93,0.35)] border border-slate-200/80 backdrop-blur-sm text-xs font-semibold cursor-pointer"
          title="Buka Pengaturan Aksesibilitas (Ukuran Font)"
        >
          <Type className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Ukuran Font</span>
          {currentScale !== 100 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px]">
              {currentScale}%
            </span>
          )}
        </button>
      )}
    </div>
  );
}
