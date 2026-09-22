import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Database, Package, DollarSign, Layers, AlertCircle, CheckCircle2, Images, ExternalLink, ChevronDown, Check } from 'lucide-react';
import { Product, Order, DatabaseStatus } from '../../types';
import { CATEGORIES } from '../../data/initialProducts';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => Promise<void>;
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onOpenDbSettings: () => void;
  onSelectProductPreview: (product: Product) => void;
  dbStatus: DatabaseStatus | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onUpdateStock,
  onUpdateOrderStatus,
  onOpenDbSettings,
  onSelectProductPreview,
  dbStatus
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inventory'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'low-stock'>('all');

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;
  const outOfStockCount = products.filter(p => p.quantity <= 0).length;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'published') matchesStatus = p.status === 'published';
    if (statusFilter === 'draft') matchesStatus = p.status === 'draft';
    if (statusFilter === 'low-stock') matchesStatus = p.quantity <= 5;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Admin Management Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Store & Product Operations
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage your catalog, multi-photo galleries, inventory variants, and customer orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenDbSettings}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200"
          >
            <Database className="w-4 h-4 text-slate-700" />
            <span>{dbStatus?.connected ? 'MongoDB Active' : 'DB / Mongo Settings'}</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-600">Total Sales Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">
              ${totalRevenue.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              From {orders.length} placed order{orders.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-600">Active Products</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{products.length}</span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              In {CATEGORIES.length - 1} categories
            </span>
          </div>
        </div>

        {/* Total Units in Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-600">Total Inventory Stock</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{totalStockUnits}</span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              Items available across catalog
            </span>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-600">Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600">
              {lowStockCount + outOfStockCount}
            </span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              {lowStockCount} low stock • {outOfStockCount} out of stock
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Product Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Orders Management ({orders.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, slug, SKU..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-800 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.filter(c => c !== 'All Products').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Status pills */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                {(['all', 'published', 'draft', 'low-stock'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {st === 'low-stock' ? 'Low Stock' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Product & Gallery</th>
                    <th className="py-3.5 px-4">Slug & Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock (Qty)</th>
                    <th className="py-3.5 px-4">Variants</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-600">
                        No products match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLowStock = p.quantity > 0 && p.quantity <= 5;
                      const isOutOfStock = p.quantity <= 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* Image & Name & Multi-photo counter */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => onSelectProductPreview(p)}
                                className="relative w-12 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer group"
                                title="Click to preview gallery"
                              >
                                <img
                                  src={p.mainImage}
                                  alt={p.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  referrerPolicy="no-referrer"
                                />
                                {p.gallery && p.gallery.length > 1 && (
                                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-white text-[9px] font-bold py-0.5 text-center flex items-center justify-center gap-0.5">
                                    <Images className="w-2.5 h-2.5" />
                                    <span>{p.gallery.length}</span>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4
                                  onClick={() => onSelectProductPreview(p)}
                                  className="font-bold text-slate-900 hover:text-slate-700 cursor-pointer line-clamp-1"
                                >
                                  {p.name}
                                </h4>
                                {p.sku && (
                                  <span className="text-[10px] font-mono text-slate-600">
                                    SKU: {p.sku}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Slug & Category */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 font-medium">{p.category}</div>
                            <div className="text-[11px] font-mono text-slate-600 truncate max-w-[130px]">
                              /{p.slug}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            ${p.price.toFixed(2)}
                            {p.compareAtPrice && (
                              <span className="text-[10px] text-slate-600 block line-through font-normal">
                                ${p.compareAtPrice.toFixed(2)}
                              </span>
                            )}
                          </td>

                          {/* Stock Quantity with Quick Stepper */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => onUpdateStock(p.id, Math.max(0, p.quantity - 1))}
                                  className="px-2 py-0.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer font-bold"
                                  title="Decrease stock"
                                >
                                  -
                                </button>
                                <span className={`px-2 text-xs font-bold ${
                                  isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-800'
                                }`}>
                                  {p.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateStock(p.id, p.quantity + 1)}
                                  className="px-2 py-0.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer font-bold"
                                  title="Increase stock"
                                >
                                  +
                                </button>
                              </div>
                              {isOutOfStock && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                  Empty
                                </span>
                              )}
                              {isLowStock && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                  Low
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Variants: Colors & Sizes */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              {/* Color dots */}
                              <div className="flex items-center gap-1">
                                {p.colors?.slice(0, 4).map((c, i) => (
                                  <span
                                    key={i}
                                    title={c.name}
                                    className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ))}
                                {(p.colors?.length || 0) > 4 && (
                                  <span className="text-[10px] text-slate-600 font-medium">
                                    +{(p.colors?.length || 0) - 4}
                                  </span>
                                )}
                              </div>
                              {/* Sizes preview */}
                              <div className="text-[10px] text-slate-600 truncate max-w-[120px]">
                                {p.sizes?.join(', ') || 'Standard'}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              p.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {p.status === 'published' ? 'Active' : 'Draft'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => onSelectProductPreview(p)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="View Customer Details Modal"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenEditProduct(p)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete product "${p.name}"?`)) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order # & Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items Purchased</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-600">
                        No customer orders received yet. Switch to Storefront to place a test order!
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Order Number & Date */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 block">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-[11px] text-slate-600">
                            {new Date(ord.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{ord.customer.fullName}</div>
                          <div className="text-[11px] text-slate-600">{ord.customer.email}</div>
                          <div className="text-[10px] text-slate-600">{ord.customer.city}, {ord.customer.country}</div>
                        </td>

                        {/* Items Purchased */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5 max-w-xs">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-7 h-8 object-cover rounded-md border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-800 truncate text-[11px]">{item.name}</p>
                                  <p className="text-[10px] text-slate-600">{item.color} • {item.size} • Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-sm">
                            ${ord.total.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-slate-600 uppercase font-mono">
                            {ord.customer.paymentMethod}
                          </span>
                        </td>

                        {/* Status Select */}
                        <td className="py-3.5 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
