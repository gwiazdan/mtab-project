import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import OrderSummary from '../components/OrderSummary';
import AdminNavbar from '../components/AdminNavbar';


const Layout: React.FC = () => {
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const location = useLocation();
  const isShop = location.pathname === '/' || location.pathname === '/shop';

  const handleLogout = () => {
    localStorage.removeItem('adminSessionToken');
    localStorage.removeItem('adminRequiresPasswordChange');
    window.location.href = '/';
  };

  const isAdmin = localStorage.getItem('adminSessionToken');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 flex flex-col bg-background border-b border-gray-800 px-4 pr-0 md:pr-4">
        {/* Main navbar row */}
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/bookshelf.svg" alt="Bookstore" className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-wider hidden sm:inline">Bookstore</span>
          </Link>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Searchbar - centered, expands left on focus */}
          {isShop && !isAdmin && (
            <div className="relative w-48 focus-within:w-64 transition-all duration-300 flex-shrink-0 mr-3">
              <div className="relative flex items-center px-3 py-2 bg-neutral-800 border border-gray-700 rounded-lg text-white focus-within:border-gray-600 focus-within:ring-1 focus-within:ring-gray-600 transition-colors">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setSearchQuery(newValue);
                    window.dispatchEvent(new CustomEvent('searchUpdate', { detail: newValue }));
                  }}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm pr-8"
                />
                <svg
                  className="absolute right-3 w-4 h-4 text-gray-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Right side - Cart Icon */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Cart Icon - Hidden for admins */}
            {!isAdmin && (
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
            )}

            {/* Admin Logout Button */}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 border border-gray-700 rounded-lg transition-colors text-white uppercase tracking-wide flex items-center justify-center cursor-pointer"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Admin Navbar - Only for admins */}
      {isAdmin && <AdminNavbar />}

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
