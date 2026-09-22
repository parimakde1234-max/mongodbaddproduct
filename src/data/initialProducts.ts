import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Atelier Heavyweight Oversized Hoodie',
    slug: 'atelier-heavyweight-oversized-hoodie',
    description: 'Crafted from 480GSM French terry cotton, featuring a relaxed drop-shoulder silhouette, double-layered hood with clean uncorded finish, and hidden kangaroo pockets. Tailored for elevated daily comfort.',
    price: 88,
    compareAtPrice: 120,
    quantity: 35,
    category: 'Hoodies & Sweatshirts',
    colors: [
      { name: 'Oatmeal Heather', hex: '#E6E2DD' },
      { name: 'Obsidian Black', hex: '#18181B' },
      { name: 'Sage Green', hex: '#7E8D7B' },
      { name: 'Charcoal Wash', hex: '#4B5563' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    mainImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
    ],
    sku: 'AUR-HD-001',
    tags: ['Best Seller', 'Heavyweight', 'Streetwear'],
    isFeatured: true,
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'prod-2',
    name: 'Minimalist Modular Field Jacket',
    slug: 'minimalist-modular-field-jacket',
    description: 'Weather-resistant technical cotton blend shell with matte black YKK dual zippers, magnetic flap pockets, and adjustable storm collar. Designed for modern urban commuting and travel.',
    price: 175,
    compareAtPrice: 220,
    quantity: 18,
    category: 'Outerwear',
    colors: [
      { name: 'Matte Olive', hex: '#4C5844' },
      { name: 'Midnight Navy', hex: '#1E293B' },
      { name: 'Stealth Black', hex: '#171717' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    mainImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=1000&q=80'
    ],
    sku: 'AUR-JK-002',
    tags: ['Water Resistant', 'Modular', 'New Arrival'],
    isFeatured: true,
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'prod-3',
    name: 'Supima Organic Boxy Tee',
    slug: 'supima-organic-boxy-tee',
    description: '100% Certified California-grown Supima cotton. 240GSM combed jersey with reinforced rib-knit neckband and clean blind-stitched hems that resist warping through repeated wash cycles.',
    price: 42,
    compareAtPrice: 50,
    quantity: 64,
    category: 'T-Shirts',
    colors: [
      { name: 'Off-White Ivory', hex: '#F5F5F0' },
      { name: 'Vintage Washed Black', hex: '#262626' },
      { name: 'Warm Terracotta', hex: '#C27050' },
      { name: 'Muted Sky Blue', hex: '#93B5C6' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    mainImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80'
    ],
    sku: 'AUR-TEE-003',
    tags: ['Organic Cotton', 'Essential', 'Eco-Friendly'],
    isFeatured: true,
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'prod-4',
    name: 'Tailored Wide-Leg Pleated Trousers',
    slug: 'tailored-wide-leg-pleated-trousers',
    description: 'Precision draped twill with front double pleats, concealed clasp closure, slash side pockets, and relaxed ankle break. Perfectly pairs with structured trainers or leather loafers.',
    price: 110,
    compareAtPrice: 145,
    quantity: 12,
    category: 'Pants & Trousers',
    colors: [
      { name: 'Khaki Stone', hex: '#C7BBA6' },
      { name: 'Deep Espresso', hex: '#3E2723' },
      { name: 'Charcoal Black', hex: '#212121' }
    ],
    sizes: ['28', '30', '32', '34', '36'],
    mainImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1000&q=80'
    ],
    sku: 'AUR-TR-004',
    tags: ['Smart Casual', 'Tailored', 'Trending'],
    isFeatured: false,
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'prod-5',
    name: 'Structured Canvas Everyday Tote',
    slug: 'structured-canvas-everyday-tote',
    description: 'Heavy 18oz water-repellent duck canvas with vegetable-tanned Italian bridle leather handles, reinforced copper rivets, and padded 16-inch laptop compartment with key carabiner.',
    price: 65,
    compareAtPrice: 85,
    quantity: 22,
    category: 'Bags & Accessories',
    colors: [
      { name: 'Raw Natural Canvas', hex: '#ECE4DB' },
      { name: 'Forest Green', hex: '#2D3F34' },
      { name: 'Raven Black', hex: '#1C1917' }
    ],
    sizes: ['One Size (22L)'],
    mainImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80'
    ],
    sku: 'AUR-BG-005',
    tags: ['Waterproof', 'Carryall', 'Leather Trim'],
    isFeatured: true,
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'prod-6',
    name: 'Heritage Low-Profile Leather Sneakers',
    slug: 'heritage-low-profile-leather-sneakers',
    description: 'Full-grain Italian Nappa leather upper mounted on a vulcanized Margom rubber cupsole. Memory foam antimicrobial calfskin insole for all-day cushioning.',
    price: 145,
    compareAtPrice: 190,
    quantity: 8,
    category: 'Footwear',
    colors: [
      { name: 'Crisp White', hex: '#F9FAFB' },
      { name: 'Chalk & Gum', hex: '#E5E7EB' },
      { name: 'Triple Black', hex: '#111827' }
    ],
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    mainImage: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80'
    ],
    sku: 'AUR-SN-006',
    tags: ['Italian Leather', 'Limited Stock'],
    isFeatured: false,
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const CATEGORIES = [
  'All Products',
  'Hoodies & Sweatshirts',
  'Outerwear',
  'T-Shirts',
  'Pants & Trousers',
  'Bags & Accessories',
  'Footwear'
];

export const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', 'One Size'];

export const POPULAR_COLORS = [
  { name: 'Obsidian Black', hex: '#18181B' },
  { name: 'Crisp White', hex: '#FFFFFF' },
  { name: 'Oatmeal Heather', hex: '#E6E2DD' },
  { name: 'Sage Green', hex: '#7E8D7B' },
  { name: 'Midnight Navy', hex: '#1E293B' },
  { name: 'Warm Terracotta', hex: '#C27050' },
  { name: 'Matte Olive', hex: '#4C5844' },
  { name: 'Vintage Washed Black', hex: '#262626' },
  { name: 'Royal Indigo', hex: '#3730A3' },
  { name: 'Crimson Red', hex: '#991B1B' }
];

export const SAMPLE_PRESET_IMAGES = [
  {
    title: 'Oversized Street Hoodie Front',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Hoodie Texture & Cuff Detail',
    url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Model Editorial Portrait',
    url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Field Jacket Angled View',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Minimalist Clean Tee',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Tailored Trousers Fit',
    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Canvas Carry Tote Studio',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Handcrafted Leather Sneakers',
    url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80'
  }
];
