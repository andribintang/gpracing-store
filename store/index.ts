import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────
interface CartItem {
  id: number;
  product_id: number;
  product?: { id: number; name: string; slug: string; images: string[]; price: number; stock: number };
  variant: Record<string, string>;
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  subtotal: number;
  count: number;
  loading: boolean;
  setCart: (items: CartItem[], subtotal: number) => void;
  setLoading: (v: boolean) => void;
  clear: () => void;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface AuthStore {
  customer: Customer | null;
  token: string | null;
  setAuth: (customer: Customer, token: string) => void;
  logout: () => void;
}

// ── Cart Store ────────────────────────────────────────────────
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  subtotal: 0,
  count: 0,
  loading: false,
  setCart: (items, subtotal) => set({ items, subtotal, count: items.reduce((s, i) => s + i.quantity, 0) }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ items: [], subtotal: 0, count: 0 }),
}));

// ── Auth Store ────────────────────────────────────────────────
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      customer: null,
      token: null,
      setAuth: (customer, token) => {
        if (typeof window !== 'undefined') localStorage.setItem('store_token', token);
        set({ customer, token });
      },
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('store_token');
        set({ customer: null, token: null });
      },
    }),
    { name: 'gpdistro-auth', partialize: (s) => ({ customer: s.customer, token: s.token }) }
  )
);

// ── Session ID for guest cart ─────────────────────────────────
export const getOrCreateSession = (): string => {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('session_id');
  if (!sid) { sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`; localStorage.setItem('session_id', sid); }
  return sid;
};
