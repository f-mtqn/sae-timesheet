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
  Sparkles
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 shadow-xs">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl shrink-0 ${todayEntry ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Presensi Hari Ini (7 Sep 2026)
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              {todayEntry ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Sudah Diisi ({todayEntry.workHoursFormatted})
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Belum Mengisi Timesheet Hari Ini
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {todayEntry 
                ? `Jam kerja: ${todayEntry.checkIn} - ${todayEntry.checkOut}. Anda dapat mengedit entri ini kapan saja sebelum tengah malam.`
                : 'Silakan lengkapi form di bawah ini setelah selesai jam kerja Anda.'}
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
            className="shrink-0 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition cursor-pointer text-center"
          >
            Muat Data Hari Ini ke Form
          </button>
        )}
      </div>

      {/* Main Input Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#1B365D] text-white">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Formulir Presensi & Aktivitas Harian
              </h2>
              <p className="text-xs text-slate-500">
                Catat jam kehadiran dan rincian pekerjaan Anda secara digital
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToHistory}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-[#1B365D] hover:underline"
          >
            <span>Lihat Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handlePreSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Tanggal Kerja */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                Tanggal Pekerjaan
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Toleransi susulan maksimal H-{settings?.hariToleransiSusulan || 2}
              </span>
            </div>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white font-medium"
            />
            {existingForDate && (
              <div className="mt-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                <span>
                  Tanggal ini sudah memiliki entri ({existingForDate.workHoursFormatted}).
                </span>
                {!isEditingExisting && (
                  <button
                    type="button"
                    onClick={loadExistingToForm}
                    className="font-bold underline text-blue-800 hover:text-blue-950"
                  >
                    Edit Isian Ini
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Jam Masuk & Jam Keluar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Jam Masuk (Check-In)
              </label>
              <input
                type="time"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standar: {settings?.jamMasukStandar || '08:00'} (toleransi {settings?.toleransiKeterlambatan || 10} menit)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Jam Keluar (Check-Out)
              </label>
              <input
                type="time"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standar kerja: {settings?.jamKerjaStandarHarian || 8} jam per hari
              </span>
            </div>
          </div>

          {/* Kalkulasi Live Ringkasan */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">Total Durasi Kerja:</span>
              <span className="text-sm font-bold text-slate-900">
                {liveMetrics.workHoursFormatted} ({liveMetrics.totalHours} jam)
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">Status Perhitungan:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {liveMetrics.lateMinutes > 0 ? (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                    Terlambat {liveMetrics.lateMinutes} menit
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-700">
                    Tepat Waktu
                  </span>
                )}

                {liveMetrics.overtimeHours > 0 && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
                    Lembur +{liveMetrics.overtimeHours} jam
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi Pekerjaan */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Deskripsi Pekerjaan / Aktivitas
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara ringkas aktivitas teknis atau operasional yang Anda selesaikan hari ini..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] leading-relaxed"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Contoh: Modelling 3D piping perpipaan, koordinasi lapangan proyek Dumai, pembuatan as-built drawing.
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#1B365D] hover:bg-[#142642] text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {isEditingExisting ? "Perbarui & Simpan Perubahan" : "Simpan Timesheet"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* POP-UP KONFIRMASI (PRD 6.2) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-full bg-blue-100 text-[#1B365D]">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Isian Timesheet
                </h3>
                <p className="text-xs text-slate-500">
                  Periksa kembali isian Anda sebelum data dicatat ke sistem rekap
                </p>
              </div>
            </div>

            <div className="my-5 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block">Karyawan:</span>
                  <span className="font-bold text-slate-800">{currentUser.namaLengkap}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tanggal:</span>
                  <span className="font-bold text-slate-800">{selectedDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block">Jam Masuk:</span>
                  <span className="font-bold text-slate-800 font-mono">{checkIn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jam Keluar:</span>
                  <span className="font-bold text-slate-800 font-mono">{checkOut}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Jam:</span>
                  <span className="font-bold text-[#1B365D]">{liveMetrics.workHoursFormatted}</span>
                </div>
              </div>

              <div className="pb-2 border-b border-slate-200">
                <span className="text-slate-500 block mb-1">Status Kehadiran:</span>
                <div className="flex gap-2">
                  {liveMetrics.lateMinutes > 0 ? (
                    <span className="px-2 py-0.5 rounded font-bold bg-red-100 text-red-700">
                      Terlambat {liveMetrics.lateMinutes} menit
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded font-medium bg-emerald-100 text-emerald-700">
                      Tepat Waktu
                    </span>
                  )}
                  {liveMetrics.overtimeHours > 0 && (
                    <span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-700">
                      Lembur {liveMetrics.overtimeHours} jam
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-semibold">Uraian Pekerjaan:</span>
                <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed italic">
                  "{description}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Periksa Ulang
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#142642] rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ya, Konfirmasi & Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
