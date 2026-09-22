import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StorefrontView } from './components/customer/StorefrontView';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { CustomerOrdersModal } from './components/customer/CustomerOrdersModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProductFormModal } from './components/admin/ProductFormModal';
import { DatabaseModal } from './components/admin/DatabaseModal';
import { api } from './services/api';
import { Product, CartItem, Order, ProductColor, DatabaseStatus } from './types';
import { Store, ShieldCheck, Database, ShoppingBag, Heart } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Checkout calculation state
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState<string>('');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const [fetchedProducts, fetchedOrders, fetchedDbStatus] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getDbStatus()
      ]);
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
      setDbStatus(fetchedDbStatus);
    }
    loadData();
  }, []);

  // Cart Functions
  const handleAddToCart = (product: Product, color: ProductColor, size: string, quantity: number) => {
    const cartItemId = `${product.id}-${color.name}-${size}`;
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === cartItemId);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = Math.min(product.quantity, updated[existingIdx].quantity + quantity);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            product,
            selectedColor: color,
            selectedSize: size,
            quantity
          }
        ];
      }
    });
    showToast(`Added ${quantity}x "${product.name}" (${color.name}, ${size}) to cart`);
  };

  const handleQuickAdd = (product: Product) => {
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Standard', hex: '#111827' };
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard';
    handleAddToCart(product, defaultColor, defaultSize, 1);
  };

  const handleUpdateCartQty = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleProceedCheckout = (discountAmount: number, promoCode: string) => {
    setCheckoutDiscount(discountAmount);
    setCheckoutPromoCode(promoCode);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    // Update local product stocks
    setProducts((prev) =>
      prev.map((p) => {
        const itemOrdered = newOrder.items.find((it) => it.productId === p.id);
        if (itemOrdered) {
          return { ...p, quantity: Math.max(0, p.quantity - itemOrdered.quantity) };
        }
        return p;
      })
    );
    showToast(`Order #${newOrder.orderNumber} placed successfully!`);
  };

  // Admin Product Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      // Update
      const updated = await api.updateProduct(editingProduct.id, productData);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`Updated product "${updated.name}"`);
    } else {
      // Create
      const created = await api.createProduct(productData as any);
      setProducts((prev) => [created, ...prev]);
      showToast(`Created new product "${created.name}"`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const success = await api.deleteProduct(productId);
    if (success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('Product removed from catalog');
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    const updated = await api.updateProduct(productId, { quantity: newStock });
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: newStock } : p)));
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await api.updateOrderStatus(orderId, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showToast(`Order status updated to ${status}`);
  };

  // MongoDB connect
  const handleConnectMongo = async (uri: string) => {
    const res = await api.connectMongoDB(uri);
    const updatedStatus = await api.getDbStatus();
    setDbStatus(updatedStatus);
    if (res.success) {
      const freshProducts = await api.getProducts();
      setProducts(freshProducts);
    }
    return res;
  };

  const handleResetData = async () => {
    await api.resetSampleData();
    const freshProducts = await api.getProducts();
    setProducts(freshProducts);
    showToast('Catalog restored to default studio sample products');
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        openOrders={() => setIsOrdersOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dbStatus={dbStatus}
        openDbSettings={() => setIsDbModalOpen(true)}
      />

      {/* Mode Switcher Floating Banner (on mobile or quick toggle) */}
      <div className="bg-slate-900 text-white py-2 px-4 text-center text-xs flex items-center justify-center gap-2 font-medium">
        <span>Current View:</span>
        <strong className="text-amber-400 uppercase tracking-wide">
          {viewMode === 'customer' ? 'Customer Storefront' : 'Admin Control Panel'}
        </strong>
        <span className="text-slate-400">•</span>
        <button
          onClick={() => setViewMode(viewMode === 'customer' ? 'admin' : 'customer')}
          className="underline hover:text-amber-300 font-bold cursor-pointer"
        >
          Switch to {viewMode === 'customer' ? 'Admin Panel' : 'Customer View'}
        </button>
      </div>

      {/* View Content */}
      <main className="flex-1">
        {viewMode === 'customer' ? (
          <StorefrontView
            products={products.filter((p) => p.status === 'published')}
            onSelectProduct={(p) => setSelectedProductForDetail(p)}
            onQuickAdd={handleQuickAdd}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        ) : (
          <AdminDashboard
            products={products}
            orders={orders}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStock={handleUpdateStock}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenDbSettings={() => setIsDbModalOpen(true)}
            onSelectProductPreview={(p) => setSelectedProductForDetail(p)}
            dbStatus={dbStatus}
          />
        )}
      </main>

      {/* Modals */}

      {/* Product Detail Modal with Multi-Photo Gallery */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={handleProceedCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        discountAmount={checkoutDiscount}
        promoCode={checkoutPromoCode}
        onOrderCompleted={handleOrderCompleted}
        onPlaceOrderApi={(data) => api.placeOrder(data)}
      />

      {/* Customer Orders Modal */}
      <CustomerOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
      />

      {/* Admin: Product Form Modal (Add / Edit Product + Multi-Photo Gallery) */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* MongoDB Database Configuration Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbStatus={dbStatus}
        onConnectMongo={handleConnectMongo}
        onResetData={handleResetData}
        products={products}
        orders={orders}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">AURA COMMERCE</span>
              <p className="text-[11px] text-slate-600">Admin & Customer Storefront Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600">
            <button
              onClick={() => setViewMode('customer')}
              className="hover:text-slate-900 font-medium"
            >
              Storefront
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className="hover:text-slate-900 font-medium"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>MongoDB Settings</span>
            </button>
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-1">
            <span>Built with precision for modern commerce</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
