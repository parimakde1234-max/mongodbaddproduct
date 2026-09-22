import React, { useState } from 'react';
import { Eye, Plus, Images, Check } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  // If there's a second photo in the gallery, peek it on hover
  const secondImage = product.gallery && product.gallery.length > 1 ? product.gallery[1] : null;
  const currentImage = (isHovered && secondImage) ? secondImage : product.mainImage;

  const isLowStock = product.quantity > 0 && product.quantity <= 5;
  const isOutOfStock = product.quantity <= 0;

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onQuickAdd(product);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1200);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Photo Container */}
      <div className="relative aspect-4/5 w-full bg-slate-100 overflow-hidden">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[11px] tracking-wide rounded-md shadow-xs uppercase">
              {discountPercent}% OFF
            </span>
          )}
          {isLowStock && (
            <span className="px-2.5 py-1 bg-rose-500 text-white font-medium text-[11px] rounded-md shadow-xs">
              Only {product.quantity} left
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-1 bg-slate-900/90 text-white font-semibold text-[11px] rounded-md shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Multi-Photo Count Badge */}
        {product.gallery && product.gallery.length > 1 && (
          <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-slate-950/60 backdrop-blur-xs text-white text-[11px] font-medium rounded-md flex items-center gap-1.5">
            <Images className="w-3.5 h-3.5" />
            <span>{product.gallery.length}</span>
          </div>
        )}

        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex-1 py-2.5 bg-white/95 hover:bg-white text-slate-900 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>

          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleQuickAddClick}
              title="Quick Add to Cart"
              className={`p-2.5 rounded-xl shadow-md text-white transition-colors flex items-center justify-center ${
                isAddedRecently ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isAddedRecently ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Slug preview */}
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span>{product.category}</span>
            <span className="text-[10px] font-mono text-slate-600 truncate max-w-[120px]">
              /{product.slug}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors">
            {product.name}
          </h3>

          {/* Colors Preview */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {product.colors.slice(0, 4).map((c, idx) => (
                <span
                  key={idx}
                  title={c.name}
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[11px] text-slate-600 font-medium">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Sizes */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-600 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Sizes Tag summary */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <span>{product.sizes.length} sizes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
