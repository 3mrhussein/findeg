import { useContext } from "react";
import { CartContext } from "@/providers/CartProvider";

/**
 * Custom hook to access the CartContext.
 *
 * This hook provides access to the cart state and actions (add, remove, update quantity, etc.).
 * It must be used within a component that is wrapped by `CartProvider`.
 *
 * @returns {CartContextType} The cart context value.
 * @throws {Error} If used outside of a CartProvider.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
