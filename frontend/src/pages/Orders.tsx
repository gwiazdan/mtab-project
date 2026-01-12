import { fetchWithAuth } from '../api/auth';
import React, { useState, useEffect } from 'react';

interface OrderItem {
  id: number;
  book_id: number;
  quantity: number;
  price_at_purchase: number;
  book?: {
    id: number;
    title: string;
    price: number;
  };
}

interface Order {
  id: number;
  customer_name: string;
  email: string;
  phone: string | null;
  address: string;
  postal_code: string;
  status: 'pending' | 'done';
  total_price: number;
  items: OrderItem[];
  created_at: string;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetchWithAuth('/api/v1/orders/');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
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

  const toggleSelectAll = (pageItems: Order[]) => {
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

  const bulkUpdateStatus = async (newStatus: 'done' | 'pending') => {
    if (selectedIds.size === 0) {
      setError('No orders selected');
      return;
    }

    try {
      const response = await fetchWithAuth('/api/v1/orders/bulk-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_ids: Array.from(selectedIds),
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setError('');
      setSelectedIds(new Set());
      await fetchOrders(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) {
      setError('No orders selected');
      return;
    }

    setDeleteCount(selectedIds.size);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetchWithAuth('/api/v1/orders/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_ids: Array.from(selectedIds),
        }),
      });

      if (!response.ok) throw new Error('Failed to delete orders');

      setError('');
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      await fetchOrders(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete orders');
      setShowDeleteConfirm(false);
    }
  };

  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-gray-400 mt-1">Manage all customer orders</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-neutral-800 border border-gray-700 p-4 rounded-lg flex items-center justify-between">
          <span className="text-white font-medium">{selectedIds.size} order(s) selected</span>
          <div className="flex gap-3">
            <button
              onClick={() => bulkUpdateStatus('done')}
              className="px-4 py-2 bg-green-900 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Mark as Done
            </button>
            <button
              onClick={() => bulkUpdateStatus('pending')}
              className="px-4 py-2 bg-yellow-900 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Mark as Pending
            </button>
            <button
              onClick={bulkDelete}
              className="px-4 py-2 bg-red-900 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
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
                  checked={selectedIds.size > 0 && paginatedOrders.every(item => selectedIds.has(item.id))}
                  onChange={() => toggleSelectAll(paginatedOrders)}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-neutral-700 transition-colors cursor-pointer" onClick={() => toggleExpanded(order.id)}>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order.id)}
                          onChange={() => toggleSelection(order.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <button
                          onClick={() => toggleExpanded(order.id)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors cursor-pointer size-[24px]"
                          title={expandedIds.has(order.id) ? 'Collapse' : 'Expand'}
                        >
                          {expandedIds.has(order.id) ? (
                            <svg className="fill-white size-[13px]" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.00003 8.1716L3.41424 3.58582L0.585815 6.41424L8.00003 13.8285L15.4142 6.41424L12.5858 3.58582L8.00003 8.1716Z"/>
                            </svg>
                          ) : (
                            <svg className="fill-white size-[13px]" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.00003 7.82842L12.5858 12.4142L15.4142 9.58578L8.00003 2.17157L0.585815 9.58578L3.41424 12.4142L8.00003 7.82842Z"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">#{order.id}</td>
                    <td className="px-6 py-4 text-white">{order.customer_name}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{order.email}</td>
                    <td className="px-6 py-4 text-gray-400">{order.items.length}</td>
                    <td className="px-6 py-4 text-white font-medium">{order.total_price.toFixed(2)} zł</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'done'
                            ? 'bg-green-900 text-green-100'
                            : 'bg-yellow-900 text-yellow-100'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {(() => {
                        const date = new Date(order.created_at);
                        return date.toLocaleString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                      })()}
                    </td>
                  </tr>
                  {expandedIds.has(order.id) && (
                    <tr className="bg-neutral-700">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="space-y-4">
                          {/* Customer Info */}
                          <div>
                            <h4 className="text-white font-semibold text-sm mb-2">Delivery Address:</h4>
                            <div className="bg-neutral-800 p-3 rounded border border-gray-700 space-y-1">
                              <p className="text-white">{order.customer_name}</p>
                              <p className="text-gray-400 text-sm">{order.address}</p>
                              <p className="text-gray-400 text-sm">{order.postal_code}</p>
                              <p className="text-gray-400 text-sm">Email: {order.email}</p>
                              {order.phone && <p className="text-gray-400 text-sm">Phone: {order.phone}</p>}
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h4 className="text-white font-semibold text-sm mb-3">Order Items:</h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="bg-neutral-800 p-3 rounded border border-gray-700 flex justify-between items-center">
                                  <div>
                                    <p className="text-white font-medium">{item.book?.title || `Book #${item.book_id}`}</p>
                                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="text-white font-medium">{(item.price_at_purchase * item.quantity).toFixed(2)} zł</p>
                                </div>
                              ))}
                            </div>
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
                  Are you sure you want to delete {deleteCount} order{deleteCount !== 1 ? 's' : ''}?
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
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
