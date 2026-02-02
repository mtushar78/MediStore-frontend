"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { medicinesApi, categoriesApi } from "@/lib/api-client";
import type { Medicine, Category } from "@/types";

export default function Home() {
  const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [medicinesRes, categoriesRes] = await Promise.all([
          medicinesApi.getAll({ limit: 8, sortBy: "ratingAvg", sortOrder: "desc" }),
          categoriesApi.getAll(),
        ]);
        setFeaturedMedicines(medicinesRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-600 text-white p-16 rounded-xl text-center mb-12 shadow-lg">
        <h1 className="text-5xl font-bold mb-4">
          💊 Welcome to MediStore
        </h1>
        <p className="text-xl mb-8 opacity-90">
          Your Trusted Online Medicine Shop - OTC Medicines Delivered to Your Door
        </p>
        <Link
          href="/shop"
          className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-md"
        >
          Browse Medicines
        </Link>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?categoryId=${category.id}`}
                className="card p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 hover:border-primary-500"
              >
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Medicines Section */}
      {featuredMedicines.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6">Featured Medicines</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredMedicines.map((medicine) => (
              <Link
                key={medicine.id}
                href={`/shop/${medicine.id}`}
                className="card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                {medicine.images[0] && (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <img
                      src={medicine.images[0]}
                      alt={medicine.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{medicine.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {medicine.manufacturer}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold text-success-600">
                      ৳{medicine.price}
                    </span>
                    {medicine.ratingAvg > 0 && (
                      <span className="text-sm flex items-center gap-1">
                        <span className="text-warning-500">⭐</span>
                        {medicine.ratingAvg.toFixed(1)} ({medicine.ratingCount})
                      </span>
                    )}
                  </div>
                  {medicine.stock > 0 ? (
                    <p className="text-sm text-success-600 font-medium">
                      In Stock ({medicine.stock} available)
                    </p>
                  ) : (
                    <p className="text-sm text-danger-600 font-medium">
                      Out of Stock
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/shop"
              className="btn-primary inline-block px-6 py-3 text-lg"
            >
              View All Medicines
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
