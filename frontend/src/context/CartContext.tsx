import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book } from '../types/book';
import { useAuth } from './AuthContext';

export interface CartItem {
  book: Book;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isAdmin: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { isAuthenticated } = useAuth();

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (book: Book, quantity: number = 1) => {
    if (isAuthenticated) return; // Block when admin logged in
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.book.id === book.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { book, quantity }];
    });
  };

  const removeItem = (bookId: number) => {
    if (isAuthenticated) return; // Block when admin logged in
    setItems((prevItems) => prevItems.filter((item) => item.book.id !== bookId));
  };

  const updateQuantity = (bookId: number, quantity: number) => {
    if (isAuthenticated) return; // Block when admin logged in
    if (quantity <= 0) {
      removeItem(bookId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.book.id === bookId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    if (isAuthenticated) return; // Block when admin logged in
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isAdmin: isAuthenticated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
