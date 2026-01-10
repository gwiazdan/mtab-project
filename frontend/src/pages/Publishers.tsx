import { fetchWithAuth } from '../api/auth';
import React, { useState, useEffect } from 'react';

interface Publisher {
  id: number;
  name: string;
  address: string | null;
  contact: string | null;
}

export const Publishers: React.FC = () => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPublisherId, setEditingPublisherId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
  });

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    try {
      const response = await fetchWithAuth('/api/v1/publishers/');
      if (!response.ok) throw new Error('Failed to fetch publishers');
      const data = await response.json();
      setPublishers(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load publishers';
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

  const toggleSelectAll = (pageItems: Publisher[]) => {
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

  const handleAddPublisher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError('Please fill in required fields');
      return;
    }

    try {
      const response = await fetchWithAuth('/api/v1/publishers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add publisher');
      }

      setError('');
      setFormData({
        name: '',
        address: '',
        contact: '',
      });
      setShowAddForm(false);
      await fetchPublishers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add publisher';
      setError(errorMessage);
    }
  };

  const handleEditPublisher = (publisher: Publisher) => {
    setFormData({
      name: publisher.name,
      address: publisher.address || '',
      contact: publisher.contact || '',
    });
    setEditingPublisherId(publisher.id);
    setShowEditForm(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || editingPublisherId === null) {
      setError('Please fill in required fields');
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/v1/publishers/${editingPublisherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update publisher');
      }

      setError('');
      setFormData({
        name: '',
        address: '',
        contact: '',
      });
      setShowEditForm(false);
      setEditingPublisherId(null);
      await fetchPublishers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update publisher';
      setError(errorMessage);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) {
      setError('No publishers selected');
      return;
    }

    setDeleteCount(selectedIds.size);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete publishers one by one since there's no bulk delete endpoint
      for (const id of selectedIds) {
        const response = await fetchWithAuth(`/api/v1/publishers/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete publisher');
      }

      setError('');
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      await fetchPublishers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete publishers');
      setShowDeleteConfirm(false);
    }
  };

  const paginatedPublishers = publishers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(publishers.length / itemsPerPage);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading publishers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Publishers</h1>
          <p className="text-gray-400 mt-1">Manage your publishers</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer uppercase tracking-wide text-sm"
        >
          + Add Publisher
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
          <span className="text-white font-medium">{selectedIds.size} publisher(s) selected</span>
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
                  checked={selectedIds.size > 0 && paginatedPublishers.every(item => selectedIds.has(item.id))}
                  onChange={() => toggleSelectAll(paginatedPublishers)}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedPublishers.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                  No publishers found
                </td>
              </tr>
            ) : (
              paginatedPublishers.map((publisher) => (
                <React.Fragment key={publisher.id}>
                  <tr className="hover:bg-neutral-700 transition-colors cursor-pointer" onClick={() => toggleExpanded(publisher.id)}>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(publisher.id)}
                          onChange={() => toggleSelection(publisher.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <button
                          onClick={() => toggleExpanded(publisher.id)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors cursor-pointer"
                        >
                          {expandedIds.has(publisher.id) ? (
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
                    <td className="px-6 py-4 text-white font-medium">{publisher.name}</td>
                  </tr>
                  {expandedIds.has(publisher.id) && (
                    <tr className="bg-neutral-700">
                      <td colSpan={2} className="px-6 py-4">
                        <div className="space-y-3">
                          {publisher.address && (
                            <div>
                              <p className="text-gray-300 text-sm font-medium mb-1">Address:</p>
                              <p className="text-gray-400 text-sm">{publisher.address}</p>
                            </div>
                          )}
                          {publisher.contact && (
                            <div>
                              <p className="text-gray-300 text-sm font-medium mb-1">Contact:</p>
                              <p className="text-gray-400 text-sm">{publisher.contact}</p>
                            </div>
                          )}
                          <div className="flex gap-4 pt-3 border-t border-gray-600">
                            <button
                              onClick={() => handleEditPublisher(publisher)}
                              className="px-3 py-1 bg-white text-black hover:bg-gray-200 text-sm font-medium rounded-lg transition-colors cursor-pointer uppercase tracking-wide"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedIds(new Set([publisher.id]));
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

      {/* Add Publisher Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh]">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">Add New Publisher</h2>

              <form onSubmit={handleAddPublisher} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    placeholder="Publisher name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    placeholder="Publisher address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Contact</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    placeholder="Contact info (email or phone)"
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
                    Add Publisher
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Publisher Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh]">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">Edit Publisher</h2>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    placeholder="Publisher name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    placeholder="Publisher address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Contact</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-neutral-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-white outline-none"
                    placeholder="Contact info (email or phone)"
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
                Are you sure you want to delete {deleteCount} publisher{deleteCount !== 1 ? 's' : ''}? This action cannot be undone.
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
