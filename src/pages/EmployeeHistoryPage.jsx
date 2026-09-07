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
  X
} from 'lucide-react';
import { calculateTimesheetMetrics } from '../utils/timeCalculations';

export function EmployeeHistoryPage({ 
  currentUser, 
  timesheets, 
  onSaveTimesheet, 
  settings, 
  onNavigateToInput 
}) {
  const todayStr = "2026-09-07";

  const [selectedMonth, setSelectedMonth] = useState("09");
  const [selectedYear, setSelectedYear] = useState("2026");
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 shadow-xs">
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#1B365D]" />
            Riwayat Presensi & Timesheet Pribadi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar lengkap catatan jam kerja harian {currentUser.namaLengkap} ({currentUser.posisi})
          </p>
        </div>

        <button
          onClick={onNavigateToInput}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B365D] hover:bg-[#142642] text-white font-semibold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Isi Timesheet Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards for Selected Month */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Hari Kerja</span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {monthlyStats.totalDays} <span className="text-xs font-normal text-slate-500">hari</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block truncate">Bulan {selectedMonth}/{selectedYear}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Jam Kerja</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1B365D] mt-1">
            {monthlyStats.totalHours} <span className="text-xs font-normal text-slate-500">jam</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block truncate">Akumulasi efektif</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Lembur</span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
            +{monthlyStats.totalOvertime} <span className="text-xs font-normal text-slate-500">jam</span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-0.5 block truncate">Kompensasi lembur</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Keterlambatan</span>
          <div className={`text-xl sm:text-2xl font-extrabold mt-1 ${monthlyStats.totalLateMinutes > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {monthlyStats.totalLateMinutes} <span className="text-xs font-normal text-slate-500">menit</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block truncate">Toleransi {settings?.toleransiKeterlambatan || 10}m</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kata kunci dalam deskripsi..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
          />
        </div>

        {/* Month & Year Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-slate-500 font-semibold">Periode:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium"
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
            className="py-1.5 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
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
                  const isToday = entry.date === todayStr;
                  return (
                    <tr key={entry.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-900">
                        {entry.date}
                        {isToday && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            Hari Ini
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                        {entry.checkIn}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                        {entry.checkOut}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-[#1B365D]">
                        {entry.workHoursFormatted || `${entry.totalHours} jam`}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {entry.lateMinutes > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                              Telat {entry.lateMinutes}m
                            </span>
                          )}
                          {entry.overtimeHours > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                              Lembur +{entry.overtimeHours}j
                            </span>
                          )}
                          {entry.lateMinutes === 0 && entry.overtimeHours === 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                              Tepat Waktu
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 leading-relaxed text-xs">
                        {entry.description}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isToday ? (
                          <button
                            onClick={() => handleOpenEdit(entry)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                            title="Edit isian hari ini"
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

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredList.length} entri</span>
          <span className="italic">* Sesuai PRD, entri hari yang sama dapat diedit sebelum pergantian hari</span>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Timesheet ({editModalItem.date})
              </h3>
              <button onClick={() => setEditModalItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Jam Masuk</label>
                  <input
                    type="time"
                    required
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Jam Keluar</label>
                  <input
                    type="time"
                    required
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 mb-1">Deskripsi Aktivitas</label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-[#1B365D] hover:bg-[#142642] rounded-lg shadow-xs"
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
