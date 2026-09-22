import { Product, Order, DatabaseStatus } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const LOCAL_STORAGE_PRODUCTS_KEY = 'aura_commerce_products';
const LOCAL_STORAGE_ORDERS_KEY = 'aura_commerce_orders';

// Helper for local storage fallback
function getLocalStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading localStorage products', e);
  }
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving localStorage products', e);
  }
}

function getLocalStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading localStorage orders', e);
  }
  return [];
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving localStorage orders', e);
  }
}

export const api = {
  // Fetch all products
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveLocalProducts(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('API call failed, using local storage fallback:', err);
    }
    return getLocalStoredProducts();
  },

  // Create product
  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const created = await res.json();
        const current = getLocalStoredProducts();
        saveLocalProducts([created, ...current]);
        return created;
      }
    } catch (err) {
      console.warn('API createProduct failed, saving to local store:', err);
    }

    const localNew: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const current = getLocalStoredProducts();
    saveLocalProducts([localNew, ...current]);
    return localNew;
  },

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        const current = getLocalStoredProducts();
        const idx = current.findIndex(p => p.id === id);
        if (idx !== -1) {
          current[idx] = { ...current[idx], ...updated };
          saveLocalProducts([...current]);
        }
        return updated;
      }
    } catch (err) {
      console.warn('API updateProduct failed, updating local store:', err);
    }

    const current = getLocalStoredProducts();
    const idx = current.findIndex(p => p.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates, updatedAt: new Date().toISOString() };
      saveLocalProducts([...current]);
      return current[idx];
    }
    return { ...updates, id } as Product;
  },

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const current = getLocalStoredProducts();
        saveLocalProducts(current.filter(p => p.id !== id));
        return true;
      }
    } catch (err) {
      console.warn('API deleteProduct failed, updating local store:', err);
    }

    const current = getLocalStoredProducts();
    saveLocalProducts(current.filter(p => p.id !== id));
    return true;
  },

  // Fetch all orders
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          saveLocalOrders(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('API getOrders failed, using local orders fallback:', err);
    }
    return getLocalStoredOrders();
  },

  // Place order
  async placeOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        const created = await res.json();
        const current = getLocalStoredOrders();
        saveLocalOrders([created, ...current]);
        return created;
      }
    } catch (err) {
      console.warn('API placeOrder failed, saving order locally:', err);
    }

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `AUR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const current = getLocalStoredOrders();
    saveLocalOrders([newOrder, ...current]);
    return newOrder;
  },

  // Update order status
  async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn('API updateOrderStatus failed:', err);
    }
    const current = getLocalStoredOrders();
    const order = current.find(o => o.id === id);
    if (order) {
      order.status = status;
      saveLocalOrders([...current]);
    }
  },

  // Check Database status
  async getDbStatus(): Promise<DatabaseStatus> {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API getDbStatus failed:', err);
    }
    return {
      connected: false,
      type: 'local',
      message: 'Running in Browser / Local Storage Mode'
    };
  },

  // Connect MongoDB dynamically
  async connectMongoDB(uri: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/connect-mongodb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error connecting to MongoDB' };
    }
  },

  // Disconnect MongoDB (switch back to local)
  async disconnectMongoDB(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/disconnect-mongodb', { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  // Sync local products to MongoDB
  async syncToMongoDB(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/sync-to-mongodb', { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  // Reset sample products
  async resetSampleData(): Promise<void> {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
    } catch (err) {
      console.warn('API resetSampleData failed:', err);
    }
    saveLocalProducts(INITIAL_PRODUCTS);
  }
};
