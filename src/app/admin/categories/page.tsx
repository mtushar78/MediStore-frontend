"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { categoriesApi } from "@/lib/api-client";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

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
      fetchCategories();
    }
  }, [status, session]);

  async function fetchCategories() {
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    try {
      await categoriesApi.create(formData, session.user.accessToken);
      setFormData({ name: "", description: "" });
      setShowAddForm(false);
      await fetchCategories();
    } catch (error: any) {
      alert(error.message || "Failed to add category");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Manage Categories</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          {showAddForm ? "Cancel" : "+ Add Category"}
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "2rem",
          marginBottom: "2rem",
          background: "var(--background)"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Add New Category</h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Category Name *</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Pain Relief"
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem"
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Description</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
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

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.75rem",
                background: submitting ? "#9ca3af" : "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: submitting ? "not-allowed" : "pointer"
              }}
            >
              {submitting ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.125rem", opacity: 0.7 }}>
            No categories yet. Click "Add Category" to create one.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem"
        }}>
          {categories.map((category) => (
            <div
              key={category.id}
              style={{
                padding: "1.5rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "var(--background)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>{category.name}</h3>
                <span style={{
                  padding: "0.25rem 0.75rem",
                  background: category.isActive ? "#d1fae5" : "#fee2e2",
                  color: category.isActive ? "#065f46" : "#dc2626",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "500"
                }}>
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              
              {category.description && (
                <p style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.5rem" }}>
                  {category.description}
                </p>
              )}
              
              <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "1rem" }}>
                Slug: {category.slug}
              </p>
              <p style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                Created: {new Date(category.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
