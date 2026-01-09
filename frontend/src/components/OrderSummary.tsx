import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import CustomerInfo, { CustomerData } from './CustomerInfo';
import PaymentConfirmation from './PaymentConfirmation';
import SuccessScreen from './SuccessScreen';
import FailureScreen from './FailureScreen';

interface OrderSummaryProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ isOpen, onClose }) => {
  const { items, total, updateQuantity, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<'summary' | 'customer' | 'payment' | 'success' | 'failure'>('summary');
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const TAX_RATE = 0.23; // 23% VAT for Poland
  const subtotal = total;
  const tax = subtotal * TAX_RATE;
  const shipping = 4.99; // Fixed shipping cost in PLN
  const finalTotal = Math.floor((subtotal + tax + shipping) * 100) / 100;

  const handleCheckout = () => {
    setCurrentStep('customer');
  };

  const handleCustomerInfoSubmit = (data: CustomerData) => {
    setCustomerData(data);
    setCurrentStep('payment');
  };

  const handleBackToSummary = () => {
    setCurrentStep('summary');
  };

  const handleBackToCustomer = () => {
    setCurrentStep('customer');
  };

  const handleFinalizeOrder = async () => {
    if (!customerData) return;

    try {
      const orderPayload = {
        customer_name: customerData.customer_name,
        email: customerData.email,
        phone: customerData.phone,
        total_price: finalTotal,
        items: items.map(item => ({
          book_id: item.book.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch('http://localhost:8000/api/v1/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.detail || 'Order creation failed. Please try again.');
        setCurrentStep('failure');
        return;
      }

      const data = await response.json();
      setOrderId(String(data.id));
      clearCart();
      setCurrentStep('success');
    } catch (error) {
      setErrorMessage('Network error. Please check your connection and try again.');
      setCurrentStep('failure');
    }
  };

  const handleSuccessClose = () => {
    setCurrentStep('summary');
    setCustomerData(null);
    setOrderId(null);
    onClose();
  };

  const handleFailureClose = () => {
    setCurrentStep('payment');
    setErrorMessage('');
  };

  return (
    <>
      {/* Step 1: Order Summary */}
      {currentStep === 'summary' && (
        <>
          {/* Overlay blur background */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

      {/* Modal card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-gray-800 rounded-lg">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-neutral-900">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-xl cursor-pointer"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold text-white">Order Summary</h2>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>

          {/* Cart items */}
          <div className="p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <>
                {/* Items table */}
                <div className="mb-8 border-b border-gray-800 pb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.book.id}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Book cover placeholder */}
                          <div className="w-16 h-24 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-gray-400 text-center px-1">
                              {item.book.title.substring(0, 10)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white truncate">
                              {item.book.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              by{' '}
                              {item.book.authors?.[0]?.name ||
                                'Unknown Author'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {item.book.price.toFixed(2)} zł each
                            </p>
                          </div>
                        </div>

                        {/* Quantity controls and price */}
                        <div className="flex items-center gap-5 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors cursor-pointer text-xs"
                            >
                              −
                            </button>
                            <span className="w-5 text-center text-gray-400 text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-lg font-bold text-white w-20 text-right">
                            {(item.book.price * item.quantity).toFixed(2)} zł
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary - Pricing breakdown */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-white">
                    Pricing Breakdown
                  </h3>

                  <div className="space-y-2">
                    <dl className="flex items-center justify-between gap-4 text-base">
                      <dt className="text-gray-400">Subtotal</dt>
                      <dd className="font-medium text-white">
                        {subtotal.toFixed(2)} zł
                      </dd>
                    </dl>

                    <dl className="flex items-center justify-between gap-4 text-base">
                      <dt className="text-gray-400">Tax (23%)</dt>
                      <dd className="font-medium text-white">
                        {tax.toFixed(2)} zł
                      </dd>
                    </dl>

                    <dl className="flex items-center justify-between gap-4 text-base">
                      <dt className="text-gray-400">Shipping</dt>
                      <dd className="font-medium text-white">
                        {shipping.toFixed(2)} zł
                      </dd>
                    </dl>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <dl className="flex items-center justify-between gap-4">
                      <dt className="text-lg font-bold text-white">Total</dt>
                      <dd className="text-2xl font-bold text-white">
                        {finalTotal.toFixed(2)} zł
                      </dd>
                    </dl>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-800">
                  <button
                    onClick={onClose}
                    className="flex-1 px-5 py-2.5 rounded-lg bg-neutral-900 border border-gray-700 text-white hover:bg-white hover:text-black font-medium transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 px-5 py-2.5 rounded-lg bg-white text-black hover:bg-black hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
        </>
      )}

      {/* Step 2: Customer Information */}
      <CustomerInfo
        isOpen={currentStep === 'customer'}
        onBack={handleBackToSummary}
        onNext={handleCustomerInfoSubmit}
      />

      {/* Step 3: Payment Confirmation */}
      {customerData && (
        <PaymentConfirmation
          isOpen={currentStep === 'payment'}
          onBack={handleBackToCustomer}
          onFinalize={handleFinalizeOrder}
          customerData={customerData}
          cartItems={items}
          totalAmount={finalTotal}
        />
      )}

      {/* Success Screen */}
      {orderId && (
        <SuccessScreen
          isOpen={currentStep === 'success'}
          orderId={orderId}
          onClose={handleSuccessClose}
        />
      )}

      {/* Failure Screen */}
      <FailureScreen
        isOpen={currentStep === 'failure'}
        message={errorMessage}
        onClose={handleFailureClose}
      />
    </>
  );
};

export default OrderSummary;
