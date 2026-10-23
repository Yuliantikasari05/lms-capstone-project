import React, { useState } from 'react';
import { Tag, Plus, CheckCircle2, DollarSign, Percent, Calendar, Edit3 } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';

interface PackagePrice {
  id: string;
  name: string;
  duration: string;
  original_price: number;
  promo_price: number;
  cohort_target: string;
  is_active: boolean;
}

interface LembagaVoucher {
  id: string;
  code: string;
  discount_percent: number;
  quota: number;
  used: number;
  valid_until: string;
}

const INITIAL_PACKAGES: PackagePrice[] = [
  {
    id: 'PKG-01',
    name: 'Paket Intensif UTBK Supercamp 2027',
    duration: '6 Bulan',
    original_price: 3500000,
    promo_price: 2800000,
    cohort_target: 'Saintek Intensif 2027',
    is_active: true,
  },
  {
    id: 'PKG-02',
    name: 'Paket Reguler Weekend Drilling TPS',
    duration: '3 Bulan',
    original_price: 1800000,
    promo_price: 1500000,
    cohort_target: 'Reguler Weekend',
    is_active: true,
  },
];

const INITIAL_VOUCHERS: LembagaVoucher[] = [
  {
    id: 'LV-01',
    code: 'BIMBELJUARA20',
    discount_percent: 20,
    quota: 50,
    used: 28,
    valid_until: '31 Desember 2026',
  },
  {
    id: 'LV-02',
    code: 'EARLYBIRD30',
    discount_percent: 30,
    quota: 25,
    used: 25,
    valid_until: '31 Oktober 2026',
  },
];

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const LembagaPricingVouchersPage: React.FC = () => {
  const [packages, setPackages] = useState<PackagePrice[]>(INITIAL_PACKAGES);
  const [vouchers, setVouchers] = useState<LembagaVoucher[]>(INITIAL_VOUCHERS);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackagePrice | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [newVoucher, setNewVoucher] = useState({
    code: '',
    discount_percent: 15,
    quota: 30,
    valid_until: '2026-12-31',
  });

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucher.code.trim()) return;

    const voucher: LembagaVoucher = {
      id: `LV-${Date.now()}`,
      code: newVoucher.code.toUpperCase().trim(),
      discount_percent: Number(newVoucher.discount_percent),
      quota: Number(newVoucher.quota),
      used: 0,
      valid_until: newVoucher.valid_until,
    };

    setVouchers((prev) => [voucher, ...prev]);
    setShowVoucherModal(false);
    setNewVoucher({
      code: '',
      discount_percent: 15,
      quota: 30,
      valid_until: '2026-12-31',
    });
    setAlert({ type: 'success', message: `Voucher promo lembaga ${voucher.code} berhasil diterbitkan!` });
  };

  const handleSavePriceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    setPackages((prev) =>
      prev.map((p) => (p.id === editingPkg.id ? editingPkg : p))
    );
    setAlert({
      type: 'success',
      message: `Tarif paket "${editingPkg.name}" berhasil diperbarui ke ${formatRupiah(editingPkg.promo_price)}!`,
    });
    setEditingPkg(null);
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Pengaturan Harga Paket & Voucher Diskon Lembaga"
        category="production"
        description="Atur skema tarif paket belajar bimbingan, tetapkan harga promosi, dan buat kupon diskon khusus untuk pendaftaran siswa baru kohort Anda."
        roleScope="Lembaga Bimbingan (pricing:manage, vouchers:create)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Package Pricing Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
              Skema Harga Paket Bimbingan Belajar
            </h3>
            <p className="text-xs text-slate-500">Tarif ini berlaku untuk pendaftaran siswa mandiri pada sistem checkout.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {pkg.cohort_target}
                </span>
                <h4 className="text-sm font-bold text-slate-800 mt-2">{pkg.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Durasi Program: {pkg.duration}</p>

                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-lg font-extrabold text-slate-800">
                    {formatRupiah(pkg.promo_price)}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {formatRupiah(pkg.original_price)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[11px] font-semibold text-emerald-600">✓ Aktif Ditampilkan</span>
                <button
                  onClick={() => setEditingPkg({ ...pkg })}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Ubah Harga
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Price Modal */}
      {editingPkg && (
        <Modal
          isOpen={true}
          onClose={() => setEditingPkg(null)}
          title={`Ubah Tarif Paket: ${editingPkg.name}`}
        >
          <form onSubmit={handleSavePriceEdit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Paket Program</label>
              <input
                type="text"
                required
                value={editingPkg.name}
                onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Harga Normal (IDR)</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  required
                  value={editingPkg.original_price}
                  onChange={(e) => setEditingPkg({ ...editingPkg, original_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Harga Promo / Tagihan (IDR)</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  required
                  value={editingPkg.promo_price}
                  onChange={(e) => setEditingPkg({ ...editingPkg, promo_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-blue-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Durasi Bimbingan</label>
                <input
                  type="text"
                  required
                  value={editingPkg.duration}
                  onChange={(e) => setEditingPkg({ ...editingPkg, duration: e.target.value })}
                  placeholder="e.g. 6 Bulan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Kohort</label>
                <input
                  type="text"
                  required
                  value={editingPkg.cohort_target}
                  onChange={(e) => setEditingPkg({ ...editingPkg, cohort_target: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingPkg(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Simpan Perubahan Tarif
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Vouchers Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-purple-600" />
              Kode Voucher Promo Khusus Lembaga
            </h3>
            <p className="text-xs text-slate-500">Kupon ini otomatis memotong harga saat siswa mendaftar paket bimbingan Anda.</p>
          </div>
          <button
            onClick={() => setShowVoucherModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Buat Kupon Baru
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Kode Kupon</th>
              <th className="py-3 px-4">Diskon</th>
              <th className="py-3 px-4">Penggunaan</th>
              <th className="py-3 px-4">Berlaku Hingga</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-mono font-bold text-blue-600">{v.code}</td>
                <td className="py-3 px-4 font-semibold text-slate-800">{v.discount_percent}% OFF</td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-800">{v.used}</span>
                  <span className="text-slate-400">/{v.quota} Siswa</span>
                </td>
                <td className="py-3 px-4 text-slate-500">{v.valid_until}</td>
                <td className="py-3 px-4 text-right">
                  {v.used >= v.quota ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      Kuota Habis
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Voucher */}
      {showVoucherModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowVoucherModal(false)}
          title="Buat Kupon Diskon Bimbingan Baru"
        >
          <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kode Kupon</label>
              <input
                type="text"
                required
                value={newVoucher.code}
                onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                placeholder="CONTOH: PROMOAKHIRTAHUN"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg uppercase font-mono font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Besar Diskon (%)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={newVoucher.discount_percent}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discount_percent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kuota Maksimal</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newVoucher.quota}
                  onChange={(e) => setNewVoucher({ ...newVoucher, quota: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Berlaku Sampai Tanggal</label>
              <input
                type="date"
                required
                value={newVoucher.valid_until}
                onChange={(e) => setNewVoucher({ ...newVoucher, valid_until: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Terbitkan Kupon
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
