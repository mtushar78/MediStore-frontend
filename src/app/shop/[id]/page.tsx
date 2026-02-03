"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { medicinesApi, reviewsApi, cartApi } from "@/lib/api-client";
import type { Medicine, Review } from "@/types";

export default function MedicineDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchMedicine();
    fetchReviews();
  }, [id]);

  async function fetchMedicine() {
    try {
      const res = await medicinesApi.getById(id);
      setMedicine(res.data);
    } catch (error) {
      console.error("Failed to fetch medicine:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReviews() {
    try {
      const res = await reviewsApi.getByMedicine(id);
      setReviews(res.data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  }

  async function handleAddToCart() {
    if (!session) {
      router.push(`/login?callbackUrl=/shop/${id}`);
      return;
    }

    if (session.user.role !== "customer") {
      setMessage({ type: "error", text: "Only customers can add items to cart" });
      return;
    }

    setAddingToCart(true);
    setMessage(null);

    try {
      await cartApi.addItem(id, quantity, session.user.accessToken);
      setMessage({ type: "success", text: "Added to cart successfully!" });
      setQuantity(1);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to add to cart" });
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!medicine) {
    return <div style={{ padding: "2rem" }}>Medicine not found</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Link href="/shop" style={{ color: "#667eea", marginBottom: "1rem", display: "inline-block" }}>
        ← Back to Shop
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>
        {/* Image Section */}
        <div>
          {medicine.images[0] && (
            <div style={{
              width: "100%",
              height: "400px",
              background: "#f3f4f6",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem"
            }}>
              <img
                src={medicine.images[0]}
                alt={medicine.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
          )}
          {medicine.images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {medicine.images.slice(1).map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#f3f4f6",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <img src={img} alt={`${medicine.name} ${idx + 2}`} style={{ maxWidth: "100%", maxHeight: "100%" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{medicine.name}</h1>
          
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
            {medicine.ratingAvg > 0 && (
              <span style={{ fontSize: "1.125rem" }}>
                ⭐ {medicine.ratingAvg.toFixed(1)} ({medicine.ratingCount} reviews)
              </span>
            )}
            {medicine.category && (
              <span style={{
                padding: "0.25rem 0.75rem",
                background: "#e0e7ff",
                color: "#4338ca",
                borderRadius: "4px",
                fontSize: "0.875rem"
              }}>
                {medicine.category.name}
              </span>
            )}
          </div>

          <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem", opacity: 0.7 }}>
            Manufacturer: <strong>{medicine.manufacturer}</strong>
          </p>
          <p style={{ fontSize: "1.125rem", marginBottom: "1.5rem", opacity: 0.7 }}>
            Unit: <strong>{medicine.unit}</strong>
          </p>

          <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#16a34a", marginBottom: "1rem" }}>
            ৳{medicine.price}
          </div>

          {medicine.stock > 0 ? (
            <p style={{ fontSize: "1.125rem", color: "#16a34a", marginBottom: "1.5rem" }}>
              ✓ In Stock ({medicine.stock} available)
            </p>
          ) : (
            <p style={{ fontSize: "1.125rem", color: "#dc2626", marginBottom: "1.5rem" }}>
              ✗ Out of Stock
            </p>
          )}

          {medicine.stock > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                Quantity:
              </label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    background: "var(--background)",
                    cursor: "pointer"
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(medicine.stock, Number(e.target.value))))}
                  min="1"
                  max={medicine.stock}
                  style={{
                    width: "80px",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    textAlign: "center"
                  }}
                />
                <button
                  onClick={() => setQuantity(Math.min(medicine.stock, quantity + 1))}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    background: "var(--background)",
                    cursor: "pointer"
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {message && (
            <div style={{
              padding: "0.75rem",
              background: message.type === "success" ? "#d1fae5" : "#fee2e2",
              color: message.type === "success" ? "#065f46" : "#dc2626",
              borderRadius: "6px",
              marginBottom: "1rem"
            }}>
              {message.text}
            </div>
          )}

          {medicine.stock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              style={{
                width: "100%",
                padding: "1rem",
                background: addingToCart ? "#9ca3af" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.125rem",
                fontWeight: "600",
                cursor: addingToCart ? "not-allowed" : "pointer",
                marginBottom: "1rem"
              }}
            >
              {addingToCart ? "Adding..." : "🛒 Add to Cart"}
            </button>
          )}

          {session?.user.role === "customer" && medicine.stock > 0 && (
            <Link
              href="/cart"
              style={{
                display: "block",
                textAlign: "center",
                padding: "1rem",
                border: "2px solid #667eea",
                color: "#667eea",
                borderRadius: "8px",
                fontSize: "1.125rem",
                fontWeight: "600"
              }}
            >
              View Cart
            </Link>
          )}
        </div>
      </div>

      {/* Description Section - Full Width */}
      <div style={{ marginBottom: "3rem", padding: "2rem", background: "#f9fafb", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Description</h2>
        <p style={{ lineHeight: "1.8", fontSize: "1.125rem" }}>{medicine.description}</p>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Customer Reviews</h2>
        
        {/* Add Review Form - Only for logged in customers */}
        {session?.user.role === "customer" && (
          <div style={{
            padding: "2rem",
            background: "#f9fafb",
            borderRadius: "8px",
            marginBottom: "2rem"
          }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Write a Review</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const rating = Number(formData.get("rating"));
              const comment = formData.get("comment") as string;
              const orderId = formData.get("orderId") as string;

              try {
                await reviewsApi.create({
                  medicineId: id,
                  orderId: orderId || undefined,
                  rating,
                  comment: comment || undefined,
                }, session.user.accessToken);
                
                setMessage({ type: "success", text: "Review submitted successfully!" });
                fetchReviews();
                e.currentTarget.reset();
              } catch (error: any) {
                setMessage({ type: "error", text: error.message || "Failed to submit review" });
              }
            }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Order ID (optional):
                </label>
                <input
                  type="text"
                  name="orderId"
                  placeholder="Enter your order ID (optional)"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px"
                  }}
                />
                <p style={{ fontSize: "0.875rem", opacity: 0.7, marginTop: "0.25rem" }}>
                  Optional: You can find your order ID in "My Orders" page
                </p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Rating:
                </label>
                <select
                  name="rating"
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px"
                  }}
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                  <option value="3">⭐⭐⭐ (3 stars)</option>
                  <option value="2">⭐⭐ (2 stars)</option>
                  <option value="1">⭐ (1 star)</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Comment (optional):
                </label>
                <textarea
                  name="comment"
                  rows={4}
                  placeholder="Share your experience with this medicine..."
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    resize: "vertical"
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Submit Review
              </button>
            </form>
          </div>
        )}

        {reviews.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No reviews yet. Be the first to review this medicine!</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: "1.5rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "var(--background)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong>{review.customer?.name || "Anonymous"}</strong>
                  <span>{"⭐".repeat(review.rating)}</span>
                </div>
                {review.comment && <p style={{ opacity: 0.8 }}>{review.comment}</p>}
                <p style={{ fontSize: "0.875rem", opacity: 0.6, marginTop: "0.5rem" }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
