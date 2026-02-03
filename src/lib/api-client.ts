import { medistoreFetch } from "@/server/medistore-api";
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Category,
  Medicine,
  Cart,
  Order,
  Review,
  RegisterFormData,
  CreateMedicineFormData,
  CreateOrderFormData,
  CreateReviewFormData,
} from "@/types";

// Auth API
export const authApi = {
  register: (data: RegisterFormData) =>
    medistoreFetch<ApiResponse<{ accessToken: string; user: User }>>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    medistoreFetch<ApiResponse<{ accessToken: string; user: User }>>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () => medistoreFetch<ApiResponse<Category[]>>("/api/v1/categories"),

  create: (data: { name: string; description?: string }, token: string) =>
    medistoreFetch<ApiResponse<Category>>("/api/v1/categories", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
};

// Medicines API
export const medicinesApi = {
  getAll: (params?: {
    q?: string;
    categoryId?: string;
    manufacturer?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
    sortBy?: "price" | "ratingAvg" | "createdAt";
    sortOrder?: "asc" | "desc";
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return medistoreFetch<PaginatedResponse<Medicine>>(
      `/api/v1/medicines${query ? `?${query}` : ""}`
    );
  },

  getById: (id: string) => medistoreFetch<ApiResponse<Medicine>>(`/api/v1/medicines/${id}`),

  create: (data: CreateMedicineFormData, token: string) =>
    medistoreFetch<ApiResponse<Medicine>>("/api/v1/medicines", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: Partial<CreateMedicineFormData>, token: string) =>
    medistoreFetch<ApiResponse<Medicine>>(`/api/v1/medicines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    medistoreFetch<ApiResponse<void>>(`/api/v1/medicines/${id}`, {
      method: "DELETE",
      token,
    }),
};

// Cart API
export const cartApi = {
  get: (token: string) => medistoreFetch<ApiResponse<Cart>>("/api/v1/cart", { token }),

  addItem: (medicineId: string, quantity: number, token: string) =>
    medistoreFetch<ApiResponse<Cart>>("/api/v1/cart/items", {
      method: "POST",
      body: JSON.stringify({ medicineId, quantity }),
      token,
    }),

  updateItem: (medicineId: string, quantity: number, token: string) =>
    medistoreFetch<ApiResponse<Cart>>(`/api/v1/cart/items/${medicineId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
      token,
    }),

  removeItem: (medicineId: string, token: string) =>
    medistoreFetch<ApiResponse<Cart>>(`/api/v1/cart/items/${medicineId}`, {
      method: "DELETE",
      token,
    }),

  clear: (token: string) =>
    medistoreFetch<ApiResponse<void>>("/api/v1/cart", {
      method: "DELETE",
      token,
    }),
};

// Orders API
export const ordersApi = {
  create: (data: CreateOrderFormData, token: string) =>
    medistoreFetch<ApiResponse<Order>>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  getAll: (token: string) => medistoreFetch<ApiResponse<Order[]>>("/api/v1/orders", { token }),

  getById: (id: string, token: string) =>
    medistoreFetch<ApiResponse<Order>>(`/api/v1/orders/${id}`, { token }),

  cancel: (id: string, token: string) =>
    medistoreFetch<ApiResponse<Order>>(`/api/v1/orders/${id}/cancel`, {
      method: "PATCH",
      token,
    }),

  // Seller endpoints
  getSellerOrders: (token: string) =>
    medistoreFetch<ApiResponse<any[]>>("/api/v1/orders/seller", { token }),

  updateOrderStatus: (id: string, status: string, token: string) =>
    medistoreFetch<ApiResponse<Order>>(`/api/v1/orders/seller/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),
};

// Reviews API
export const reviewsApi = {
  getByMedicine: (medicineId: string) =>
    medistoreFetch<ApiResponse<Review[]>>(`/api/v1/reviews/medicines/${medicineId}/reviews`),

  create: (data: CreateReviewFormData, token: string) =>
    medistoreFetch<ApiResponse<Review>>("/api/v1/reviews", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  getMyReviews: (token: string) =>
    medistoreFetch<ApiResponse<Review[]>>("/api/v1/reviews/me", { token }),
};

// Admin API
export const adminApi = {
  getUsers: (token: string) => medistoreFetch<ApiResponse<User[]>>("/api/v1/admin/users", { token }),

  getUserById: (id: string, token: string) =>
    medistoreFetch<ApiResponse<User>>(`/api/v1/admin/users/${id}`, { token }),

  updateUserStatus: (id: string, status: "active" | "banned", token: string) =>
    medistoreFetch<ApiResponse<User>>(`/api/v1/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),

  deleteReview: (id: string, token: string) =>
    medistoreFetch<ApiResponse<void>>(`/api/v1/admin/reviews/${id}`, {
      method: "DELETE",
      token,
    }),
};
