import React, { useState } from 'react';
import { CustomerData } from './CustomerInfo';
import { CartItem } from '../context/CartContext';

interface PaymentConfirmationProps {
  isOpen: boolean;
  onBack: () => void;
  onFinalize: () => void;
  customerData: CustomerData;
  cartItems: CartItem[];
  totalAmount: number;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  isOpen,
  onBack,
  onFinalize,
  customerData,
  cartItems,
  totalAmount,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFinalize = async () => {
    setIsProcessing(true);
    try {
      onFinalize();
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const tax = subtotal * 0.23;
  const shipping = 4.99;

  return (
    <>
      {/* Overlay blur background */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onBack}
      />

      {/* Modal card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-neutral-900 border border-gray-800 rounded-lg max-h-[90vh] overflow-y-auto">
          {/* Header with back button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-neutral-900">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-xl cursor-pointer"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold text-white">Payment</h2>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="lg:flex lg:items-start lg:gap-12">
              {/* Payment Form - Frozen */}
              <form className="w-full rounded-lg border border-gray-700 bg-neutral-800 p-4 sm:p-6 lg:max-w-xl lg:p-8">
                <div className="mb-6 grid grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-2 block text-sm font-medium text-white">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customerData.customer_name}
                      disabled
                      className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-gray-300 cursor-not-allowed"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-2 block text-sm font-medium text-white">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value="•••• •••• •••• 4242"
                      disabled
                      className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-gray-300 cursor-not-allowed"
                    />
                  </div>

                  {/* Card Expiration */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Card Expiration
                    </label>
                    <input
                      type="text"
                      value="12/27"
                      disabled
                      className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-gray-300 cursor-not-allowed"
                    />
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      CVV
                    </label>
                    <input
                      type="text"
                      value="•••"
                      disabled
                      className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-gray-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinalize}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center rounded-lg bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Finalize Order'}
                </button>
              </form>

              {/* Order Summary */}
              <div className="mt-6 grow sm:mt-8 lg:mt-0">
                <div className="space-y-4 rounded-lg border border-gray-700 bg-neutral-800 p-6">
                  {/* Order Items */}
                  <div className="space-y-2 pb-4 border-b border-gray-700">
                    <h3 className="text-sm font-semibold text-white">Order Items</h3>
                    <div className="space-y-1">
                      {cartItems.map((item) => (
                        <dl key={item.book.id} className="flex items-center justify-between gap-4 text-sm">
                          <dt className="text-gray-400">
                            {item.book.title} x{item.quantity}
                          </dt>
                          <dd className="font-medium text-white">
                            {(item.book.price * item.quantity).toFixed(2)} zł
                          </dd>
                        </dl>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <dl className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-gray-400">Subtotal</dt>
                      <dd className="font-medium text-white">{subtotal.toFixed(2)} zł</dd>
                    </dl>

                    <dl className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-gray-400">Tax (23%)</dt>
                      <dd className="font-medium text-white">{tax.toFixed(2)} zł</dd>
                    </dl>

                    <dl className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-gray-400">Shipping</dt>
                      <dd className="font-medium text-white">{shipping.toFixed(2)} zł</dd>
                    </dl>
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-700 pt-4">
                    <dl className="flex items-center justify-between gap-4">
                      <dt className="text-base font-bold text-white">Total</dt>
                      <dd className="text-base font-bold text-white">
                        {totalAmount.toFixed(2)} zł
                      </dd>
                    </dl>
                  </div>

                  {/* Customer Info */}
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-white mb-2">Billing To</h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>{customerData.customer_name}</p>
                      <p>{customerData.email}</p>
                      <p>{customerData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentConfirmation;
