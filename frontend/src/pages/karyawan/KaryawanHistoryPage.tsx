import React from 'react';
import { History, Award, Clock, Download, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';

export const KaryawanHistoryPage: React.FC = () => {
  const historyLogs = [
    {
      date: '18 Oktober 2026',
      title: 'Menyelesaikan Modul: CI/CD Pipeline with GitHub Actions',
      type: 'Materi Pelatihan',
      duration: '4 Jam',
      status: 'Selesai',
    },
    {
      date: '16 Oktober 2026',
      title: 'Pengajuan Sertifikasi: Full-Stack Software Architecture',
      type: 'Pengajuan Sertifikasi',
      duration: '48 Jam Audit',
      status: 'Dalam Review',
    },
    {
      date: '10 Oktober 2026',
      title: 'Webinar: DevSecOps Zero Trust Architecture',
      type: 'Webinar Korporat',
      duration: '2 Jam',
      status: 'Selesai',
    },
    {
      date: '20 Agustus 2026',
      title: 'Penerbitan Sertifikat: Docker & Kubernetes Practitioner',
      type: 'Sertifikasi Resmi',
      duration: '45 Jam',
      status: 'Terbit (MX-CERT-2026-DK-9012)',
    },
  ];

  const handleDownloadTranscript = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Tanggal,Aktivitas,Tipe,Durasi,Status\n' +
      historyLogs.map((l) => `"${l.date}","${l.title}","${l.type}","${l.duration}","${l.status}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transkrip-pelatihan-karyawan-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Riwayat Pembelajaran & Audit Jam Pelatihan"
        category="production"
        description="Rekap komprehensif seluruh jam pelatihan korporat, keikutsertaan webinar, dan riwayat perolehan sertifikasi kompetensi untuk laporan pengembangan SDM perusahaan."
        roleScope="Karyawan (history:view, reports:view)"
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Akumulasi Jam Pelatihan</span>
          <p className="text-2xl font-bold text-slate-800 mt-2">81 Jam</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Target tahunan: 80 Jam (Tercapai! 🎉)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Program Diselesaikan</span>
          <p className="text-2xl font-bold text-blue-600 mt-2">4 Program</p>
          <p className="text-xs text-slate-400 mt-1">Termasuk 2 Pelatihan Wajib & 2 Pilihan</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Sertifikat Diperoleh</span>
          <p className="text-2xl font-bold text-emerald-700 mt-2">1 Terbit, 1 Review</p>
          <p className="text-xs text-slate-400 mt-1">Diakui secara formal oleh manajemen</p>
        </div>
      </div>

      {/* Timeline Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <History className="w-4 h-4 mr-2 text-blue-600" />
            Log Aktivitas Pelatihan Terverifikasi
          </h3>
          <button
            onClick={handleDownloadTranscript}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" /> Unduh Transkrip CSV
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Aktivitas / Modul</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Durasi Terhitung</th>
              <th className="py-3 px-4 text-right">Status Verifikasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {historyLogs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60">
                <td className="py-3 px-4 text-slate-500 font-medium">{log.date}</td>
                <td className="py-3 px-4 font-semibold text-slate-800">{log.title}</td>
                <td className="py-3 px-4 text-slate-600">{log.type}</td>
                <td className="py-3 px-4 font-mono font-bold text-blue-600">{log.duration}</td>
                <td className="py-3 px-4 text-right font-medium text-emerald-700">
                  {log.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
