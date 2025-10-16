'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type CartItemVariant = {
  id: string;
  label: string;
  description?: string;
  price: number;
};

type CartItemPayload = {
  productId: string;
  name: string;
  image?: string;
  description?: string;
  price: number;
  quantity?: number;
  sizeId?: string;
  sizeLabel?: string;
  crustLabel?: string;
  extras?: string[];
  category?: string;
  metadata?: Record<string, string | number>;
  bundleId?: string;
  priceVariants?: CartItemVariant[];
};

type CartAddOptions = {
  openCart?: boolean;
};

export type CartItem = {
  uid: string;
  key: string;
  productId: string;
  name: string;
  image?: string;
  description?: string;
  sizeId?: string;
  sizeLabel?: string;
  crustLabel?: string;
  extras: string[];
  category?: string;
  metadata?: Record<string, string | number>;
  quantity: number;
  unitPrice: number;
  bundleId?: string;
  priceVariants?: CartItemVariant[];
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  isOpen: boolean;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (payload: CartItemPayload, options?: CartAddOptions) => void;
  removeItem: (uid: string) => void;
  updateQuantity: (uid: string, quantity: number) => void;
  updateItemSize: (uid: string, sizeId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const buildKey = ({
  productId,
  sizeId,
  sizeLabel,
  crustLabel,
  extras,
  metadata,
  bundleId,
}: {
  productId: string;
  sizeId?: string;
  sizeLabel?: string;
  crustLabel?: string;
  extras?: string[];
  metadata?: Record<string, string | number>;
  bundleId?: string;
}) => {
  const extrasKey = extras ? [...extras].sort().join('|') : '';
  const metadataKey = metadata
    ? Object.keys(metadata)
        .sort()
        .map(key => `${key}:${metadata?.[key]}`)
        .join('|')
    : '';

  return [
    productId,
    sizeId ?? sizeLabel ?? '',
    crustLabel ?? '',
    extrasKey,
    metadataKey,
    bundleId ?? '',
  ].join('::');
};

const generateUid = () =>
  `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);

  const addItem = useCallback(
    (payload: CartItemPayload, options?: CartAddOptions) => {
      const quantityToAdd = Math.max(1, payload.quantity ?? 1);
      const priceVariants = payload.priceVariants
        ? payload.priceVariants.map(variant => ({ ...variant }))
        : undefined;
      const resolvedVariant =
        priceVariants?.find(variant => variant.id === payload.sizeId) ??
        priceVariants?.find(variant => variant.id === 'M') ??
        priceVariants?.[0];
      const key = buildKey({
        productId: payload.productId,
        sizeId: resolvedVariant?.id ?? payload.sizeId,
        sizeLabel: resolvedVariant?.label ?? payload.sizeLabel,
        crustLabel: payload.crustLabel,
        extras: payload.extras,
        metadata: payload.metadata,
        bundleId: payload.bundleId,
      });

      setItems(prevItems => {
        const existingIndex = prevItems.findIndex(item => item.key === key);

        if (existingIndex !== -1) {
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantityToAdd,
            priceVariants:
              updated[existingIndex].priceVariants ?? priceVariants,
          };
          return updated;
        }

        const newItem: CartItem = {
          uid: generateUid(),
          key,
          productId: payload.productId,
          name: payload.name,
          image: payload.image,
          description: payload.description,
          sizeId: resolvedVariant?.id ?? payload.sizeId,
          sizeLabel: resolvedVariant?.label ?? payload.sizeLabel,
          crustLabel: payload.crustLabel,
          extras: payload.extras ? [...payload.extras] : [],
          category: payload.category,
          metadata: payload.metadata,
          quantity: quantityToAdd,
          unitPrice: resolvedVariant?.price ?? payload.price,
          bundleId: payload.bundleId,
          priceVariants,
        };

        return [...prevItems, newItem];
      });

      if (options?.openCart ?? true) {
        setIsOpen(true);
      }
    },
    []
  );

  const removeItem = useCallback((uid: string) => {
    setItems(prev => prev.filter(item => item.uid !== uid));
  }, []);

  const updateQuantity = useCallback((uid: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.uid === uid ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }, []);

  const updateItemSize = useCallback((uid: string, sizeId: string) => {
    setItems(prevItems => {
      const currentIndex = prevItems.findIndex(item => item.uid === uid);
      if (currentIndex === -1) {
        return prevItems;
      }

      const currentItem = prevItems[currentIndex];
      if (!currentItem.priceVariants) {
        return prevItems;
      }

      const variant = currentItem.priceVariants.find(
        entry => entry.id === sizeId
      );
      if (!variant || currentItem.sizeId === variant.id) {
        return prevItems;
      }

      const nextItems = [...prevItems];
      const updatedItem: CartItem = {
        ...currentItem,
        sizeId: variant.id,
        sizeLabel: variant.label,
        unitPrice: variant.price,
        key: buildKey({
          productId: currentItem.productId,
          sizeId: variant.id,
          sizeLabel: variant.label,
          crustLabel: currentItem.crustLabel,
          extras: currentItem.extras,
          metadata: currentItem.metadata,
          bundleId: currentItem.bundleId,
        }),
      };

      const duplicateIndex = nextItems.findIndex(
        (item, index) => index !== currentIndex && item.key === updatedItem.key
      );

      if (duplicateIndex !== -1) {
        const duplicate = nextItems[duplicateIndex];
        nextItems[duplicateIndex] = {
          ...duplicate,
          quantity: duplicate.quantity + updatedItem.quantity,
        };
        nextItems.splice(currentIndex, 1);
        return nextItems;
      }

      nextItems[currentIndex] = updatedItem;
      return nextItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      isOpen,
      subtotal,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      updateItemSize,
      clearCart,
    }),
    [
      items,
      itemCount,
      isOpen,
      subtotal,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      updateItemSize,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
