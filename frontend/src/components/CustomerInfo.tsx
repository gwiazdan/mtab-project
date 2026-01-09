import React, { useState } from 'react';

interface CustomerInfoProps {
  isOpen: boolean;
  onBack: () => void;
  onNext: (data: CustomerData) => void;
}

export interface CustomerData {
  customer_name: string;
  email: string;
  phone: string;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ isOpen, onBack, onNext }) => {
  const [formData, setFormData] = useState<CustomerData>({
    customer_name: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<CustomerData>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerData> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <>
      {/* Overlay blur background */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onBack}
      />

      {/* Modal card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-neutral-900 border border-gray-800 rounded-lg">
          {/* Header with back button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-xl cursor-pointer"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold text-white">Billing Information</h2>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-white mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg bg-neutral-800 border transition-colors text-white placeholder-gray-500 focus:outline-none ${
                    errors.customer_name ? 'border-red-500' : 'border-gray-700 focus:border-gray-600'
                  }`}
                  placeholder="John Doe"
                  cursor-pointer
                />
                {errors.customer_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg bg-neutral-800 border transition-colors text-white placeholder-gray-500 focus:outline-none ${
                    errors.email ? 'border-red-500' : 'border-gray-700 focus:border-gray-600'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg bg-neutral-800 border transition-colors text-white placeholder-gray-500 focus:outline-none ${
                    errors.phone ? 'border-red-500' : 'border-gray-700 focus:border-gray-600'
                  }`}
                  placeholder="+48 123 456 789"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-8 border-t border-gray-800 mt-8">
              <button
                onClick={onBack}
                className="flex-1 px-5 py-2.5 rounded-lg bg-neutral-900 border border-gray-700 text-white hover:bg-white hover:text-black font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-5 py-2.5 rounded-lg bg-white text-black hover:bg-black hover:text-white font-semibold transition-colors cursor-pointer"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerInfo;
