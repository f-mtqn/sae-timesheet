import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  UserX, 
  UserCheck, 
  Search, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  X,
  Phone,
  Mail,
  Building,
  CalendarClock,
  AlertCircle,
  Trash2,
  Loader2
} from 'lucide-react';
import { getTodayWIB, formatDateIndoWIB } from '../utils/timeCalculations';

export function AdminEmployeesView({ 
  employees, 
  onSaveEmployee, 
  onToggleStatus,
  lateEntryPermits = [],
  onGrantPermit,
  onRevokePermit
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal Karyawan State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Modal Izin Susulan State
  const [permitModalOpen, setPermitModalOpen] = useState(false);
  const [selectedEmployeeForPermit, setSelectedEmployeeForPermit] = useState(null);
  const [permitDate, setPermitDate] = useState('');
  const [permitReason, setPermitReason] = useState('');
  const [permitLoading, setPermitLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    id: '',
    namaLengkap: '',
    email: '',
    noTelepon: '',
    posisi: '',
    departemen: 'Engineering',
    role: 'user',
    status: 'aktif',
    tanggalBergabung: getTodayWIB(),
  });

  const [toastMessage, setToastMessage] = useState('');

  // Filtered employee list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (filterStatus !== 'all' && emp.status !== filterStatus) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (emp.namaLengkap || '').toLowerCase().includes(q);
        const matchEmail = (emp.email || '').toLowerCase().includes(q);
        const matchPos = (emp.posisi || '').toLowerCase().includes(q);
        const matchId = (emp.id || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPos && !matchId) return false;
      }
      return true;
    });
  }, [employees, filterStatus, searchTerm]);

  // Buka modal tambah
  const handleOpenAddModal = () => {
    const nextIdNum = employees.length + 1;
    const generatedId = `EMP-${String(nextIdNum).padStart(3, '0')}`;
    setEditingEmployee(null);
    setFormData({
      id: generatedId,
      namaLengkap: '',
      email: '',
      noTelepon: '',
      posisi: '',
      departemen: 'Engineering',
      role: 'user',
      status: 'aktif',
      tanggalBergabung: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  // Buka modal edit
  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      id: emp.id,
      namaLengkap: emp.namaLengkap,
      email: emp.email,
      noTelepon: emp.noTelepon || '',
      posisi: emp.posisi || '',
      departemen: emp.departemen || 'Engineering',
      role: emp.role || 'user',
      status: emp.status || 'aktif',
      tanggalBergabung: emp.tanggalBergabung || '2024-01-01',
    });
    setIsModalOpen(true);
  };

  // Submit simpan / update
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.email || !formData.posisi) {
      alert('Mohon isi nama lengkap, email, dan posisi/jabatan.');
      return;
    }

    onSaveEmployee(formData);
    setIsModalOpen(false);
    setToastMessage(
      editingEmployee 
        ? `Data karyawan ${formData.namaLengkap} berhasil diperbarui.`
        : `Karyawan baru ${formData.namaLengkap} berhasil ditambahkan.`
    );
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Handler Buka Modal Izin Susulan
  const handleOpenPermitModal = (emp) => {
    setSelectedEmployeeForPermit(emp);
    const today = getTodayWIB();
    const d = new Date(`${today}T12:00:00+07:00`);
    d.setDate(d.getDate() - 1);
    const yesterdayStr = d.toISOString().slice(0, 10);
    setPermitDate(yesterdayStr);
    setPermitReason('');
    setPermitModalOpen(true);
  };

  // Handler Submit Izin Susulan
  const handleSubmitPermit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeForPermit || !permitDate || !permitReason.trim()) {
      alert('Mohon pilih tanggal dan masukkan alasan izin susulan.');
      return;
    }
    setPermitLoading(true);
    try {
      await onGrantPermit({
        employeeId: selectedEmployeeForPermit.id,
        employeeCode: selectedEmployeeForPermit.employeeCode || selectedEmployeeForPermit.id,
        employeeName: selectedEmployeeForPermit.namaLengkap,
        permittedDate: permitDate,
        reason: permitReason.trim(),
      });
      setToastMessage(`Izin susulan tanggal ${permitDate} berhasil diberikan kepada ${selectedEmployeeForPermit.namaLengkap}!`);
      setTimeout(() => setToastMessage(''), 4000);
      setPermitModalOpen(false);
    } catch (err) {
      console.error('Error granting permit:', err);
      alert('Gagal memberikan izin: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setPermitLoading(false);
    }
  };

  // Handler Cabut Izin Susulan
  const handleRevoke = async (permitId) => {
    if (!confirm('Apakah Anda yakin ingin mencabut izin susulan ini?')) return;
    try {
      await onRevokePermit(permitId);
      setToastMessage('Izin susulan berhasil dicabut.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Error revoking permit:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1B365D] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1B365D]" />
            Manajemen Data Karyawan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data staf teknik & administrasi, status akun, dan hak akses sistem
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B365D] hover:bg-[#142642] text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Karyawan Baru
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white/95 p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs card-hover">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, ID, atau jabatan..."
            className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-slate-50/60 font-medium transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3.5 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
          >
            <option value="all">Semua Karyawan ({employees.length})</option>
            <option value="aktif">Aktif ({employees.filter(e => e.status === 'aktif').length})</option>
            <option value="nonaktif">Nonaktif ({employees.filter(e => e.status === 'nonaktif').length})</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden card-hover">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9EEF5] text-slate-800 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 whitespace-nowrap">Karyawan</th>
                <th className="py-3 px-4 whitespace-nowrap">Kontak</th>
                <th className="py-3 px-4 whitespace-nowrap">Jabatan & Departemen</th>
                <th className="py-3 px-4 whitespace-nowrap">Tgl Bergabung</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Hak Akses</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => {
                const initials = emp.namaLengkap
                  ? emp.namaLengkap.split(' ').map(n => n[0]).slice(0, 2).join('')
                  : 'EMP';
                const pendingPermit = (lateEntryPermits || []).find(p => p.employeeId === emp.id && p.status === 'pending');
                return (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#1B365D] font-bold flex items-center justify-center text-xs shadow-xs shrink-0 border border-blue-200/60">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight">{emp.namaLengkap}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">ID: {emp.employeeCode || emp.id}</div>
                          {pendingPermit && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" title={`Alasan: ${pendingPermit.reason}`}>
                                <CalendarClock className="w-3 h-3 text-amber-700" />
                                <span>Izin Susulan: {pendingPermit.permittedDate}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.noTelepon || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{emp.posisi}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" /> {emp.departemen}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-xs">
                      {emp.tanggalBergabung}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {emp.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                          <ShieldCheck className="w-3 h-3 text-amber-600" /> Admin HR
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <User className="w-3 h-3 text-slate-500" /> Karyawan
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        emp.status === 'aktif' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70' 
                          : 'bg-red-50 text-red-700 border border-red-200/70'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'aktif' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {emp.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handleOpenPermitModal(emp)}
                        className="p-2 rounded-xl hover:bg-amber-50 text-slate-500 hover:text-amber-700 transition cursor-pointer border border-transparent hover:border-amber-200"
                        title="Beri Izin Susulan Absensi (Lewat Hari)"
                      >
                        <CalendarClock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        className="p-2 rounded-xl hover:bg-blue-50 text-slate-500 hover:text-blue-700 transition cursor-pointer border border-transparent hover:border-blue-200"
                        title="Edit Data Karyawan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(emp.id)}
                        className={`p-2 rounded-xl transition cursor-pointer border border-transparent ${
                          emp.status === 'aktif'
                            ? 'hover:bg-red-50 text-slate-400 hover:text-red-600 hover:border-red-200'
                            : 'hover:bg-emerald-50 text-emerald-600 hover:border-emerald-200'
                        }`}
                        title={emp.status === 'aktif' ? "Nonaktifkan Akun (Soft Delete)" : "Aktifkan Kembali Akun"}
                      >
                        {emp.status === 'aktif' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT KARYAWAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingEmployee ? "Edit Profil Karyawan" : "Tambah Karyawan Baru"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">ID Karyawan</label>
                  <input
                    type="text"
                    disabled
                    value={formData.id}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-100/90 font-mono text-slate-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                  placeholder="Contoh: Ir. Rahmat Hidayat, M.T."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Email Perusahaan</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahmat.h@suluhardhi.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">No. Telepon / WA</label>
                  <input
                    type="tel"
                    value={formData.noTelepon}
                    onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Departemen</label>
                  <select
                    value={formData.departemen}
                    onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="QA & HSE">QA & HSE</option>
                    <option value="Project Support">Project Support</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Posisi / Jabatan</label>
                  <input
                    type="text"
                    required
                    value={formData.posisi}
                    onChange={(e) => setFormData({ ...formData, posisi: e.target.value })}
                    placeholder="Piping Drafter"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Peran Sistem (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/60 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                  >
                    <option value="user">Karyawan (Input Timesheet)</option>
                    <option value="admin">Admin (HR & Rekap)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#1B365D] hover:bg-[#142642] rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingEmployee ? "Simpan Perubahan" : "Tambahkan Karyawan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IZIN PENGISIAN SUSULAN (DISPENSASI ADMIN HR) */}
      {permitModalOpen && selectedEmployeeForPermit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Izin Pengisian Susulan Absensi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Beri dispensasi tanggal terlewat bagi karyawan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPermitModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Karyawan */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Karyawan Penerima Izin</span>
                <span className="font-bold text-slate-800 text-sm">{selectedEmployeeForPermit.namaLengkap}</span>
                <span className="text-slate-500 block text-[11px] font-mono">
                  {selectedEmployeeForPermit.employeeCode || selectedEmployeeForPermit.id} • {selectedEmployeeForPermit.posisi}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full font-semibold text-[11px] bg-blue-50 text-blue-800 border border-blue-200">
                {selectedEmployeeForPermit.departemen}
              </span>
            </div>

            <form onSubmit={handleSubmitPermit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Tanggal Yang Diizinkan Untuk Diisi Susulan</span>
                  <span className="text-[11px] text-slate-400 font-medium">Pilih tanggal lampau</span>
                </label>
                <input
                  type="date"
                  required
                  value={permitDate}
                  max={getTodayWIB()}
                  onChange={(e) => setPermitDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {permitDate && formatDateIndoWIB(permitDate)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alasan / Keterangan Dispensasi Resmi (Wajib)
                </label>
                <textarea
                  required
                  rows={3}
                  value={permitReason}
                  onChange={(e) => setPermitReason(e.target.value)}
                  placeholder="Contoh: Penugasan luar kota ke Balongan tanpa sinyal / dispensasi isolasi mandiri / kendala teknis sistem..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 leading-relaxed"
                />
              </div>

              {/* Riwayat Izin Karyawan Ini */}
              {(() => {
                const empPermits = (lateEntryPermits || []).filter(p => p.employeeId === selectedEmployeeForPermit.id);
                if (empPermits.length === 0) return null;
                return (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Riwayat Izin Susulan Karyawan Ini:
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {empPermits.map(p => (
                        <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              <span>{p.permittedDate}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'completed' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : p.status === 'revoked'
                                  ? 'bg-slate-200 text-slate-600 line-through'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {p.status === 'completed' ? 'Sudah Diisi' : p.status === 'revoked' ? 'Dicabut' : 'Menunggu Pengisian'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs italic">
                              "{p.reason}"
                            </p>
                          </div>
                          {p.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(p.id)}
                              className="text-[11px] font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer shrink-0"
                            >
                              Cabut
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPermitModalOpen(false)}
                  className="px-4 py-2.5 font-semibold text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={permitLoading}
                  className="px-5 py-2.5 font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  {permitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Izin...</span>
                    </>
                  ) : (
                    <>
                      <CalendarClock className="w-4 h-4" />
                      <span>Keluarkan Izin Susulan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
