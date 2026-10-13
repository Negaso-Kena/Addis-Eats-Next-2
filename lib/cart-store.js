"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { useSession } from "@/app/useSession";

const CartContext = createContext(null);

function storageKeyFor(user) {
  // undefined = session not resolved yet (caller should wait, not guess)
  if (user === undefined) return null;
  return `addisEats.cart.v2.${user?.id ?? "guest"}`;
}

function cartReducer(state, action) {
  if (action.type === "HYDRATE") {
    return {
      identityKey: action.identityKey,
      items: Array.isArray(action.items) ? action.items : [],
    };
  }

  if (action.identityKey !== state.identityKey) return state;

  switch (action.type) {
    case "ADD": {
      const { quantity = 1, note = "", ...dish } = action.item;
      const existing = state.items.find((i) => i.id === dish.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === dish.id
              ? { ...i, quantity: i.quantity + quantity, note: note || i.note }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: dish.id,
            name: dish.name,
            price: dish.price,
            image: dish.image,
            quantity,
            note,
          },
        ],
      };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
      };
    case "SET_QTY":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.id === action.id ? { ...i, quantity: action.quantity } : i
          )
          .filter((i) => i.quantity > 0),
      };
    case "INCREMENT":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    case "DECREMENT":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter((i) => i.quantity > 0),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const user = useSession(); // undefined | null | user object
  const [cart, dispatch] = useReducer(cartReducer, {
    identityKey: null,
    items: [],
  });

  const storageKey = storageKeyFor(user);

  // Keep cart identity and items in one reducer state. This prevents an
  // account switch from persisting the previous account's items under the
  // newly active account's storage key.
  useEffect(() => {
    if (!storageKey) return; // session still resolving — wait, don't guess
    if (cart.identityKey === storageKey) return;

    let items = [];
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) items = parsed;
    } catch (error) {
      console.error("Unable to load the saved cart for this account.", error);
    }
    dispatch({ type: "HYDRATE", identityKey: storageKey, items });
  }, [cart.identityKey, storageKey]);

  // Persist only after reducer state has been hydrated for this identity.
  useEffect(() => {
    if (!storageKey || cart.identityKey !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart.items));
    } catch (error) {
      console.error("Unable to save the cart for this account.", error);
    }
  }, [cart, storageKey]);

  const dispatchForIdentity = useCallback(
    (action) => {
      if (storageKey) dispatch({ ...action, identityKey: storageKey });
    },
    [storageKey]
  );

  const addItem = useCallback(
    (item) => dispatchForIdentity({ type: "ADD", item }),
    [dispatchForIdentity]
  );
  const removeItem = useCallback(
    (id) => dispatchForIdentity({ type: "REMOVE", id }),
    [dispatchForIdentity]
  );
  const setQuantity = useCallback(
    (id, quantity) => dispatchForIdentity({ type: "SET_QTY", id, quantity }),
    [dispatchForIdentity]
  );
  const increment = useCallback(
    (id) => dispatchForIdentity({ type: "INCREMENT", id }),
    [dispatchForIdentity]
  );
  const decrement = useCallback(
    (id) => dispatchForIdentity({ type: "DECREMENT", id }),
    [dispatchForIdentity]
  );
  const clear = useCallback(
    () => dispatchForIdentity({ type: "CLEAR" }),
    [dispatchForIdentity]
  );

  const items = cart.identityKey === storageKey ? cart.items : [];
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