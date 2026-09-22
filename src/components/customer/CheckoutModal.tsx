import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, Banknote, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerInfo, Order } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discountAmount: number;
  promoCode: string;
  onOrderCompleted: (newOrder: Order) => void;
  onPlaceOrderApi: (orderData: any) => Promise<Order>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discountAmount,
  promoCode,
  onOrderCompleted,
  onPlaceOrderApi
}) => {
  if (!isOpen) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 234-5678',
    address: '452 Broadway Ave, Suite 7B',
    city: 'New York',
    postalCode: '10013',
    country: 'United States',
    paymentMethod: 'card'
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.fullName || !customer.email || !customer.address) return;

    setIsSubmitting(true);
    try {
      const orderItems = items.map((it) => ({
        productId: it.productId,
        name: it.product.name,
        image: it.product.mainImage,
        color: it.selectedColor.name,
        size: it.selectedSize,
        price: it.product.price,
        quantity: it.quantity
      }));

      const newOrder = await onPlaceOrderApi({
        customer,
        items: orderItems,
        subtotal,
        discount: discountAmount,
        shipping,
        total: grandTotal
      });

      setCompletedOrder(newOrder);
      onOrderCompleted(newOrder);

      // Trigger Confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to submit order', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-slate-900 text-lg">
              {completedOrder ? 'Order Confirmed!' : 'Secure Checkout'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrder ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 text-xs font-bold rounded-full border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Thank you for shopping with AURA</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Your Order has been Placed!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                We sent a confirmation receipt to <strong className="text-slate-800">{completedOrder.customer.email}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left max-w-lg mx-auto text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Order Reference:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Customer:</span>
                <span className="font-semibold text-slate-800">{completedOrder.customer.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Shipping to:</span>
                <span className="font-semibold text-slate-800">{completedOrder.customer.address}, {completedOrder.customer.city}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Payment:</span>
                <span className="font-semibold uppercase text-slate-800">{completedOrder.customer.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                <span>Total Paid:</span>
                <span>${completedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                1. Shipping Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={customer.postalCode}
                    onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={customer.country}
                    onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                2. Payment Method
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCustomer({ ...customer, paymentMethod: 'card' })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    customer.paymentMethod === 'card'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Card / Stripe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomer({ ...customer, paymentMethod: 'upi' })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    customer.paymentMethod === 'upi'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-extrabold text-sm tracking-tighter">UPI</span>
                  <span>UPI / NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomer({ ...customer, paymentMethod: 'cod' })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    customer.paymentMethod === 'cod'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* Summary preview */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Items ({items.length})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount ({promoCode})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount Due</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order (${grandTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
