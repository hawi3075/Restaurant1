import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { showToast } from '../components/Toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const { t } = useLanguage();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    setCartLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (food, quantity = 1, addons = [], specialInstructions = '') => {
    const itemPrice = food.price + addons.reduce((sum, addon) => sum + addon.price, 0);
    const total = itemPrice * quantity;

    const newItem = {
      id: `${food.id}-${Date.now()}`, // Unique ID for cart item
      food,
      quantity,
      addons,
      specialInstructions,
      itemPrice,
      total,
    };

    setCart((prev) => [...prev, newItem]);
    showToast(`${food.name} ${t('addedToCartSuccessfully') || 'added to cart successfully!'}`, 'success');
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              total: item.itemPrice * newQuantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getRestaurantId = () => {
    if (cart.length === 0) return null;
    for (const item of cart) {
      const id = item?.food?.restaurantId || item?.food?.restaurant_id || item?.food?.restaurant?.id || item?.restaurantId || item?.restaurant_id;
      if (id) return id;
    }
    return null;
  };

  const canAddItem = (restaurantId) => {
    const currentRestaurantId = getRestaurantId();
    return !currentRestaurantId || currentRestaurantId === restaurantId;
  };

  const value = {
    cart,
    cartLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
    getRestaurantId,
    canAddItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
