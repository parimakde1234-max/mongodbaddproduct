import React from 'react';
import { X, Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Order } from '../../types';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  orders
}) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3.5 h-3.5" /> Shipped & In Transit
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">My Orders & Purchases</h2>
              <p className="text-xs text-slate-600">{orders.length} order{orders.length === 1 ? '' : 's'} recorded</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-600 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
                <Package className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-800 text-base">No orders placed yet</p>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Once you purchase from the catalog, you will be able to track order shipping and delivery status right here.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs hover:border-slate-300 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center gap-3.5 first:pt-0 last:pb-0">
                      <div className="w-12 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Color: <strong className="text-slate-700">{item.color}</strong> • Size: <strong className="text-slate-700">{item.size}</strong> • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Footer Details */}
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <div>
                    Ship to: <span className="font-medium text-slate-800">{order.customer.fullName} ({order.customer.city})</span>
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    Total: ${order.total.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
