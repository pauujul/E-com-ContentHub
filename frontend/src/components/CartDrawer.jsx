import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = (planId) => {
    setIsCartOpen(false);
    navigate(`/checkout/${planId || (cartItems[0] ? cartItems[0].id : '')}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">shopping_cart</span>
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Keranjang Belanja</h2>
                <p className="text-xs text-slate-500 font-medium">Pilihan paket langganan ContentHub</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Body Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartCount === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl">shopping_bag</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-700 text-base">Keranjang Anda Masih Kosong</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Pilih paket langganan SaaS (Starter atau Pro) yang sesuai kebutuhan bisnis Anda.</p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/pricing');
                  }}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  Lihat Katalog Paket
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold px-1">
                  <span>ITEM PAKET ({cartCount})</span>
                  <button onClick={clearCart} className="text-red-600 hover:underline">
                    Kosongkan
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 hover:border-primary/40 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mb-1">
                          {item.sku || 'CH-PLAN'}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Siklus: {item.billing_cycle || 'Bulanan'}</p>
                      </div>

                      <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-600 p-1 transition-colors" title="Hapus dari keranjang">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-end pt-2 border-t border-slate-200/60">
                      <span className="text-xs text-slate-500 font-medium">Harga Langganan</span>
                      <span className="text-sm font-extrabold text-primary">Rp {parseFloat(item.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cartCount > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>PPN / Biaya Platform</span>
                  <span className="text-green-600 font-bold">Gratis (Promo UMKM)</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Tagihan</span>
                  <span className="text-primary text-lg">Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleCheckout(cartItems[0]?.id)}
                  className="w-full py-3.5 bg-gradient-primary text-white rounded-xl font-extrabold text-sm shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">payment</span>
                  Lanjut ke Pembayaran
                </button>

                <button onClick={() => setIsCartOpen(false)} className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  Lanjut Lihat Paket Lainnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
