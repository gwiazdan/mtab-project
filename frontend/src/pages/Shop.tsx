import { fetchWithAuth } from '../api/auth';
import React, { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PriceRangeSlider from '../components/PriceRangeSlider';
import LoadingScreen from '../components/LoadingScreen';

interface PaginatedResponse {
  items: Book[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface Genre {
  id: number;
  name: string;
}

interface Author {
  id: number;
  name: string;
}

interface Publisher {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 12;

const Shop: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedGenres, setExpandedGenres] = useState(false);
  const [expandedAuthors, setExpandedAuthors] = useState(false);
  const [expandedPublishers, setExpandedPublishers] = useState(false);
  const [expandedPrice, setExpandedPrice] = useState(false);
  const { addItem } = useCart();
  const { logout } = useAuth();

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedGenres.length > 0 || selectedAuthors.length > 0 || selectedPublishers.length > 0 || minPrice !== null || maxPrice !== null;

  // Auto-logout admin when visiting shop page
  useEffect(() => {
    const isAdmin = localStorage.getItem('adminSessionToken');
    if (isAdmin) {
      logout();
    }
  }, [logout]);

  // Fetch genres, authors, publishers on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [genresRes, authorsRes, publishersRes] = await Promise.all([
          fetchWithAuth('/api/v1/genres/'),
          fetchWithAuth('/api/v1/authors/'),
          fetchWithAuth('/api/v1/publishers/'),
        ]);
        setGenres(await genresRes.json());
        setAuthors(await authorsRes.json());
        setPublishers(await publishersRes.json());
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  // Listen for search updates from navbar
  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSearchQuery(customEvent.detail);
      setCurrentPage(1); // Reset to first page on search
    };

    window.addEventListener('searchUpdate', handleSearch);
    return () => window.removeEventListener('searchUpdate', handleSearch);
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        if (searchQuery) params.append('search', searchQuery);
        selectedGenres.forEach(id => params.append('genre_ids', id.toString()));
        selectedAuthors.forEach(id => params.append('author_ids', id.toString()));
        selectedPublishers.forEach(id => params.append('publisher_ids', id.toString()));
        if (minPrice !== null) params.append('min_price', minPrice.toString());
        if (maxPrice !== null) params.append('max_price', maxPrice.toString());

        const response = await fetchWithAuth(
          `/api/v1/books/?${params.toString()}`
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
  }, [currentPage, searchQuery, selectedGenres, selectedAuthors, selectedPublishers, minPrice, maxPrice]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Filters Section - Header always visible */}
      <div className="mb-8 bg-neutral-900 border border-gray-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-800 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          <div className="flex items-center gap-2">
            {(selectedGenres.length > 0 || selectedAuthors.length > 0 || selectedPublishers.length > 0 || minPrice !== null || maxPrice !== null) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGenres([]);
                  setSelectedAuthors([]);
                  setSelectedPublishers([]);
                  setMinPrice(null);
                  setMaxPrice(null);
                  setCurrentPage(1);
                }}
                className="text-xs uppercase tracking-wider hover:text-gray-300 transition-colors"
              >
                Clear all
              </button>
            )}
            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </button>

        {showFilters && (
          <div className="p-4 pt-0 space-y-1.5">
              {/* Genres Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => setExpandedGenres(!expandedGenres)}
                  className="w-full px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-sm text-gray-300">Category</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedGenres ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {expandedGenres && (
                  <div className="px-3 py-2 bg-neutral-800 space-y-1.5 max-h-48 overflow-y-auto">
                    {genres.map((genre) => {
                        const count = books.filter(b => b.genres.some(g => g.id === genre.id)).length;
                        return (
                          <label key={genre.id} className="flex items-center gap-2 cursor-pointer text-sm py-1">
                            <input
                              type="checkbox"
                              checked={selectedGenres.includes(genre.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedGenres([...selectedGenres, genre.id]);
                                } else {
                                  setSelectedGenres(selectedGenres.filter(id => id !== genre.id));
                                }
                                setCurrentPage(1);
                              }}
                              className="w-4 h-4 bg-neutral-700 border border-gray-600 rounded accent-blue-500 cursor-pointer"
                            />
                            <span className="text-gray-300 flex-1">{genre.name}</span>
                            <span className="text-xs text-gray-500">({count})</span>
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Authors Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => setExpandedAuthors(!expandedAuthors)}
                  className="w-full px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-sm text-gray-300">Author</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedAuthors ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {expandedAuthors && (
                  <div className="px-3 py-2 bg-neutral-800 space-y-1.5 max-h-48 overflow-y-auto">
                    {authors.map((author) => {
                        const count = books.filter(b => b.authors.some(a => a.id === author.id)).length;
                        return (
                          <label key={author.id} className="flex items-center gap-2 cursor-pointer text-sm py-1">
                            <input
                              type="checkbox"
                              checked={selectedAuthors.includes(author.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAuthors([...selectedAuthors, author.id]);
                                } else {
                                  setSelectedAuthors(selectedAuthors.filter(id => id !== author.id));
                                }
                                setCurrentPage(1);
                              }}
                              className="w-4 h-4 bg-neutral-700 border border-gray-600 rounded accent-blue-500 cursor-pointer"
                            />
                            <span className="text-gray-300 flex-1">{author.name}</span>
                            <span className="text-xs text-gray-500">({count})</span>
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Publishers Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => setExpandedPublishers(!expandedPublishers)}
                  className="w-full px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-sm text-gray-300">Publisher</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedPublishers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {expandedPublishers && (
                  <div className="px-3 py-2 bg-neutral-800 space-y-1.5 max-h-48 overflow-y-auto">
                    {publishers.map((publisher) => {
                        const count = books.filter(b => b.publisher.id === publisher.id).length;
                        return (
                          <label key={publisher.id} className="flex items-center gap-2 cursor-pointer text-sm py-1">
                            <input
                              type="checkbox"
                              checked={selectedPublishers.includes(publisher.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPublishers([...selectedPublishers, publisher.id]);
                                } else {
                                  setSelectedPublishers(selectedPublishers.filter(id => id !== publisher.id));
                                }
                                setCurrentPage(1);
                              }}
                              className="w-4 h-4 bg-neutral-700 border border-gray-600 rounded accent-blue-500 cursor-pointer"
                            />
                            <span className="text-gray-300 flex-1">{publisher.name}</span>
                            <span className="text-xs text-gray-500">({count})</span>
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => setExpandedPrice(!expandedPrice)}
                  className="w-full px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-sm text-gray-300">Price</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedPrice ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {expandedPrice && (
                  <div className="px-3 py-3 bg-neutral-800">
                    <PriceRangeSlider
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      onChange={(min, max) => {
                        setMinPrice(min);
                        setMaxPrice(max);
                        setCurrentPage(1);
                      }}
                      minBound={0}
                      maxBound={1000}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      {/* Loading state */}
      {loading && <LoadingScreen />}

      {/* No books message */}
      {!loading && books.length === 0 && (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="text-xl text-gray-400">No books available</div>
        </div>
      )}

      {/* Books Grid - Only shown when there are books */}
      {!loading && books.length > 0 && (
        <div key={currentPage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 fade-in">
          {books.map((book) => (
          <div
            key={book.id}
            onClick={() => setSelectedBook(book)}
            className="bg-neutral-900 p-4 border border-gray-800 rounded-lg shadow-xs hover:shadow-md transition-shadow cursor-pointer"
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
                onClick={(e) => {
                  e.stopPropagation();
                  addItem(book);
                }}
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
      )}

      {/* Pagination */}
      {!loading && books.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-8">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 text-white transition-colors cursor-pointer"
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
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
            className="px-4 py-2 border border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 text-white transition-colors cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}

      {/* Book Preview Modal */}
      {selectedBook && (
        <>
          {/* Overlay blur background */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedBook(null)}
          />

          {/* Modal card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-gray-800 rounded-lg">
              {/* Header with back button */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-neutral-900">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="flex items-center justify-center w-10 h-10 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-xl cursor-pointer"
                >
                  ←
                </button>
                <h2 className="text-2xl font-bold text-white">{selectedBook.title}</h2>
                <div className="w-6" /> {/* Spacer for centering */}
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left: Book Image */}
                  <div className="md:col-span-1 flex flex-col items-center">
                    <div className="bg-gray-800 rounded-lg w-full aspect-[2/3] flex items-center justify-center mb-4">
                      <img
                        src={`/book-placeholder.svg`}
                        alt={selectedBook.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"%3E%3Crect fill="%23374151" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%239CA3AF" text-anchor="middle" dominant-baseline="middle" font-family="Arial"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    {/* Availability Badge */}
                    <div className="w-full text-center">
                      <span className={`inline-block px-4 py-2 rounded-lg font-medium ${
                        selectedBook.stock > 0
                          ? 'bg-green-900 text-green-400 border border-green-700'
                          : 'bg-red-900 text-red-400 border border-red-700'
                      }`}>
                        {selectedBook.stock > 0
                          ? `${selectedBook.stock} in stock`
                          : 'Out of stock'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Book Details */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Authors */}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Authors</p>
                      <p className="text-lg text-white">
                        {selectedBook.authors && selectedBook.authors.length > 0
                          ? selectedBook.authors.map((a) => a.name).join(', ')
                          : 'Unknown Author'}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Description</h3>
                      <p className="text-gray-400 leading-relaxed">
                        {selectedBook.description || 'No description available'}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-800 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">ISBN</p>
                        <p className="text-white">{selectedBook.isbn || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">Year</p>
                        <p className="text-white">{selectedBook.published_year || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-medium text-gray-400 mb-1">Publisher</p>
                        <p className="text-white">{selectedBook.publisher?.name || 'Unknown'}</p>
                      </div>
                    </div>

                    {/* Genres */}
                    {selectedBook.genres && selectedBook.genres.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-2">Genres</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedBook.genres.map((genre) => (
                            <span
                              key={genre.id}
                              className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price & Add to Cart */}
                    <div className="pt-6 border-t border-gray-800 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">Price</p>
                        <p className="text-4xl font-bold text-white">
                          {selectedBook.price.toFixed(2)} zł
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addItem(selectedBook);
                          setSelectedBook(null);
                        }}
                        className="inline-flex items-center gap-2 text-black bg-white hover:bg-black hover:text-white rounded-lg font-semibold px-6 py-3 transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" viewBox="0 -1.02 19.036 19.036" xmlns="http://www.w3.org/2000/svg">
                          <path d="M379.806,829.36c-.678,1.556-1.213,2.66-2.709,2.66h-8.128a2.664,2.664,0,0,1-2.71-2.66l-.316-5.346v-1.722l-2.911-2.589.7-.708,3.158,2.755h.049v2.264h15.125Zm-12.849-4.382.292,4.382a1.874,1.874,0,0,0,1.72,1.633H377.1c.9,0,1.24-.72,1.626-1.633l1.93-4.382Zm2.017,1.013h8.949v1h-8.949ZM375.952,829h-6.978v-1h6.978Zm-7.478,4a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,368.474,833Zm-.531,1.969h1V834h-1ZM376.474,833a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,376.474,833Zm-.531,1.969h1V834h-1Z" transform="translate(-363.032 -818.995)" fill="currentColor"/>
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Shop;
