import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, ShoppingBag, ShieldCheck, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import { Product, ProductColor } from '../../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color: ProductColor, size: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  // Multi-image gallery state
  const galleryImages = (product.gallery && product.gallery.length > 0)
    ? product.gallery
    : [product.mainImage];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Standard', hex: '#1e293b' }
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
  );
  const [qty, setQty] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Reset indices whenever product changes
  useEffect(() => {
    setActiveImageIndex(0);
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setQty(1);
  }, [product]);

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCart = () => {
    if (product.quantity <= 0) return;
    onAddToCart(product, selectedColor, selectedSize, qty);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;
  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-sm flex items-center justify-center transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* LEFT: Multi-Photo Interactive Gallery */}
          <div className="p-4 sm:p-6 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80">
            <div>
              {/* Main Photo Showcase */}
              <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-slate-200 shadow-inner group">
                <img
                  src={galleryImages[activeImageIndex]}
                  alt={`${product.name} photo ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Left/Right Controls for multi-image navigation */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                      title="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                      title="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950/70 backdrop-blur-xs text-white text-xs font-semibold rounded-full shadow-sm">
                      {activeImageIndex + 1} / {galleryImages.length} Photos
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Gallery Bar */}
              {galleryImages.length > 1 && (
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-slate-950 ring-2 ring-slate-900/10 scale-102'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Guarantees banner */}
            <div className="mt-6 pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-slate-700" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>Authentic Quality</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-slate-700" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Specs, Selection & Add to Cart */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Header: Category & Slug */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
                  <span className="uppercase tracking-wider font-semibold text-slate-600">{product.category}</span>
                  {product.sku && <span className="font-mono text-slate-600">SKU: {product.sku}</span>}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {product.name}
                </h1>
                <p className="text-xs font-mono text-slate-600 mt-0.5">
                  Slug: <span className="text-slate-600">/{product.slug}</span>
                </p>
              </div>

              {/* Price & Stock Display */}
              <div className="flex items-center justify-between py-2 border-y border-slate-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-base text-slate-600 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-md">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>

                {/* Stock status indicator */}
                <div>
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      Only {product.quantity} units left!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      In Stock ({product.quantity} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Color: <span className="text-slate-900 normal-case font-semibold">{selectedColor.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color, idx) => {
                      const isSelected = selectedColor.name === color.name;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Size: <span className="text-slate-900 normal-case font-semibold">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        disabled={qty <= 1}
                        className="px-3.5 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer font-bold text-base"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                        disabled={qty >= product.quantity}
                        className="px-3.5 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer font-bold text-base"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-600">
                      Total: <strong className="text-slate-900">${(product.price * qty).toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-600 cursor-not-allowed shadow-none'
                    : addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg'
                }`}
              >
                {isOutOfStock ? (
                  <span>Out of Stock</span>
                ) : addedAnimation ? (
                  <>
                    <Check className="w-5 h-5 animate-scaleUp" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Bag - ${(product.price * qty).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
