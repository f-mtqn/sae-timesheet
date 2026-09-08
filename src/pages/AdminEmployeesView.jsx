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
  Building
} from 'lucide-react';

export function AdminEmployeesView({ employees, onSaveEmployee, onToggleStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

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
    tanggalBergabung: '2026-09-07',
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
                return (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#1B365D] font-bold flex items-center justify-center text-xs shadow-xs shrink-0 border border-blue-200/60">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight">{emp.namaLengkap}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">ID: {emp.id}</div>
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
    </div>
  );
}
