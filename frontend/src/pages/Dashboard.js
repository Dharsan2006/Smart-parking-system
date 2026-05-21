import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { parkingService } from '../services/parkingService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import './Dashboard.css';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card" style={{ '--accent': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useWebSocket('/topic/slots', (updatedSlots) => {
    setSlots(updatedSlots);
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotsRes, bookingsRes] = await Promise.all([
          parkingService.getAllSlots(),
          bookingService.getMyBookings(),
        ]);
        setSlots(slotsRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const available = slots.filter(s => s.status === 'AVAILABLE').length;
  const occupied = slots.filter(s => s.status === 'OCCUPIED').length;
  const reserved = slots.filter(s => s.status === 'RESERVED').length;
  const activeBooking = bookings.find(b => b.status === 'ACTIVE');
  const recentBookings = bookings.slice(0, 5);

  const statusColor = {
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    ACTIVE: '#10b981',
    COMPLETED: '#6b7280',
    CANCELLED: '#ef4444',
  };

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name} 👋</h1>
            <p>Here's your parking overview</p>
          </div>
          <Link to="/parking-map" className="btn-primary">
            🅿 Find Parking
          </Link>
        </div>

        {/* Active Booking Banner */}
        {activeBooking && (
          <div className="active-booking-banner">
            <div className="banner-left">
              <span className="pulse-dot"></span>
              <div>
                <strong>Active Parking Session</strong>
                <p>Slot {activeBooking.slotNumber} • Floor {activeBooking.floorNumber} • Vehicle: {activeBooking.vehicleNumber}</p>
              </div>
            </div>
            <Link to={`/bookings/${activeBooking.id}`} className="banner-btn">View Details →</Link>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon="🟢" label="Available Slots" value={available} color="#10b981" sub={`of ${slots.length} total`} />
          <StatCard icon="🔴" label="Occupied Slots" value={occupied} color="#ef4444" />
          <StatCard icon="🟡" label="Reserved Slots" value={reserved} color="#f59e0b" />
          <StatCard icon="📋" label="My Bookings" value={bookings.length} color="#6366f1" />
        </div>

        {/* Recent Bookings */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <Link to="/bookings">View All →</Link>
          </div>

          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : recentBookings.length === 0 ? (
            <div className="empty-state">
              <p>No bookings yet.</p>
              <Link to="/parking-map" className="btn-primary">Book a Slot</Link>
            </div>
          ) : (
            <div className="bookings-table-wrap">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Vehicle</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.slotNumber}</strong> <span className="floor-tag">F{b.floorNumber}</span></td>
                      <td>{b.vehicleNumber}</td>
                      <td>{new Date(b.bookingTime).toLocaleDateString()}</td>
                      <td>{b.durationHours ? `${b.durationHours.toFixed(1)}h` : '-'}</td>
                      <td>${b.totalAmount?.toFixed(2) || '-'}</td>
                      <td>
                        <span className="status-badge" style={{ background: `${statusColor[b.status]}22`, color: statusColor[b.status] }}>
                          {b.status}
                        </span>
                      </td>
                      <td><Link to={`/bookings/${b.id}`} className="table-link">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
