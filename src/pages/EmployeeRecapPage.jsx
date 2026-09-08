import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Printer, 
  CheckCircle2 
} from 'lucide-react';
import { triggerPrint } from '../utils/exportUtils';

export function EmployeeRecapPage({ currentUser, timesheets }) {
  const [selectedYear, setSelectedYear] = useState('2026');

  // Timesheets user
  const myTimesheets = useMemo(() => {
    return timesheets.filter(ts => ts.employeeId === currentUser.id);
  }, [timesheets, currentUser.id]);

  // Months breakdown list
  const months = [
    { code: '09', name: 'September' },
    { code: '08', name: 'Agustus' },
    { code: '07', name: 'Juli' },
    { code: '06', name: 'Juni' },
    { code: '05', name: 'Mei' },
    { code: '04', name: 'April' },
    { code: '03', name: 'Maret' },
    { code: '02', name: 'Februari' },
    { code: '01', name: 'Januari' },
  ];

  // Month-by-month calculation
  const monthlyBreakdown = useMemo(() => {
    return months.map(m => {
      const entries = myTimesheets.filter(ts => {
        const [year, month] = ts.date.split('-');
        return year === selectedYear && month === m.code;
      });

      const totalDays = entries.length;
      const totalHours = entries.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
      const totalOvertime = entries.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
      const totalLateMinutes = entries.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);
      const lateIncidents = entries.filter(ts => ts.lateMinutes > 0).length;

      return {
        ...m,
        totalDays,
        totalHours: parseFloat(totalHours.toFixed(1)),
        totalOvertime: parseFloat(totalOvertime.toFixed(1)),
        totalLateMinutes,
        lateIncidents,
      };
    });
  }, [myTimesheets, selectedYear]);

  // Annual Totals
  const annualTotal = useMemo(() => {
    const totalDays = monthlyBreakdown.reduce((acc, curr) => acc + curr.totalDays, 0);
    const totalHours = monthlyBreakdown.reduce((acc, curr) => acc + curr.totalHours, 0);
    const totalOvertime = monthlyBreakdown.reduce((acc, curr) => acc + curr.totalOvertime, 0);
    const totalLateMinutes = monthlyBreakdown.reduce((acc, curr) => acc + curr.totalLateMinutes, 0);
    const lateIncidents = monthlyBreakdown.reduce((acc, curr) => acc + curr.lateIncidents, 0);

    return {
      totalDays,
      totalHours: totalHours.toFixed(1),
      totalOvertime: totalOvertime.toFixed(1),
      totalLateMinutes,
      lateIncidents,
    };
  }, [monthlyBreakdown]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1B365D] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#1B365D]" />
            Rekapitulasi Jam Kerja Pribadi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan akumulasi kehadiran bulanan & tahunan untuk keperluan evaluasi dan payroll
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="py-2 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
          >
            <option value="2026">Tahun 2026</option>
            <option value="2025">Tahun 2025</option>
          </select>
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B365D] hover:bg-[#142642] text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Rekap
          </button>
        </div>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hari Hadir */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Hari Hadir ({selectedYear})</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {annualTotal.totalDays} <span className="text-xs font-normal text-slate-400">hari</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">Total presensi tercatat</span>
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
            {annualTotal.totalHours} <span className="text-xs font-normal text-slate-400">jam</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block truncate">Akumulasi jam kerja efektif</span>
        </div>

        {/* Card 3: Lembur */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Lembur</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
            +{annualTotal.totalOvertime} <span className="text-xs font-normal text-slate-400">jam</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block truncate">Jam di luar waktu reguler</span>
        </div>

        {/* Card 4: Keterlambatan */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Keterlambatan</span>
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-2 ${annualTotal.totalLateMinutes > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {annualTotal.totalLateMinutes} <span className="text-xs font-normal text-slate-400">menit</span>
          </div>
          <span className="text-[11px] text-red-500 font-medium mt-1 block truncate">{annualTotal.lateIncidents} kali kejadian telat</span>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden card-hover">
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Rincian Per Bulan (Tahun {selectedYear})
          </div>
          <span className="text-[11px] text-slate-400">9 bulan kalender operasional</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9EEF5] text-slate-800 border-b border-slate-300 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">Bulan</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Hari Kerja</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Total Jam Kerja</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Rata-rata / Hari</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Total Lembur</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Keterlambatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyBreakdown.map((row) => (
                <tr key={row.code} className="hover:bg-blue-50/40 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                    {row.name} {selectedYear}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-900 whitespace-nowrap">
                    {row.totalDays > 0 ? `${row.totalDays} hari` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#1B365D] whitespace-nowrap">
                    {row.totalHours > 0 ? `${row.totalHours} jam` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 whitespace-nowrap">
                    {row.totalDays > 0 ? `${(row.totalHours / row.totalDays).toFixed(1)} jam` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {row.totalOvertime > 0 ? (
                      <span className="font-bold text-emerald-700">+{row.totalOvertime} jam</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {row.totalLateMinutes > 0 ? (
                      <span className="font-bold text-red-600">{row.totalLateMinutes} mnt ({row.lateIncidents}x)</span>
                    ) : (
                      <span className="text-slate-400">0 mnt</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-4 px-4 text-xs whitespace-nowrap">Total akumulasi {selectedYear}</td>
                <td className="py-4 px-4 text-center text-xs whitespace-nowrap">{annualTotal.totalDays} hari</td>
                <td className="py-4 px-4 text-right text-xs text-[#1B365D] whitespace-nowrap">{annualTotal.totalHours} jam</td>
                <td className="py-4 px-4 text-right text-xs text-slate-600 whitespace-nowrap">
                  {annualTotal.totalDays > 0 ? `${(annualTotal.totalHours / annualTotal.totalDays).toFixed(1)} jam` : '-'}
                </td>
                <td className="py-4 px-4 text-right text-xs text-emerald-700 whitespace-nowrap">+{annualTotal.totalOvertime} jam</td>
                <td className="py-4 px-4 text-right text-xs text-red-600 whitespace-nowrap">{annualTotal.totalLateMinutes} mnt</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
