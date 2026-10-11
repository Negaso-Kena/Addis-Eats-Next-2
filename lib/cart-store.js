"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useSession } from "@/app/useSession";

const CartContext = createContext(null);

function storageKeyFor(user) {
  // undefined = session not resolved yet (caller should wait, not guess)
  if (user === undefined) return null;
  return `addisEats.cart.${user?.id ?? "guest"}`;
}

function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      // Fires both on initial load AND whenever the signed-in identity
      // changes — in the identity-switch case this deliberately REPLACES
      // state (including with []), which is what clears a previous
      // user's cart instead of carrying it over.
      return Array.isArray(action.items) ? action.items : state;
    case "ADD": {
      const { quantity = 1, note = "", ...dish } = action.item;
      const existing = state.find((i) => i.id === dish.id);
      if (existing) {
        return state.map((i) =>
          i.id === dish.id
            ? { ...i, quantity: i.quantity + quantity, note: note || i.note }
            : i
        );
      }
      return [
        ...state,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          quantity,
          note,
        },
      ];
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "SET_QTY":
      return state
        .map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        )
        .filter((i) => i.quantity > 0);
    case "INCREMENT":
      return state.map((i) =>
        i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    case "DECREMENT":
      return state
        .map((i) =>
          i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const user = useSession(); // undefined | null | user object
  const [items, dispatch] = useReducer(cartReducer, []);
  // Tracks which identity's storage key the in-memory `items` currently
  // reflects — not just whether hydration ran once, like before.
  const syncedKeyRef = useRef(null);

  const storageKey = storageKeyFor(user);

  // Re-hydrate whenever the resolved identity's key changes: first load,
  // sign-in, sign-out, or switching accounts all land here.
  useEffect(() => {
    if (!storageKey) return; // session still resolving — wait, don't guess
    if (syncedKeyRef.current === storageKey) return; // already on this identity

    try {
      const raw = localStorage.getItem(storageKey);
      dispatch({ type: "HYDRATE", items: raw ? JSON.parse(raw) : [] });
    } catch {
      dispatch({ type: "HYDRATE", items: [] });
    }
    syncedKeyRef.current = storageKey;
  }, [storageKey]);

  // Persist on every change, but only once we've actually synced to the
  // current identity's key — otherwise a change made right after a
  // sign-in/out, before hydration catches up, could write into the
  // wrong (previous) identity's storage.
  useEffect(() => {
    if (!storageKey || syncedKeyRef.current !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // storage full or unavailable — cart just won't persist this time
    }
  }, [items, storageKey]);

  const addItem = useCallback((item) => dispatch({ type: "ADD", item }), []);
  const removeItem = useCallback((id) => dispatch({ type: "REMOVE", id }), []);
  const setQuantity = useCallback(
    (id, quantity) => dispatch({ type: "SET_QTY", id, quantity }),
    []
  );
  const increment = useCallback((id) => dispatch({ type: "INCREMENT", id }), []);
  const decrement = useCallback((id) => dispatch({ type: "DECREMENT", id }), []);
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        setQuantity,
        increment,
        decrement,
        clear,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}