import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Send, 
  HelpCircle, 
  AlertCircle, 
  Info, 
  ArrowRight,
  Sparkles,
  Timer,
  Tag,
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';
import { calculateTimesheetMetrics } from '../utils/timeCalculations';

export function EmployeeInputPage({ currentUser, timesheets, onSaveTimesheet, settings, onNavigateToHistory }) {
  const todayStr = "2026-09-07";

  // State Form
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [checkIn, setCheckIn] = useState("08:00");
  const [checkOut, setCheckOut] = useState("17:00");
  const [description, setDescription] = useState("");
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Modal konfirmasi (PRD 6.2)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Quick engineering activity chips for PT Suluh Ardhi Engineering
  const quickActivities = [
    'Modelling 3D Piping & Support',
    'Review P&ID & Diagram Isometrik',
    'Kalkulasi Beban Pondasi Struktur (STAAD)',
    'Stress Analysis Jalur Pipa (Caesar II)',
    'Pemeriksaan Single Line Diagram Elektrikal',
    'Site Inspection & Supervisi Yard Proyek',
    'Penyusunan Dokumen As-Built Drawing',
    'Koordinasi Teknis Mingguan bersama Klien',
  ];

  const handleAddQuickTag = (tag) => {
    setDescription((prev) => {
      if (!prev.trim()) return tag;
      if (prev.includes(tag)) return prev;
      return `${prev.trim()}, ${tag}`;
    });
  };

  // Timesheet milik user ini
  const myTimesheets = useMemo(() => {
    return timesheets.filter(ts => ts.employeeId === currentUser.id);
  }, [timesheets, currentUser.id]);

  // Cek apakah tanggal terpilih sudah pernah diisi
  const existingForDate = useMemo(() => {
    return myTimesheets.find(ts => ts.date === selectedDate);
  }, [myTimesheets, selectedDate]);

  // Status hari ini
  const todayEntry = useMemo(() => {
    return myTimesheets.find(ts => ts.date === todayStr);
  }, [myTimesheets]);

  // Live Metrics
  const liveMetrics = useMemo(() => {
    return calculateTimesheetMetrics(checkIn, checkOut, settings);
  }, [checkIn, checkOut, settings]);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Mohon isi uraian deskripsi pekerjaan hari ini.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    const entry = {
      id: existingForDate?.id || `TS-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.namaLengkap,
      position: currentUser.posisi,
      date: selectedDate,
      checkIn,
      checkOut,
      totalHours: liveMetrics.totalHours,
      workHoursFormatted: liveMetrics.workHoursFormatted,
      lateMinutes: liveMetrics.lateMinutes,
      overtimeHours: liveMetrics.overtimeHours,
      status: liveMetrics.status,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveTimesheet(entry);
    setShowConfirmModal(false);
    setDescription("");
    setIsEditingExisting(false);

    setSuccessToast(`Timesheet tanggal ${selectedDate} berhasil disimpan dan masuk ke rekap!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const loadExistingToForm = () => {
    if (existingForDate) {
      setCheckIn(existingForDate.checkIn);
      setCheckOut(existingForDate.checkOut);
      setDescription(existingForDate.description);
      setIsEditingExisting(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{successToast}</span>
          </div>
          <button 
            onClick={() => setSuccessToast('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Today's Status Banner Card */}
      <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 card-hover">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${todayEntry ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' : 'bg-amber-50 text-amber-600 border border-amber-200/60'}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Presensi Hari Ini
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">
                Senin, 7 September 2026
              </span>
            </div>
            
            <div className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              {todayEntry ? (
                <>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                  <span className="text-emerald-800">Sudah Tercatat ({todayEntry.workHoursFormatted})</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 animate-pulse"></span>
                  <span className="text-amber-800">Belum Mengisi Timesheet</span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              {todayEntry 
                ? `Check-in pukul ${todayEntry.checkIn} — Check-out pukul ${todayEntry.checkOut}. Anda dapat mengedit rincian tugas ini kapan saja hari ini.`
                : 'Selesaikan aktivitas Anda lalu simpan timesheet harian di form bawah ini sebelum batas jam kerja berakhir.'}
            </p>
          </div>
        </div>

        {todayEntry && (
          <button
            onClick={() => {
              setSelectedDate(todayStr);
              setCheckIn(todayEntry.checkIn);
              setCheckOut(todayEntry.checkOut);
              setDescription(todayEntry.description);
              setIsEditingExisting(true);
            }}
            className="shrink-0 px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 hover:border-blue-600 hover:bg-blue-50/50 text-slate-700 hover:text-blue-900 transition shadow-2xs cursor-pointer text-center"
          >
            Muat & Edit Isian Hari Ini
          </button>
        )}
      </div>

      {/* Main Input Form Card */}
      <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden card-hover">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50/20 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1B365D] text-white shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {isEditingExisting ? "Edit Timesheet Kerja" : "Formulir Timesheet Harian"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                PT Suluh Ardhi Engineering • Divisi {currentUser.departemen}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToHistory}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-[#1B365D] transition"
          >
            <span>Buka Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handlePreSubmit} className="p-5 sm:p-7 space-y-6">
          {/* Tanggal Kerja */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tanggal Pelaksanaan</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Toleransi susulan H-{settings?.hariToleransiSusulan || 2}
              </span>
            </div>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/60 font-medium transition"
            />
            {existingForDate && (
              <div className="mt-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs text-blue-900">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  Tanggal ini sudah memiliki rekaman jam kerja ({existingForDate.workHoursFormatted}).
                </span>
                {!isEditingExisting && (
                  <button
                    type="button"
                    onClick={loadExistingToForm}
                    className="font-bold underline text-blue-700 hover:text-blue-900 cursor-pointer ml-2"
                  >
                    Edit Isian Ini
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Jam Masuk, Jam Keluar & Visual Timeline Bar */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jam Masuk (Check-In)</span>
                </label>
                <input
                  type="time"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] font-mono bg-slate-50/60 transition font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Standar: {settings?.jamMasukStandar || '08:00'} (toleransi {settings?.toleransiKeterlambatan || 10}m)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jam Keluar (Check-Out)</span>
                </label>
                <input
                  type="time"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] font-mono bg-slate-50/60 transition font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Standar kerja: {settings?.jamKerjaStandarHarian || 8} jam per hari
                </span>
              </div>
            </div>

            {/* Visual Timeline connector to break the boxy stiffness! */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 via-slate-50 to-blue-50/40 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Masuk</span>
                  <span className="font-mono font-extrabold text-sm text-slate-900">{checkIn}</span>
                </div>
                
                {/* Connecting timeline graphic */}
                <div className="flex-1 min-w-[100px] flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600 rounded-full"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Keluar</span>
                  <span className="font-mono font-extrabold text-sm text-slate-900">{checkOut}</span>
                </div>
              </div>

              {/* Total duration pill & Status badges */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-[#1B365D]">
                  {liveMetrics.workHoursFormatted} ({liveMetrics.totalHours} jam)
                </div>

                {liveMetrics.lateMinutes > 0 ? (
                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                    Telat {liveMetrics.lateMinutes}m
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Tepat Waktu
                  </span>
                )}

                {liveMetrics.overtimeHours > 0 && (
                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    Lembur +{liveMetrics.overtimeHours}j
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi Pekerjaan & Interactive Quick Activity Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Deskripsi Pekerjaan & Aktivitas</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Pilih aktivitas cepat di bawah atau ketik manual
              </span>
            </div>

            {/* Quick Clickable Chips to make input effortless & engaging */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {quickActivities.map((act, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddQuickTag(act)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-900 border border-slate-200/80 hover:border-blue-300 text-[11px] font-medium transition cursor-pointer"
                  title="Klik untuk menambahkan ke deskripsi"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  <span>+ {act}</span>
                </button>
              ))}
            </div>

            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uraikan aktivitas teknis atau pekerjaan operasional yang telah Anda selesaikan..."
              className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] leading-relaxed bg-slate-50/60 transition"
            />
            <span className="text-[11px] text-slate-400 block">
              * Deskripsi ini akan tersimpan ke arsip rekapitulasi jam kerja proyek.
            </span>
          </div>

          {/* Submit Button with Modern Subtle Gradient */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-5 bg-gradient-to-r from-[#1B365D] via-[#204374] to-[#1B365D] hover:from-[#152B4A] hover:to-[#183154] text-white font-bold text-sm rounded-2xl shadow-md shadow-blue-950/15 transition flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.008] duration-200"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              <span>
                {isEditingExisting ? "Perbarui & Simpan Perubahan" : "Simpan Timesheet Harian"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* POP-UP KONFIRMASI MODERN GLASS MODAL (PRD 6.2) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/60">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Isian Timesheet
                </h3>
                <p className="text-xs text-slate-500">
                  Periksa kembali ringkasan jam kerja Anda sebelum tersimpan permanen
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Nama Karyawan</span>
                  <span className="font-bold text-slate-800 text-sm">{currentUser.namaLengkap}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tanggal Pelaksanaan</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Jam Masuk</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{checkIn}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Jam Keluar</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{checkOut}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Total Jam</span>
                  <span className="font-extrabold text-[#1B365D] text-sm">{liveMetrics.workHoursFormatted}</span>
                </div>
              </div>

              <div className="pb-3 border-b border-slate-200">
                <span className="text-slate-400 block mb-1 font-medium">Status Kehadiran</span>
                <div className="flex flex-wrap gap-2">
                  {liveMetrics.lateMinutes > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-red-100 text-red-700">
                      Terlambat {liveMetrics.lateMinutes} menit (Standar {settings?.jamMasukStandar})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                      Tepat Waktu
                    </span>
                  )}
                  {liveMetrics.overtimeHours > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                      Lembur +{liveMetrics.overtimeHours} jam
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-medium">Deskripsi Pekerjaan</span>
                <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed italic">
                  "{description}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition"
              >
                Periksa Ulang / Batal
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#142642] rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ya, Konfirmasi & Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
