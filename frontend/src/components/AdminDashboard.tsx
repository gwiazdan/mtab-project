import { fetchWithAuth } from '../api/auth';
import React, { useState, useEffect } from 'react';

export const AdminDashboard: React.FC = () => {
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [totalGenres, setTotalGenres] = useState(0);
  const [totalPublishers, setTotalPublishers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth('/api/v1/stats/');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setTotalBooks(data.total_books);
      setTotalOrders(data.total_orders);
      setTotalAuthors(data.total_authors);
      setTotalGenres(data.total_genres);
      setTotalPublishers(data.total_publishers);
      setTotalRevenue(data.total_revenue);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Books',
      value: totalBooks.toString(),
      icon: (
        <svg className="w-6 h-6 text-neutral-900" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 1H8V15H5V1Z"/>
          <path d="M0 3H3V15H0V3Z"/>
          <path d="M12.167 3L9.34302 3.7041L12.1594 15L14.9834 14.2959L12.167 3Z"/>
        </svg>
      ),
    },
    {
      label: 'Orders',
      value: totalOrders.toString(),
      icon: (
        <svg className="w-6 h-6 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Authors',
      value: totalAuthors.toString(),
      icon: (
        <svg className="w-6 h-6 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
    },
    {
      label: 'Genres',
      value: totalGenres.toString(),
      icon: (
        <svg className="w-6 h-6 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
      ),
    },
    {
      label: 'Publishers',
      value: totalPublishers.toString(),
      icon: (
        <svg className="w-6 h-6 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2V17zm4 0h-2V7h2V17zm4 0h-2v-4h2V17z" />
        </svg>
      ),
    },
    {
      label: 'Revenue',
      value: `${totalRevenue.toFixed(2)} zł`,
      icon: (
        <svg className="w-6 h-6 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 9c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>;
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-neutral-900 border border-gray-800 rounded-lg p-8 shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                {stat.icon}
              </div>
              <div className="text-end">
                <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
