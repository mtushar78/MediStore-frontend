"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const user = session?.user;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-md border-b-2 border-primary-500">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2 text-primary-800 hover:text-primary-600 transition-colors">
            <span className="text-3xl">💊</span>
            <span>MediStore</span>
          </Link>

          <div className="flex items-center gap-6 flex-wrap">
            <Link
              href="/"
              className={`hover:text-primary-700 transition-colors ${isActive("/") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`hover:text-primary-700 transition-colors ${isActive("/shop") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
            >
              Shop
            </Link>

            {status === "loading" ? (
              <span className="text-gray-400">Loading...</span>
            ) : user ? (
              <>
                {user.role === "customer" && (
                  <>
                    <Link
                      href="/cart"
                      className={`hover:text-primary-700 transition-colors ${isActive("/cart") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                    >
                      Cart
                    </Link>
                    <Link
                      href="/orders"
                      className={`hover:text-primary-700 transition-colors ${isActive("/orders") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                    >
                      My Orders
                    </Link>
                  </>
                )}

                {user.role === "seller" && (
                  <>
                    <Link
                      href="/seller/dashboard"
                      className={`hover:text-primary-700 transition-colors ${isActive("/seller/dashboard") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/seller/medicines"
                      className={`hover:text-primary-700 transition-colors ${isActive("/seller/medicines") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                    >
                      My Medicines
                    </Link>
                    <Link
                      href="/seller/orders"
                      className={`hover:text-primary-700 transition-colors ${isActive("/seller/orders") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                    >
                      Orders
                    </Link>
                  </>
                )}

                {user.role === "admin" && (
                  <>
                    <Link
                      href="/admin"
                      className={`hover:text-primary-700 transition-colors ${isActive("/admin") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/users"
                      className={`hover:text-primary-700 transition-colors ${isActive("/admin/users") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                    >
                      Users
                    </Link>
                    <Link
                      href="/admin/categories"
                      className={`hover:text-primary-700 transition-colors ${isActive("/admin/categories") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                    >
                      Categories
                    </Link>
                  </>
                )}

                <Link
                  href="/profile"
                  className={`hover:text-primary-700 transition-colors ${isActive("/profile") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                >
                  Profile ({user.name})
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`hover:text-primary-700 transition-colors ${isActive("/login") ? "text-primary-700 font-semibold" : "text-gray-700"}`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-500 text-gray-800 rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
