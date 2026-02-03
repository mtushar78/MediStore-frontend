"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api-client";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer" as UserRole,
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      await authApi.register(formData);
      // After successful registration, redirect to login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setPending(false);
    }
  }

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Create Account</h1>
      <p style={{ marginBottom: "2rem", opacity: 0.7 }}>
        Join MediStore to start shopping for medicines
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span style={{ fontWeight: "500" }}>Full Name *</span>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            type="text"
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
          <span style={{ fontWeight: "500" }}>Email *</span>
          <input
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            type="email"
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
          <span style={{ fontWeight: "500" }}>Password *</span>
          <input
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            type="password"
            required
            minLength={6}
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "1rem"
            }}
          />
          <span style={{ fontSize: "0.875rem", opacity: 0.7 }}>
            Minimum 6 characters
          </span>
        </label>

        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span style={{ fontWeight: "500" }}>Phone (Optional)</span>
          <input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            type="tel"
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "1rem"
            }}
          />
        </label>

        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span style={{ fontWeight: "500" }}>Register as *</span>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            required
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "1rem",
              background: "var(--background)"
            }}
          >
            <option value="customer">Customer (Buy medicines)</option>
            <option value="seller">Seller (Sell medicines)</option>
          </select>
        </label>

        {error && (
          <div style={{
            padding: "0.75rem",
            background: "#fee2e2",
            color: "#dc2626",
            borderRadius: "6px",
            fontSize: "0.875rem"
          }}>
            {error}
          </div>
        )}

        <button
          disabled={pending}
          type="submit"
          style={{
            padding: "0.75rem",
            background: pending ? "#9ca3af" : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: pending ? "not-allowed" : "pointer"
          }}
        >
          {pending ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#667eea", fontWeight: "500" }}>
          Login here
        </Link>
      </p>
    </div>
  );
}
