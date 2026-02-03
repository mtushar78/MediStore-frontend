"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cartApi } from "@/lib/api-client";
import type { Cart } from "@/types";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (status === "authenticated") {
      if (session.user.role !== "customer") {
        router.push("/");
        return;
      }
      fetchCart();
    }
  }, [status, session]);

  async function fetchCart() {
    if (!session) return;
    
    try {
      const res = await cartApi.get(session.user.accessToken);
      setCart(res.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(medicineId: string, quantity: number) {
    if (!session) return;
    
    setUpdating(medicineId);
    try {
      await cartApi.updateItem(medicineId, quantity, session.user.accessToken);
      await fetchCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(medicineId: string) {
    if (!session) return;
    
    setUpdating(medicineId);
    try {
      await cartApi.removeItem(medicineId, session.user.accessToken);
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdating(null);
    }
  }

  async function clearCart() {
    if (!session || !confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      await cartApi.clear(session.user.accessToken);
      await fetchCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }

  if (status === "loading" || loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Your Cart is Empty</h1>
        <p style={{ marginBottom: "2rem", opacity: 0.7 }}>
          Add some medicines to your cart to get started!
        </p>
        <Link
          href="/shop"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            background: "#667eea",
            color: "white",
            borderRadius: "8px",
            fontWeight: "600"
          }}
        >
          Browse Medicines
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  const shippingFee = 0; // Free shipping for now
  const total = subtotal + shippingFee;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Shopping Cart</h1>
        <button
          onClick={clearCart}
          style={{
            padding: "0.5rem 1rem",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Clear Cart
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Cart Items */}
        <div>
          {cart.items.map((item) => (
            <div
              key={item.medicineId}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr auto",
                gap: "1rem",
                padding: "1.5rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                marginBottom: "1rem",
                background: "var(--background)"
              }}
            >
              {/* Image */}
              <Link href={`/shop/${item.medicine.id}`}>
                <div style={{
                  width: "100px",
                  height: "100px",
                  background: "#f3f4f6",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {item.medicine.images[0] && (
                    <img
                      src={item.medicine.images[0]}
                      alt={item.medicine.name}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  )}
                </div>
              </Link>

              {/* Details */}
              <div>
                <Link href={`/shop/${item.medicine.id}`}>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{item.medicine.name}</h3>
                </Link>
                <p style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.5rem" }}>
                  {item.medicine.manufacturer}
                </p>
                <p style={{ fontSize: "1.125rem", fontWeight: "600", color: "#16a34a" }}>
                  ৳{item.medicine.price} × {item.quantity} = ৳{(item.medicine.price * item.quantity).toFixed(2)}
                </p>

                {/* Quantity Controls */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "1rem" }}>
                  <button
                    onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                    disabled={updating === item.medicineId || item.quantity <= 1}
                    style={{
                      padding: "0.25rem 0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      background: "var(--background)",
                      cursor: item.quantity <= 1 ? "not-allowed" : "pointer"
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: "40px", textAlign: "center" }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                    disabled={updating === item.medicineId || item.quantity >= item.medicine.stock}
                    style={{
                      padding: "0.25rem 0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      background: "var(--background)",
                      cursor: item.quantity >= item.medicine.stock ? "not-allowed" : "pointer"
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeItem(item.medicineId)}
                disabled={updating === item.medicineId}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  height: "fit-content"
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "var(--background)",
          height: "fit-content",
          position: "sticky",
          top: "1rem"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Order Summary</h2>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span>Subtotal ({cart.items.length} items):</span>
            <span>৳{subtotal.toFixed(2)}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span>Shipping Fee:</span>
            <span style={{ color: "#16a34a" }}>{shippingFee === 0 ? "FREE" : `৳${shippingFee}`}</span>
          </div>
          
          <hr style={{ margin: "1rem 0", border: "none", borderTop: "1px solid #e5e7eb" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
            <span>Total:</span>
            <span style={{ color: "#16a34a" }}>৳{total.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            style={{
              display: "block",
              textAlign: "center",
              padding: "1rem",
              background: "#667eea",
              color: "white",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "1.125rem"
            }}
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/shop"
            style={{
              display: "block",
              textAlign: "center",
              padding: "0.75rem",
              marginTop: "1rem",
              color: "#667eea",
              fontWeight: "500"
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
