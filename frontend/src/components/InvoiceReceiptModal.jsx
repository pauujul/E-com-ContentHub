import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * InvoiceReceiptModal - Komponen Struk Pembayaran & Tagihan Resmi ContentHub
 * Fitur Cetak Bersih (Print-Isolated):
 * - Menggunakan React Portal (dimount langsung di document.body, terpisah dari #root)
 * - Saat mencetak, class 'receipt-modal-open' menyembunyikan #root (seluruh halaman aplikasi,
 *   navbar, sidebar, dan tabel pesanan) sehingga HANYA lembar struk (1 Halaman Pas) yang tercetak.
 * - Cap stempel resmi (LUNAS / BELUM LUNAS / DITOLAK) terposisi rapi di header kanan.
 */
export default function InvoiceReceiptModal({ isOpen, onClose, order }) {
  // Pasang class cetak dan kunci scroll body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('receipt-modal-open');
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.classList.remove('receipt-modal-open');
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const isPaid = order.status === 'Paid' || order.tracking_status === 'lunas';
  const isRejected = order.status === 'Cancelled' || order.tracking_status === 'ditolak';
  const amountNum = parseFloat(order.total_amount || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    // Pastikan class cetak sudah terpasang di body sebelum memanggil print
    document.body.classList.add('receipt-modal-open');
    window.print();
  };

  const modalContent = (
    <div 
      className="receipt-modal-overlay fixed inset-0 z-[9999] bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible"
      onClick={onClose}
    >
      {/* Container Dialog Struk Kompak */}
      <div 
        className="receipt-modal-card relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden text-slate-800 animate-in fade-in zoom-in duration-150 print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none print:max-h-none print:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BAR ATAS KONTROL (Hidden saat print) */}
        <div className="print:hidden shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
            <span className="text-xs font-black text-slate-700">
              Struk Resmi
            </span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              isPaid 
                ? 'bg-emerald-100 text-emerald-800' 
                : isRejected 
                ? 'bg-red-100 text-red-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {isPaid ? 'Lunas' : isRejected ? 'Ditolak' : 'Belum Lunas'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="py-1 px-3 rounded-lg bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Cetak</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              title="Tutup Struk"
            >
              ✕
            </button>
          </div>
        </div>

        {/* AREA DOKUMEN STRUK (PRINTABLE & SCROLLABLE DI LAYAR KECIL) */}
        <div id="printable-receipt" className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-3.5 bg-white print:p-4 print:overflow-visible">
          
          {/* HEADER STRUK & CAP STEMPEL RESMI */}
          <div className="flex items-start justify-between pb-3 border-b-2 border-slate-900 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                  CH
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">ContentHub</h1>
                  <p className="text-[9px] text-slate-400 font-medium">PT ContentHub Media Indonesia</p>
                </div>
              </div>
              <p className="text-[10px] font-mono text-primary font-bold mt-1">
                #{order.order_number}
              </p>
              <p className="text-[10px] text-slate-500">
                Tgl Terbit: {formatDate(order.created_at)}
              </p>
            </div>

            {/* Cap Stempel Resmi ContentHub (Posisi Presisi di Header Kanan Tanpa Menimpa Teks) */}
            <div className="shrink-0 select-none">
              {isPaid ? (
                <div className="border-2 border-dashed border-emerald-600 text-emerald-600 px-3 py-1 rounded-xl text-center transform -rotate-6 shadow-xs bg-emerald-50/70">
                  <span className="text-[8px] tracking-widest font-black uppercase block leading-tight">CONTENTHUB</span>
                  <span className="text-xs sm:text-sm font-black tracking-wider uppercase block my-0.5 leading-none">★ LUNAS ★</span>
                  <span className="text-[7.5px] tracking-wider uppercase block leading-tight font-bold">TERVERIFIKASI SAH</span>
                </div>
              ) : isRejected ? (
                <div className="border-2 border-dashed border-red-600 text-red-600 px-3 py-1 rounded-xl text-center transform -rotate-6 shadow-xs bg-red-50/70">
                  <span className="text-[8px] tracking-widest font-black uppercase block leading-tight">CONTENTHUB</span>
                  <span className="text-xs sm:text-sm font-black tracking-wider uppercase block my-0.5 leading-none">✕ DITOLAK ✕</span>
                  <span className="text-[7.5px] tracking-wider uppercase block leading-tight font-bold">DIBATALKAN</span>
                </div>
              ) : (
                <div className="border-2 border-dashed border-amber-600 text-amber-600 px-3 py-1 rounded-xl text-center transform -rotate-6 shadow-xs bg-amber-50/70">
                  <span className="text-[8px] tracking-widest font-black uppercase block leading-tight">CONTENTHUB</span>
                  <span className="text-xs sm:text-sm font-black tracking-wider uppercase block my-0.5 leading-none">⚠ BELUM LUNAS ⚠</span>
                  <span className="text-[7.5px] tracking-wider uppercase block leading-tight font-bold">MENUNGGU BAYAR</span>
                </div>
              )}
            </div>
          </div>

          {/* INFORMASI PELANGGAN & DETAIL PEMBAYARAN */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                Ditagihkan Kepada:
              </span>
              <p className="font-extrabold text-slate-900 truncate">
                {order.customer_name || 'Pelanggan UMKM'}
              </p>
              <p className="text-slate-500 font-mono text-[10px] truncate">
                {order.customer_email || '-'}
              </p>
              <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isPaid ? 'Member Aktif' : 'Menunggu Pelunasan'}
              </span>
            </div>

            <div className="space-y-0.5 text-right">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                Informasi Bayar:
              </span>
              <p className="font-bold text-slate-800">
                <span className="text-primary font-black">{order.payment_channel || order.payment_method}</span>
              </p>
              {order.bank_provider === 'BRI' && (
                <p className="text-[10px] text-slate-600 font-mono">
                  BRI: 7077 0100 3149 506
                </p>
              )}
              {isPaid && order.paid_at ? (
                <p className="text-[10px] text-emerald-700 font-bold">
                  Lunas: {formatDate(order.paid_at)}
                </p>
              ) : !isPaid ? (
                <p className="text-[10px] text-amber-700 font-bold">
                  Batas Bayar: 24 Jam
                </p>
              ) : null}
            </div>
          </div>

          {/* TABEL RINCIAN ITEM */}
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[9px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Layanan</th>
                  <th className="py-2 px-2 text-center">Durasi</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-slate-900 text-xs">
                      {order.plan_name || 'Paket Langganan ContentHub'}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      Kalender Editorial, Template Canva & Fitur Otomasi
                    </p>
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-slate-700 text-xs whitespace-nowrap">
                    {order.billing_cycle || '1 Siklus'}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-slate-700 text-xs">
                    1
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 text-xs whitespace-nowrap">
                    Rp {amountNum.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTAL & STATUS RINGKASAN */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Subtotal Layanan:</span>
              <span className="font-bold text-slate-700">Rp {amountNum.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Biaya Admin / Layanan:</span>
              <span className="font-bold text-emerald-600">Rp 0 (Gratis)</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-black text-slate-900 text-xs">TOTAL TAGIHAN:</span>
              <span className="text-base font-black text-primary">
                Rp {amountNum.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* LEGAL & DIGITAL VERIFICATION */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-900 text-white font-mono flex items-center justify-center text-[7px] font-bold">
                CH
              </div>
              <div>
                <p className="font-bold text-slate-600">Dokumen Sah Terverifikasi</p>
                <p className="font-mono text-[8px]">SIG-{order.order_number.replace('ORD-', '').slice(-8)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-600">PT ContentHub Media Indonesia</p>
              <p className="text-[8px]">support@contenthub.id</p>
            </div>
          </div>

        </div>

        {/* FOOTER MODAL KONTROL (Hidden saat print) */}
        <div className="print:hidden shrink-0 px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Tutup Struk
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Render via React Portal langsung ke document.body agar terpisah dari #root
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
