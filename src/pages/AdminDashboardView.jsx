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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
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

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Karyawan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500">Karyawan Aktif</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {kpiStats.activeEmployeesCount} <span className="text-xs font-normal text-slate-500">orang</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Seluruh divisi terdaftar</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-[#1B365D]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Jam Kerja */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500">Total Jam Kerja</span>
            <div className="text-2xl font-extrabold text-[#1B365D] mt-1">
              {kpiStats.totalHours} <span className="text-xs font-normal text-slate-500">jam</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Akumulasi periode terpilih</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-[#1B365D]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Keterlambatan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500">Keterlambatan</span>
            <div className="text-2xl font-extrabold text-red-600 mt-1">
              {kpiStats.totalLateIncidents} <span className="text-xs font-normal text-slate-500">kejadian</span>
            </div>
            <span className="text-[11px] text-red-500 mt-0.5 block font-medium">
              Total {kpiStats.totalLateMinutes} menit telat
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Lembur */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-500">Total Lembur</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              +{kpiStats.totalOvertimeHours} <span className="text-xs font-normal text-slate-500">jam</span>
            </div>
            <span className="text-[11px] text-emerald-600 mt-0.5 block font-medium">
              Sesuai pembulatan {settings?.pembulatanLembur || 30}m
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Filter className="w-4 h-4 text-[#1B365D]" />
          Filter & Pencarian Data
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="lg:col-span-2">
            <label className="block text-slate-600 font-semibold mb-1">Cari Karyawan / Tugas</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ketik nama karyawan, jabatan, atau aktivitas..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
              />
            </div>
          </div>

          {/* Filter Karyawan */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Karyawan</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full py-2 px-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white"
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
              className="w-full py-2 px-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white"
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
                className="w-full py-2 px-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white"
              >
                <option value="all">Semua</option>
                <option value="09">September</option>
                <option value="08">Agustus</option>
                <option value="07">Juli</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full py-2 px-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white"
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
              className="py-1 px-2 border border-slate-200 rounded bg-white text-slate-700 text-xs"
            >
              <option value="date_desc">Tanggal (Terbaru)</option>
              <option value="date_asc">Tanggal (Terlama)</option>
              <option value="hours_desc">Total Jam Kerja (Tertinggi)</option>
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9EEF5] text-slate-800 border-b border-slate-300 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3.5 px-3.5">Tanggal</th>
                <th className="py-3 px-3.5">Karyawan</th>
                <th className="py-3 px-3.5">Jam Masuk</th>
                <th className="py-3 px-3.5">Jam Keluar</th>
                <th className="py-3 px-3.5">Total Jam</th>
                <th className="py-3 px-3.5">Keterlambatan</th>
                <th className="py-3 px-3.5">Lembur</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Ringkasan Pekerjaan</th>
                <th className="py-3 px-3.5 text-center no-print">Aksi</th>
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
                filteredTimesheets.map((ts) => (
                  <tr key={ts.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-900">
                      {ts.date}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{ts.employeeName}</div>
                      <div className="text-[10px] text-slate-500">{ts.position}</div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-700">
                      {ts.checkIn}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-700">
                      {ts.checkOut}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-bold text-[#1B365D]">
                      {ts.workHoursFormatted || `${ts.totalHours} jam`}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {ts.lateMinutes > 0 ? (
                        <span className="font-bold text-red-600">
                          {ts.lateMinutes} menit
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {ts.overtimeHours > 0 ? (
                        <span className="font-bold text-emerald-700">
                          +{ts.overtimeHours} jam
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {ts.lateMinutes > 0 && ts.overtimeHours > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Telat & Lembur
                        </span>
                      ) : ts.lateMinutes > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                          Terlambat
                        </span>
                      ) : ts.overtimeHours > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                          Lembur
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                          Tepat Waktu
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs text-slate-600">
                      <p className="truncate text-[11px]" title={ts.description}>
                        {ts.description}
                      </p>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap no-print">
                      <button
                        onClick={() => setActiveDetailItem(ts)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                        title="Lihat rincian pekerjaan"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Rincian Timesheet Harian
              </h3>
              <button
                onClick={() => setActiveDetailItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Karyawan:</span>
                  <span className="font-bold text-slate-800">{activeDetailItem.employeeName}</span>
                  <span className="text-[11px] text-slate-500 block">{activeDetailItem.position}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tanggal:</span>
                  <span className="font-bold text-slate-800">{activeDetailItem.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Jam Masuk:</span>
                  <span className="font-bold text-slate-800">{activeDetailItem.checkIn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jam Keluar:</span>
                  <span className="font-bold text-slate-800">{activeDetailItem.checkOut}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Jam:</span>
                  <span className="font-bold text-[#1B365D]">{activeDetailItem.workHoursFormatted || `${activeDetailItem.totalHours} jam`}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-500 block mb-1 font-semibold">Deskripsi Aktivitas Pekerjaan:</span>
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {activeDetailItem.description}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveDetailItem(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1B365D] hover:bg-[#142642] rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
