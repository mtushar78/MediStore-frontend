// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// User Types
export type UserRole = "customer" | "seller" | "admin";
export type UserStatus = "active" | "banned";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: any;
  createdAt: string;
  updatedAt: string;
};

// Category Types
export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Medicine Types
export type Medicine = {
  id: string;
  name: string;
  slug?: string;
  categoryId: string;
  category?: Category;
  sellerId: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  manufacturer: string;
  unit: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
};

// Cart Types
export type CartItem = {
  id: string;
  cartId: string;
  medicineId: string;
  medicine: Medicine;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type Cart = {
  id: string;
  customerId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
};

// Order Types
export type PaymentMethod = "COD";
export type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type ShippingAddress = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  area: string;
  postalCode?: string;
  notes?: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  medicineId: string;
  medicine?: Medicine;
  sellerId: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  customerId: string;
  customer?: User;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

// Review Types
export type Review = {
  id: string;
  medicineId: string;
  medicine?: Medicine;
  orderId: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

// Form Types
export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
};

export type CreateMedicineFormData = {
  name: string;
  categoryId: string;
  manufacturer: string;
  unit: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  isActive: boolean;
};

export type CreateOrderFormData = {
  items: {
    medicineId: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
};

export type CreateReviewFormData = {
  medicineId: string;
  orderId?: string;
  rating: number;
  comment?: string;
};
