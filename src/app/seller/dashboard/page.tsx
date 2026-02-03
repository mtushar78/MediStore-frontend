"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ordersApi, medicinesApi } from "@/lib/api-client";

export default function SellerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalMedicines: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

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
      fetchStats();
    }
  }, [status, session]);

  async function fetchStats() {
    if (!session) return;

    try {
      const [ordersRes, medicinesRes] = await Promise.all([
        ordersApi.getSellerOrders(session.user.accessToken),
        medicinesApi.getAll(), // Get all to count seller's medicines
      ]);

      const orders = ordersRes.data;
      const allMedicines = medicinesRes.data;
      
      // Filter medicines by seller
      const sellerMedicines = allMedicines.filter((m: any) => m.sellerId === session.user.id);
      
      // Calculate stats
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return sum + (order.priceSnapshot * order.quantity);
      }, 0);

      const pendingOrders = orders.filter((order: any) => 
        order.order?.status === "PLACED" || order.order?.status === "PROCESSING"
      ).length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalMedicines: sellerMedicines.length,
        pendingOrders,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Seller Dashboard</h1>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
        marginBottom: "3rem"
      }}>
        <div style={{
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}>
          <h3 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.9 }}>Total Medicines</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.totalMedicines}</p>
        </div>

        <div style={{
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white"
        }}>
          <h3 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.9 }}>Total Orders</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.totalOrders}</p>
        </div>

        <div style={{
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white"
        }}>
          <h3 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.9 }}>Pending Orders</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.pendingOrders}</p>
        </div>

        <div style={{
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          color: "white"
        }}>
          <h3 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.9 }}>Total Revenue</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>৳{stats.totalRevenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>Quick Actions</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem"
        }}>
          <Link
            href="/seller/medicines"
            style={{
              padding: "2rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              textAlign: "center",
              transition: "all 0.2s",
              background: "var(--background)"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💊</div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Manage Medicines</h3>
            <p style={{ opacity: 0.7 }}>Add, edit, or remove your medicine inventory</p>
          </Link>

          <Link
            href="/seller/orders"
            style={{
              padding: "2rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              textAlign: "center",
              transition: "all 0.2s",
              background: "var(--background)"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>View Orders</h3>
            <p style={{ opacity: 0.7 }}>Manage and update order statuses</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
