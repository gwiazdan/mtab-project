import React, { useState, useEffect } from 'react';

interface Genre {
  id: number;
  name: string;
  description: string | null;
}

export const Genres: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingGenreId, setEditingGenreId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/genres/');
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      setGenres(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load genres';
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

  const toggleSelectAll = (pageItems: Genre[]) => {
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

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/genres/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add genre');
      }

      setError('');
      setFormData({
        name: '',
        description: '',
      });
      setShowAddForm(false);
      await fetchGenres();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add genre';
      setError(errorMessage);
    }
  };

  const handleEditGenre = (genre: Genre) => {
    setFormData({
      name: genre.name,
      description: genre.description || '',
    });
    setEditingGenreId(genre.id);
    setShowEditForm(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || editingGenreId === null) {
      setError('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/genres/${editingGenreId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update genre');
      }

      setError('');
      setFormData({
        name: '',
        description: '',
      });
      setShowEditForm(false);
      setEditingGenreId(null);
      await fetchGenres();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update genre';
      setError(errorMessage);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) {
      setError('No genres selected');
      return;
    }

    setDeleteCount(selectedIds.size);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete genres one by one since there's no bulk delete endpoint
      for (const id of selectedIds) {
        const response = await fetch(`http://localhost:8000/api/v1/genres/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete genre');
      }

      setError('');
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      await fetchGenres();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete genres');
      setShowDeleteConfirm(false);
    }
  };

  const paginatedGenres = genres.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(genres.length / itemsPerPage);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading genres...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Genres</h1>
          <p className="text-gray-400 mt-1">Manage your genres</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer uppercase tracking-wide text-sm"
        >
          + Add Genre
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
          <span className="text-white font-medium">{selectedIds.size} genre(s) selected</span>
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
                  checked={selectedIds.size > 0 && paginatedGenres.every(item => selectedIds.has(item.id))}
                  onChange={() => toggleSelectAll(paginatedGenres)}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedGenres.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                  No genres found
                </td>
              </tr>
            ) : (
              paginatedGenres.map((genre) => (
                <React.Fragment key={genre.id}>
                  <tr className="hover:bg-neutral-700 transition-colors cursor-pointer" onClick={() => toggleExpanded(genre.id)}>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(genre.id)}
                          onChange={() => toggleSelection(genre.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <button
                          onClick={() => toggleExpanded(genre.id)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors cursor-pointer"
                        >
                          {expandedIds.has(genre.id) ? (
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
                    <td className="px-6 py-4 text-white font-medium">{genre.name}</td>
                  </tr>
                  {expandedIds.has(genre.id) && (
                    <tr className="bg-neutral-700">
                      <td colSpan={2} className="px-6 py-4">
                        <div className="space-y-3">
                          {genre.description && (
                            <div>
                              <p className="text-gray-300 text-sm font-medium mb-1">Description:</p>
                              <p className="text-gray-400 text-sm">{genre.description}</p>
                            </div>
                          )}
                          <div className="flex gap-4 pt-3 border-t border-gray-600">
                            <button
                              onClick={() => handleEditGenre(genre)}
                              className="px-3 py-1 bg-white text-black hover:bg-gray-200 text-sm font-medium rounded-lg transition-colors cursor-pointer uppercase tracking-wide"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedIds(new Set([genre.id]));
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

      {/* Add Genre Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh]">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">Add New Genre</h2>

              <form onSubmit={handleAddGenre} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    placeholder="Genre name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none h-24 resize-none"
                    placeholder="Genre description"
                  />
                </div>

                <div className="flex gap-3">
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
                    Add Genre
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Genre Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh]">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">Edit Genre</h2>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    placeholder="Genre name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none h-24 resize-none"
                    placeholder="Genre description"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
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
              <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
              <p className="text-gray-300">
                Are you sure you want to delete {deleteCount} genre{deleteCount !== 1 ? 's' : ''}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-900 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
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
