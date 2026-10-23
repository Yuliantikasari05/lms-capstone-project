import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Download
} from 'lucide-react';
import { userService } from '../../services/userService';
import type { CreateUserPayload, UpdateUserPayload } from '../../services/userService';
import type { PaginatedResponse, Role, User } from '../../types';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<User> | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Notification states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserPayload>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_id: 3, // default 'siswa'
    is_active: true,
  });

  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_id: 3,
    is_active: true,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        userService.getUsers({
          search: searchTerm,
          role: selectedRole,
          is_active: selectedStatus,
          page: currentPage,
          per_page: 10,
        }),
        userService.getRoles(),
      ]);
      setPaginatedData(usersRes);
      setRoles(rolesRes);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengambil data pengguna.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedRole, selectedStatus, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleOpenCreate = () => {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      role_id: roles.find((r) => r.name === 'siswa')?.id || 3,
      is_active: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg(null);
    try {
      await userService.createUser(createForm);
      setSuccessMsg('Pengguna baru berhasil ditambahkan.');
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menambahkan pengguna.';
      setErrorMsg(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    const primaryRoleId = user.roles[0]?.id || roles[0]?.id || 1;
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role_id: primaryRoleId,
      is_active: user.is_active,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalLoading(true);
    setErrorMsg(null);
    try {
      await userService.updateUser(selectedUser.id, editForm);
      setSuccessMsg('Data pengguna berhasil diperbarui.');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memperbarui pengguna.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setModalLoading(true);
    setErrorMsg(null);
    try {
      await userService.deleteUser(selectedUser.id);
      setSuccessMsg(`Pengguna ${selectedUser.name} berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus pengguna.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    try {
      const blob = await userService.exportUsers('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daftar_pengguna_maxy_lms_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMsg('Daftar pengguna berhasil diekspor ke format CSV.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengekspor data pengguna.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola identitas, penugasan peran (RBAC), dan status akun seluruh pengguna LMS.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadData()}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs hover:bg-slate-50 transition"
            title="Muat ulang data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow-sm transition"
            title="Ekspor seluruh daftar pengguna ke berkas CSV"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Mengekspor...' : 'Ekspor CSV'}</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}
      {errorMsg && (
        <Alert type="error" message={errorMsg} onClose={() => setErrorMsg(null)} />
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, email, atau telepon..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="">Semua Peran</option>
            <option value="admin">Administrator</option>
            <option value="mentor">Mentor</option>
            <option value="siswa">Siswa</option>
            <option value="karyawan">Karyawan</option>
            <option value="lembaga_bimbingan">Lembaga Bimbingan</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="">Semua Status</option>
            <option value="true">Hanya Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner message="Mengambil daftar pengguna dari PostgreSQL..." />
          </div>
        ) : !paginatedData || paginatedData.data.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">Tidak ada data pengguna ditemukan.</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Pengguna</th>
                    <th className="px-6 py-3.5">Telepon</th>
                    <th className="px-6 py-3.5">Peran (RBAC)</th>
                    <th className="px-6 py-3.5">Status Akun</th>
                    <th className="px-6 py-3.5">Terdaftar</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedData.data.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{user.name}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-600">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-3.5">
                        <RoleBadge role={user.primary_role} size="sm" />
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge isActive={user.is_active} />
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 font-mono">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                            title="Sunting Pengguna"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(user)}
                            disabled={currentUser?.id === user.id}
                            className={`p-1.5 rounded-md transition ${
                              currentUser?.id === user.id
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={
                              currentUser?.id === user.id
                                ? 'Tidak dapat menghapus akun Anda sendiri'
                                : 'Hapus Pengguna'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div>
                Menampilkan{' '}
                <span className="font-semibold">{paginatedData.meta.from || 0}</span> s/d{' '}
                <span className="font-semibold">{paginatedData.meta.to || 0}</span> dari{' '}
                <span className="font-semibold">{paginatedData.meta.total}</span> data
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-40 transition flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <span className="font-mono px-2 font-semibold">
                  {currentPage} / {paginatedData.meta.last_page || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, paginatedData.meta.last_page))}
                  disabled={currentPage >= paginatedData.meta.last_page}
                  className="px-3 py-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-40 transition flex items-center space-x-1"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah Pengguna Baru"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Rina Kusuma"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Email *</label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="nama@maxy.test"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Awal * (Min. 8 karakter)</label>
            <input
              type="password"
              required
              minLength={8}
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
            <input
              type="text"
              value={createForm.phone || ''}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="08123456789"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Peran Akses (Role) *</label>
            <select
              value={createForm.role_id}
              onChange={(e) => setCreateForm({ ...createForm, role_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.display_name} ({r.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active_create"
              checked={createForm.is_active}
              onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <label htmlFor="is_active_create" className="font-medium text-slate-700">
              Aktifkan akun ini segera
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {modalLoading ? 'Menyimpan...' : 'Simpan Pengguna'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Sunting Data Pengguna"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Email *</label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kata Sandi Baru (Kosongkan jika tidak ingin mengubah)
            </label>
            <input
              type="password"
              minLength={8}
              value={editForm.password || ''}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
            <input
              type="text"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Peran Akses (Role) *</label>
            <select
              value={editForm.role_id}
              onChange={(e) => setEditForm({ ...editForm, role_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.display_name} ({r.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active_edit"
              checked={editForm.is_active}
              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <label htmlFor="is_active_edit" className="font-medium text-slate-700">
              Akun Aktif (Dapat masuk ke dalam sistem)
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {modalLoading ? 'Memperbarui...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Pengguna"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Apakah Anda yakin ingin menghapus pengguna{' '}
            <span className="font-bold text-slate-900">{selectedUser?.name}</span> (
            <span className="font-mono text-slate-700">{selectedUser?.email}</span>)?
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
            <p className="font-semibold">Peringatan:</p>
            <p className="mt-0.5">
              Tindakan ini akan mencabut seluruh token sesi dan menghapus riwayat autentikasi pengguna secara permanen.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={modalLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {modalLoading ? 'Menghapus...' : 'Ya, Hapus Pengguna'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
