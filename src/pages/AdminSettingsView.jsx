import React, { useState } from 'react';
import { 
  Settings, 
  Clock, 
  AlertCircle, 
  Save, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert,
  Sliders,
  Mail
} from 'lucide-react';

export function AdminSettingsView({ settings, onSaveSettings }) {
  const [formData, setFormData] = useState({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#1B365D]" />
          Pengaturan Jam Kerja & Kebijakan Timesheet
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi parameter standar jam kerja, perhitungan lembur, dan toleransi keterlambatan PT Suluh Ardhi Engineering
        </p>
      </div>

      {/* Success Notification */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">
            Pengaturan berhasil diperbarui! Parameter ini langsung aktif pada seluruh formulir & rekap timesheet.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Parameter Jam Kerja & Kehadiran */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-[#1B365D]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Parameter Jam Kerja Harian
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Jam Masuk Standar */}
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Jam Masuk Standar Kantor
              </label>
              <input
                type="time"
                value={formData.jamMasukStandar}
                onChange={(e) => setFormData({ ...formData, jamMasukStandar: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Karyawan yang masuk setelah jam ini (+toleransi) dihitung terlambat.
              </span>
            </div>

            {/* Jam Kerja Standar Harian */}
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Jam Kerja Standar (Jam / Hari)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="4"
                  max="12"
                  value={formData.jamKerjaStandarHarian}
                  onChange={(e) => setFormData({ ...formData, jamKerjaStandarHarian: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                />
                <span className="font-semibold text-slate-600">Jam</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Umumnya 8 jam kerja per hari kerja normal.
              </span>
            </div>

            {/* Toleransi Keterlambatan */}
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Toleransi Keterlambatan (Menit)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.toleransiKeterlambatan}
                  onChange={(e) => setFormData({ ...formData, toleransiKeterlambatan: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                />
                <span className="font-semibold text-slate-600">Menit</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Misal jika 10 menit, maka hadir sebelum {formData.jamMasukStandar ? `${formData.jamMasukStandar.slice(0, 3)}10` : '08:10'} tidak dikenai penalti telat.
              </span>
            </div>

            {/* Pembulatan Lembur */}
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Aturan Pembulatan Lembur
              </label>
              <select
                value={formData.pembulatanLembur}
                onChange={(e) => setFormData({ ...formData, pembulatanLembur: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white"
              >
                <option value="15">Dibulatkan per 15 Menit</option>
                <option value="30">Dibulatkan per 30 Menit (Direkomendasikan)</option>
                <option value="60">Dibulatkan per 1 Jam Penuh</option>
                <option value="1">Hitung Real (Per Menit)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Basis perhitungan agregasi jam lembur di rekap.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Kebijakan Input Susulan & Notifikasi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-[#1B365D]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Kebijakan Formulir & Notifikasi
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Hari Toleransi Susulan */}
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Batas Pengisian Susulan (Backdate)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={formData.hariToleransiSusulan}
                  onChange={(e) => setFormData({ ...formData, hariToleransiSusulan: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white"
                >
                  <option value="0">Hanya Hari Ini (Tidak ada susulan)</option>
                  <option value="1">Maksimal H-1 (Kemarin)</option>
                  <option value="2">Maksimal H-2 (Dua hari ke belakang)</option>
                  <option value="5">Maksimal 5 Hari Kerja</option>
                </select>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Mencegah karyawan mengisi timesheet bulan lalu yang sudah ditutup.
              </span>
            </div>

            {/* Pengiriman Email Otomatis */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailRekapOtomatis}
                  onChange={(e) => setFormData({ ...formData, emailRekapOtomatis: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Kirim Rekap Email Otomatis</span>
                  <span className="text-[11px] text-slate-500">
                    Otomatis kirim rekap bulanan ke seluruh karyawan pada akhir bulan.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Business Rule Notice */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold">Aturan Bisnis PRD:</strong>
            <p className="leading-relaxed text-blue-800">
              Setiap kali pengaturan di atas diubah dan disimpan, rumus perhitungan pada entri timesheet yang baru disubmit akan mengikuti parameter terkini secara real-time tanpa perlu restart server.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1B365D] hover:bg-[#142642] text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Seluruh Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
}
