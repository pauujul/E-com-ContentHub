import React from 'react';

/**
 * InvoiceReceiptModal - Komponen Struk Pembayaran & Tagihan Resmi ContentHub
 * Menampilkan struk digital dengan cap stempel resmi:
 * - "LUNAS" (Hijau) jika status order sudah dibayar
 * - "BELUM LUNAS" (Merah) jika status order masih menunggu pembayaran / verifikasi
 * Dilengkapi fitur cetak / download PDF resmi via window.print()
 */
export default function InvoiceReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const isPaid = order.status === 'Paid' || order.tracking_status === 'lunas';
  const isRejected = order.status === 'Cancelled' || order.tracking_status === 'ditolak';
  const amountNum = parseFloat(order.total_amount || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      {/* Container Struk */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in duration-200 print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Aksi Atas (Hidden saat print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Pratinjau Struk Digital
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-3.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              title="Tutup Struk"
            >
              ✕
            </button>
          </div>
        </div>

        {/* AREA DOKUMEN STRUK FISIK (PRINTABLE) */}
        <div id="printable-receipt" className="p-6 sm:p-10 relative space-y-6 bg-white">
          
          {/* WATERMARK CAP STEMPEL RESMI BESAR (RUBBER STAMP) */}
          <div className="absolute top-44 right-8 sm:right-16 pointer-events-none select-none z-10">
            {isPaid ? (
              <div className="border-4 border-dashed border-emerald-600 text-emerald-600 px-6 py-2.5 rounded-2xl font-black text-center transform -rotate-12 opacity-85 shadow-sm bg-white/40">
                <span className="text-[10px] sm:text-xs tracking-widest uppercase block border-b border-dashed border-emerald-400 pb-0.5">
                  CONTENTHUB INDONESIA
                </span>
                <span className="text-2xl sm:text-3xl tracking-widest font-black uppercase block my-0.5">
                  ★ LUNAS ★
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-wider uppercase block border-t border-dashed border-emerald-400 pt-0.5">
                  TERVERIFIKASI SAH
                </span>
              </div>
            ) : isRejected ? (
              <div className="border-4 border-dashed border-red-600 text-red-600 px-6 py-2.5 rounded-2xl font-black text-center transform -rotate-12 opacity-85 shadow-sm bg-white/40">
                <span className="text-[10px] sm:text-xs tracking-widest uppercase block border-b border-dashed border-red-400 pb-0.5">
                  CONTENTHUB INDONESIA
                </span>
                <span className="text-2xl sm:text-3xl tracking-widest font-black uppercase block my-0.5">
                  ✕ DITOLAK ✕
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-wider uppercase block border-t border-dashed border-red-400 pt-0.5">
                  TRANSAKSI DIBATALKAN
                </span>
              </div>
            ) : (
              <div className="border-4 border-dashed border-amber-600 text-amber-600 px-6 py-2.5 rounded-2xl font-black text-center transform -rotate-12 opacity-85 shadow-sm bg-white/40">
                <span className="text-[10px] sm:text-xs tracking-widest uppercase block border-b border-dashed border-amber-400 pb-0.5">
                  CONTENTHUB INDONESIA
                </span>
                <span className="text-2xl sm:text-3xl tracking-widest font-black uppercase block my-0.5">
                  ⚠ BELUM LUNAS ⚠
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-wider uppercase block border-t border-dashed border-amber-400 pt-0.5">
                  MENUNGGU PEMBAYARAN
                </span>
              </div>
            )}
          </div>

          {/* HEADER STRUK */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  CH
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">ContentHub</h1>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                PT ContentHub Media Indonesia • Platform Manajemen Konten UMKM
              </p>
              <p className="text-[10px] text-slate-400">
                Website: contenthub.id • Dukungan: support@contenthub.id
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {isPaid ? 'BUKTI PEMBAYARAN SAH (INVOICE)' : 'FAKTUR TAGIHAN (INVOICE)'}
              </span>
              <p className="text-base font-mono font-black text-primary">
                #{order.order_number}
              </p>
              <p className="text-[11px] text-slate-500">
                Tgl Terbit: {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          {/* INFORMASI PELANGGAN & DETAIL PEMBAYARAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Ditagihkan Kepada:
              </span>
              <p className="font-extrabold text-slate-900 text-sm">
                {order.customer_name || 'Pelanggan UMKM'}
              </p>
              <p className="text-slate-600 font-mono text-[11px]">
                {order.customer_email || '-'}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                Status Akun: {isPaid ? 'Member Aktif Terverifikasi' : 'Menunggu Pelunasan'}
              </span>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Informasi Pembayaran:
              </span>
              <p className="font-bold text-slate-800">
                Metode: <span className="font-extrabold text-primary">{order.payment_channel || order.payment_method}</span>
              </p>
              {order.bank_provider === 'BRI' && (
                <p className="text-[11px] text-slate-600">
                  Bank BRI: 7077 0100 3149 506 a.n. FIRMAN SYAH
                </p>
              )}
              {isPaid && order.paid_at && (
                <p className="text-[11px] text-emerald-700 font-bold">
                  Waktu Lunas: {formatDate(order.paid_at)}
                </p>
              )}
              {!isPaid && (
                <p className="text-[11px] text-amber-700 font-bold">
                  Batas Waktu Bayar: 24 Jam sejak pemesanan
                </p>
              )}
            </div>
          </div>

          {/* TABEL RINCIAN ITEM */}
          <div className="overflow-hidden border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Deskripsi Layanan</th>
                  <th className="py-3 px-3 text-center">Durasi</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-slate-900 text-sm">
                      {order.plan_name || 'Paket Langganan ContentHub'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kalender Editorial Drag & Drop, Akses Library Template Desain Canva, Notifikasi Jadwal & Multi Akun.
                    </p>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                    {order.billing_cycle || '1 Siklus'}
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                    1
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    Rp {amountNum.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTAL & STATUS RINGKASAN */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div className="max-w-xs text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Ketentuan & Keabsahan Dokumen:</p>
              <p className="leading-relaxed">
                Struk ini diterbitkan secara elektronik oleh sistem ContentHub. Berfungsi sebagai bukti transaksi dan penagihan yang sah bagi pembukuan usaha/UMKM.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal Layanan:</span>
                <span className="font-bold">Rp {amountNum.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Biaya Admin / Layanan:</span>
                <span className="font-bold text-emerald-600">Rp 0 (Gratis)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-xs font-black text-slate-900">TOTAL TAGIHAN:</span>
                <span className="text-lg font-black text-primary">
                  Rp {amountNum.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Status Box */}
              <div className={`mt-2 p-2 rounded-xl text-center text-xs font-black uppercase tracking-wider ${
                isPaid 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : isRejected 
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isPaid ? 'STATUS: TELAH LUNAS' : isRejected ? 'STATUS: TRANSAKSI DITOLAK' : 'STATUS: MENUNGGU PEMBAYARAN'}
              </div>
            </div>
          </div>

          {/* FOOTER STEMPEL & TANDA TANGAN DIGITAL */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border border-slate-200 p-1 flex items-center justify-center bg-white shadow-xs">
                {/* Kode QR Verifikasi Mini */}
                <div className="w-10 h-10 bg-slate-900 rounded-sm flex items-center justify-center text-white text-[8px] font-mono text-center leading-tight">
                  VERIFIED<br/>CH-ID
                </div>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-700">Digital Authenticated</p>
                <p className="text-[9px] text-slate-400 font-mono">HASH: {order.order_number.replace('ORD-', '')}-SIG</p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Otorisasi Resmi</p>
              <p className="text-xs font-black text-slate-800 mt-0.5">PT ContentHub Media Indonesia</p>
              <p className="text-[9px] text-emerald-600 font-bold">Sistem Billing Otomatis</p>
            </div>
          </div>

        </div>

        {/* FOOTER MODAL ACTION (Hidden saat print) */}
        <div className="print:hidden p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Tutup Struk
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Cetak / Simpan PDF Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
}
