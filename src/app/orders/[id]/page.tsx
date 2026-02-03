"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ordersApi } from "@/lib/api-client";
import type { Order } from "@/types";

export default function OrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;
  const isSuccess = searchParams.get("success") === "true";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session.user.role !== "customer") {
        router.push("/");
        return;
      }
      fetchOrder();
    }
  }, [status, session, id]);

  async function fetchOrder() {
    if (!session) return;

    try {
      const res = await ordersApi.getById(id, session.user.accessToken);
      setOrder(res.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder() {
    if (!session || !order || !confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      await ordersApi.cancel(order.id, session.user.accessToken);
      await fetchOrder();
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  }

  if (status === "loading" || loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!order) {
    return <div style={{ padding: "2rem" }}>Order not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "#3b82f6";
      case "PROCESSING": return "#f59e0b";
      case "SHIPPED": return "#8b5cf6";
      case "DELIVERED": return "#16a34a";
      case "CANCELLED": return "#dc2626";
      default: return "#6b7280";
    }
  };

  const canCancel = order.status === "PLACED";

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <Link href="/orders" style={{ color: "#667eea", marginBottom: "1rem", display: "inline-block" }}>
        ← Back to Orders
      </Link>

      {isSuccess && (
        <div style={{
          padding: "1rem",
          background: "#d1fae5",
          color: "#065f46",
          borderRadius: "8px",
          marginBottom: "2rem",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎉 Order Placed Successfully!</h2>
          <p>Thank you for your order. We'll process it shortly.</p>
        </div>
      )}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        marginBottom: "2rem",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            Order #{order.id.slice(0, 8)}
          </h1>
          <p style={{ opacity: 0.7 }}>
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: getStatusColor(order.status) + "20",
              color: getStatusColor(order.status),
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "1.125rem"
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: "2rem" }}>
        {/* Order Items */}
        <div style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "1.5rem",
          background: "var(--background)"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Order Items</h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {order.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "1rem",
                  background: "#f9fafb",
                  borderRadius: "6px"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>
                    {item.nameSnapshot}
                  </h3>
                  <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                    Quantity: {item.quantity}
                  </p>
                  <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                    Price: ৳{item.priceSnapshot} each
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "1.25rem", fontWeight: "600", color: "#16a34a" }}>
                    ৳{(item.priceSnapshot * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "1.5rem",
          background: "var(--background)"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Order Summary</h2>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span>Subtotal:</span>
            <span>৳{order.subtotal.toFixed(2)}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span>Shipping Fee:</span>
            <span style={{ color: "#16a34a" }}>
              {order.shippingFee === 0 ? "FREE" : `৳${order.shippingFee.toFixed(2)}`}
            </span>
          </div>
          
          <hr style={{ margin: "1rem 0", border: "none", borderTop: "1px solid #e5e7eb" }} />
          
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "1rem"
          }}>
            <span>Total:</span>
            <span style={{ color: "#16a34a" }}>৳{order.total.toFixed(2)}</span>
          </div>

          <div style={{
            padding: "1rem",
            background: "#fef3c7",
            borderRadius: "6px"
          }}>
            <strong>Payment Method:</strong> {order.paymentMethod}
          </div>
        </div>

        {/* Shipping Address */}
        <div style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "1.5rem",
          background: "var(--background)"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Shipping Address</h2>
          <div style={{ lineHeight: "1.8" }}>
            <p><strong>{order.shippingAddress.name}</strong></p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>
              {order.shippingAddress.area}, {order.shippingAddress.city}
              {order.shippingAddress.postalCode && ` - ${order.shippingAddress.postalCode}`}
            </p>
            {order.shippingAddress.notes && (
              <p style={{ marginTop: "0.5rem", fontStyle: "italic", opacity: 0.8 }}>
                Note: {order.shippingAddress.notes}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {canCancel && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              style={{
                padding: "0.75rem 2rem",
                background: cancelling ? "#9ca3af" : "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: cancelling ? "not-allowed" : "pointer"
              }}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
