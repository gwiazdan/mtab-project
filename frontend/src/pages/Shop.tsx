import React, { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface PaginatedResponse {
  items: Book[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const ITEMS_PER_PAGE = 12;

const Shop: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { addItem } = useCart();
  const { logout } = useAuth();

  // Auto-logout admin when visiting shop page
  useEffect(() => {
    const isAdmin = localStorage.getItem('adminSessionToken');
    if (isAdmin) {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/books/?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        const data: PaginatedResponse = await response.json();
        setBooks(data.items);
        setTotalPages(data.pages);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-xl text-gray-400">Loading books...</div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-xl text-gray-400">No books available</div>
      </div>
    );
  }

  return (
    <>
      {/* Books Grid */}
      <div key={currentPage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 fade-in">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-neutral-900 p-4 border border-gray-800 rounded-lg shadow-xs hover:shadow-md transition-shadow"
          >
            {/* Book Image Placeholder */}
            <div className="mb-4 bg-gray-800 rounded-lg w-full aspect-square flex items-center justify-center">
              <img
                src={`/book-placeholder.svg`}
                alt={book.title}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"%3E%3Crect fill="%23374151" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%239CA3AF" text-anchor="middle" dominant-baseline="middle" font-family="Arial"%3ENo image%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Rating & Stock Info */}
            <div className="flex items-center justify-end mb-4">
              <span className="text-xs font-medium bg-gray-700 px-2 py-1 rounded">
                {book.stock} in stock
              </span>
            </div>

            {/* Title */}
            <h5 className="text-lg font-semibold text-white mb-2 line-clamp-2 h-14">
              {book.title}
            </h5>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {book.description || 'Brak opisu'}
            </p>

            {/* Authors */}
            <p className="text-xs text-gray-500 mb-3">
              {book.authors && book.authors.length > 0
                ? book.authors.map((a) => a.name).join(', ')
                : 'Brak autora'}
            </p>

            {/* Price & Add to Cart */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-2xl font-bold text-white">
                {book.price.toFixed(2)} zł
              </span>
              <button
                type="button"
                onClick={() => addItem(book)}
                className="inline-flex items-center gap-1.5 text-black bg-white hover:bg-black hover:text-white rounded-lg font-semibold px-3 py-2 transition-colors text-sm cursor-pointer"
              >
                <svg className="w-6 h-6" viewBox="0 -1.02 19.036 19.036" xmlns="http://www.w3.org/2000/svg">
                  <path d="M379.806,829.36c-.678,1.556-1.213,2.66-2.709,2.66h-8.128a2.664,2.664,0,0,1-2.71-2.66l-.316-5.346v-1.722l-2.911-2.589.7-.708,3.158,2.755h.049v2.264h15.125Zm-12.849-4.382.292,4.382a1.874,1.874,0,0,0,1.72,1.633H377.1c.9,0,1.24-.72,1.626-1.633l1.93-4.382Zm2.017,1.013h8.949v1h-8.949ZM375.952,829h-6.978v-1h6.978Zm-7.478,4a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,368.474,833Zm-.531,1.969h1V834h-1ZM376.474,833a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,376.474,833Zm-.531,1.969h1V834h-1Z" transform="translate(-363.032 -818.995)" fill="currentColor"/>
                </svg>
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-8">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 text-white transition-colors"
          >
            ← Previous
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            // Show first page, last page, current page and adjacent pages
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-white text-black'
                      : 'border border-gray-700 text-white hover:bg-gray-900'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (
              (page === currentPage - 2 && page > 1) ||
              (page === currentPage + 2 && page < totalPages)
            ) {
              return (
                <span key={page} className="text-gray-500">
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 text-white transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
};

export default Shop;
