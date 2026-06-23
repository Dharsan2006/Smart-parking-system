import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { bookingService } from '../services/bookingService';
import './BookingHistory.css';

const statusConfig = {
  PENDING:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CONFIRMED: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  ACTIVE:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  COMPLETED: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  CANCELLED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    bookingService.getMyBookings()
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <Layout>
      <div className="history-page">
        <div className="page-header">
          <h1>My Bookings</h1>
          <Link to="/parking-map" className="btn-primary">+ New Booking</Link>
        </div>

        <div className="filter-bar">
          {['ALL', 'ACTIVE', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f} {f !== 'ALL' && `(${bookings.filter(b => b.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No bookings found</p>
            <Link to="/parking-map" className="btn-primary">Book a Slot</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(b => {
              const config = statusConfig[b.status] || statusConfig.PENDING;
              return (
                <div key={b.id} className="booking-card">
                  <div className="booking-card-left">
                    <div className="slot-badge">
                      <span className="slot-num">{b.slotNumber}</span>
                      <span className="floor-num">Floor {b.floorNumber}</span>
                    </div>
                    <div className="booking-info">
                      <div className="booking-vehicle">🚗 {b.vehicleNumber}</div>
                      <div className="booking-time">
                        {new Date(b.bookingTime).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                      {b.durationHours && (
                        <div className="booking-duration">⏱ {b.durationHours.toFixed(1)} hours</div>
                      )}
                    </div>
                  </div>
                  <div className="booking-card-right">
                    <div className="booking-amount">
                      {b.totalAmount ? `₹${b.totalAmount.toFixed(2)}` : '-'}
                    </div>
                    <span className="status-badge" style={{ background: config.bg, color: config.color }}>
                      {b.status}
                    </span>
                    <Link to={`/bookings/${b.id}`} className="view-btn">View →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingHistory;
