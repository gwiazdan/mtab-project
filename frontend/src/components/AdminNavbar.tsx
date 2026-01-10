import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
}

const AdminNavbar: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Books', path: '/admin/books' },
    { label: 'Authors', path: '/admin/authors' },
    { label: 'Genres', path: '/admin/genres' },
    { label: 'Publishers', path: '/admin/publishers' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-16 z-30 bg-neutral-900 border-b border-gray-800 px-4 py-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-0 py-3 text-xs font-semibold tracking-widest transition-colors whitespace-nowrap uppercase ${
                isActive(item.path)
                  ? 'text-white font-bold border-b-2 border-white'
                  : 'text-gray-400 hover:text-white border-b-2 border-transparent'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
