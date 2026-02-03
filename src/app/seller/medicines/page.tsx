"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { medicinesApi, categoriesApi } from "@/lib/api-client";
import type { Medicine, Category } from "@/types";

export default function SellerMedicinesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    manufacturer: "",
    unit: "",
    price: "",
    stock: "",
    images: [""],
    description: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

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
      fetchData();
    }
  }, [status, session]);

  async function fetchData() {
    if (!session) return;

    try {
      const [medicinesRes, categoriesRes] = await Promise.all([
        medicinesApi.getAll(),
        categoriesApi.getAll(),
      ]);

      // Filter medicines by seller
      const sellerMedicines = medicinesRes.data.filter((m: Medicine) => m.sellerId === session.user.id);
      setMedicines(sellerMedicines);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    try {
      await medicinesApi.create(
        {
          name: formData.name,
          categoryId: formData.categoryId,
          manufacturer: formData.manufacturer,
          unit: formData.unit,
          price: Number(formData.price),
          stock: Number(formData.stock),
          images: formData.images.filter(img => img.trim() !== ""),
          description: formData.description,
          isActive: formData.isActive,
        },
        session.user.accessToken
      );

      // Reset form and refresh
      setFormData({
        name: "",
        categoryId: "",
        manufacturer: "",
        unit: "",
        price: "",
        stock: "",
        images: [""],
        description: "",
        isActive: true,
      });
      setShowAddForm(false);
      await fetchData();
    } catch (error: any) {
      alert(error.message || "Failed to add medicine");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!session || !confirm("Are you sure you want to delete this medicine?")) return;

    try {
      await medicinesApi.delete(id, session.user.accessToken);
      await fetchData();
    } catch (error: any) {
      alert(error.message || "Failed to delete medicine");
    }
  }

  if (status === "loading" || loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem" }}>My Medicines</h1>
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
          {showAddForm ? "Cancel" : "+ Add Medicine"}
        </button>
      </div>

      {/* Add Medicine Form */}
      {showAddForm && (
        <div style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "2rem",
          marginBottom: "2rem",
          background: "var(--background)"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Add New Medicine</h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500" }}>Medicine Name *</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                />
              </label>

              <label style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500" }}>Category *</span>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                  style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", background: "var(--background)" }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500" }}>Manufacturer *</span>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  required
                  style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                />
              </label>

              <label style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500" }}>Unit *</span>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                  placeholder="e.g., 10 tablets"
                  style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500" }}>Price (৳) *</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                />
              </label>

              <label style={{ display: "grid", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500" }}>Stock *</span>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  min="0"
                  style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                />
              </label>
            </div>

            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Image URL *</span>
              <input
                type="url"
                value={formData.images[0]}
                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                required
                placeholder="https://example.com/image.jpg"
                style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span style={{ fontWeight: "500" }}>Description *</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontFamily: "inherit" }}
              />
            </label>

            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Active (visible to customers)</span>
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
              {submitting ? "Adding..." : "Add Medicine"}
            </button>
          </form>
        </div>
      )}

      {/* Medicines List */}
      {medicines.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.125rem", opacity: 0.7 }}>
            You haven't added any medicines yet. Click "Add Medicine" to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {medicines.map((medicine) => (
            <div
              key={medicine.id}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr auto",
                gap: "1rem",
                padding: "1.5rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "var(--background)"
              }}
            >
              {medicine.images[0] && (
                <div style={{
                  width: "100px",
                  height: "100px",
                  background: "#f3f4f6",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <img
                    src={medicine.images[0]}
                    alt={medicine.name}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>
              )}

              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{medicine.name}</h3>
                <p style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.5rem" }}>
                  {medicine.manufacturer} • {medicine.unit}
                </p>
                <p style={{ fontSize: "1.125rem", fontWeight: "600", color: "#16a34a", marginBottom: "0.5rem" }}>
                  ৳{medicine.price}
                </p>
                <p style={{ fontSize: "0.875rem" }}>
                  Stock: <strong>{medicine.stock}</strong> • 
                  Status: <strong style={{ color: medicine.isActive ? "#16a34a" : "#dc2626" }}>
                    {medicine.isActive ? "Active" : "Inactive"}
                  </strong>
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link
                  href={`/shop/${medicine.id}`}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #667eea",
                    color: "#667eea",
                    borderRadius: "6px",
                    textAlign: "center",
                    fontSize: "0.875rem"
                  }}
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(medicine.id)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.875rem"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
