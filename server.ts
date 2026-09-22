import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { MongoClient, Db } from 'mongodb';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS } from './src/data/initialProducts';
import { Product, Order } from './src/types';

dotenv.config();

const PORT = 3000;
const app = express();

// Increase JSON body limits for high-resolution gallery photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory / Local fallback store
let localProducts: Product[] = [...INITIAL_PRODUCTS];
let localOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'AUR-8291',
    customer: {
      fullName: 'Alex Vance',
      email: 'alex.vance@example.com',
      phone: '+1 415-555-0192',
      address: '742 Evergreen Terrace',
      city: 'San Francisco',
      postalCode: '94107',
      country: 'United States',
      paymentMethod: 'card'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'Atelier Heavyweight Oversized Hoodie',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
        color: 'Oatmeal Heather',
        size: 'L',
        price: 88,
        quantity: 1
      },
      {
        productId: 'prod-3',
        name: 'Supima Organic Boxy Tee',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
        color: 'Vintage Washed Black',
        size: 'M',
        price: 42,
        quantity: 2
      }
    ],
    subtotal: 172,
    discount: 17.2,
    shipping: 0,
    total: 154.8,
    status: 'processing',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// MongoDB client instance
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let currentMongoUri: string = process.env.MONGODB_URI || '';
let mongoConnectionError: string | null = null;

function sanitizeMongoUri(rawUri: string): string {
  let uri = rawUri.trim().replace(/^["']|["']$/g, '');
  const srvPrefix = uri.startsWith('mongodb+srv://') 
    ? 'mongodb+srv://' 
    : uri.startsWith('mongodb://') 
    ? 'mongodb://' 
    : '';

  if (srvPrefix) {
    const afterPrefix = uri.slice(srvPrefix.length);
    const lastAtIdx = afterPrefix.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      const userInfo = afterPrefix.slice(0, lastAtIdx);
      const hostAndRest = afterPrefix.slice(lastAtIdx + 1);
      const firstColonIdx = userInfo.indexOf(':');
      if (firstColonIdx !== -1) {
        const username = userInfo.slice(0, firstColonIdx);
        const rawPassword = userInfo.slice(firstColonIdx + 1);
        try {
          const encodedPassword = encodeURIComponent(decodeURIComponent(rawPassword));
          const encodedUsername = encodeURIComponent(decodeURIComponent(username));
          uri = `${srvPrefix}${encodedUsername}:${encodedPassword}@${hostAndRest}`;
        } catch {
          // fallback to raw
        }
      }
    }
  }
  return uri;
}

async function initMongoDB(uriToConnect: string) {
  if (!uriToConnect || uriToConnect.trim() === '') {
    mongoDb = null;
    mongoClient = null;
    mongoConnectionError = null;
    return { success: false, message: 'No MongoDB URI configured. Using local persistence.' };
  }

  const cleanUri = sanitizeMongoUri(uriToConnect);

  try {
    if (mongoClient) {
      await mongoClient.close().catch(() => {});
    }
    const client = new MongoClient(cleanUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
    });
    await client.connect();
    mongoClient = client;
    mongoDb = client.db('auracommerce');
    mongoConnectionError = null;
    currentMongoUri = cleanUri;
    console.log('Successfully connected to MongoDB Database: auracommerce');

    // Persist to mongo_config.json so it auto-reconnects on restart or for shared links
    try {
      const configPath = path.join(process.cwd(), 'mongo_config.json');
      fs.writeFileSync(configPath, JSON.stringify({ mongoUri: cleanUri }, null, 2), 'utf-8');
    } catch (saveErr: any) {
      console.warn('Could not write mongo_config.json:', saveErr.message);
    }

    // Seed database if empty
    const productCount = await mongoDb.collection('products').countDocuments();
    if (productCount === 0) {
      console.log('Seeding initial products into MongoDB collection...');
      await mongoDb.collection('products').insertMany(INITIAL_PRODUCTS as any);
    }

    return { success: true, message: 'Connected to MongoDB successfully!' };
  } catch (err: any) {
    let friendlyMsg = `MongoDB connection error: ${err.message}`;
    if (err.message?.includes('bad auth') || err.message?.includes('Authentication failed')) {
      friendlyMsg = 'MongoDB Authentication Failed: Password match nahi hua (bad auth). Atlas me Database Users -> Edit -> Edit Password karke password confirm karein.';
    } else if (err.message?.includes('SSL alert') || err.message?.includes('tlsv1 alert') || err.message?.includes('whitelist')) {
      friendlyMsg = 'MongoDB Network Blocked: Google Cloud server IP allow nahi hai. Atlas Network Access me "0.0.0.0/0" allow karein.';
    }
    console.warn('MongoDB connection issue:', friendlyMsg);
    mongoDb = null;
    mongoConnectionError = friendlyMsg;
    return { success: false, message: friendlyMsg, rawError: err.message };
  }
}

// Auto-connect on server start from env or saved mongo_config.json
let startupMongoUri = process.env.MONGODB_URI || '';
if (!startupMongoUri) {
  try {
    const configPath = path.join(process.cwd(), 'mongo_config.json');
    if (fs.existsSync(configPath)) {
      const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (savedConfig.mongoUri) {
        startupMongoUri = savedConfig.mongoUri;
      }
    }
  } catch {
    // fallback
  }
}

if (startupMongoUri) {
  initMongoDB(startupMongoUri).catch((err) => {
    console.warn('Initial MongoDB connection attempt failed, will run with local fallback:', err.message);
  });
}

// =================== API ENDPOINTS ===================

// Database Status & Test Endpoint
app.get('/api/db-status', async (_req: Request, res: Response) => {
  if (mongoDb && mongoClient) {
    try {
      await mongoDb.command({ ping: 1 });
      const productCount = await mongoDb.collection('products').countDocuments();
      const orderCount = await mongoDb.collection('orders').countDocuments();
      return res.json({
        connected: true,
        type: 'mongodb',
        databaseName: 'auracommerce',
        message: 'Active connection to MongoDB Database',
        counts: { products: productCount, orders: orderCount }
      });
    } catch (err: any) {
      return res.json({
        connected: false,
        type: 'local',
        message: 'MongoDB disconnected. Serving via local storage.',
        error: err.message
      });
    }
  }

  return res.json({
    connected: false,
    type: 'local',
    message: mongoConnectionError 
      ? `MongoDB Error: ${mongoConnectionError}. Serving via local store.` 
      : 'Running in Local Storage Mode (Ready to connect to MongoDB Atlas)',
    hasEnvUri: Boolean(process.env.MONGODB_URI)
  });
});

// Connect to MongoDB dynamically (from Admin settings)
app.post('/api/connect-mongodb', async (req: Request, res: Response) => {
  const { uri } = req.body;
  if (!uri) {
    return res.status(400).json({ error: 'MongoDB connection string (URI) is required' });
  }

  const result = await initMongoDB(uri);
  if (result.success) {
    return res.json({ success: true, message: result.message, connected: true });
  } else {
    return res.status(500).json({ success: false, message: result.message, connected: false });
  }
});

// Disconnect from MongoDB (revert to local)
app.post('/api/disconnect-mongodb', async (_req: Request, res: Response) => {
  if (mongoClient) {
    await mongoClient.close().catch(() => {});
    mongoClient = null;
    mongoDb = null;
  }
  mongoConnectionError = null;
  return res.json({ success: true, message: 'Switched to local storage mode' });
});

// Sync current in-memory products to MongoDB collection
app.post('/api/sync-to-mongodb', async (_req: Request, res: Response) => {
  if (!mongoDb) {
    return res.status(400).json({ error: 'MongoDB is not currently connected.' });
  }
  try {
    let syncedProducts = 0;
    for (const prod of localProducts) {
      await mongoDb.collection('products').updateOne(
        { id: prod.id },
        { $set: prod },
        { upsert: true }
      );
      syncedProducts++;
    }
    return res.json({ success: true, message: `Successfully synced ${syncedProducts} products to MongoDB!` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/products - list all products
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    if (mongoDb) {
      const items = await mongoDb.collection('products').find().sort({ createdAt: -1 }).toArray();
      // map _id if needed
      const mapped = items.map((item: any) => ({
        ...item,
        id: item.id || item._id.toString()
      }));
      return res.json(mapped);
    }
    return res.json(localProducts);
  } catch (err: any) {
    console.error('Error fetching products:', err);
    return res.json(localProducts);
  }
});

// POST /api/products - create new product
app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.price) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const newProduct: Product = {
      id: data.id || `prod-${Date.now()}`,
      name: data.name.trim(),
      slug: data.slug?.trim() || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: data.description || '',
      price: Number(data.price) || 0,
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
      quantity: Number(data.quantity) || 0,
      category: data.category || 'General',
      colors: Array.isArray(data.colors) ? data.colors : [],
      sizes: Array.isArray(data.sizes) ? data.sizes : [],
      mainImage: data.mainImage || (data.gallery && data.gallery[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      gallery: Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : [data.mainImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80'],
      sku: data.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      tags: Array.isArray(data.tags) ? data.tags : [],
      isFeatured: Boolean(data.isFeatured),
      status: data.status === 'draft' ? 'draft' : 'published',
      createdAt: new Date().toISOString()
    };

    if (mongoDb) {
      await mongoDb.collection('products').insertOne(newProduct as any);
    }
    // Also keep local fallback synced
    localProducts.unshift(newProduct);

    return res.status(201).json(newProduct);
  } catch (err: any) {
    console.error('Error creating product:', err);
    return res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// PUT /api/products/:id - update product
app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date().toISOString();

    if (mongoDb) {
      await mongoDb.collection('products').updateOne(
        { $or: [{ id }, { _id: id } as any] },
        { $set: updates }
      );
    }

    const index = localProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      localProducts[index] = { ...localProducts[index], ...updates };
      return res.json(localProducts[index]);
    }

    return res.json({ id, ...updates });
  } catch (err: any) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// DELETE /api/products/:id - delete product
app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoDb) {
      await mongoDb.collection('products').deleteOne({ $or: [{ id }, { _id: id } as any] });
    }

    localProducts = localProducts.filter(p => p.id !== id);
    return res.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

// GET /api/orders - list all orders
app.get('/api/orders', async (_req: Request, res: Response) => {
  try {
    if (mongoDb) {
      const orders = await mongoDb.collection('orders').find().sort({ createdAt: -1 }).toArray();
      const mapped = orders.map((o: any) => ({
        ...o,
        id: o.id || o._id.toString()
      }));
      return res.json(mapped);
    }
    return res.json(localOrders);
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return res.json(localOrders);
  }
});

// POST /api/orders - place new customer order
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const orderNumber = `AUR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer: data.customer,
      items: data.items,
      subtotal: Number(data.subtotal) || 0,
      discount: Number(data.discount) || 0,
      shipping: Number(data.shipping) || 0,
      total: Number(data.total) || 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Deduct stock for items ordered
    for (const item of newOrder.items) {
      if (mongoDb) {
        await mongoDb.collection('products').updateOne(
          { id: item.productId },
          { $inc: { quantity: -item.quantity } }
        );
      }
      const prod = localProducts.find(p => p.id === item.productId);
      if (prod) {
        prod.quantity = Math.max(0, prod.quantity - item.quantity);
      }
    }

    if (mongoDb) {
      await mongoDb.collection('orders').insertOne(newOrder as any);
    }
    localOrders.unshift(newOrder);

    return res.status(201).json(newOrder);
  } catch (err: any) {
    console.error('Error placing order:', err);
    return res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

// PATCH /api/orders/:id/status - update order status
app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (mongoDb) {
      await mongoDb.collection('orders').updateOne(
        { $or: [{ id }, { _id: id } as any] },
        { $set: { status } }
      );
    }

    const order = localOrders.find(o => o.id === id);
    if (order) {
      order.status = status;
      return res.json(order);
    }

    return res.json({ id, status });
  } catch (err: any) {
    console.error('Error updating order:', err);
    return res.status(500).json({ error: err.message || 'Failed to update order status' });
  }
});

// Reset / Seed Sample Data
app.post('/api/reset-data', async (_req: Request, res: Response) => {
  try {
    localProducts = [...INITIAL_PRODUCTS];
    if (mongoDb) {
      await mongoDb.collection('products').deleteMany({});
      await mongoDb.collection('products').insertMany(INITIAL_PRODUCTS as any);
    }
    return res.json({ success: true, count: localProducts.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =================== VITE / STATIC SERVING ===================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
