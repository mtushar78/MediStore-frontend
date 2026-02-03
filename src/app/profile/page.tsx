"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status]);

  if (status === "loading") {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const user = session.user;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>My Profile</h1>

      <div style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "2rem",
        background: "var(--background)"
      }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.5rem" }}>
            Name
          </label>
          <p style={{ fontSize: "1.125rem", fontWeight: "500" }}>{user.name}</p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.5rem" }}>
            Email
          </label>
          <p style={{ fontSize: "1.125rem", fontWeight: "500" }}>{user.email}</p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.5rem" }}>
            Role
          </label>
          <span style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            background: user.role === "admin" ? "#fee2e2" : user.role === "seller" ? "#dbeafe" : "#d1fae5",
            color: user.role === "admin" ? "#dc2626" : user.role === "seller" ? "#1e40af" : "#065f46",
            borderRadius: "6px",
            fontWeight: "600",
            textTransform: "capitalize"
          }}>
            {user.role}
          </span>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.5rem" }}>
            User ID
          </label>
          <p style={{ fontSize: "0.875rem", fontFamily: "monospace", opacity: 0.8 }}>{user.id}</p>
        </div>

        <hr style={{ margin: "2rem 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

        <div style={{
          padding: "1rem",
          background: "#fef3c7",
          borderRadius: "6px",
          fontSize: "0.875rem"
        }}>
          <strong>Note:</strong> Profile editing is not yet implemented. Contact support to update your information.
        </div>
      </div>
    </div>
  );
}
