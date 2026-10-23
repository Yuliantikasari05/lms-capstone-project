import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Clock, Download, Tag, ArrowRight } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { downloadInvoicePdf } from '../../lib/pdfGenerator';
import { useAuth } from '../../context/AuthContext';

interface PaymentItem {
  id: string;
  invoice_number: string;
  course_name: string;
  amount: number;
  discount: number;
  final_amount: number;
  payment_method: string;
  date: string;
  status: 'paid' | 'pending';
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: 'PAY-01',
    invoice_number: 'INV-2026-10-0012',
    course_name: 'Full-Stack Web Development Bootcamp',
    amount: 1500000,
    discount: 500000,
    final_amount: 1000000,
    payment_method: 'BCA Virtual Account',
    date: '10 Oktober 2026',
    status: 'paid',
  },
  {
    id: 'PAY-02',
    invoice_number: 'INV-2026-10-0094',
    course_name: 'Paket Ujian Sertifikasi Internasional',
    amount: 750000,
    discount: 0,
    final_amount: 750000,
    payment_method: 'QRIS Instant',
    date: '18 Oktober 2026',
    status: 'pending',
  },
];

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const SiswaPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [selectedPay, setSelectedPay] = useState<PaymentItem | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (voucherCode.toUpperCase() === 'MAXYDISC30' || voucherCode.toUpperCase() === 'MAXYSCHOLAR50') {
      setAppliedDiscount(225000);
      setAlert({ type: 'success', message: `Voucher ${voucherCode.toUpperCase()} berhasil diterapkan! Potongan Rp 225.000` });
    } else {
      setAlert({ type: 'error', message: 'Kode voucher tidak valid atau sudah kadaluarsa.' });
    }
  };

  const handleSimulatePayment = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'paid' } : p))
    );
    setSelectedPay(null);
    setAlert({ type: 'success', message: 'Pembayaran berhasil dikonfirmasi! Akses program telah aktif otomatis.' });
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Riwayat Transaksi & Pembayaran Program Belajar"
        category="production"
        description="Kelola tagihan kursus, klaim voucher potongan harga, lakukan simulasi pembayaran, dan unduh kwitansi resmi tanda terima."
        roleScope="Siswa (payments:view, payments:pay)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Payment History List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
            Daftar Tagihan & Transaksi Anda
          </h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">No. Invoice & Tanggal</th>
              <th className="py-3 px-4">Program Belajar</th>
              <th className="py-3 px-4">Metode Bayar</th>
              <th className="py-3 px-4">Total Tagihan</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-slate-800">{p.invoice_number}</div>
                  <div className="text-[11px] text-slate-400">{p.date}</div>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800">{p.course_name}</td>
                <td className="py-3 px-4 text-slate-600">{p.payment_method}</td>
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-800">{formatRupiah(p.final_amount)}</span>
                  {p.discount > 0 && (
                    <span className="text-[10px] text-emerald-600 block">
                      Hemat {formatRupiah(p.discount)}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {p.status === 'paid' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Lunas
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3 mr-1" /> Menunggu Pembayaran
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {p.status === 'pending' ? (
                    <button
                      onClick={() => setSelectedPay(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                    >
                      Bayar Sekarang
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        downloadInvoicePdf({
                          invoiceNumber: p.invoice_number,
                          studentName: user?.name || 'Budi Pratama',
                          courseName: p.course_name,
                          originalAmount: p.amount,
                          discountAmount: p.discount,
                          finalAmount: p.final_amount,
                          paymentMethod: p.payment_method,
                          paymentDate: p.date,
                          status: 'LUNAS / BERHASIL',
                        });
                        setAlert({
                          type: 'success',
                          message: `Kwitansi resmi "${p.invoice_number}.pdf" berhasil diunduh ke komputer Anda!`,
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 inline-flex items-center"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Unduh Kwitansi PDF
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {selectedPay && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPay(null)}
          title={`Selesaikan Pembayaran: ${selectedPay.course_name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor Invoice:</span>
                <span className="font-mono font-bold text-slate-800">{selectedPay.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Harga Asli:</span>
                <span className="font-semibold text-slate-800">{formatRupiah(selectedPay.amount)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Potongan Voucher:</span>
                  <span>- {formatRupiah(appliedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-blue-600">
                <span>Total Harus Dibayar:</span>
                <span>{formatRupiah(selectedPay.amount - appliedDiscount)}</span>
              </div>
            </div>

            {/* Voucher Input */}
            <form onSubmit={handleApplyVoucher} className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Punya voucher diskon? (e.g. MAXYDISC30)"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg uppercase font-mono text-xs"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Terapkan
              </button>
            </form>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900">
              <span className="font-bold block mb-1">Pilihan Saluran Pembayaran:</span>
              <p className="text-[11px] text-blue-700">
                BCA Virtual Account: <span className="font-mono font-bold">8801-9238-1290</span> atas nama Maxy Academy.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedPay(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSimulatePayment(selectedPay.id)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center"
              >
                Konfirmasi Pembayaran Selesai <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
