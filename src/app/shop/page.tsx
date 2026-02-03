"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { medicinesApi, categoriesApi } from "@/lib/api-client";
import type { Medicine, Category } from "@/types";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Filter states
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [manufacturer, setManufacturer] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "ratingAvg" | "createdAt" | "name" | "manufacturer" | "stock">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [search, categoryId, manufacturer, minPrice, maxPrice, inStock, sortBy, sortOrder, page]);

  async function fetchCategories() {
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  async function fetchMedicines() {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 20,
        sortBy,
        sortOrder,
      };
      if (search) params.q = search;
      if (categoryId) params.categoryId = categoryId;
      if (manufacturer) params.manufacturer = manufacturer;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);
      if (inStock) params.inStock = true;

      const res = await medicinesApi.getAll(params);
      setMedicines(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(column: "name" | "price" | "manufacturer" | "stock" | "ratingAvg") {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Shop Medicines</h1>

      {/* Filters Bar */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Medicine name..."
              className="input"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Manufacturer */}
          <div>
            <label className="block text-sm font-medium mb-2">Manufacturer</label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => { setManufacturer(e.target.value); setPage(1); }}
              placeholder="e.g., ACME Pharma"
              className="input"
            />
          </div>

          {/* In Stock */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => { setInStock(e.target.checked); setPage(1); }}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              placeholder="0"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              placeholder="10000"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-12">Loading medicines...</div>
      ) : medicines.length === 0 ? (
        <div className="text-center py-12">No medicines found. Try adjusting your filters.</div>
      ) : (
        <>
          <div className="card overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-100">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-primary-200 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Name
                        {sortBy === "name" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-primary-200 transition-colors"
                      onClick={() => handleSort("manufacturer")}
                    >
                      <div className="flex items-center gap-2">
                        Manufacturer
                        {sortBy === "manufacturer" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th 
                      className="px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-primary-200 transition-colors"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Price
                        {sortBy === "price" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center text-sm font-semibold cursor-pointer hover:bg-primary-200 transition-colors"
                      onClick={() => handleSort("stock")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Stock
                        {sortBy === "stock" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center text-sm font-semibold cursor-pointer hover:bg-primary-200 transition-colors"
                      onClick={() => handleSort("ratingAvg")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Rating
                        {sortBy === "ratingAvg" && (
                          <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {medicines.map((medicine) => (
                    <tr key={medicine.id} className="hover:bg-primary-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{medicine.name}</div>
                        <div className="text-sm text-gray-500">{medicine.unit}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{medicine.manufacturer}</td>
                      <td className="px-4 py-3 text-sm">{medicine.category?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary-700">
                        ৳{medicine.price}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {medicine.stock > 0 ? (
                          <span className="badge-success">{medicine.stock}</span>
                        ) : (
                          <span className="badge-danger">Out</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {medicine.ratingAvg > 0 ? (
                          <span className="flex items-center justify-center gap-1">
                            <span className="text-warning-500">⭐</span>
                            {medicine.ratingAvg.toFixed(1)}
                            <span className="text-xs text-gray-500">({medicine.ratingCount})</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">No ratings</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/shop/${medicine.id}`}
                          className="text-primary-700 hover:text-primary-800 font-medium text-sm underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex gap-2 justify-center items-center">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {meta.totalPages} ({meta.total} total)
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === meta.totalPages}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
