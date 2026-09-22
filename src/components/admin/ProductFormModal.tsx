import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2, Star, MoveLeft, MoveRight, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { CATEGORIES, COMMON_SIZES, POPULAR_COLORS, SAMPLE_PRESET_IMAGES } from '../../data/initialProducts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
  editingProduct?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(editingProduct?.name || '');
  const [slug, setSlug] = useState(editingProduct?.slug || '');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [category, setCategory] = useState(editingProduct?.category || 'Hoodies & Sweatshirts');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState<string>(editingProduct ? String(editingProduct.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    editingProduct?.compareAtPrice ? String(editingProduct.compareAtPrice) : ''
  );
  const [quantity, setQuantity] = useState<string>(editingProduct ? String(editingProduct.quantity) : '15');
  const [sku, setSku] = useState(editingProduct?.sku || '');
  const [status, setStatus] = useState<'published' | 'draft'>(editingProduct?.status || 'published');
  const [isFeatured, setIsFeatured] = useState<boolean>(editingProduct?.isFeatured || false);

  // Colors
  const [colors, setColors] = useState<ProductColor[]>(
    editingProduct?.colors || [
      { name: 'Obsidian Black', hex: '#18181B' },
      { name: 'Oatmeal Heather', hex: '#E6E2DD' }
    ]
  );
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2563eb');

  // Sizes
  const [sizes, setSizes] = useState<string[]>(
    editingProduct?.sizes || ['S', 'M', 'L', 'XL']
  );
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Gallery Photos
  const [gallery, setGallery] = useState<string[]>(
    editingProduct?.gallery || (editingProduct?.mainImage ? [editingProduct.mainImage] : [])
  );
  const [mainImage, setMainImage] = useState<string>(
    editingProduct?.mainImage || ''
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setSlug(editingProduct.slug);
      setDescription(editingProduct.description);
      setCategory(editingProduct.category);
      setPrice(String(editingProduct.price));
      setCompareAtPrice(editingProduct.compareAtPrice ? String(editingProduct.compareAtPrice) : '');
      setQuantity(String(editingProduct.quantity));
      setSku(editingProduct.sku || '');
      setStatus(editingProduct.status);
      setIsFeatured(Boolean(editingProduct.isFeatured));
      setColors(editingProduct.colors || []);
      setSizes(editingProduct.sizes || []);
      setGallery(editingProduct.gallery || []);
      setMainImage(editingProduct.mainImage || '');
      setIsSlugManual(true);
    }
  }, [editingProduct]);

  // Auto-generate slug from name if not manual
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManual) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  // Color functions
  const addColor = () => {
    if (!newColorName.trim()) return;
    setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const addPresetColor = (preset: { name: string; hex: string }) => {
    if (!colors.some(c => c.name.toLowerCase() === preset.name.toLowerCase())) {
      setColors([...colors, preset]);
    }
  };

  const removeColor = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  // Size functions
  const toggleSize = (sizeVal: string) => {
    if (sizes.includes(sizeVal)) {
      setSizes(sizes.filter(s => s !== sizeVal));
    } else {
      setSizes([...sizes, sizeVal]);
    }
  };

  const addCustomSize = () => {
    const s = customSizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) {
      setSizes([...sizes, s]);
      setCustomSizeInput('');
    }
  };

  // Gallery & Image Upload functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          setGallery((prev) => {
            const next = [...prev, base64];
            if (!mainImage) setMainImage(base64);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setGallery([...gallery, url]);
    if (!mainImage) setMainImage(url);
    setNewImageUrl('');
  };

  const addPresetImage = (url: string) => {
    if (!gallery.includes(url)) {
      setGallery([...gallery, url]);
      if (!mainImage) setMainImage(url);
    }
  };

  const removeGalleryImage = (idx: number) => {
    const target = gallery[idx];
    const newGallery = gallery.filter((_, i) => i !== idx);
    setGallery(newGallery);
    if (mainImage === target) {
      setMainImage(newGallery[0] || '');
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newGallery = [...gallery];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newGallery.length) return;
    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIdx];
    newGallery[targetIdx] = temp;
    setGallery(newGallery);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const finalMainImage = mainImage || gallery[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80';
      const finalGallery = gallery.length > 0 ? gallery : [finalMainImage];

      await onSave({
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        category: category === 'Custom' ? (customCategory || 'Custom') : category,
        price: parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        quantity: parseInt(quantity, 10) || 0,
        colors,
        sizes,
        mainImage: finalMainImage,
        gallery: finalGallery,
        sku: sku.trim() || `AUR-${Math.floor(1000 + Math.random() * 9000)}`,
        status,
        isFeatured
      });
      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-600">
              Configure product details, colors, sizes, and multi-photo gallery
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Basic Product Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Heavyweight Oversized Hoodie"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Slug (URL friendly identifier) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Product Slug (URL) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSlugManual(false);
                      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                    }}
                    className="text-[11px] text-slate-600 hover:text-slate-900 underline"
                  >
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-600">/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="heavyweight-oversized-hoodie"
                    className="w-full pl-6 pr-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe fabric composition, fit, styling notes, and unique features..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Category & Status & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  {CATEGORIES.filter(c => c !== 'All Products').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Custom">+ Custom Category...</option>
                </select>
                {category === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full mt-2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Code</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. AUR-HD-001"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Publish Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="published">Published (Active)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Stock Inventory */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Pricing & Stock Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="88.00"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compare at / Original Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="120.00"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity in Stock <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="25"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="isFeatured" className="text-xs font-medium text-slate-700 cursor-pointer">
                Feature on Storefront Homepage Showcase
              </label>
            </div>
          </div>

          {/* Section 3: Colors & Sizes Variants */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              3. Colors & Sizes Variants
            </h3>

            {/* Colors Config */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Product Colors ({colors.length} added)
              </label>

              {/* Color chips */}
              <div className="flex flex-wrap gap-2">
                {colors.map((c, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      className="text-slate-600 hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Color Input */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 bg-transparent p-0.5"
                  title="Pick color"
                />
                <input
                  type="text"
                  placeholder="Color name (e.g. Forest Olive)"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg flex-1 min-w-[140px]"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Add Color
                </button>
              </div>

              {/* Popular quick presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-600">Quick presets:</span>
                {POPULAR_COLORS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => addPresetColor(preset)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-1 text-slate-700"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.hex }} />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes Config */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Available Sizes ({sizes.length} selected)
              </label>

              {/* Multi-select chips */}
              <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map((size) => {
                  const isSelected = sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Custom Size Adder */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                <input
                  type="text"
                  placeholder="Custom size (e.g. 36R, XL-Tall)"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg max-w-[200px]"
                />
                <button
                  type="button"
                  onClick={addCustomSize}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  + Add Custom Size
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Multi-Photo Gallery (ek se jayda photo daalne k liye gallary for showing mulitple photos) */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  4. Multi-Photo Product Gallery ({gallery.length} photos)
                </h3>
                <p className="text-xs text-slate-600">
                  Add multiple high-resolution photos for the interactive customer gallery. Set one as the Cover photo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{showPresets ? 'Hide Studio Presets' : 'Sample Studio Photos'}</span>
              </button>
            </div>

            {/* Presets Tray */}
            {showPresets && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl">
                <p className="text-xs font-semibold text-amber-900 mb-2">
                  Click any studio photograph below to instantly add to your gallery:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addPresetImage(preset.url)}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-amber-200 hover:border-amber-400 text-left transition-all"
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                        <span className="text-[10px] text-white font-bold leading-tight">
                          + Add Photo
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload & URL Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Device File Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-2xl bg-slate-50/50 hover:bg-slate-50 text-center cursor-pointer transition-colors flex flex-col items-center justify-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-700 mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Upload multiple photos from device
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Select multiple JPG, PNG, WEBP files
                </p>
              </div>

              {/* Direct Image URL input */}
              <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Or add photo via Web URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  Add photos of various angles: front, back, fabric detail, model wear.
                </p>
              </div>
            </div>

            {/* Gallery Visual Grid */}
            {gallery.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Gallery items ({gallery.length}):</span>
                  <span>Use ⭐ to set cover image, ◄ ► to reorder</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {gallery.map((imgUrl, idx) => {
                    const isCover = (mainImage === imgUrl) || (!mainImage && idx === 0);
                    return (
                      <div
                        key={idx}
                        className={`group relative aspect-4/5 rounded-2xl overflow-hidden border-2 bg-slate-100 transition-all ${
                          isCover ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />

                        {/* Cover Badge */}
                        {isCover && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-950 text-amber-400 text-[10px] font-bold rounded-md shadow-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>COVER</span>
                          </div>
                        )}

                        {/* Image overlay controls */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <button
                              type="button"
                              onClick={() => setMainImage(imgUrl)}
                              title="Set as Main Cover Photo"
                              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                isCover
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-white/90 hover:bg-white text-slate-800'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-current' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              title="Delete photo"
                              className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Reordering arrows */}
                          <div className="flex justify-between items-center bg-white/20 backdrop-blur-xs rounded-lg p-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveImage(idx, 'left')}
                              className="p-1 rounded-sm text-white hover:bg-white/30 disabled:opacity-30 cursor-pointer"
                              title="Move left"
                            >
                              <MoveLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-white font-mono">{idx + 1}</span>
                            <button
                              type="button"
                              disabled={idx === gallery.length - 1}
                              onClick={() => moveImage(idx, 'right')}
                              className="p-1 rounded-sm text-white hover:bg-white/30 disabled:opacity-30 cursor-pointer"
                              title="Move right"
                            >
                              <MoveRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-600">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-700">No photos in gallery yet</p>
                <p className="text-[11px] text-slate-600">
                  Upload photos or select from the studio presets above to showcase your product.
                </p>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-7 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving Product...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
