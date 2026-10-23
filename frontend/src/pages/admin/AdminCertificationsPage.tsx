import React, { useState, useEffect, useCallback } from 'react';
import { Award, CheckCircle, Clock, Download, ExternalLink, Filter, Search, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { downloadCertificatePdf } from '../../lib/pdfGenerator';
import { certificationService, CertificationApplication } from '../../services/certificationService';

export const AdminCertificationsPage: React.FC = () => {
  const [certifications, setCertifications] = useState<CertificationApplication[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedCert, setSelectedCert] = useState<CertificationApplication | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await certificationService.getAll();
      setCertifications(data);
    } catch (e) {
      console.error('Failed to load certifications in Admin page', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('lms:certifications-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('lms:certifications-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  const filteredCerts = certifications.filter((cert) => {
    const matchFilter = filter === 'all' || cert.status === filter;
    const matchSearch =
      cert.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      cert.company.toLowerCase().includes(search.toLowerCase()) ||
      cert.track.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleApproveAndIssue = async (id: string | number) => {
    try {
      setProcessing(true);
      const updated = await certificationService.approve(id);
      setCertifications((prev) =>
        prev.map((c) => (String(c.id) === String(id) ? updated : c))
      );
      setSelectedCert(updated);
      setAlert({
        type: 'success',
        message: `Sertifikat resmi berhasil disetujui & diterbitkan dengan Nomor Seri: ${updated.certificate_number}! Perubahan telah disimpan permanen.`,
      });
    } catch (e) {
      setAlert({
        type: 'error',
        message: 'Gagal menerbitkan sertifikat. Silakan coba kembali.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      setProcessing(true);
      const updated = await certificationService.reject(
        id,
        'Jam pelatihan atau portofolio teknis belum memenuhi standar kompetensi minimum.'
      );
      setCertifications((prev) =>
        prev.map((c) => (String(c.id) === String(id) ? updated : c))
      );
      setSelectedCert(updated);
      setAlert({
        type: 'error',
        message: 'Pengajuan sertifikasi ditolak dengan catatan verifikasi. Perubahan telah disimpan permanen.',
      });
    } catch (e) {
      setAlert({
        type: 'error',
        message: 'Gagal menolak pengajuan sertifikasi.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDisplayDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Hari ini';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Verifikasi & Penerbitan Sertifikasi Karyawan"
        category="production"
        description="Pusat validasi kompetensi korporat: tinjau portofolio, verifikasi jam pelatihan, dan terbitkan sertifikat digital terverifikasi dengan nomor seri resmi yang tersinkronisasi real-time ke database."
        roleScope="Administrator (certifications:issue, certifications:view)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Pengajuan</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{certifications.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600">Menunggu Review</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {certifications.filter((c) => c.status === 'pending').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600">Telah Diterbitkan</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {certifications.filter((c) => c.status === 'issued').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-600">Ditolak / Revisi</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">
              {certifications.filter((c) => c.status === 'rejected').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari karyawan, perusahaan, bidang..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Verifikasi</option>
            <option value="verified">Terverifikasi (Siap Terbit)</option>
            <option value="issued">Telah Diterbitkan</option>
            <option value="rejected">Ditolak</option>
          </select>
          <button
            onClick={() => loadData()}
            title="Muat ulang data terbaru"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Certifications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Karyawan & Instansi</th>
                <th className="py-3 px-4">Jalur Kompetensi</th>
                <th className="py-3 px-4">Jam Belajar</th>
                <th className="py-3 px-4">Portofolio</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading && certifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-blue-500" />
                    Memuat data sertifikasi dari database...
                  </td>
                </tr>
              ) : filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada pengajuan sertifikasi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{cert.employee_name}</div>
                      <div className="text-[11px] text-slate-500">{cert.company}</div>
                      <div className="text-[10px] text-slate-400">{cert.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{cert.track}</span>
                      <div className="text-[10px] text-slate-400">
                        Diajukan: {formatDisplayDate(cert.created_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {cert.training_hours} Jam
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={cert.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Buka Berkas <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      {cert.status === 'issued' && (
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ Diterbitkan
                          </span>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {cert.certificate_number}
                          </div>
                        </div>
                      )}
                      {cert.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          ⏳ Menunggu Review
                        </span>
                      )}
                      {cert.status === 'verified' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          🔍 Terverifikasi
                        </span>
                      )}
                      {cert.status === 'rejected' && (
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            ✕ Ditolak
                          </span>
                          {cert.admin_notes && (
                            <div className="text-[10px] text-rose-500 mt-0.5 italic max-w-xs truncate">
                              {cert.admin_notes}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        Tinjau & Tindak
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedCert && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCert(null)}
          title={`Tinjau Pengajuan Sertifikasi: ${selectedCert.employee_name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Karyawan:</span>
                <span className="font-semibold text-slate-800">{selectedCert.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800">{selectedCert.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Perusahaan / Instansi:</span>
                <span className="font-semibold text-slate-800">{selectedCert.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jalur Pelatihan:</span>
                <span className="font-semibold text-slate-800">{selectedCert.track}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Akumulasi Jam Pelatihan:</span>
                <span className="font-semibold text-blue-600">{selectedCert.training_hours} Jam Selesai</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Portofolio / Bukti:</span>
                <a
                  href={selectedCert.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 hover:underline inline-flex items-center"
                >
                  {selectedCert.portfolio_url} <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-800">
              <div className="font-bold mb-1 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Standar Kelayakan Penerbitan:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-700">
                <li>Minimal 40 Jam Pelatihan Kompetensi Terverifikasi (Kandidat: {selectedCert.training_hours} jam)</li>
                <li>Portofolio kode / laporan audit valid dan dapat diakses</li>
                <li>Penerbitan tersinkronisasi otomatis ke akun karyawan dan tercatat di database</li>
              </ul>
            </div>

            {selectedCert.status === 'issued' ? (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-center space-y-2">
                <p className="font-bold">Sertifikat Resmi Telah Diterbitkan</p>
                <p className="font-mono text-xs font-semibold">{selectedCert.certificate_number}</p>
                <p className="text-[11px] text-emerald-600">Diterbitkan pada: {formatDisplayDate(selectedCert.issued_at || selectedCert.created_at)}</p>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      downloadCertificatePdf({
                        recipientName: selectedCert.employee_name,
                        companyName: selectedCert.company,
                        trackName: selectedCert.track,
                        certificateNumber: selectedCert.certificate_number || 'MX-CERT-2026-DEV-0001',
                        trainingHours: selectedCert.training_hours,
                        issueDate: formatDisplayDate(selectedCert.issued_at || selectedCert.created_at),
                      });
                      setAlert({
                        type: 'success',
                        message: `Salinan resmi sertifikat ${selectedCert.certificate_number}.pdf berhasil diunduh!`,
                      });
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Unduh Berkas Sertifikat PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleReject(selectedCert.id)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 disabled:opacity-50"
                >
                  {processing ? 'Memproses...' : 'Tolak Pengajuan'}
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleApproveAndIssue(selectedCert.id)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center disabled:opacity-50"
                >
                  <Award className="w-4 h-4 mr-1.5" />
                  {processing ? 'Menerbitkan...' : 'Setujui & Terbitkan Sertifikat'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
