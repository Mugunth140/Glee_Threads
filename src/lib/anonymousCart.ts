export type CartItem = {
  id: string; // uuid-like
  product_id: number;
  size_id: number;
  size_name?: string;
  quantity: number;
  color?: string;
  product?: {
    id: number;
    name?: string;
    price?: number;
    image_url?: string;
  };
};

const STORAGE_KEY = 'glee_cart_v1';

function readStore(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch (e) {
    console.error('Failed to read cart from localStorage', e);
    return [];
  }
}

function writeStore(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // dispatch storage event for same-window listeners
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(items) }));
  } catch (e) {
    console.error('Failed to write cart to localStorage', e);
  }
}

function generateId() {
  // simple id
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function getCart(): CartItem[] {
  return readStore();
}

export function getCartCount(): number {
  const items = readStore();
  return items.reduce((acc, it) => acc + (it.quantity || 0), 0);
}

export function addToCart(item: Omit<CartItem, 'id'>) {
  const items = readStore();
  // try to find existing item by product_id + size_id + color (if provided)
  const existing = items.find((it) =>
    it.product_id === item.product_id &&
    it.size_id === item.size_id &&
    (it.color || '') === (item.color || '')
  );
  if (existing) {
    existing.quantity = (existing.quantity || 0) + (item.quantity || 1);
  } else {
    items.push({ ...item, id: generateId() });
  }
  writeStore(items);
}

export function removeFromCartById(id: string) {
  let items = readStore();
  items = items.filter((it) => it.id !== id);
  writeStore(items);
}

export function clearCart() {
  writeStore([]);
}

export function updateQuantity(id: string, newQuantity: number) {
  const items = readStore();
  const idx = items.findIndex((it) => it.id === id);
  if (idx === -1) return;
  if (newQuantity <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx].quantity = newQuantity;
  }
  writeStore(items);
}

const anonymousCart = {
  getCart,
  getCartCount,
  addToCart,
  removeFromCartById,
  clearCart,
};

export default anonymousCart;
