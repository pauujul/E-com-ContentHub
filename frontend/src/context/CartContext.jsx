import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('contenthub_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Gagal membaca data keranjang dari localStorage:', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('contenthub_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Gagal menyimpan keranjang ke localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (plan) => {
    setCartItems((prev) => {
      // Jika paket sudah ada di keranjang, jangan duplikasi
      const existing = prev.find((item) => item.id === plan.id);
      if (existing) {
        return prev;
      }
      return [...prev, { ...plan, quantity: 1, addedAt: new Date().toISOString() }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (planId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== planId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
