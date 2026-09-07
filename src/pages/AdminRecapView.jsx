import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Mail, 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { exportToCSV, triggerPrint } from '../utils/exportUtils';

export function AdminRecapView({ timesheets, employees }) {
  const [periodType, setPeriodType] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedMonth, setSelectedMonth] = useState('09');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Email modal simulation state (PRD 6.8)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  // Agregasi rekap per karyawan
  const recapData = useMemo(() => {
    return employees.map((emp) => {
      // Filter timesheets sesuai karyawan dan periode
      const empTimesheets = timesheets.filter((ts) => {
        if (ts.employeeId !== emp.id) return false;
        const [year, month] = ts.date.split('-');
        if (year !== selectedYear) return false;
        if (periodType === 'monthly' && month !== selectedMonth) return false;
        return true;
      });

      const totalDays = empTimesheets.length;
      const totalHours = empTimesheets.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
      const totalLateMinutes = empTimesheets.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);
      const totalOvertimeHours = empTimesheets.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
      const averageHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;

      return {
        employeeId: emp.id,
        namaLengkap: emp.namaLengkap,
        posisi: emp.posisi,
        departemen: emp.departemen,
        status: emp.status,
        totalDays,
        totalHours: parseFloat(totalHours.toFixed(1)),
        totalLateMinutes,
        totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(1)),
        averageHoursPerDay,
      };
    });
  }, [employees, timesheets, periodType, selectedMonth, selectedYear]);

  // Agregasi Total Perusahaan (Grand Total)
  const grandTotal = useMemo(() => {
    const totalDays = recapData.reduce((acc, curr) => acc + curr.totalDays, 0);
    const totalHours = recapData.reduce((acc, curr) => acc + curr.totalHours, 0);
    const totalLateMinutes = recapData.reduce((acc, curr) => acc + curr.totalLateMinutes, 0);
    const totalOvertimeHours = recapData.reduce((acc, curr) => acc + curr.totalOvertimeHours, 0);

    return {
      totalDays,
      totalHours: totalHours.toFixed(1),
      totalLateMinutes,
      totalOvertimeHours: totalOvertimeHours.toFixed(1),
    };
  }, [recapData]);

  // Handle Ekspor Rekap ke Excel CSV
  const handleExportRecapCSV = () => {
    const periodLabel = periodType === 'monthly' ? `Bulan_${selectedMonth}_${selectedYear}` : `Tahun_${selectedYear}`;
    const headers = [
      'ID Karyawan',
      'Nama Karyawan',
      'Jabatan',
      'Departemen',
      'Status Karyawan',
      'Total Hari Kerja',
      'Total Jam Kerja',
      'Rata-rata Jam/Hari',
      'Total Keterlambatan (Menit)',
      'Total Lembur (Jam)',
      'Periode'
    ];

    const rows = recapData.map(r => [
      r.employeeId,
      r.namaLengkap,
      r.posisi,
      r.departemen,
      r.status,
      r.totalDays,
      r.totalHours,
      r.averageHoursPerDay,
      r.totalLateMinutes,
      r.totalOvertimeHours,
      periodLabel
    ]);

    // Baris Grand Total
    rows.push([
      'TOTAL KESELURUHAN',
      '-',
      '-',
      '-',
      '-',
      grandTotal.totalDays,
      grandTotal.totalHours,
      '-',
      grandTotal.totalLateMinutes,
      grandTotal.totalOvertimeHours,
      periodLabel
    ]);

    exportToCSV(`Rekap_Jam_Kerja_${periodLabel}`, headers, rows);
  };

  const handleSendEmailRecap = () => {
    setEmailStatus('sending');
    setTimeout(() => {
      setEmailStatus('sent');
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailStatus('');
      }, 2000);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#1B365D]" />
            Rekap Jam Kerja Karyawan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Laporan rekapitulasi jam kerja otomatis untuk audit dan evaluasi payroll
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            title="Kirim laporan rekap ke email karyawan"
          >
            <Mail className="w-4 h-4" />
            Kirim Rekap via Email
          </button>
          <button
            onClick={handleExportRecapCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            title="Download laporan rekap Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Rekap Excel
          </button>
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1B365D] hover:bg-[#142642] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan PDF
          </button>
        </div>
      </div>

      {/* PERIOD SELECTOR CARD */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase text-slate-600">Mode Rekap:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                periodType === 'monthly' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Bulanan
            </button>
            <button
              onClick={() => setPeriodType('yearly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                periodType === 'yearly' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Akumulasi Tahunan
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {periodType === 'monthly' && (
            <div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="py-1.5 px-3 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700"
              >
                <option value="09">September</option>
                <option value="08">Agustus</option>
                <option value="07">Juli</option>
                <option value="06">Juni</option>
                <option value="05">Mei</option>
                <option value="04">April</option>
                <option value="03">Maret</option>
                <option value="02">Februari</option>
                <option value="01">Januari</option>
              </select>
            </div>
          )}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="py-1.5 px-3 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS AGGREGATE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Total Man-Days</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{grandTotal.totalDays} Hari</div>
          <span className="text-[11px] text-slate-400">Total kehadiran tercatat</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Total Jam Terakumulasi</span>
          <div className="text-xl font-bold text-[#1B365D] mt-1">{grandTotal.totalHours} Jam</div>
          <span className="text-[11px] text-slate-400">Jam kerja seluruh divisi</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Total Keterlambatan</span>
          <div className="text-xl font-bold text-red-600 mt-1">{grandTotal.totalLateMinutes} Menit</div>
          <span className="text-[11px] text-red-500">Selisih waktu masuk</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Total Jam Lembur</span>
          <div className="text-xl font-bold text-emerald-700 mt-1">+{grandTotal.totalOvertimeHours} Jam</div>
          <span className="text-[11px] text-emerald-600">Terhitung kompensasi</span>
        </div>
      </div>

      {/* PRINT HEADER ONLY */}
      <div className="hidden print-only text-center border-b pb-4">
        <h1 className="text-xl font-bold uppercase text-[#1B365D]">PT Suluh Ardhi Engineering</h1>
        <h2 className="text-base font-semibold">Laporan Rekapitulasi Jam Kerja Karyawan</h2>
        <p className="text-xs text-slate-500">
          Periode: {periodType === 'monthly' ? `Bulan ${selectedMonth} ` : ''}Tahun {selectedYear}
        </p>
      </div>

      {/* RECAP TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9EEF5] text-slate-800 border-b border-slate-300 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3.5 px-3.5">ID & Karyawan</th>
                <th className="py-3 px-3.5">Departemen</th>
                <th className="py-3 px-3.5 text-center">Total Hari</th>
                <th className="py-3 px-3.5 text-right">Total Jam Kerja</th>
                <th className="py-3 px-3.5 text-right">Rata-rata/Hari</th>
                <th className="py-3 px-3.5 text-right">Total Keterlambatan</th>
                <th className="py-3 px-3.5 text-right">Total Lembur</th>
                <th className="py-3 px-3.5 text-center">Status Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recapData.map((item) => (
                <tr key={item.employeeId} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900">{item.namaLengkap}</div>
                    <div className="text-[10px] text-slate-500">{item.posisi} • ID: {item.employeeId}</div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-700 font-medium">
                    {item.departemen}
                  </td>
                  <td className="py-3 px-3.5 text-center font-bold text-slate-900">
                    {item.totalDays} hari
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-[#1B365D]">
                    {item.totalHours} jam
                  </td>
                  <td className="py-3 px-3.5 text-right text-slate-600">
                    {item.averageHoursPerDay} jam/hari
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {item.totalLateMinutes > 0 ? (
                      <span className="font-bold text-red-600">
                        {item.totalLateMinutes} mnt
                      </span>
                    ) : (
                      <span className="text-slate-400">0 mnt</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {item.totalOvertimeHours > 0 ? (
                      <span className="font-bold text-emerald-700">
                        +{item.totalOvertimeHours} jam
                      </span>
                    ) : (
                      <span className="text-slate-400">0 jam</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer Grand Total */}
            <tfoot>
              <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-slate-900">
                <td colSpan={2} className="py-3.5 px-3.5 uppercase tracking-wider text-xs">
                  Grand Total Keseluruhan
                </td>
                <td className="py-3.5 px-3.5 text-center text-xs">
                  {grandTotal.totalDays} hari
                </td>
                <td className="py-3.5 px-3.5 text-right text-xs text-[#1B365D]">
                  {grandTotal.totalHours} jam
                </td>
                <td className="py-3.5 px-3.5 text-right text-xs text-slate-500">
                  -
                </td>
                <td className="py-3.5 px-3.5 text-right text-xs text-red-600">
                  {grandTotal.totalLateMinutes} mnt
                </td>
                <td className="py-3.5 px-3.5 text-right text-xs text-emerald-700">
                  +{grandTotal.totalOvertimeHours} jam
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* EMAIL RECAP MODAL (PRD 6.8 SIMULATION) */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#1B365D]">
                <Mail className="w-5 h-5" />
                <h3 className="text-base font-bold">Kirim Rekap via Email</h3>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {emailStatus === 'sent' ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Email Berhasil Dikirim!</h4>
                <p className="text-xs text-slate-600">
                  Rekap jam kerja periode {selectedMonth}/{selectedYear} telah terkirim ke {employees.length} alamat email karyawan.
                </p>
              </div>
            ) : (
              <div className="my-4 space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Fitur ini akan mengirimkan salinan rekapitulasi jam kerja individu secara otomatis ke masing-masing email karyawan aktif.
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Penerima:</span>
                    <span className="font-bold text-slate-800">{employees.length} Karyawan Aktif</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Periode Rekap:</span>
                    <span className="font-bold text-[#1B365D]">{periodType === 'monthly' ? `Bulan ${selectedMonth}/` : ''}{selectedYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Format Lampiran:</span>
                    <span className="font-bold text-slate-800">PDF Rincian Pribadi</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    disabled={emailStatus === 'sending'}
                    onClick={handleSendEmailRecap}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {emailStatus === 'sending' ? 'Mengirim...' : 'Kirim Sekarang'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
