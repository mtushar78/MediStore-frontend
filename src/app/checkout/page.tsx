"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cartApi, ordersApi } from "@/lib/api-client";
import type { Cart, ShippingAddress } from "@/types";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    area: "",
    postalCode: "",
    notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    if (status === "authenticated") {
      if (session.user.role !== "customer") {
        router.push("/");
        return;
      }
      fetchCart();
      // Pre-fill name from session
      setShippingAddress(prev => ({ ...prev, name: session.user.name }));
    }
  }, [status, session]);

  async function fetchCart() {
    if (!session) return;

    try {
      const res = await cartApi.get(session.user.accessToken);
      if (!res.data || res.data.items.length === 0) {
        router.push("/cart");
        return;
      }
      setCart(res.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session || !cart) return;

    setSubmitting(true);
    setError(null);

    try {
      const orderData = {
        items: cart.items.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: "COD" as const,
      };

      const res = await ordersApi.create(orderData, session.user.accessToken);
      // Clear cart after successful order
      await cartApi.clear(session.user.accessToken);
      // Redirect to order confirmation
      router.push(`/orders/${res.data.id}?success=true`);
    } catch (err: any) {
      setError(err.message || "Failed to place order");
      setSubmitting(false);
    }
  }

  if (status === "loading" || loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!cart) {
    return null;
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Shipping Form */}
        <div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Shipping Information</h2>
          
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Full Name *</span>
              <input
                type="text"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                required
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Phone Number *</span>
              <input
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                required
                placeholder="+880..."
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Address Line 1 *</span>
              <input
                type="text"
                value={shippingAddress.addressLine1}
                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                required
                placeholder="House/Flat number, Street"
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Address Line 2</span>
              <input
                type="text"
                value={shippingAddress.addressLine2}
                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                placeholder="Apartment, suite, etc. (optional)"
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500" }}>City *</span>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  required
                  placeholder="e.g., Dhaka"
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem"
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500" }}>Area *</span>
                <input
                  type="text"
                  value={shippingAddress.area}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, area: e.target.value })}
                  required
                  placeholder="e.g., Mirpur"
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem"
                  }}
                />
              </label>
            </div>

            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Postal Code</span>
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                placeholder="Optional"
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Delivery Notes</span>
              <textarea
                value={shippingAddress.notes}
                onChange={(e) => setShippingAddress({ ...shippingAddress, notes: e.target.value })}
                placeholder="Any special instructions for delivery (optional)"
                rows={3}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontFamily: "inherit"
                }}
              />
            </label>

            {error && (
              <div style={{
                padding: "0.75rem",
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: "6px"
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "1rem",
                background: submitting ? "#9ca3af" : "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.125rem",
                fontWeight: "600",
                cursor: submitting ? "not-allowed" : "pointer"
              }}
            >
              {submitting ? "Placing Order..." : "Place Order (Cash on Delivery)"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{
            padding: "1.5rem",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            background: "var(--background)",
            position: "sticky",
            top: "1rem"
          }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Order Summary</h2>

            <div style={{ marginBottom: "1rem" }}>
              {cart.items.map((item) => (
                <div
                  key={item.medicineId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid #e5e7eb"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500" }}>{item.medicine.name}</div>
                    <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                      ৳{item.medicine.price} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: "600" }}>
                    ৳{(item.medicine.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>Subtotal:</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>Shipping:</span>
              <span style={{ color: "#16a34a" }}>FREE</span>
            </div>

            <hr style={{ margin: "1rem 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1rem"
            }}>
              <span>Total:</span>
              <span style={{ color: "#16a34a" }}>৳{total.toFixed(2)}</span>
            </div>

            <div style={{
              padding: "1rem",
              background: "#fef3c7",
              borderRadius: "6px",
              fontSize: "0.875rem"
            }}>
              <strong>Payment Method:</strong> Cash on Delivery (COD)
              <p style={{ marginTop: "0.5rem", opacity: 0.8 }}>
                Pay when you receive your order
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
