import React, { useState, useEffect, useCallback } from 'react';
import { Award, Download, Clock, CheckCircle2, Plus, ExternalLink, ShieldCheck, Eye, RefreshCw, XCircle } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { downloadCertificatePdf } from '../../lib/pdfGenerator';
import { useAuth } from '../../context/AuthContext';
import { certificationService, CertificationApplication } from '../../services/certificationService';

export const KaryawanCertificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [certs, setCerts] = useState<CertificationApplication[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [previewCert, setPreviewCert] = useState<CertificationApplication | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState({
    track_name: 'Cloud DevOps & Containerization',
    training_hours: 40,
    portfolio_url: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await certificationService.getAll();
      // Filter for this karyawan if email or user_id matches, or fallback to showing user's items
      const userEmail = user?.email?.toLowerCase();
      const userCerts = data.filter((c) => {
        if (!userEmail) return true;
        if (c.email && c.email.toLowerCase() === userEmail) return true;
        if (c.user_id && user?.id && c.user_id === user.id) return true;
        // In local demo mode if matching karyawan@maxy.test
        if (userEmail.includes('karyawan') && c.email?.toLowerCase().includes('karyawan')) return true;
        return false;
      });

      // If filtered is empty but data has items and current user is karyawan, display data
      setCerts(userCerts.length > 0 ? userCerts : data);
    } catch (e) {
      console.error('Failed to load karyawan certifications', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const formatDisplayDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Hari ini';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleDownload = (c: CertificationApplication) => {
    try {
      downloadCertificatePdf({
        recipientName: c.employee_name || user?.name || 'Ahmad Fauzi (Tech Corp)',
        companyName: c.company || 'Tech Corp Nusantara',
        trackName: c.track,
        certificateNumber: c.certificate_number || 'MX-CERT-2026-DEV-9012',
        trainingHours: c.training_hours,
        issueDate: formatDisplayDate(c.issued_at || c.created_at),
      });
      setAlert({
        type: 'success',
        message: `Berkas sertifikat resmi "${c.certificate_number}.pdf" berhasil diunduh ke komputer Anda!`,
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Gagal membuat berkas PDF sertifikat.',
      });
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.portfolio_url.trim()) return;

    try {
      setSubmitting(true);
      await certificationService.apply({
        track: form.track_name,
        training_hours: Number(form.training_hours),
        portfolio_url: form.portfolio_url.trim(),
        employee_name: user?.name || 'Ahmad Fauzi (Tech Corp)',
        email: user?.email || 'karyawan@maxy.test',
        company: 'Tech Corp Nusantara',
      });

      setShowApplyModal(false);
      setForm({
        track_name: 'Cloud DevOps & Containerization',
        training_hours: 40,
        portfolio_url: '',
      });
      setAlert({
        type: 'success',
        message: 'Pengajuan sertifikasi kompetensi berhasil dikirimkan ke Admin untuk verifikasi dan tersimpan di sistem!',
      });
      await loadData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Gagal mengirimkan pengajuan sertifikasi. Silakan coba kembali.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Pengajuan Sertifikasi Kompetensi Profesional"
        category="production"
        description="Ajukan verifikasi kompetensi Anda ke Administrator setelah menyelesaikan jam pelatihan wajib dan unduh sertifikat digital berlisensi resmi dalam format PDF asli yang tersinkronisasi langsung dengan sistem admin."
        roleScope="Karyawan (certifications:apply, certifications:view)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Action Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Daftar Sertifikasi Kompetensi Anda</h3>
          <p className="text-xs text-slate-500">
            Sertifikat resmi mencakup nomor seri verifikasi dan jam pelatihan tercatat permanen di database.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadData()}
            title="Muat ulang status terbaru"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Ajukan Sertifikasi Baru
          </button>
        </div>
      </div>

      {/* Certifications Grid */}
      <div className="space-y-4">
        {loading && certs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-blue-500" />
            Memuat daftar sertifikasi Anda dari server...
          </div>
        ) : certs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 space-y-2">
            <Award className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">Belum Ada Pengajuan Sertifikasi</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Anda belum mengajukan sertifikasi kompetensi. Klik tombol "Ajukan Sertifikasi Baru" di atas untuk memulai.
            </p>
          </div>
        ) : (
          certs.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h4 className="text-sm font-bold text-slate-800">{c.track}</h4>
                  {c.status === 'issued' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Diterbitkan & Terverifikasi
                    </span>
                  )}
                  {c.status === 'pending' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Menunggu Review Admin
                    </span>
                  )}
                  {c.status === 'verified' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Terverifikasi (Proses Terbit)
                    </span>
                  )}
                  {c.status === 'rejected' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center">
                      <XCircle className="w-3 h-3 mr-1" /> Ditolak
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Diajukan: {formatDisplayDate(c.created_at)} • Akumulasi: {c.training_hours} Jam Pelatihan • Instansi: {c.company}
                </p>
                {c.certificate_number && (
                  <div className="text-xs font-mono font-semibold text-blue-600 pt-1">
                    No. Sertifikat: {c.certificate_number} (Terbit: {formatDisplayDate(c.issued_at || c.created_at)})
                  </div>
                )}
                {c.status === 'rejected' && c.admin_notes && (
                  <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-2">
                    <span className="font-semibold">Catatan Evaluator:</span> {c.admin_notes}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center space-x-2">
                {c.status === 'issued' ? (
                  <>
                    <button
                      onClick={() => setPreviewCert(c)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-1.5 text-slate-500" /> Pratinjau
                    </button>
                    <button
                      onClick={() => handleDownload(c)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-1.5" /> Unduh Sertifikat PDF
                    </button>
                  </>
                ) : (
                  <div className="text-right">
                    <span className="text-xs text-slate-400 italic block">
                      {c.status === 'pending' ? 'Sedang ditinjau oleh Admin' : c.status === 'verified' ? 'Siap diterbitkan oleh Admin' : 'Silakan ajukan revisi'}
                    </span>
                    <a
                      href={c.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:underline inline-flex items-center mt-1"
                    >
                      Lihat Berkas Terkirim <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Certificate Preview Modal */}
      {previewCert && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewCert(null)}
          title="Pratinjau Sertifikat Kompetensi Digital"
        >
          <div className="space-y-4 text-xs">
            {/* Certificate Frame Preview */}
            <div className="p-6 bg-linear-to-b from-slate-50 to-blue-50/30 rounded-xl border-4 border-double border-slate-700 text-center space-y-3 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                Maxy Academy Indonesia • Lembaga Pengembangan Talenta Digital
              </div>
              <h2 className="text-base font-serif font-bold text-slate-900 tracking-wide">
                SERTIFIKAT KOMPETENSI RESMI
              </h2>
              <p className="text-[11px] text-slate-500 italic">Dianugerahkan dengan bangga kepada:</p>
              <h3 className="text-lg font-serif font-bold text-blue-800 uppercase tracking-wider">
                {previewCert.employee_name || user?.name || 'Ahmad Fauzi'}
              </h3>
              <p className="text-[11px] text-slate-600">Perwakilan dari: {previewCert.company || 'Tech Corp Nusantara'}</p>
              <div className="py-2 border-y border-slate-200 max-w-sm mx-auto">
                <span className="text-[10px] text-slate-500 block">Jalur Pelatihan & Ujian Teknis:</span>
                <span className="text-sm font-bold text-slate-800">{previewCert.track}</span>
                <span className="text-[11px] text-amber-600 font-semibold block mt-1">
                  Akumulasi {previewCert.training_hours} Jam Pelatihan Terverifikasi
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                No. Registrasi: <span className="font-bold">{previewCert.certificate_number}</span>
              </div>
              <div className="flex justify-between pt-4 text-[10px] text-slate-500">
                <div>
                  <div className="font-bold text-slate-700">Dr. Hendra Gunawan, M.Cs</div>
                  <div>Direktur Akademik Maxy</div>
                </div>
                <div>
                  <div className="font-bold text-slate-700">Budi Santoso, S.Kom, M.T</div>
                  <div>Lead Technical Assessor</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownload(previewCert);
                  setPreviewCert(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 mr-1.5" /> Unduh Dokumen PDF
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <Modal
          isOpen={true}
          onClose={() => !submitting && setShowApplyModal(false)}
          title="Ajukan Sertifikasi Kompetensi Karyawan"
        >
          <form onSubmit={handleApply} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jalur / Bidang Kompetensi</label>
              <select
                value={form.track_name}
                onChange={(e) => setForm({ ...form, track_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Cloud DevOps & Containerization">Cloud DevOps & Containerization</option>
                <option value="Full-Stack Software Architecture">Full-Stack Software Architecture</option>
                <option value="Information Security & Compliance Audit">Information Security & Compliance Audit</option>
                <option value="Data Science & ML Pipeline">Data Science & ML Pipeline</option>
                <option value="Certified Docker & Kubernetes Practitioner">Certified Docker & Kubernetes Practitioner</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Total Jam Pelatihan yang Diselesaikan</label>
              <input
                type="number"
                min="40"
                required
                value={form.training_hours}
                onChange={(e) => setForm({ ...form, training_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Minimal 40 jam pelatihan teknis terverifikasi.</span>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tautan Berkas Portofolio / Bukti Proyek
              </label>
              <input
                type="url"
                required
                value={form.portfolio_url}
                onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                placeholder="https://github.com/... atau tautan repositori/laporan proyek"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowApplyModal(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Mengirimkan...
                  </>
                ) : (
                  'Kirimkan Pengajuan ke Admin'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
