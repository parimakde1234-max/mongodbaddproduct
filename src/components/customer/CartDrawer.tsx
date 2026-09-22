import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check, Shield } from 'lucide-react';
import { CartItem } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedCheckout: (discountAmount: number, promoCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout
}) => {
  if (!isOpen) return null;

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Calculate discount
  let discountAmount = 0;
  if (appliedPromo === 'WELCOME10' || appliedPromo === 'AURAFIRST') {
    discountAmount = subtotal * 0.1; // 10% off
  } else if (appliedPromo === 'VIP20') {
    discountAmount = subtotal * 0.2; // 20% off
  }

  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === 'WELCOME10' || code === 'AURAFIRST' || code === 'VIP20') {
      setAppliedPromo(code);
      setPromoError(null);
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon code. Try "WELCOME10" or "VIP20"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Your Shopping Bag</h2>
              <p className="text-xs text-slate-600">{items.length} unique item{items.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>
              {subtotal >= 100
                ? '🎉 You unlocked Free Express Shipping!'
                : `Add $${(100 - subtotal).toFixed(2)} more for Free Shipping`}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (subtotal / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-800 text-lg">Your bag is empty</p>
              <p className="text-xs text-slate-600 max-w-xs mt-1 mb-6">
                Discover our new collections and find your next favorite pieces.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                {/* Thumbnail */}
                <div className="w-20 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={item.product.mainImage}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-600 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Variant tags */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        {item.selectedColor.name}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">Size: {item.selectedSize}</span>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.quantity}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold text-xs disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-sm text-slate-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Promo & Totals */}
        {items.length > 0 && (
          <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
            
            {/* Promo Code Box */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo: WELCOME10 or VIP20"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Apply
              </button>
            </form>

            {appliedPromo && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Code <strong>{appliedPromo}</strong> applied!
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedPromo(null)}
                  className="text-emerald-900 hover:underline font-bold"
                >
                  Remove
                </button>
              </div>
            )}

            {promoError && (
              <p className="text-xs text-rose-600 font-medium">{promoError}</p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedPromo})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => onProceedCheckout(discountAmount, appliedPromo || '')}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe 256-bit SSL encrypted checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
