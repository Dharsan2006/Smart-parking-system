import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { bookingService } from '../../services/bookingService';
import { Link } from 'react-router-dom';
import './AdminBookings.css';

const statusConfig = {
  PENDING:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CONFIRMED: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  ACTIVE:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  COMPLETED: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  CANCELLED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    bookingService.getAllBookings()
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings
    .filter(b => filter === 'ALL' || b.status === filter)
    .filter(b =>
      search === '' ||
      b.slotNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.userName?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Layout>
      <div className="admin-bookings-page">
        <div className="page-header">
          <div>
            <h1>All Bookings</h1>
            <p>{bookings.length} total bookings</p>
          </div>
        </div>

        <div className="controls-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search by slot, vehicle, user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="filter-bar">
            {['ALL', 'ACTIVE', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'PENDING'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading bookings...</div>
        ) : (
          <div className="bookings-table-wrap">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Slot</th>
                  <th>Vehicle</th>
                  <th>Booked At</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const config = statusConfig[b.status] || statusConfig.PENDING;
                  return (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td>{b.userName}</td>
                      <td>
                        <strong>{b.slotNumber}</strong>
                        <span className="floor-tag"> F{b.floorNumber}</span>
                      </td>
                      <td>{b.vehicleNumber}</td>
                      <td>{new Date(b.bookingTime).toLocaleDateString()}</td>
                      <td>{b.durationHours ? `${b.durationHours.toFixed(1)}h` : '-'}</td>
                      <td>₹{b.totalAmount?.toFixed(2) || '-'}</td>
                      <td>
                        <span className="status-badge" style={{ background: config.bg, color: config.color }}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.payment ? (
                          <span style={{ color: b.payment.status === 'COMPLETED' ? '#10b981' : '#f59e0b', fontSize: '0.82rem' }}>
                            {b.payment.status}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>-</span>
                        )}
                      </td>
                      <td>
                        <Link to={`/bookings/${b.id}`} className="view-link">View</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-table">No bookings found</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminBookings;
