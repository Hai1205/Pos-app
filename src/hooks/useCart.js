import { useState, useEffect } from 'react';

export function useCart() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((currentCart) => {
      const existingItemIndex = currentCart.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
      );

      if (existingItemIndex > -1) {
        const newCart = currentCart.map((cartItem, index) => {
          if (index === existingItemIndex) {
            return { 
              ...cartItem, 
              quantity: cartItem.quantity + (item.quantity || 1),
              note: item.note || cartItem.note 
            };
          }
          return cartItem;
        });
        return newCart;
      }

      const price = item.selectedSize === 'large' ? item.large_size_price : item.price;
      return [...currentCart, {
        ...item,
        quantity: item.quantity || 1,
        price,
        note: item.note || '' 
      }];
    });
  };

  const removeFromCart = (id, selectedSize) => {
    setCart((currentCart) =>
      currentCart.filter((item) => !(item.id === id && item.selectedSize === selectedSize))
    );
  };

  const updateQuantity = (id, selectedSize, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id === id && item.selectedSize === selectedSize) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount
  };
}