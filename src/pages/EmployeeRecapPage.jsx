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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#1B365D]" />
            Rekapitulasi Jam Kerja Pribadi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan akumulasi kehadiran bulanan & tahunan untuk keperluan evaluasi dan payroll
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-800"
          >
            <option value="2026">Tahun 2026</option>
            <option value="2025">Tahun 2025</option>
          </select>
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1B365D] hover:bg-[#142642] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Rekap
          </button>
        </div>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Hari Hadir ({selectedYear})</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{annualTotal.totalDays} Hari</div>
          <span className="text-[11px] text-slate-400">Total presensi tercatat</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Jam Kerja</span>
          <div className="text-2xl font-extrabold text-[#1B365D] mt-1">{annualTotal.totalHours} Jam</div>
          <span className="text-[11px] text-slate-400">Akumulasi jam kerja efektif</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Jam Lembur</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">+{annualTotal.totalOvertime} Jam</div>
          <span className="text-[11px] text-emerald-600 font-medium">Jam di luar waktu standar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Terlambat</span>
          <div className="text-2xl font-extrabold text-red-600 mt-1">{annualTotal.totalLateMinutes} Menit</div>
          <span className="text-[11px] text-red-500 font-medium">{annualTotal.lateIncidents} kali kejadian</span>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 tracking-wider">
          Rincian Per Bulan (Tahun {selectedYear})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                <th className="py-3 px-4">Bulan</th>
                <th className="py-3 px-4 text-center">Hari Kerja</th>
                <th className="py-3 px-4 text-right">Total Jam Kerja</th>
                <th className="py-3 px-4 text-right">Rata-rata / Hari</th>
                <th className="py-3 px-4 text-right">Total Lembur</th>
                <th className="py-3 px-4 text-right">Keterlambatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyBreakdown.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {row.name} {selectedYear}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-900">
                    {row.totalDays > 0 ? `${row.totalDays} hari` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#1B365D]">
                    {row.totalHours > 0 ? `${row.totalHours} jam` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {row.totalDays > 0 ? `${(row.totalHours / row.totalDays).toFixed(1)} jam` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.totalOvertime > 0 ? (
                      <span className="font-bold text-emerald-700">+{row.totalOvertime} jam</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
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
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3.5 px-4 uppercase text-xs">Total Akumulasi {selectedYear}</td>
                <td className="py-3.5 px-4 text-center text-xs">{annualTotal.totalDays} hari</td>
                <td className="py-3.5 px-4 text-right text-xs text-[#1B365D]">{annualTotal.totalHours} jam</td>
                <td className="py-3.5 px-4 text-right text-xs text-slate-600">
                  {annualTotal.totalDays > 0 ? `${(annualTotal.totalHours / annualTotal.totalDays).toFixed(1)} jam` : '-'}
                </td>
                <td className="py-3.5 px-4 text-right text-xs text-emerald-700">+{annualTotal.totalOvertime} jam</td>
                <td className="py-3.5 px-4 text-right text-xs text-red-600">{annualTotal.totalLateMinutes} mnt</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
