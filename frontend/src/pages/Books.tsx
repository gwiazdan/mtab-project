import React, { useState, useEffect } from 'react';

interface Author {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface Publisher {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  isbn: string | null;
  published_year: number | null;
  publisher_id: number;
  authors: Author[];
  genres: Genre[];
  publisher: Publisher | null;
}

export const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    isbn: '',
    published_year: '',
    publisher_id: '',
    author_ids: [] as number[],
    genre_ids: [] as number[],
  });
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    fetchBooksData();
  }, []);

  const fetchBooksData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/books/metadata?limit=100');
      if (!response.ok) throw new Error('Failed to fetch books data');
      const data = await response.json();
      setBooks(data.books.items || []);
      setPublishers(data.publishers || []);
      setAuthors(data.authors || []);
      setGenres(data.genres || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load books';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = (pageItems: Book[]) => {
    if (selectedIds.size === pageItems.length && pageItems.every(item => selectedIds.has(item.id))) {
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set(selectedIds);
      pageItems.forEach(item => newSelected.add(item.id));
      setSelectedIds(newSelected);
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.publisher_id) {
      setError('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/books/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          published_year: formData.published_year ? parseInt(formData.published_year) : null,
          publisher_id: parseInt(formData.publisher_id),
          author_ids: formData.author_ids,
          genre_ids: formData.genre_ids,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add book');
      }

      setError('');
      setFormData({
        title: '',
        description: '',
        price: '',
        stock: '',
        isbn: '',
        published_year: '',
        publisher_id: '',
        author_ids: [],
        genre_ids: [],
      });
      setShowAddForm(false);
      await fetchBooksData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add book';
      setError(errorMessage);
    }
  };

  const handleEditBook = (book: Book) => {
    setFormData({
      title: book.title,
      description: book.description || '',
      price: book.price.toString(),
      stock: book.stock.toString(),
      isbn: book.isbn || '',
      published_year: book.published_year?.toString() || '',
      publisher_id: book.publisher_id.toString(),
      author_ids: book.authors.map(a => a.id),
      genre_ids: book.genres.map(g => g.id),
    });
    setEditingBookId(book.id);
    setShowEditForm(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.publisher_id || editingBookId === null) {
      setError('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/books/${editingBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          published_year: formData.published_year ? parseInt(formData.published_year) : null,
          publisher_id: parseInt(formData.publisher_id),
          author_ids: formData.author_ids,
          genre_ids: formData.genre_ids,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update book');
      }

      setError('');
      setFormData({
        title: '',
        description: '',
        price: '',
        stock: '',
        isbn: '',
        published_year: '',
        publisher_id: '',
        author_ids: [],
        genre_ids: [],
      });
      setShowEditForm(false);
      setEditingBookId(null);
      await fetchBooksData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update book';
      setError(errorMessage);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) {
      setError('No books selected');
      return;
    }

    setDeleteCount(selectedIds.size);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/books/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_ids: Array.from(selectedIds),
        }),
      });

      if (!response.ok) throw new Error('Failed to delete books');

      setError('');
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      await fetchBooksData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete books');
      setShowDeleteConfirm(false);
    }
  };

  const paginatedBooks = books.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(books.length / itemsPerPage);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading books...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Books</h1>
          <p className="text-gray-400 mt-1">Manage your book catalog</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer uppercase tracking-wide text-sm"
        >
          + Add Book
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-neutral-800 border border-gray-700 p-4 rounded-lg flex items-center justify-between">
          <span className="text-white font-medium">{selectedIds.size} book(s) selected</span>
          <div className="flex gap-3">
            <button
              onClick={bulkDelete}
              className="px-4 py-2 bg-red-900 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-neutral-800 rounded-lg overflow-hidden border border-gray-700">
        <table className="w-full">
          <thead className="bg-neutral-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && paginatedBooks.every(item => selectedIds.has(item.id))}
                  onChange={() => toggleSelectAll(paginatedBooks)}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ISBN</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Publisher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedBooks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No books found
                </td>
              </tr>
            ) : (
              paginatedBooks.map((book) => (
                <React.Fragment key={book.id}>
                  <tr className="hover:bg-neutral-700 transition-colors cursor-pointer" onClick={() => toggleExpanded(book.id)}>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(book.id)}
                          onChange={() => toggleSelection(book.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <button
                          onClick={() => toggleExpanded(book.id)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors cursor-pointer"
                        >
                          {expandedIds.has(book.id) ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.00003 8.1716L3.41424 3.58582L0.585815 6.41424L8.00003 13.8285L15.4142 6.41424L12.5858 3.58582L8.00003 8.1716Z" fill="#9CA3AF"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.00003 7.82842L12.5858 12.4142L15.4142 9.58578L8.00003 2.17157L0.585815 9.58578L3.41424 12.4142L8.00003 7.82842Z" fill="#9CA3AF"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{book.title}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{book.isbn || 'N/A'}</td>
                    <td className="px-6 py-4 text-white font-medium">{book.price.toFixed(2)} zł</td>
                    <td className="px-6 py-4 text-gray-400">{book.stock}</td>
                    <td className="px-6 py-4 text-gray-400">{book.publisher?.name || 'N/A'}</td>
                  </tr>
                  {expandedIds.has(book.id) && (
                    <tr className="bg-neutral-700">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="space-y-3">
                          {book.description && (
                            <div>
                              <p className="text-gray-300 text-sm font-medium mb-1">Description:</p>
                              <p className="text-gray-400 text-sm">{book.description}</p>
                            </div>
                          )}
                          {book.authors.length > 0 && (
                            <div>
                              <p className="text-gray-300 text-sm font-medium mb-1">Authors:</p>
                              <p className="text-gray-400 text-sm">{book.authors.map(a => a.name).join(', ')}</p>
                            </div>
                          )}
                          {book.genres.length > 0 && (
                            <div>
                              <p className="text-gray-300 text-sm font-medium mb-1">Genres:</p>
                              <p className="text-gray-400 text-sm">{book.genres.map(g => g.name).join(', ')}</p>
                            </div>
                          )}
                          {book.published_year && (
                            <div>
                              <p className="text-gray-300 text-sm font-medium">Published: {book.published_year}</p>
                            </div>
                          )}
                          <div className="flex gap-4 pt-3 border-t border-gray-600">
                            <button
                              onClick={() => handleEditBook(book)}
                              className="px-3 py-1 bg-white text-black hover:bg-gray-200 text-sm font-medium rounded-lg transition-colors cursor-pointer uppercase tracking-wide"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedIds(new Set([book.id]));
                                setDeleteCount(1);
                                setShowDeleteConfirm(true);
                              }}
                              className="px-3 py-1 bg-red-900 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer uppercase tracking-wide"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  onClick={() => setCurrentPage(page)}
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
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 text-white transition-colors cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh]">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">Add New Book</h2>

              <form onSubmit={handleAddBook} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="Book title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">ISBN</label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="ISBN"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Price *</label>
                    <input
                      type="text"
                      pattern="[0-9]*\.?[0-9]*"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="0.00"
                      style={{
                        WebkitOuterSpinButton: { WebkitAppearance: 'none', margin: 0 },
                        WebkitInnerSpinButton: { WebkitAppearance: 'none', margin: 0 },
                        MozAppearance: 'textfield'
                      } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Stock</label>
                    <input
                      type="text"
                      pattern="[0-9]*"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="0"
                      style={{
                        WebkitOuterSpinButton: { WebkitAppearance: 'none', margin: 0 },
                        WebkitInnerSpinButton: { WebkitAppearance: 'none', margin: 0 },
                        MozAppearance: 'textfield'
                      } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1\">Published Year</label>
                    <input
                      type="text"
                      pattern="[0-9]*"
                      value={formData.published_year}
                      onChange={(e) => setFormData({ ...formData, published_year: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="2026"
                      style={{
                        WebkitOuterSpinButton: { WebkitAppearance: 'none', margin: 0 },
                        WebkitInnerSpinButton: { WebkitAppearance: 'none', margin: 0 },
                        MozAppearance: 'textfield'
                      } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Publisher *</label>
                    <select
                      value={formData.publisher_id}
                      onChange={(e) => setFormData({ ...formData, publisher_id: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    >
                      <option value="">Select publisher</option>
                      {publishers.map((pub) => (
                        <option key={pub.id} value={pub.id}>
                          {pub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none h-24 resize-none"
                    placeholder="Book description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Authors</label>
                    <div className="bg-neutral-800 border border-gray-700 rounded-lg p-2 max-h-32 overflow-y-auto">
                      {authors.map((author) => (
                        <label key={author.id} className="flex items-center gap-2 text-white text-sm mb-1 cursor-pointer hover:bg-neutral-700 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.author_ids.includes(author.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  author_ids: [...formData.author_ids, author.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  author_ids: formData.author_ids.filter(id => id !== author.id),
                                });
                              }
                            }}
                            className="cursor-pointer"
                          />
                          {author.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Genres</label>
                    <div className="bg-neutral-800 border border-gray-700 rounded-lg p-2 max-h-32 overflow-y-auto">
                      {genres.map((genre) => (
                        <label key={genre.id} className="flex items-center gap-2 text-white text-sm mb-1 cursor-pointer hover:bg-neutral-700 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.genre_ids.includes(genre.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  genre_ids: [...formData.genre_ids, genre.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  genre_ids: formData.genre_ids.filter(id => id !== genre.id),
                                });
                              }
                            }}
                            className="cursor-pointer"
                          />
                          {genre.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Add Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh]">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">Edit Book</h2>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="Book title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">ISBN</label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="ISBN"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Price *</label>
                    <input
                      type="text"
                      pattern="[0-9]*\.?[0-9]*"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Stock</label>
                    <input
                      type="text"
                      pattern="[0-9]*"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Published Year</label>
                    <input
                      type="text"
                      pattern="[0-9]*"
                      value={formData.published_year}
                      onChange={(e) => setFormData({ ...formData, published_year: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                      placeholder="2026"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Publisher *</label>
                    <select
                      value={formData.publisher_id}
                      onChange={(e) => setFormData({ ...formData, publisher_id: e.target.value })}
                      className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    >
                      <option value="">Select publisher</option>
                      {publishers.map((pub) => (
                        <option key={pub.id} value={pub.id}>
                          {pub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none h-24 resize-none"
                    placeholder="Book description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Authors</label>
                    <div className="bg-neutral-800 border border-gray-700 rounded-lg p-2 max-h-32 overflow-y-auto">
                      {authors.map((author) => (
                        <label key={author.id} className="flex items-center gap-2 text-white text-sm mb-1 cursor-pointer hover:bg-neutral-700 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.author_ids.includes(author.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  author_ids: [...formData.author_ids, author.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  author_ids: formData.author_ids.filter(id => id !== author.id),
                                });
                              }
                            }}
                            className="cursor-pointer"
                          />
                          {author.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Genres</label>
                    <div className="bg-neutral-800 border border-gray-700 rounded-lg p-2 max-h-32 overflow-y-auto">
                      {genres.map((genre) => (
                        <label key={genre.id} className="flex items-center gap-2 text-white text-sm mb-1 cursor-pointer hover:bg-neutral-700 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.genre_ids.includes(genre.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  genre_ids: [...formData.genre_ids, genre.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  genre_ids: formData.genre_ids.filter(id => id !== genre.id),
                                });
                              }
                            }}
                            className="cursor-pointer"
                          />
                          {genre.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingBookId(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-gray-700 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
                <p className="text-gray-400 text-sm mt-1">This action cannot be undone.</p>
              </div>

              <div className="bg-red-900 border border-red-700 rounded p-3">
                <p className="text-red-100 text-sm">
                  Are you sure you want to delete {deleteCount} book{deleteCount !== 1 ? 's' : ''}?
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
