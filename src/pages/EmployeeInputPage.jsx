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
  Briefcase,
  Layers,
  ChevronRight,
  Lock,
  CalendarClock,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { calculateTimesheetMetrics, getTodayWIB, formatDateIndoWIB } from '../utils/timeCalculations';

export function EmployeeInputPage({ 
  currentUser, 
  timesheets, 
  onSaveTimesheet, 
  settings, 
  onNavigateToHistory,
  lateEntryPermits = [],
  onCompletePermit
}) {
  const todayWIB = getTodayWIB(); // e.g. "2026-09-08"

  // Cek apakah ada izin susulan dari Admin berstatus 'pending' untuk user ini
  const activePermits = useMemo(() => {
    return (lateEntryPermits || []).filter(
      p => p.employeeId === currentUser.id && p.status === 'pending'
    );
  }, [lateEntryPermits, currentUser.id]);

  const activePermit = activePermits[0] || null;

  // State Form (Default ke tanggal hari ini WIB)
  const [selectedDate, setSelectedDate] = useState(todayWIB);
  const [checkIn, setCheckIn] = useState("08:00");
  const [checkOut, setCheckOut] = useState("17:00");
  const [description, setDescription] = useState("");

  // Modal konfirmasi (PRD 6.2)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Timesheet milik user ini
  const myTimesheets = useMemo(() => {
    return timesheets.filter(ts => ts.employeeId === currentUser.id);
  }, [timesheets, currentUser.id]);

  // Cek apakah hari ini sudah diisi
  const todayEntry = useMemo(() => {
    return myTimesheets.find(ts => ts.date === todayWIB);
  }, [myTimesheets, todayWIB]);

  const isTodayFilled = Boolean(todayEntry);

  // Cek apakah mode susulan sedang aktif
  const isSusulanMode = Boolean(activePermit && selectedDate === activePermit.permittedDate);

  // Cek apakah tanggal terpilih sudah pernah diisi
  const existingForDate = useMemo(() => {
    return myTimesheets.find(ts => ts.date === selectedDate);
  }, [myTimesheets, selectedDate]);

  // Live Metrics
  const liveMetrics = useMemo(() => {
    return calculateTimesheetMetrics(checkIn, checkOut, settings);
  }, [checkIn, checkOut, settings]);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Mohon isi uraian deskripsi aktivitas pekerjaan harian Anda.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
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

    await onSaveTimesheet(entry);

    if (isSusulanMode && onCompletePermit) {
      await onCompletePermit(currentUser.id, selectedDate);
      setSelectedDate(todayWIB);
    }

    setShowConfirmModal(false);
    setDescription("");

    setSuccessToast(`Timesheet tanggal ${selectedDate} berhasil disimpan dan masuk ke database Supabase!`);
    setTimeout(() => setSuccessToast(''), 4500);
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
                Presensi Hari Ini (WIB)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">
                {formatDateIndoWIB(todayWIB)}
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
                  <span className="text-amber-800">Belum Mengisi Timesheet Hari Ini</span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              {todayEntry 
                ? `Check-in pukul ${todayEntry.checkIn} — Check-out pukul ${todayEntry.checkOut}. Presensi harian Anda telah tersimpan aman di database.`
                : 'Selesaikan aktivitas Anda lalu simpan timesheet harian di form bawah ini sebelum batas jam kerja berakhir.'}
            </p>
          </div>
        </div>

        {todayEntry && (
          <button
            onClick={onNavigateToHistory}
            className="shrink-0 px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 hover:border-blue-600 hover:bg-blue-50/50 text-slate-700 hover:text-blue-900 transition shadow-2xs cursor-pointer text-center flex items-center gap-1.5"
          >
            <span>Buka Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* BANNER IZIN SUSULAN ADMIN (Jika Karyawan Diberikan Izin Khusus Lewat Hari) */}
      {activePermit && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/35 text-amber-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-800 border border-amber-400/50 shrink-0 mt-0.5">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Izin Pengisian Susulan Dari Admin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 text-amber-900 border border-amber-300">
                  Dispensasi
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Tanggal Terlewat: {activePermit.permittedDate} ({formatDateIndoWIB(activePermit.permittedDate)})
              </h4>
              <p className="text-xs text-slate-700 mt-0.5">
                <span className="font-semibold text-slate-800">Catatan/Alasan Admin:</span> "{activePermit.reason}"
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {!isSusulanMode ? (
              <button
                type="button"
                onClick={() => setSelectedDate(activePermit.permittedDate)}
                className="px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <CalendarClock className="w-4 h-4" />
                <span>Buka Form Susulan Tanggal Ini</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedDate(todayWIB)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Batal / Kembali ke Hari Ini</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* KONDISI: HARI INI SUDAH DIISI DAN TIDAK SEDANG DALAM MODE SUSULAN */}
      {isTodayFilled && !isSusulanMode ? (
        <div className="bg-white/95 rounded-3xl border border-emerald-200/80 shadow-sm p-6 sm:p-8 space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              Timesheet Hari Ini Telah Selesai Diisi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anda telah mengirimkan absensi dan laporan kerja untuk hari ini (<strong>{formatDateIndoWIB(todayWIB)}</strong>). 
              Sesuai kebijakan perusahaan, pengisian dibatasi 1 kali per hari kerja.
            </p>
          </div>

          {/* Ringkasan Isian Hari Ini */}
          <div className="max-w-lg mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Jam Kerja</span>
              <span className="font-mono font-bold text-slate-800">
                {todayEntry.checkIn} — {todayEntry.checkOut} ({todayEntry.workHoursFormatted})
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Status Kehadiran</span>
              <span className="font-bold text-emerald-700">
                {todayEntry.status === 'telat' ? 'Terlambat' : todayEntry.status === 'lembur' ? 'Lembur' : 'Tepat Waktu'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Aktivitas yang Dilaporkan:</span>
              <p className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 italic">
                "{todayEntry.description}"
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#142642] rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Periksa Rekap & Riwayat Saya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {activePermit && (
              <button
                type="button"
                onClick={() => setSelectedDate(activePermit.permittedDate)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Isi Susulan Tanggal {activePermit.permittedDate}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* MAIN INPUT FORM CARD */
        <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden card-hover">
          {/* Card Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50/20 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl text-white shadow-xs ${isSusulanMode ? 'bg-amber-600' : 'bg-[#1B365D]'}`}>
                {isSusulanMode ? <CalendarClock className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{isSusulanMode ? "Formulir Timesheet Susulan (Izin Admin)" : "Formulir Timesheet Harian"}</span>
                  {isSusulanMode && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                      SUSULAN
                    </span>
                  )}
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
            {/* Tanggal Kerja (LOCKED TO TODAY OR PERMIT DATE) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tanggal Pelaksanaan</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <span className="text-[11px] font-bold text-slate-500">
                  {isSusulanMode ? "Dispensasi Izin Admin" : "Terkunci (Hari Ini Saja)"}
                </span>
              </div>
              <input
                type="date"
                required
                disabled
                readOnly
                value={selectedDate}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-not-allowed transition"
              />
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                {isSusulanMode ? (
                  <span className="text-amber-700 font-medium">
                    🔒 Mengisi susulan tanggal <strong>{formatDateIndoWIB(selectedDate)}</strong> sesuai izin Admin ({activePermit.reason}).
                  </span>
                ) : (
                  <span>
                    🔒 Khusus pengisian tanggal hari ini (<strong>{formatDateIndoWIB(todayWIB)} WIB</strong>). Tanggal lain memerlukan izin susulan dari Admin HR.
                  </span>
                )}
              </span>
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

          {/* Deskripsi Pekerjaan */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Deskripsi Pekerjaan & Aktivitas</span>
            </label>

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
                {isSusulanMode ? "Simpan Timesheet Susulan" : "Simpan Timesheet Harian"}
              </span>
            </button>
          </div>
        </form>
      </div>
      )}

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
