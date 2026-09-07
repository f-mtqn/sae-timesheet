import React, { useEffect, useState } from 'react';
import { Type, ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react';

export function AccessibilityWidget({ inline = false }) {
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
    return (
      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg border border-slate-700 text-white text-xs">
        <span className="flex items-center gap-1 px-2 text-[11px] text-slate-300 font-medium">
          <Type className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Ukuran Font:</span>
        </span>
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={currentScale <= 90}
          className="p-1 px-2 rounded hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer font-bold"
          title="Kecilkan ukuran teks"
        >
          A-
        </button>
        <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold text-[11px]">
          {currentScale}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={currentScale >= 125}
          className="p-1 px-2 rounded hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer font-bold"
          title="Besarkan ukuran teks"
        >
          A+
        </button>
        {currentScale !== 100 && (
          <button
            type="button"
            onClick={handleReset}
            className="p-1 px-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
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
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150 max-w-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold flex items-center gap-1.5 text-blue-300">
              <Eye className="w-4 h-4 text-blue-400" />
              Aksesibilitas & Tampilan
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 block font-medium">
              Ukuran Font Layar ({currentScale}%)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={currentScale <= 90}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" /> A-
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                  currentScale === 100
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={currentScale >= 125}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
              >
                A+ <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-blue-300 hover:text-white rounded-full shadow-lg border border-slate-700 backdrop-blur-xs text-xs font-bold transition cursor-pointer hover:scale-105"
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
