import React, { useState } from 'react';
import { ArrowUpDown, SlidersHorizontal, Sparkles, Filter, X } from 'lucide-react';
import { Product } from '../../types';
import { CATEGORIES } from '../../data/initialProducts';
import { ProductCard } from './ProductCard';

interface StorefrontViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  products,
  onSelectProduct,
  onQuickAdd,
  searchQuery,
  setSearchQuery
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Search
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.colors?.some(c => c.name.toLowerCase().includes(query)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query)));

    // Category
    const matchesCategory =
      selectedCategory === 'All Products' || p.category === selectedCategory;

    // Size filter
    const matchesSize =
      selectedSizeFilter === 'all' || (p.sizes && p.sizes.includes(selectedSizeFilter));

    // In Stock filter
    const matchesStock = !inStockOnly || p.quantity > 0;

    return matchesSearch && matchesCategory && matchesSize && matchesStock;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // featured
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  // Collect unique sizes across products for filter
  const allAvailableSizes = Array.from(
    new Set(products.flatMap((p) => p.sizes || []))
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80"
            alt="Hero editorial"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:px-12 flex flex-col items-start justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-300 border border-white/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autumn / Winter Capsule 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl leading-tight">
            Elevated Essentials for the Modern Wardrobe.
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Engineered silhouettes, heavyweight organic cottons, and functional outerwear built to withstand the elements with timeless grace.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory('Hoodies & Sweatshirts');
                window.scrollTo({ top: 480, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-white text-slate-950 font-extrabold text-xs rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
            >
              Shop Outerwear
            </button>
            <div className="text-xs text-slate-400 pl-2">
              Free Express shipping on orders over $100
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Category Pills & Sorting Bar */}
        <div className="space-y-4">
          
          {/* Category Pills Slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Filtering and Sort Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 pl-1">
                <Filter className="w-3.5 h-3.5 text-slate-600" />
                <span>Filters:</span>
              </span>

              {/* In-Stock Toggle */}
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  inStockOnly
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                In Stock Only
              </button>

              {/* Size Filter Dropdown */}
              {allAvailableSizes.length > 0 && (
                <select
                  value={selectedSizeFilter}
                  onChange={(e) => setSelectedSizeFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value="all">All Sizes</option>
                  {allAvailableSizes.map((s) => (
                    <option key={s} value={s}>Size: {s}</option>
                  ))}
                </select>
              )}

              {/* Clear filters if active */}
              {(selectedCategory !== 'All Products' || selectedSizeFilter !== 'all' || inStockOnly || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('All Products');
                    setSelectedSizeFilter('all');
                    setInStockOnly(false);
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            {/* Sort & Count */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-600">
                Showing <strong className="text-slate-900">{sortedProducts.length}</strong> items
              </span>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 cursor-pointer focus:outline-none"
                >
                  <option value="featured">Featured Collection</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
              <SlidersHorizontal className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No products match your criteria</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the selected size and category filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Products');
                setSelectedSizeFilter('all');
                setInStockOnly(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
