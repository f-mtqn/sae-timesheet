import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Eye, 
  ArrowUpDown,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import { exportToCSV, triggerPrint } from '../utils/exportUtils';

export function AdminDashboardView({ timesheets, employees, settings }) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('09');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'hours_desc' | 'name_asc'

  // Modal detail deskripsi
  const [activeDetailItem, setActiveDetailItem] = useState(null);

  // Filtered timesheets
  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((ts) => {
      // Filter Bulan & Tahun
      const [year, month] = ts.date.split('-');
      if (selectedMonth !== 'all' && month !== selectedMonth) return false;
      if (selectedYear !== 'all' && year !== selectedYear) return false;

      // Filter Karyawan
      if (selectedEmployeeId !== 'all' && ts.employeeId !== selectedEmployeeId) return false;

      // Filter Status
      if (selectedStatus === 'normal') {
        if (ts.lateMinutes > 0 || ts.overtimeHours > 0) return false;
      } else if (selectedStatus === 'telat') {
        if (!ts.lateMinutes || ts.lateMinutes <= 0) return false;
      } else if (selectedStatus === 'lembur') {
        if (!ts.overtimeHours || ts.overtimeHours <= 0) return false;
      }

      // Search bar (nama, posisi, deskripsi)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = (ts.employeeName || '').toLowerCase().includes(query);
        const matchPos = (ts.position || '').toLowerCase().includes(query);
        const matchDesc = (ts.description || '').toLowerCase().includes(query);
        if (!matchName && !matchPos && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'hours_desc') return (b.totalHours || 0) - (a.totalHours || 0);
      if (sortBy === 'name_asc') return (a.employeeName || '').localeCompare(b.employeeName || '');
      return 0;
    });
  }, [timesheets, selectedMonth, selectedYear, selectedEmployeeId, selectedStatus, searchTerm, sortBy]);

  // Executive KPI summary stats
  const kpiStats = useMemo(() => {
    const activeEmployeesCount = employees.filter(e => e.status === 'aktif').length;
    
    // Total jam & insiden dari data yang sedang aktif difilter atau seluruh data bulan ini
    const totalHours = filteredTimesheets.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const totalLateIncidents = filteredTimesheets.filter(ts => ts.lateMinutes > 0).length;
    const totalLateMinutes = filteredTimesheets.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);
    const totalOvertimeHours = filteredTimesheets.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);

    return {
      activeEmployeesCount,
      totalHours: totalHours.toFixed(1),
      totalLateIncidents,
      totalLateMinutes,
      totalOvertimeHours: totalOvertimeHours.toFixed(1),
    };
  }, [employees, filteredTimesheets]);

  // Handle Ekspor ke CSV / Excel
  const handleExportCSV = () => {
    const headers = [
      'ID Timesheet',
      'Tanggal',
      'ID Karyawan',
      'Nama Karyawan',
      'Jabatan',
      'Jam Masuk',
      'Jam Keluar',
      'Total Jam Kerja',
      'Keterlambatan (Menit)',
      'Lembur (Jam)',
      'Status',
      'Deskripsi Pekerjaan'
    ];

    const rows = filteredTimesheets.map(ts => [
      ts.id,
      ts.date,
      ts.employeeId,
      ts.employeeName,
      ts.position,
      ts.checkIn,
      ts.checkOut,
      ts.totalHours,
      ts.lateMinutes,
      ts.overtimeHours,
      ts.status,
      ts.description
    ]);

    const filename = `Timesheet_Suluh_Ardhi_${selectedMonth}_${selectedYear}`;
    exportToCSV(filename, headers, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1B365D] tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#1B365D]" />
            Dashboard Monitoring Timesheet
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau jam kerja seluruh tim rekayasa & operasional PT Suluh Ardhi Engineering secara terpusat
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            title="Download file CSV / Excel data yang difilter"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Excel (CSV)
          </button>
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1B365D] hover:bg-[#142642] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            title="Cetak atau simpan sebagai PDF"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS WITH SUBTLE ACCENTS & MICRO-INDICATORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Karyawan */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Karyawan Aktif</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {kpiStats.activeEmployeesCount} <span className="text-xs font-normal text-slate-400">orang</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>100% status aktif</span>
          </div>
        </div>

        {/* Card 2: Total Jam Kerja */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Jam Kerja</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] mt-2">
            {kpiStats.totalHours} <span className="text-xs font-normal text-slate-400">jam</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium">
            <span>Akumulasi periode terpilih</span>
          </div>
        </div>

        {/* Card 3: Total Keterlambatan */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Keterlambatan</span>
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-2">
            {kpiStats.totalLateIncidents} <span className="text-xs font-normal text-slate-400">kejadian</span>
          </div>
          <div className="mt-1 text-[11px] text-red-500 font-semibold truncate">
            Total {kpiStats.totalLateMinutes} menit selisih
          </div>
        </div>

        {/* Card 4: Total Lembur */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Lembur</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
            +{kpiStats.totalOvertimeHours} <span className="text-xs font-normal text-slate-400">jam</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium truncate">
            Pembulatan {settings?.pembulatanLembur || 30} menit
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="bg-white/95 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 no-print card-hover">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter & Pencarian Monitoring</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="lg:col-span-2">
            <label className="block text-slate-600 font-semibold mb-1">Cari Karyawan / Tugas</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ketik nama karyawan, jabatan, atau aktivitas..."
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/60 font-medium transition"
              />
            </div>
          </div>

          {/* Filter Karyawan */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Karyawan</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/60 font-medium transition text-slate-800"
            >
              <option value="all">Semua Karyawan</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.namaLengkap}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Status Kehadiran</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/60 font-medium transition text-slate-800"
            >
              <option value="all">Semua Status</option>
              <option value="normal">Tepat Waktu / Normal</option>
              <option value="telat">Terlambat Saja</option>
              <option value="lembur">Lembur Saja</option>
            </select>
          </div>

          {/* Filter Periode */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Bulan & Tahun</label>
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full py-2.5 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/60 font-medium transition text-slate-800"
              >
                <option value="all">Semua</option>
                <option value="09">September</option>
                <option value="08">Agustus</option>
                <option value="07">Juli</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full py-2.5 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/60 font-medium transition text-slate-800"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <span>Menemukan <strong>{filteredTimesheets.length}</strong> entri timesheet</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-3 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-700 text-xs font-semibold focus:outline-none"
            >
              <option value="date_desc">Tanggal (Terbaru)</option>
              <option value="date_asc">Tanggal (Terlama)</option>
              <option value="late_desc">Terlambat Tertinggi</option>
              <option value="overtime_desc">Lembur Tertinggi</option>
              <option value="hours_desc">Total Jam Terbanyak</option>
              <option value="name_asc">Nama Karyawan (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRINT HEADER ONLY (VISIBLE IN PRINT MODE) */}
      <div className="hidden print-only mb-6 text-center border-b pb-4">
        <h1 className="text-xl font-bold uppercase text-[#1B365D]">PT Suluh Ardhi Engineering</h1>
        <h2 className="text-base font-semibold">Laporan Monitoring Presensi & Timesheet Karyawan</h2>
        <p className="text-xs text-slate-500">Periode: {selectedMonth !== 'all' ? `Bulan ${selectedMonth}` : 'Semua Bulan'} {selectedYear}</p>
      </div>

      {/* MONITORING TABLE */}
      <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden card-hover">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9EEF5] text-slate-800 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4 whitespace-nowrap">Karyawan</th>
                <th className="py-3 px-4 whitespace-nowrap">Jam Masuk</th>
                <th className="py-3 px-4 whitespace-nowrap">Jam Keluar</th>
                <th className="py-3 px-4 whitespace-nowrap">Total Jam</th>
                <th className="py-3 px-4 whitespace-nowrap">Keterlambatan</th>
                <th className="py-3 px-4 whitespace-nowrap">Lembur</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 min-w-[200px]">Ringkasan Pekerjaan</th>
                <th className="py-3 px-4 text-center no-print whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTimesheets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Tidak ada data timesheet yang sesuai dengan kriteria filter di atas.
                  </td>
                </tr>
              ) : (
                filteredTimesheets.map((ts) => {
                  const initials = ts.employeeName
                    ? ts.employeeName.split(' ').map(n => n[0]).slice(0, 2).join('')
                    : 'EMP';
                  return (
                    <tr key={ts.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-900">
                        {ts.date}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#1B365D] font-bold flex items-center justify-center text-xs shadow-xs shrink-0 border border-blue-200/60">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight">{ts.employeeName}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{ts.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700 font-medium">
                        {ts.checkIn}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700 font-medium">
                        {ts.checkOut}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-[#1B365D]">
                        {ts.workHoursFormatted || `${ts.totalHours} jam`}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ts.lateMinutes > 0 ? (
                          <span className="font-bold text-red-600">
                            {ts.lateMinutes} menit
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ts.overtimeHours > 0 ? (
                          <span className="font-bold text-emerald-700">
                            +{ts.overtimeHours} jam
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ts.lateMinutes > 0 && ts.overtimeHours > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Telat & Lembur
                          </span>
                        ) : ts.lateMinutes > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Terlambat
                          </span>
                        ) : ts.overtimeHours > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Lembur
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Tepat Waktu
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600">
                        <p className="truncate text-[11px]" title={ts.description}>
                          {ts.description}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap no-print">
                        <button
                          onClick={() => setActiveDetailItem(ts)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold cursor-pointer transition border border-transparent hover:border-blue-200"
                          title="Lihat rincian pekerjaan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Rincian Timesheet Karyawan
                </h3>
                <span className="text-[11px] text-slate-400">Verifikasi pencatatan harian & rincian pekerjaan</span>
              </div>
              <button
                onClick={() => setActiveDetailItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Karyawan:</span>
                  <span className="font-bold text-slate-900 text-sm block">{activeDetailItem.employeeName}</span>
                  <span className="text-[11px] text-slate-500 block">{activeDetailItem.position}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Tanggal:</span>
                  <span className="font-bold text-slate-900 text-sm block">{activeDetailItem.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Jam Masuk:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm block">{activeDetailItem.checkIn}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Jam Keluar:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm block">{activeDetailItem.checkOut}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Total Jam:</span>
                  <span className="font-bold text-[#1B365D] text-sm block">{activeDetailItem.workHoursFormatted || `${activeDetailItem.totalHours} jam`}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                <span className="text-slate-500 block mb-1.5 font-bold text-[11px] uppercase tracking-wider">Deskripsi Aktivitas Pekerjaan:</span>
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-xs">
                  {activeDetailItem.description}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveDetailItem(null)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#142642] rounded-xl transition cursor-pointer shadow-sm hover:shadow"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
