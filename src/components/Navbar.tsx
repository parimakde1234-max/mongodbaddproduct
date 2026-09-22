import React from 'react';
import { ShoppingBag, ShieldCheck, Store, Package, Database, Search } from 'lucide-react';
import { DatabaseStatus } from '../types';

interface NavbarProps {
  viewMode: 'customer' | 'admin';
  setViewMode: (mode: 'customer' | 'admin') => void;
  cartCount: number;
  openCart: () => void;
  openOrders: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  dbStatus: DatabaseStatus | null;
  openDbSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  cartCount,
  openCart,
  openOrders,
  searchQuery,
  setSearchQuery,
  dbStatus,
  openDbSettings
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setViewMode('customer')}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-sm group-hover:bg-slate-800 transition-colors">
                A
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">AURA</span>
                <span className="text-[10px] tracking-widest text-slate-600 block uppercase font-bold">Commerce</span>
              </div>
            </button>

            {/* Quick MongoDB Status indicator pill */}
            <button
              onClick={openDbSettings}
              title={dbStatus?.connected ? 'Connected to MongoDB Atlas' : 'Local Storage Mode (Click to configure MongoDB)'}
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                dbStatus?.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <Database className="w-3 h-3" />
              <span>{dbStatus?.connected ? 'MongoDB Live' : 'Storage: Local / Ready for Mongo'}</span>
            </button>
          </div>

          {/* Search bar (primarily in Customer view or global) */}
          <div className="flex-1 max-w-md mx-4 hidden lg:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, category, slug, or color..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-slate-800 placeholder-slate-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Controls: Mode Switcher, Orders & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Admin / Customer Mode Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'customer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Storefront</span>
              </button>

              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Panel</span>
              </button>
            </div>

            {/* My Orders Button */}
            <button
              onClick={openOrders}
              title="Track Placed Orders"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-200 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span className="hidden md:inline">Orders</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs cursor-pointer group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center -ml-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
