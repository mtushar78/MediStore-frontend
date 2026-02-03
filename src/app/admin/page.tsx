"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi, medicinesApi, ordersApi } from "@/lib/api-client";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalSellers: 0,
    totalMedicines: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session.user.role !== "admin") {
        router.push("/");
        return;
      }
      fetchStats();
    }
  }, [status, session]);

  async function fetchStats() {
    if (!session) return;

    try {
      const [usersRes, medicinesRes] = await Promise.all([
        adminApi.getUsers(session.user.accessToken),
        medicinesApi.getAll(),
      ]);

      const users = usersRes.data;
      const medicines = medicinesRes.data;

      setStats({
        totalUsers: users.length,
        totalCustomers: users.filter((u: any) => u.role === "customer").length,
        totalSellers: users.filter((u: any) => u.role === "seller").length,
        totalMedicines: medicines.length,
        totalOrders: 0, // Would need to fetch all orders
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
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Admin Dashboard</h1>

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
          <h3 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.9 }}>Total Users</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.totalUsers}</p>
        </div>

        <div style={{
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white"
        }}>
          <h3 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.9 }}>Customers</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.totalCustomers}</p>
        </div>

        <div style={{
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white"
        }}>
          <h3 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.9 }}>Sellers</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.totalSellers}</p>
        </div>

        <div style={{
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          color: "white"
        }}>
          <h3 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.9 }}>Total Medicines</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.totalMedicines}</p>
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
            href="/admin/users"
            style={{
              padding: "2rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              textAlign: "center",
              transition: "all 0.2s",
              background: "var(--background)"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Manage Users</h3>
            <p style={{ opacity: 0.7 }}>View and manage all users (customers & sellers)</p>
          </Link>

          <Link
            href="/admin/categories"
            style={{
              padding: "2rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              textAlign: "center",
              transition: "all 0.2s",
              background: "var(--background)"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Manage Categories</h3>
            <p style={{ opacity: 0.7 }}>Add and manage medicine categories</p>
          </Link>

          <Link
            href="/shop"
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
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>View All Medicines</h3>
            <p style={{ opacity: 0.7 }}>Browse all medicines in the system</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
