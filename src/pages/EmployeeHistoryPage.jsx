import React, { useState, useMemo } from 'react';
import { 
  History, 
  Calendar, 
  Search, 
  Edit3, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle,
  FileSpreadsheet,
  X,
  Filter,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { calculateTimesheetMetrics, getTodayWIB } from '../utils/timeCalculations';

export function EmployeeHistoryPage({ 
  currentUser, 
  timesheets, 
  onSaveTimesheet, 
  settings, 
  onNavigateToInput 
}) {
  const todayWIB = getTodayWIB();
  const [currentYear, currentMonth] = todayWIB.split('-');

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [editModalItem, setEditModalItem] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editToast, setEditToast] = useState("");

  // User's timesheets
  const myTimesheets = useMemo(() => {
    return timesheets.filter(ts => ts.employeeId === currentUser.id);
  }, [timesheets, currentUser.id]);

  // Filtered timesheets
  const filteredList = useMemo(() => {
    return myTimesheets.filter(ts => {
      const [year, month] = ts.date.split('-');
      if (selectedMonth !== 'all' && month !== selectedMonth) return false;
      if (selectedYear !== 'all' && year !== selectedYear) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchDesc = (ts.description || '').toLowerCase().includes(q);
        const matchDate = ts.date.includes(q);
        if (!matchDesc && !matchDate) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [myTimesheets, selectedMonth, selectedYear, searchTerm]);

  // Monthly summary stats
  const monthlyStats = useMemo(() => {
    const currentMonthEntries = myTimesheets.filter(ts => {
      const [year, month] = ts.date.split('-');
      return month === selectedMonth && year === selectedYear;
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
  }, [myTimesheets, selectedMonth, selectedYear]);

  // Open edit modal for entry
  const handleOpenEdit = (entry) => {
    setEditModalItem(entry);
    setEditCheckIn(entry.checkIn);
    setEditCheckOut(entry.checkOut);
    setEditDescription(entry.description);
  };

  // Save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editModalItem) return;

    const metrics = calculateTimesheetMetrics(editCheckIn, editCheckOut, settings);
    const updated = {
      ...editModalItem,
      checkIn: editCheckIn,
      checkOut: editCheckOut,
      totalHours: metrics.totalHours,
      workHoursFormatted: metrics.workHoursFormatted,
      lateMinutes: metrics.lateMinutes,
      overtimeHours: metrics.overtimeHours,
      status: metrics.status,
      description: editDescription.trim(),
    };

    onSaveTimesheet(updated);
    setEditModalItem(null);
    setEditToast(`Timesheet tanggal ${updated.date} berhasil diperbarui.`);
    setTimeout(() => setEditToast(""), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Toast Alert */}
      {editToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-800 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{editToast}</span>
          </div>
          <button onClick={() => setEditToast('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">
            Tutup
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
              Rekapitulasi Pribadi
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Bulan {selectedMonth}/{selectedYear}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <History className="w-6 h-6 text-[#1B365D]" />
            Riwayat Presensi & Jam Kerja
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap catatan kehadiran {currentUser.namaLengkap} ({currentUser.posisi})
          </p>
        </div>

        <button
          onClick={onNavigateToInput}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1B365D] hover:bg-[#142642] text-white font-bold text-xs shadow-md shadow-blue-950/15 transition cursor-pointer self-start sm:self-auto hover:scale-[1.02] duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Isi Timesheet Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards with Subtle Gradient Accents & Micro Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Hari Kerja */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/80"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Hari Hadir</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {monthlyStats.totalDays} <span className="text-xs font-normal text-slate-400">hari</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">Bulan {selectedMonth}/{selectedYear}</span>
        </div>

        {/* Card 2: Total Jam Kerja */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500/80"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Jam Kerja</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] mt-2">
            {monthlyStats.totalHours} <span className="text-xs font-normal text-slate-400">jam</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">Akumulasi jam efektif</span>
        </div>

        {/* Card 3: Lembur */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/80"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Lembur</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
            +{monthlyStats.totalOvertime} <span className="text-xs font-normal text-slate-400">jam</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block truncate">Kompensasi lembur</span>
        </div>

        {/* Card 4: Keterlambatan */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/80"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Keterlambatan</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-2 ${monthlyStats.totalLateMinutes > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {monthlyStats.totalLateMinutes} <span className="text-xs font-normal text-slate-400">menit</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">Toleransi {settings?.toleransiKeterlambatan || 10}m</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/95 p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kata kunci dalam deskripsi tugas..."
            className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/60 font-medium transition"
          />
        </div>

        {/* Month & Year Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Periode:</span>
          </span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
          >
            <option value="all">Semua Bulan</option>
            <option value="09">September</option>
            <option value="08">Agustus</option>
            <option value="07">Juli</option>
            <option value="06">Juni</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Modern SaaS Data Table */}
      <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden card-hover">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9EEF5] text-slate-800 border-b border-slate-300 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4 whitespace-nowrap">Jam Masuk</th>
                <th className="py-3 px-4 whitespace-nowrap">Jam Keluar</th>
                <th className="py-3 px-4 whitespace-nowrap">Durasi Total</th>
                <th className="py-3 px-4 whitespace-nowrap">Status Kehadiran</th>
                <th className="py-3 px-4 min-w-[260px]">Deskripsi Pekerjaan</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data timesheet untuk periode atau pencarian ini.
                  </td>
                </tr>
              ) : (
                filteredList.map((entry) => {
                  const isToday = entry.date === todayWIB;
                  return (
                    <tr key={entry.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-4 px-4 whitespace-nowrap font-semibold text-slate-900">
                        {entry.date}
                        {isToday && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200/60">
                            Hari Ini
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-700 font-medium">
                        {entry.checkIn}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-700 font-medium">
                        {entry.checkOut}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap font-bold text-[#1B365D]">
                        {entry.workHoursFormatted || `${entry.totalHours} jam`}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1.5">
                          {entry.lateMinutes > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Telat {entry.lateMinutes}m
                            </span>
                          )}
                          {entry.overtimeHours > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Lembur +{entry.overtimeHours}j
                            </span>
                          )}
                          {entry.lateMinutes === 0 && entry.overtimeHours === 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Tepat Waktu
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700 leading-relaxed text-xs">
                        {entry.description}
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {isToday ? (
                          <button
                            onClick={() => handleOpenEdit(entry)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition cursor-pointer"
                            title="Edit isian hari ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic font-medium">
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

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>Menampilkan <strong>{filteredList.length}</strong> entri tercatat</span>
          <span className="italic">* Entri pada hari yang sama dapat direvisi sebelum jam kerja berakhir</span>
        </div>
      </div>

      {/* EDIT MODAL GLASSMORPHIC */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Timesheet ({editModalItem.date})
                </h3>
                <p className="text-xs text-slate-400">Revisi jam kehadiran atau catatan aktivitas</p>
              </div>
              <button onClick={() => setEditModalItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Jam Masuk</label>
                  <input
                    type="time"
                    required
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Jam Keluar</label>
                  <input
                    type="time"
                    required
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Deskripsi Aktivitas</label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl leading-relaxed text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-white bg-[#1B365D] hover:bg-[#142642] rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
