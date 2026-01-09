import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import OrderSummary from '../components/OrderSummary';


const Layout: React.FC = () => {
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const { itemCount } = useCart();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  const isAdmin = localStorage.getItem('adminToken');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 flex justify-between bg-background border-b border-gray-800 h-16 px-4 pr-0 md:pr-4">
        <div className="flex w-full select-none flex-row items-center">
          <div className="flex flex-shrink-0 flex-row items-center gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <img src="/bookshelf.svg" alt="Bookstore" className="w-8 h-8" />
                <span className="text-2xl font-bold tracking-wider">Bookstore</span>
              </Link>
            </div>
          </div>
        </div>
        <div className='items-center gap-4 flex pr-4'>
          {/* Cart Icon */}
          <button
            onClick={() => setShowOrderSummary(true)}
            className="relative flex items-center justify-center w-8 h-8 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg viewBox="0 -1.02 19.036 19.036" xmlns="http://www.w3.org/2000/svg">
              <path d="M379.806,829.36c-.678,1.556-1.213,2.66-2.709,2.66h-8.128a2.664,2.664,0,0,1-2.71-2.66l-.316-5.346v-1.722l-2.911-2.589.7-.708,3.158,2.755h.049v2.264h15.125Zm-12.849-4.382.292,4.382a1.874,1.874,0,0,0,1.72,1.633H377.1c.9,0,1.24-.72,1.626-1.633l1.93-4.382Zm2.017,1.013h8.949v1h-8.949ZM375.952,829h-6.978v-1h6.978Zm-7.478,4a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,368.474,833Zm-.531,1.969h1V834h-1ZM376.474,833a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,376.474,833Zm-.531,1.969h1V834h-1Z" transform="translate(-363.032 -818.995)" fill="currentColor"/>
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>


          {/* Admin Logout Button */}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm font-medium bg-gray-700 hover:bg-gray-800 rounded-lg transition-colors text-white"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p>&copy; 2026 MTAB Project. All rights reserved.</p>
        </div>
      </footer>

      {/* Order Summary Modal */}
      <OrderSummary isOpen={showOrderSummary} onClose={() => setShowOrderSummary(false)} />
    </div>
  );
};

export default Layout;
