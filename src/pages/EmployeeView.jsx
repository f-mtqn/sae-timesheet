import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  History, 
  Edit3, 
  Send,
  HelpCircle,
  Timer,
  Info
} from 'lucide-react';
import { calculateTimesheetMetrics, getTodayWIB } from '../utils/timeCalculations';

export function EmployeeView({ currentUser, timesheets, onSaveTimesheet, settings }) {
  const todayStr = getTodayWIB();
  
  // State form input
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [checkIn, setCheckIn] = useState("08:00");
  const [checkOut, setCheckOut] = useState("17:00");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Confirmation Modal state (PRD 6.2)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Filter riwayat
  const [historyMonth, setHistoryMonth] = useState("09");
  const [historyYear, setHistoryYear] = useState("2026");

  // Hitung live metrics
  const liveMetrics = useMemo(() => {
    return calculateTimesheetMetrics(checkIn, checkOut, settings);
  }, [checkIn, checkOut, settings]);

  // Timesheets milik user ini
  const myTimesheets = useMemo(() => {
    return timesheets.filter(ts => ts.employeeId === currentUser.id);
  }, [timesheets, currentUser.id]);

  // Cek apakah tanggal terpilih sudah pernah diisi
  const existingEntryForSelectedDate = useMemo(() => {
    return myTimesheets.find(ts => ts.date === selectedDate);
  }, [myTimesheets, selectedDate]);

  // Rekap bulan berjalan untuk user
  const monthlyStats = useMemo(() => {
    const currentMonthEntries = myTimesheets.filter(ts => {
      const parts = ts.date.split('-');
      return parts[1] === historyMonth && parts[0] === historyYear;
    });

    const totalDays = currentMonthEntries.length;
    const totalHours = currentMonthEntries.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const totalLateMinutes = currentMonthEntries.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);
    const totalOvertime = currentMonthEntries.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);

    return {
      totalDays,
      totalHours: totalHours.toFixed(1),
      totalLateMinutes,
      totalOvertime: totalOvertime.toFixed(1),
    };
  }, [myTimesheets, historyMonth, historyYear]);

  // Handle klik tombol submit pertama (buka konfirmasi popup)
  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Mohon isi deskripsi pekerjaan atau aktivitas hari ini.");
      return;
    }
    setShowConfirmModal(true);
  };

  // Konfirmasi final dan simpan
  const handleFinalConfirm = () => {
    const newEntry = {
      id: editingId || `TS-${Date.now()}`,
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

    onSaveTimesheet(newEntry);
    setShowConfirmModal(false);
    setEditingId(null);
    setDescription("");
    
    setSuccessToast(`Timesheet tanggal ${selectedDate} berhasil disimpan dan masuk ke rekap!`);
    setTimeout(() => {
      setSuccessToast('');
    }, 4000);
  };

  // Siapkan form untuk edit
  const handleEditEntry = (entry) => {
    setSelectedDate(entry.date);
    setCheckIn(entry.checkIn);
    setCheckOut(entry.checkOut);
    setDescription(entry.description);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Portal Karyawan
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Selamat Datang, {currentUser.namaLengkap}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.posisi} • Departemen {currentUser.departemen} • ID: {currentUser.id}
          </p>
        </div>

        {/* Quick Month Recap Pill */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Bulan Ini (Sep 2026):</span>
            <span className="font-bold text-slate-800">{monthlyStats.totalDays} Hari Kerja</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div>
            <span className="text-slate-500 block">Total Jam:</span>
            <span className="font-bold text-blue-900">{monthlyStats.totalHours} Jam</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div>
            <span className="text-slate-500 block">Lembur:</span>
            <span className="font-bold text-emerald-700">+{monthlyStats.totalOvertime} Jam</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div>
            <span className="text-slate-500 block">Keterlambatan:</span>
            <span className={`font-bold ${monthlyStats.totalLateMinutes > 0 ? 'text-red-600' : 'text-slate-700'}`}>
              {monthlyStats.totalLateMinutes} Menit
            </span>
          </div>
        </div>
      </div>

      {/* Success Toast */}
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

      {/* Grid Layout: Input Form on Left / Top, History on Right / Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM INPUT TIMESHEET */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-[#1B365D]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingId ? "Edit Timesheet" : "Form Input Timesheet Harian"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Isi jam kehadiran dan rincian pekerjaan
                  </p>
                </div>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setDescription("");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {existingEntryForSelectedDate && !editingId && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Perhatian:</strong> Tanggal {selectedDate} sudah pernah diisi ({existingEntryForSelectedDate.workHoursFormatted}). 
                  Mengisi form ini akan memperbarui entri yang sudah ada.
                </div>
              </div>
            )}

            <form onSubmit={handlePreSubmit} className="mt-5 space-y-4">
              {/* Tanggal */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase text-slate-700">
                    Tanggal Pekerjaan
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Toleransi susulan H-{settings?.hariToleransiSusulan || 2}
                  </span>
                </div>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/50"
                />
              </div>

              {/* Jam Masuk & Jam Keluar */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Jam Masuk
                  </label>
                  <input
                    type="time"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Standar: {settings?.jamMasukStandar || '08:00'} (tol. {settings?.toleransiKeterlambatan || 10}m)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Jam Keluar
                  </label>
                  <input
                    type="time"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Standar: {settings?.jamKerjaStandarHarian || 8} Jam kerja
                  </span>
                </div>
              </div>

              {/* Kalkulasi Otomatis Preview Card */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Total Jam Kerja:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {liveMetrics.workHoursFormatted} ({liveMetrics.totalHours} jam)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-600">Status Perhitungan:</span>
                  <div className="flex gap-1.5">
                    {liveMetrics.lateMinutes > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                        Telat {liveMetrics.lateMinutes} menit
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-700">
                        Tepat Waktu
                      </span>
                    )}

                    {liveMetrics.overtimeHours > 0 && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
                        Lembur +{liveMetrics.overtimeHours} jam
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Deskripsi Pekerjaan */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Deskripsi Pekerjaan & Aktivitas
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Pembuatan gambar detail isometrik pipa gas 12-inch, koordinasi dengan site manager, dan verifikasi shop drawing..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                />
                <span className="text-[11px] text-slate-400">
                  Uraikan aktivitas kerja yang telah diselesaikan pada hari tersebut.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#1B365D] hover:bg-[#142642] text-white font-semibold text-sm rounded-lg shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {editingId ? "Perbarui & Simpan Perubahan" : "Simpan Timesheet"}
              </button>
            </form>
          </div>
        </div>

        {/* RIWAYAT TIMESHEET SAYA */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#1B365D]" />
                  Riwayat Timesheet Saya
                </h3>
                <p className="text-xs text-slate-500">
                  Histori pengisian presensi dan rincian jam kerja Anda
                </p>
              </div>

              {/* Filter Bulan & Tahun */}
              <div className="flex items-center gap-2">
                <select
                  value={historyMonth}
                  onChange={(e) => setHistoryMonth(e.target.value)}
                  className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
                >
                  <option value="09">September</option>
                  <option value="08">Agustus</option>
                  <option value="07">Juli</option>
                  <option value="06">Juni</option>
                </select>
                <select
                  value={historyYear}
                  onChange={(e) => setHistoryYear(e.target.value)}
                  className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            {/* List / Table Riwayat */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                    <th className="py-2.5 px-3 font-semibold">Jam</th>
                    <th className="py-2.5 px-3 font-semibold">Total Durasi</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Deskripsi Pekerjaan</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myTimesheets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada riwayat timesheet untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    myTimesheets.map((entry) => {
                      const isToday = entry.date === todayStr;
                      return (
                        <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                            {entry.date}
                            {isToday && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                Hari Ini
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                            {entry.checkIn} - {entry.checkOut}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900">
                            {entry.workHoursFormatted || `${entry.totalHours} jam`}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {entry.lateMinutes > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                  Telat {entry.lateMinutes}m
                                </span>
                              )}
                              {entry.overtimeHours > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                                  Lembur +{entry.overtimeHours}j
                                </span>
                              )}
                              {entry.lateMinutes === 0 && entry.overtimeHours === 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                  Normal
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 max-w-xs">
                            <p className="line-clamp-2 text-[11px] leading-relaxed">
                              {entry.description}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            {/* Tombol Edit diperbolehkan untuk hari ini sesuai PRD */}
                            {isToday ? (
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 transition cursor-pointer"
                                title="Edit timesheet hari ini"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Terkunci
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan {myTimesheets.length} entri riwayat</span>
              <span className="italic">* Entri hari yang sama dapat diedit sebelum tengah malam</span>
            </div>
          </div>
        </div>
      </div>

      {/* POP-UP KONFIRMASI SUBMIT TIMESHEET (SESUAI PRD 6.2 & 7) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-full bg-blue-100 text-[#1B365D]">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Pengisian Timesheet
                </h3>
                <p className="text-xs text-slate-500">
                  Pastikan seluruh rincian jam kerja dan deskripsi telah benar sebelum disimpan.
                </p>
              </div>
            </div>

            {/* Summary details */}
            <div className="my-5 bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block">Nama Karyawan:</span>
                  <span className="font-semibold text-slate-800">{currentUser.namaLengkap}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tanggal Kerja:</span>
                  <span className="font-semibold text-slate-800">{selectedDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block">Jam Masuk:</span>
                  <span className="font-bold text-slate-900">{checkIn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jam Keluar:</span>
                  <span className="font-bold text-slate-900">{checkOut}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Jam Kerja:</span>
                  <span className="font-bold text-[#1B365D]">{liveMetrics.workHoursFormatted}</span>
                </div>
              </div>

              <div className="pb-2 border-b border-slate-200">
                <span className="text-slate-500 block mb-1">Status Kehadiran:</span>
                <div className="flex gap-2">
                  {liveMetrics.lateMinutes > 0 ? (
                    <span className="px-2 py-0.5 rounded font-bold bg-red-100 text-red-700">
                      Terlambat {liveMetrics.lateMinutes} menit (Standar {settings?.jamMasukStandar})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded font-medium bg-emerald-100 text-emerald-700">
                      Tepat Waktu
                    </span>
                  )}

                  {liveMetrics.overtimeHours > 0 && (
                    <span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-700">
                      Lembur {liveMetrics.overtimeHours} Jam
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Deskripsi Pekerjaan:</span>
                <p className="bg-white p-2.5 rounded border border-slate-200 text-slate-800 italic leading-relaxed">
                  "{description}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Periksa Ulang / Batal
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
