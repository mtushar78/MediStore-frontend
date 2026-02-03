"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ordersApi } from "@/lib/api-client";
import type { Order } from "@/types";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/orders");
      return;
    }

    if (status === "authenticated") {
      if (session.user.role !== "customer") {
        router.push("/");
        return;
      }
      fetchOrders();
    }
  }, [status, session]);

  async function fetchOrders() {
    if (!session) return;

    try {
      const res = await ordersApi.getAll(session.user.accessToken);
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
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

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>My Orders</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.125rem", marginBottom: "1.5rem", opacity: 0.7 }}>
            You haven't placed any orders yet.
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
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "1.5rem",
                background: "var(--background)"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "1rem"
              }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.5rem 1rem",
                      background: getStatusColor(order.status) + "20",
                      color: getStatusColor(order.status),
                      borderRadius: "6px",
                      fontWeight: "600",
                      marginBottom: "0.5rem"
                    }}
                  >
                    {order.status}
                  </span>
                  <p style={{ fontSize: "1.25rem", fontWeight: "600", color: "#16a34a" }}>
                    ৳{order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem", fontWeight: "600" }}>
                  Items ({order.items?.length || 0}):
                </h4>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {order.items?.map((item) => (
                    <div
                      key={item.medicineId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.5rem",
                        background: "#f9fafb",
                        borderRadius: "4px"
                      }}
                    >
                      <span>
                        {item.nameSnapshot} × {item.quantity}
                      </span>
                      <span style={{ fontWeight: "500" }}>
                        ৳{(item.priceSnapshot * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )) || <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>No items</p>}
                </div>
              </div>

              {order.shippingAddress && (
                <div style={{ marginBottom: "1rem" }}>
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem", fontWeight: "600" }}>
                    Shipping Address:
                  </h4>
                  <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.phone}<br />
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}<br />
                    {order.shippingAddress.area}, {order.shippingAddress.city}
                    {order.shippingAddress.postalCode && ` - ${order.shippingAddress.postalCode}`}
                  </p>
                </div>
              )}

              <Link
                href={`/orders/${order.id}`}
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  border: "1px solid #667eea",
                  color: "#667eea",
                  borderRadius: "6px",
                  fontWeight: "500"
                }}
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
