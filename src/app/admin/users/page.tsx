"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api-client";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "customer" | "seller">("all");

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
      fetchUsers();
    }
  }, [status, session]);

  async function fetchUsers() {
    if (!session) return;

    try {
      const res = await adminApi.getUsers(session.user.accessToken);
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserStatus(userId: string, currentStatus: string) {
    if (!session) return;

    const newStatus = currentStatus === "active" ? "banned" : "active";
    if (!confirm(`Are you sure you want to ${newStatus === "banned" ? "ban" : "activate"} this user?`)) return;

    setUpdating(userId);
    try {
      await adminApi.updateUserStatus(userId, newStatus, session.user.accessToken);
      await fetchUsers();
    } catch (error: any) {
      alert(error.message || "Failed to update user status");
    } finally {
      setUpdating(null);
    }
  }

  if (status === "loading" || loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  const filteredUsers = users.filter(user => {
    if (filter === "all") return user.role !== "admin";
    return user.role === filter;
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Manage Users</h1>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "0.75rem 1.5rem",
            background: filter === "all" ? "#667eea" : "transparent",
            color: filter === "all" ? "white" : "inherit",
            border: "1px solid #667eea",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          All Users ({users.filter(u => u.role !== "admin").length})
        </button>
        <button
          onClick={() => setFilter("customer")}
          style={{
            padding: "0.75rem 1.5rem",
            background: filter === "customer" ? "#667eea" : "transparent",
            color: filter === "customer" ? "white" : "inherit",
            border: "1px solid #667eea",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Customers ({users.filter(u => u.role === "customer").length})
        </button>
        <button
          onClick={() => setFilter("seller")}
          style={{
            padding: "0.75rem 1.5rem",
            background: filter === "seller" ? "#667eea" : "transparent",
            color: filter === "seller" ? "white" : "inherit",
            border: "1px solid #667eea",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Sellers ({users.filter(u => u.role === "seller").length})
        </button>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.125rem", opacity: 0.7 }}>No users found.</p>
        </div>
      ) : (
        <div style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
          background: "var(--background)"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Name</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Email</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Role</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Joined</th>
                <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem" }}>{user.name}</td>
                  <td style={{ padding: "1rem" }}>{user.email}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      background: user.role === "seller" ? "#dbeafe" : "#d1fae5",
                      color: user.role === "seller" ? "#1e40af" : "#065f46",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      textTransform: "capitalize"
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      background: user.status === "active" ? "#d1fae5" : "#fee2e2",
                      color: user.status === "active" ? "#065f46" : "#dc2626",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      textTransform: "capitalize"
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", opacity: 0.7 }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      disabled={updating === user.id}
                      style={{
                        padding: "0.5rem 1rem",
                        background: user.status === "active" ? "#fee2e2" : "#d1fae5",
                        color: user.status === "active" ? "#dc2626" : "#065f46",
                        border: "none",
                        borderRadius: "6px",
                        cursor: updating === user.id ? "not-allowed" : "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "500"
                      }}
                    >
                      {updating === user.id ? "Updating..." : user.status === "active" ? "Ban User" : "Activate User"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
