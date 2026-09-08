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
          <h2 className="text-xl font-semibold text-[#1B365D] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#1B365D]" />
            Rekap Jam Kerja Karyawan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Laporan rekapitulasi jam kerja otomatis untuk audit dan evaluasi payroll
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
            title="Kirim laporan rekap ke email karyawan"
          >
            <Mail className="w-4 h-4" />
            Kirim Rekap via Email
          </button>
          <button
            onClick={handleExportRecapCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
            title="Download laporan rekap Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Rekap Excel
          </button>
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1B365D] hover:bg-[#142642] text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan PDF
          </button>
        </div>
      </div>

      {/* PERIOD SELECTOR CARD */}
      <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print card-hover">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mode Rekapitulasi:</span>
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-100/90">
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                periodType === 'monthly' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Bulanan
            </button>
            <button
              onClick={() => setPeriodType('yearly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                periodType === 'yearly' ? 'bg-white text-[#1B365D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Akumulasi Tahunan
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {periodType === 'monthly' && (
            <div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="py-2 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50/60 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
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
              className="py-2 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50/60 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS AGGREGATE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Man-Days */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Man-Days</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {grandTotal.totalDays} <span className="text-xs font-normal text-slate-400">hari kerja</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">Total kehadiran staf tercatat</span>
        </div>

        {/* Card 2: Total Jam Terakumulasi */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Jam Terakumulasi</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] mt-2">
            {grandTotal.totalHours} <span className="text-xs font-normal text-slate-400">jam</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block truncate">Jam kerja seluruh divisi</span>
        </div>

        {/* Card 3: Total Keterlambatan */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Keterlambatan</span>
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-2">
            {grandTotal.totalLateMinutes} <span className="text-xs font-normal text-slate-400">menit</span>
          </div>
          <span className="text-[11px] text-red-500 font-medium mt-1 block truncate">Selisih waktu masuk</span>
        </div>

        {/* Card 4: Total Jam Lembur */}
        <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Jam Lembur</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
            +{grandTotal.totalOvertimeHours} <span className="text-xs font-normal text-slate-400">jam</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block truncate">Terhitung kompensasi payroll</span>
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
      <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden card-hover">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9EEF5] text-slate-800 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 whitespace-nowrap">ID & Karyawan</th>
                <th className="py-3 px-4 whitespace-nowrap">Departemen</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Total Hari</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Total Jam Kerja</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Rata-rata/Hari</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Total Keterlambatan</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Total Lembur</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recapData.map((item) => {
                const initials = item.namaLengkap
                  ? item.namaLengkap.split(' ').map(n => n[0]).slice(0, 2).join('')
                  : 'EMP';
                return (
                  <tr key={item.employeeId} className="hover:bg-blue-50/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#1B365D] font-bold flex items-center justify-center text-xs shadow-xs shrink-0 border border-blue-200/60">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight">{item.namaLengkap}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.posisi} • <span className="font-mono">{item.employeeId}</span></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {item.departemen}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 whitespace-nowrap">
                      {item.totalDays} hari
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#1B365D] whitespace-nowrap">
                      {item.totalHours} jam
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 whitespace-nowrap">
                      {item.averageHoursPerDay} jam/hari
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {item.totalLateMinutes > 0 ? (
                        <span className="font-bold text-red-600">
                          {item.totalLateMinutes} mnt
                        </span>
                      ) : (
                        <span className="text-slate-400">0 mnt</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {item.totalOvertimeHours > 0 ? (
                        <span className="font-bold text-emerald-700">
                          +{item.totalOvertimeHours} jam
                        </span>
                      ) : (
                        <span className="text-slate-400">0 jam</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'aktif' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer Grand Total */}
            <tfoot>
              <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900">
                <td colSpan={2} className="py-4 px-4 text-xs">
                  Grand Total Keseluruhan
                </td>
                <td className="py-4 px-4 text-center text-xs whitespace-nowrap">
                  {grandTotal.totalDays} hari
                </td>
                <td className="py-4 px-4 text-right text-xs text-[#1B365D] whitespace-nowrap">
                  {grandTotal.totalHours} jam
                </td>
                <td className="py-4 px-4 text-right text-xs text-slate-500 whitespace-nowrap">
                  -
                </td>
                <td className="py-4 px-4 text-right text-xs text-red-600 whitespace-nowrap">
                  {grandTotal.totalLateMinutes} mnt
                </td>
                <td className="py-4 px-4 text-right text-xs text-emerald-700 whitespace-nowrap">
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#1B365D]">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold">Kirim Rekap via Email</h3>
              </div>
              <button 
                onClick={() => setShowEmailModal(false)} 
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
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
              <div className="my-4 space-y-3.5 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Fitur ini akan mengirimkan salinan rekapitulasi jam kerja individu secara otomatis ke masing-masing email karyawan aktif.
                </p>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Target Penerima:</span>
                    <span className="font-bold text-slate-800">{employees.length} Karyawan Aktif</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Periode Rekap:</span>
                    <span className="font-bold text-[#1B365D]">{periodType === 'monthly' ? `Bulan ${selectedMonth}/` : ''}{selectedYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Format Lampiran:</span>
                    <span className="font-bold text-slate-800">PDF Rincian Pribadi</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    disabled={emailStatus === 'sending'}
                    onClick={handleSendEmailRecap}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
