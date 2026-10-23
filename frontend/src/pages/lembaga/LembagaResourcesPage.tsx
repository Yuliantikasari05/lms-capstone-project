import React, { useState } from 'react';
import { Layers, Plus, FileText, Download, Upload, ExternalLink, Calendar, Video } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { downloadResourcePdf } from '../../lib/pdfGenerator';

interface ResourceItem {
  id: string;
  title: string;
  file_type: 'PDF' | 'Slide PPT' | 'Video' | 'Dokumen';
  cohort: string;
  file_size: string;
  uploaded_at: string;
  download_url: string;
}

const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'RES-01',
    title: 'Modul Rangkuman Rumus Cepat TPS & Penalaran Matematika',
    file_type: 'PDF',
    cohort: 'Saintek Intensif 2027',
    file_size: '4.8 MB',
    uploaded_at: '15 Oktober 2026',
    download_url: '#',
  },
  {
    id: 'RES-02',
    title: 'Slide Presentasi Sesi 1: Strategi Lolos UTBK PTN Top',
    file_type: 'Slide PPT',
    cohort: 'Saintek Intensif 2027',
    file_size: '12.4 MB',
    uploaded_at: '10 Oktober 2026',
    download_url: '#',
  },
  {
    id: 'RES-03',
    title: 'Bank Soal Tryout Mandiri Edisi 1 + Kunci Jawaban',
    file_type: 'PDF',
    cohort: 'Reguler Weekend',
    file_size: '2.1 MB',
    uploaded_at: '08 Oktober 2026',
    download_url: '#',
  },
];

export const LembagaResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    title: '',
    file_type: 'PDF',
    cohort: 'Saintek Intensif 2027',
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const newRes: ResourceItem = {
      id: `RES-${Date.now()}`,
      title: form.title.trim(),
      file_type: form.file_type as any,
      cohort: form.cohort,
      file_size: '3.5 MB',
      uploaded_at: 'Hari ini',
      download_url: '#',
    };

    setResources((prev) => [newRes, ...prev]);
    setShowUploadModal(false);
    setForm({
      title: '',
      file_type: 'PDF',
      cohort: 'Saintek Intensif 2027',
    });
    setAlert({ type: 'success', message: 'Berkas materi pembelajaran berhasil diunggah dan dibagikan ke siswa kohort!' });
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Repositori Berkas, Sesi & Materi Tambahan Lembaga"
        category="production"
        description="Unggah bank soal, modul rangkuman PDF, lembar kerja siswa, dan kelola arsip materi suplemen eksklusif untuk kohort bimbingan Anda."
        roleScope="Lembaga Bimbingan (resources:manage, resources:view)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Action Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Koleksi Berkas Materi Pembelajaran</h3>
          <p className="text-xs text-slate-500">Berkas dapat diunduh langsung oleh seluruh siswa yang terdaftar dalam kohort terkait.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs"
        >
          <Upload className="w-4 h-4 mr-1.5" /> Unggah Berkas Baru
        </button>
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((r) => (
          <div
            key={r.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {r.file_type}
                </span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {r.cohort}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-800 leading-snug">{r.title}</h4>
              <p className="text-xs text-slate-400 mt-2">Ukuran: {r.file_size} • Diunggah: {r.uploaded_at}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-semibold">Tersinkron ke Siswa</span>
              <button
                onClick={() => {
                  downloadResourcePdf({
                    title: r.title,
                    cohort: r.cohort,
                    fileType: r.file_type,
                  });
                  setAlert({
                    type: 'success',
                    message: `Dokumen materi "${r.title}.pdf" berhasil diunduh ke komputer Anda!`,
                  });
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center shadow-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Unduh Dokumen PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Upload */}
      {showUploadModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowUploadModal(false)}
          title="Unggah Berkas Materi / Sumber Daya Baru"
        >
          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Judul Dokumen / Materi</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Modul Rangkuman Rumus Cepat TPS"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tipe Berkas</label>
                <select
                  value={form.file_type}
                  onChange={(e) => setForm({ ...form, file_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="PDF">Dokumen PDF</option>
                  <option value="Slide PPT">Slide Presentasi (PPTX)</option>
                  <option value="Dokumen">Lembar Kerja / Word</option>
                  <option value="Video">Video Pembahasan</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Kohort</label>
                <select
                  value={form.cohort}
                  onChange={(e) => setForm({ ...form, cohort: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Saintek Intensif 2027">Saintek Intensif 2027</option>
                  <option value="Reguler Weekend">Reguler Weekend</option>
                  <option value="Semua Kohort">Semua Kohort Lembaga</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50">
              <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
              <p className="text-xs font-medium text-slate-600">Pilih berkas dari komputer Anda</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Mendukung PDF, PPTX, DOCX, ZIP hingga 50MB</p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Unggah & Publikasikan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
