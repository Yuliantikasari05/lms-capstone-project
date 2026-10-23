import React from 'react';
import { Wallet, TrendingUp, Download, ArrowUpRight, DollarSign, Users, CheckCircle2 } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';

export const LembagaRevenuePage: React.FC = () => {
  const salesHistory = [
    {
      invoice: 'INV-BIMBEL-001',
      student: 'Muhammad Farhan',
      package_name: 'Paket Intensif UTBK Supercamp 2027',
      gross_amount: 2800000,
      partner_net: 2240000, // 80%
      platform_fee: 560000, // 20%
      date: '01 Oktober 2026',
      status: 'Lunas & Ditransfer',
    },
    {
      invoice: 'INV-BIMBEL-002',
      student: 'Nadia Salsabila',
      package_name: 'Paket Intensif UTBK Supercamp 2027',
      gross_amount: 2800000,
      partner_net: 2240000,
      platform_fee: 560000,
      date: '05 Oktober 2026',
      status: 'Lunas & Ditransfer',
    },
    {
      invoice: 'INV-BIMBEL-003',
      student: 'Kevin Jonathan',
      package_name: 'Paket Reguler Weekend Drilling TPS',
      gross_amount: 1500000,
      partner_net: 1200000,
      platform_fee: 300000,
      date: '12 September 2026',
      status: 'Lunas & Ditransfer',
    },
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalGross = salesHistory.reduce((acc, curr) => acc + curr.gross_amount, 0);
  const totalNet = salesHistory.reduce((acc, curr) => acc + curr.partner_net, 0);

  const handleDownloadReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Invoice,Siswa,Paket,Penjualan Kotor (Rp),Hak Bersih Lembaga (80%),Fee Platform (20%),Tanggal,Status\n' +
      salesHistory
        .map(
          (s) =>
            `"${s.invoice}","${s.student}","${s.package_name}",${s.gross_amount},${s.partner_net},${s.platform_fee},"${s.date}","${s.status}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-keuangan-lembaga-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Laporan Penjualan Paket & Pendapatan Bersih Lembaga"
        category="production"
        description="Pantau arus kas masuk dari pendaftaran paket bimbingan siswa kohort, pembagian hak bersih mitra 80%, dan rekonsiliasi transfer ke rekening lembaga."
        roleScope="Lembaga Bimbingan (revenue:view, reports:view)"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Penjualan Kotor (GMV)</span>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatRupiah(totalGross)}</p>
          <p className="text-xs text-slate-400 mt-1">Dari {salesHistory.length} pendaftaran paket siswa</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pendapatan Bersih Mitra (80%)</span>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{formatRupiah(totalNet)}</p>
          <div className="flex items-center text-xs text-emerald-600 mt-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Ditransfer otomatis tiap tanggal 25
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Fee Infrastruktur Platform (20%)</span>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatRupiah(totalGross - totalNet)}</p>
          <p className="text-xs text-slate-400 mt-1">Biaya server, video streaming & support</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <Wallet className="w-4 h-4 mr-2 text-emerald-600" />
            Rincian Transaksi Pendaftaran Siswa Lembaga
          </h3>
          <button
            onClick={handleDownloadReport}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" /> Ekspor Laporan CSV
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">No. Invoice & Tanggal</th>
              <th className="py-3 px-4">Siswa Pendaftar</th>
              <th className="py-3 px-4">Paket Belajar</th>
              <th className="py-3 px-4">Harga Kotor</th>
              <th className="py-3 px-4">Hak Bersih Lembaga (80%)</th>
              <th className="py-3 px-4 text-right">Status Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {salesHistory.map((s) => (
              <tr key={s.invoice} className="hover:bg-slate-50/60">
                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-slate-800">{s.invoice}</div>
                  <div className="text-[11px] text-slate-400">{s.date}</div>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800">{s.student}</td>
                <td className="py-3 px-4 text-slate-600">{s.package_name}</td>
                <td className="py-3 px-4 font-medium text-slate-700">{formatRupiah(s.gross_amount)}</td>
                <td className="py-3 px-4 font-bold text-emerald-700">{formatRupiah(s.partner_net)}</td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
