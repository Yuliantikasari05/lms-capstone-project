import React, { useState } from 'react';
import { DollarSign, Download, Building2, TrendingUp, ArrowUpRight, CheckCircle2, Calendar } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Alert } from '../../components/common/Alert';

interface PartnerRevenueItem {
  id: string;
  partner_name: string;
  contact_person: string;
  total_students: number;
  gross_sales: number;
  platform_fee: number; // 20%
  net_payout: number;   // 80%
  payout_status: 'paid' | 'pending' | 'processing';
  period: string;
}

const INITIAL_PARTNERS: PartnerRevenueItem[] = [
  {
    id: 'PRT-01',
    partner_name: 'Bimbel Prestasi Mandiri',
    contact_person: 'Dr. Hendra Gunawan',
    total_students: 145,
    gross_sales: 72500000,
    platform_fee: 14500000,
    net_payout: 58000000,
    payout_status: 'paid',
    period: 'Oktober 2026',
  },
  {
    id: 'PRT-02',
    partner_name: 'Lembaga Edukasi Cerdas Bangsa',
    contact_person: 'Nurul Hidayati, S.Pd',
    total_students: 88,
    gross_sales: 44000000,
    platform_fee: 8800000,
    net_payout: 35200000,
    payout_status: 'pending',
    period: 'Oktober 2026',
  },
  {
    id: 'PRT-03',
    partner_name: 'Maxy Coding Camp Jogja',
    contact_person: 'Rian Pratama',
    total_students: 62,
    gross_sales: 37200000,
    platform_fee: 7440000,
    net_payout: 29760000,
    payout_status: 'processing',
    period: 'Oktober 2026',
  },
  {
    id: 'PRT-04',
    partner_name: 'Akademi Sains & Komputasi Bandung',
    contact_person: 'Yusuf Maulana, M.Kom',
    total_students: 35,
    gross_sales: 17500000,
    platform_fee: 3500000,
    net_payout: 14000000,
    payout_status: 'paid',
    period: 'September 2026',
  },
];

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const AdminRevenueReportsPage: React.FC = () => {
  const [partners, setPartners] = useState<PartnerRevenueItem[]>(INITIAL_PARTNERS);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredPartners = selectedPeriod === 'all'
    ? partners
    : partners.filter((p) => p.period.toLowerCase().includes(selectedPeriod.toLowerCase()));

  const totalGross = filteredPartners.reduce((acc, curr) => acc + curr.gross_sales, 0);
  const totalPlatformFee = filteredPartners.reduce((acc, curr) => acc + curr.platform_fee, 0);
  const totalNetPayout = filteredPartners.reduce((acc, curr) => acc + curr.net_payout, 0);

  const handleTogglePayout = (id: string) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.payout_status === 'pending' ? 'processing' : p.payout_status === 'processing' ? 'paid' : 'paid';
          return { ...p, payout_status: nextStatus };
        }
        return p;
      })
    );
    setAlert({ type: 'success', message: 'Status pembayaran bagi hasil mitra berhasil diperbarui!' });
  };

  const handleExportCSV = () => {
    const headers = ['ID Mitra', 'Nama Mitra Lembaga', 'Kontak PIC', 'Total Siswa', 'Total Penjualan Kotor (Rp)', 'Bagi Hasil Platform 20% (Rp)', 'Bagi Hasil Mitra 80% (Rp)', 'Status Pembayaran', 'Periode'];
    const rows = filteredPartners.map((p) => [
      p.id,
      `"${p.partner_name}"`,
      `"${p.contact_person}"`,
      p.total_students,
      p.gross_sales,
      p.platform_fee,
      p.net_payout,
      p.payout_status,
      p.period,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-pemasukan-mitra-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Laporan Penjualan & Bagi Hasil Mitra Lembaga"
        category="production"
        description="Pantau performa penjualan paket pelatihan dari seluruh mitra lembaga bimbingan, pembagian komisi 80:20 secara otomatis, dan rekonsiliasi transfer pembayaran."
        roleScope="Administrator (reports:view, financial:manage)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total GMV Penjualan Kotor</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatRupiah(totalGross)}</p>
          <div className="flex items-center text-xs text-emerald-600 mt-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +18.4% dari bulan lalu
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pendapatan Platform LMS (20%)</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatRupiah(totalPlatformFee)}</p>
          <p className="text-xs text-slate-400 mt-1">Komisi operasional platform</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Bagi Hasil Hak Mitra (80%)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{formatRupiah(totalNetPayout)}</p>
          <p className="text-xs text-slate-400 mt-1">Disalurkan ke rekening mitra</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter Periode:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium"
          >
            <option value="all">Semua Periode</option>
            <option value="Oktober">Oktober 2026</option>
            <option value="September">September 2026</option>
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs"
        >
          <Download className="w-4 h-4 mr-1.5" /> Ekspor Rekap Keuangan CSV
        </button>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Mitra Lembaga Bimbingan</th>
                <th className="py-3 px-4">Siswa Terdaftar</th>
                <th className="py-3 px-4">Total Penjualan</th>
                <th className="py-3 px-4">Fee Platform (20%)</th>
                <th className="py-3 px-4">Hak Mitra (80%)</th>
                <th className="py-3 px-4">Status Payout</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPartners.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{p.partner_name}</div>
                    <div className="text-[11px] text-slate-400">PIC: {p.contact_person} • {p.period}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{p.total_students}</span> Siswa
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {formatRupiah(p.gross_sales)}
                  </td>
                  <td className="py-3 px-4 font-medium text-blue-600">
                    {formatRupiah(p.platform_fee)}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-700">
                    {formatRupiah(p.net_payout)}
                  </td>
                  <td className="py-3 px-4">
                    {p.payout_status === 'paid' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Ditransfer
                      </span>
                    )}
                    {p.payout_status === 'pending' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        ⏳ Menunggu Proses
                      </span>
                    )}
                    {p.payout_status === 'processing' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        🔄 Sedang Kliring
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {p.payout_status !== 'paid' ? (
                      <button
                        onClick={() => handleTogglePayout(p.id)}
                        className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      >
                        Tandai Selesai Transfer
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Lunas</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
