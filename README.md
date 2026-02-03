# MediStore Frontend

A comprehensive Next.js 16 frontend application for the MediStore e-commerce platform - an online medicine shop with role-based access for customers, sellers, and administrators.

## 🚀 Features

### Public Features
- **Home Page**: Hero section, featured medicines, and category browsing
- **Shop**: Browse all medicines with advanced filters (search, category, price range, manufacturer, stock status)
- **Medicine Details**: View detailed information, reviews, and add to cart
- **Authentication**: Login and registration with role selection

### Customer Features
- **Shopping Cart**: Add, update, and remove items
- **Checkout**: Place orders with shipping address (Cash on Delivery)
- **Order Management**: View order history and track status
- **Order Cancellation**: Cancel orders in PLACED status
- **Profile**: View account information

### Seller Features
- **Dashboard**: View statistics (total medicines, orders, revenue)
- **Medicine Management**: Add, view, and delete medicines
- **Order Management**: View orders and update status (PLACED → PROCESSING → SHIPPED → DELIVERED)

### Admin Features
- **Dashboard**: Platform statistics (users, medicines, orders)
- **User Management**: View all users, ban/unban accounts
- **Category Management**: Create and manage medicine categories

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js v4
- **Styling**: Inline CSS (for simplicity)
- **State Management**: React Hooks
- **API Client**: Custom fetch wrapper

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

## 🔧 Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-min-32-characters-long
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (protected)/          # Protected routes
│   │   ├── admin/                # Admin pages
│   │   │   ├── users/
│   │   │   └── categories/
│   │   ├── seller/               # Seller pages
│   │   │   ├── dashboard/
│   │   │   ├── medicines/
│   │   │   └── orders/
│   │   ├── shop/                 # Public shop pages
│   │   │   └── [id]/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   │   └── [id]/
│   │   ├── profile/
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx              # Home page
│   ├── auth/                     # NextAuth configuration
│   ├── components/               # Reusable components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── lib/                      # API client functions
│   │   └── api-client.ts
│   ├── server/                   # Server utilities
│   │   └── medistore-api.ts
│   ├── types/                    # TypeScript types
│   │   ├── index.ts
│   │   └── next-auth.d.ts
│   └── env.ts                    # Environment validation
└── package.json
```

## 🔐 Authentication & Authorization

The application uses NextAuth.js with JWT strategy:

- **Session Management**: JWT-based sessions
- **Role-Based Access**: Customer, Seller, Admin roles
- **Protected Routes**: Automatic redirection for unauthorized access
- **Token Storage**: Access token stored in session for API calls

## 🎨 Pages Overview

### Public Routes
- `/` - Home page with featured medicines
- `/shop` - Browse all medicines with filters
- `/shop/[id]` - Medicine details page
- `/login` - Login page
- `/register` - Registration page

### Customer Routes (Protected)
- `/cart` - Shopping cart
- `/checkout` - Checkout with shipping form
- `/orders` - Order history
- `/orders/[id]` - Order details
- `/profile` - User profile

### Seller Routes (Protected)
- `/seller/dashboard` - Seller dashboard with stats
- `/seller/medicines` - Manage medicine inventory
- `/seller/orders` - View and update order status

### Admin Routes (Protected)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/categories` - Category management

## 🔌 API Integration

All API calls are centralized in `src/lib/api-client.ts`:

- **Auth API**: Login, register
- **Medicines API**: CRUD operations, search, filters
- **Cart API**: Add, update, remove items
- **Orders API**: Create, view, cancel orders
- **Admin API**: User management, categories
- **Reviews API**: View and create reviews

## 🚦 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 🧪 Testing the Application

1. **Start Backend**: Ensure backend is running on port 5000
2. **Seed Data**: Run backend seed scripts for admin and catalog
3. **Register Users**: Create customer and seller accounts
4. **Test Flows**:
   - Customer: Browse → Add to Cart → Checkout → Track Order
   - Seller: Add Medicine → View Orders → Update Status
   - Admin: Manage Users → Create Categories

## 🔑 Default Test Accounts

After running backend seed scripts:

**Admin**:
- Email: `admin@medistore.com`
- Password: `admin123`

**Customer** (create via registration):
- Role: Customer
- Can browse and purchase medicines

**Seller** (create via registration):
- Role: Seller
- Can add and manage medicines

## 📝 Key Features Implementation

### Role-Based Navigation
The Navbar component dynamically shows links based on user role:
- Customers see: Cart, My Orders
- Sellers see: Dashboard, My Medicines, Orders
- Admins see: Dashboard, Users, Categories

### Protected Routes
Pages check authentication status and role:
```typescript
useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/login");
  }
  if (session.user.role !== "expectedRole") {
    router.push("/");
  }
}, [status, session]);
```

### Shopping Flow
1. Browse medicines (public)
2. Add to cart (requires login)
3. View cart and update quantities
4. Proceed to checkout
5. Enter shipping address
6. Place order (COD)
7. Track order status

## 🎯 Future Enhancements

- Profile editing functionality
- Medicine image upload
- Advanced search with autocomplete
- Order reviews and ratings
- Email notifications
- Payment gateway integration
- Wishlist functionality
- Medicine comparison
- Seller analytics dashboard

## 🐛 Troubleshooting

**Issue**: "Failed to fetch"
- **Solution**: Ensure backend is running and NEXT_PUBLIC_BACKEND_URL is correct

**Issue**: "Unauthorized"
- **Solution**: Check if user is logged in and has correct role

**Issue**: "Session not found"
- **Solution**: Clear cookies and login again

## 📄 License

This project is part of the MediStore e-commerce platform.

## 👥 Support

For issues or questions, please refer to the main project documentation.
