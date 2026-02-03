"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ordersApi } from "@/lib/api-client";
import type { OrderStatus } from "@/types";

export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session.user.role !== "seller") {
        router.push("/");
        return;
      }
      fetchOrders();
    }
  }, [status, session]);

  async function fetchOrders() {
    if (!session) return;

    try {
      const res = await ordersApi.getSellerOrders(session.user.accessToken);
      console.log("API Response:", res.data);
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    if (!session) return;

    setUpdating(orderId);
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus, session.user.accessToken);
      await fetchOrders();
    } catch (error: any) {
      alert(error.message || "Failed to update order status");
    } finally {
      setUpdating(null);
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

  // The API returns a flat array of order items
  // We need to group them by orderId
  const groupedOrders = orders.reduce((acc: any, item: any) => {
    const orderId = item.orderId;
    if (!acc[orderId]) {
      acc[orderId] = {
        id: orderId,
        status: item.orderStatus,
        createdAt: item.createdAt,
        customerId: item.customerId,
        items: []
      };
    }
    acc[orderId].items.push(item);
    return acc;
  }, {});

  // Convert to array and calculate totals
  const ordersList = Object.values(groupedOrders).map((order: any) => ({
    ...order,
    total: order.items.reduce((sum: number, item: any) => 
      sum + (item.priceSnapshot * item.quantity), 0
    )
  }));
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Seller Orders</h1>

      {ordersList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.125rem", opacity: 0.7 }}>
            No orders yet. Your medicines will appear here when customers place orders.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {ordersList.map((order: any) => (
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
                  <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                    Customer ID: {order.customerId.slice(0, 8)}
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
                  Your Items:
                </h4>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
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
                  ))}
                </div>
              </div>


              {/* Status Update Actions */}
              {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {order.status === "PLACED" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "PROCESSING")}
                      disabled={updating === order.id}
                      style={{
                        padding: "0.5rem 1rem",
                        background: updating === order.id ? "#9ca3af" : "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: updating === order.id ? "not-allowed" : "pointer",
                        fontSize: "0.875rem"
                      }}
                    >
                      {updating === order.id ? "Updating..." : "Mark as Processing"}
                    </button>
                  )}
                  {order.status === "PROCESSING" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                      disabled={updating === order.id}
                      style={{
                        padding: "0.5rem 1rem",
                        background: updating === order.id ? "#9ca3af" : "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: updating === order.id ? "not-allowed" : "pointer",
                        fontSize: "0.875rem"
                      }}
                    >
                      {updating === order.id ? "Updating..." : "Mark as Shipped"}
                    </button>
                  )}
                  {order.status === "SHIPPED" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                      disabled={updating === order.id}
                      style={{
                        padding: "0.5rem 1rem",
                        background: updating === order.id ? "#9ca3af" : "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: updating === order.id ? "not-allowed" : "pointer",
                        fontSize: "0.875rem"
                      }}
                    >
                      {updating === order.id ? "Updating..." : "Mark as Delivered"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
