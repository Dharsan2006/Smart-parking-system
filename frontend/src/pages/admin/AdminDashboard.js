import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { adminService } from '../../services/adminService';
import { parkingService } from '../../services/parkingService';
import useWebSocket from '../../hooks/useWebSocket';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './AdminDashboard.css';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="admin-stat-card" style={{ '--accent': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const SLOT_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6b7280'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useWebSocket('/topic/slots', (updatedSlots) => {
    setSlots(updatedSlots);
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, slotsRes] = await Promise.all([
          adminService.getDashboardStats(),
          parkingService.getAllSlots(),
        ]);
        setStats(statsRes.data);
        setSlots(slotsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const slotPieData = stats ? [
    { name: 'Available', value: stats.availableSlots },
    { name: 'Occupied', value: stats.occupiedSlots },
    { name: 'Reserved', value: stats.reservedSlots },
    { name: 'Maintenance', value: stats.totalSlots - stats.availableSlots - stats.occupiedSlots - stats.reservedSlots },
  ].filter(d => d.value > 0) : [];

  const revenueData = stats ? [
    { name: 'Today', amount: stats.todayRevenue || 0 },
    { name: 'This Week', amount: stats.weekRevenue || 0 },
    { name: 'Total', amount: stats.totalRevenue || 0 },
  ] : [];

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Real-time parking management overview</p>
          </div>
          <div className="admin-actions">
            <Link to="/admin/slots" className="btn-secondary">Manage Slots</Link>
            <Link to="/admin/bookings" className="btn-primary">View Bookings</Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading dashboard...</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="admin-stats-grid">
              <StatCard icon="🅿" label="Total Slots" value={stats?.totalSlots || 0} color="#6366f1" />
              <StatCard icon="🟢" label="Available" value={stats?.availableSlots || 0} color="#10b981" />
              <StatCard icon="🔴" label="Occupied" value={stats?.occupiedSlots || 0} color="#ef4444" />
              <StatCard icon="🟡" label="Reserved" value={stats?.reservedSlots || 0} color="#f59e0b" />
              <StatCard icon="📋" label="Total Bookings" value={stats?.totalBookings || 0} color="#3b82f6" />
              <StatCard icon="⚡" label="Active Now" value={stats?.activeBookings || 0} color="#10b981" />
              <StatCard icon="✓" label="Completed" value={stats?.completedBookings || 0} color="#6b7280" />
              <StatCard icon="💰" label="Total Revenue" value={`$${(stats?.totalRevenue || 0).toFixed(2)}`} color="#f59e0b" sub={`Today: $${(stats?.todayRevenue || 0).toFixed(2)}`} />
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Slot Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={slotPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {slotPieData.map((_, i) => (
                        <Cell key={i} fill={SLOT_COLORS[i % SLOT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Revenue Overview</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: '8px' }}
                      formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']}
                    />
                    <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <Link to="/admin/slots" className="action-card">
                  <span className="action-icon">🅿</span>
                  <span>Manage Slots</span>
                </Link>
                <Link to="/admin/bookings" className="action-card">
                  <span className="action-icon">📋</span>
                  <span>All Bookings</span>
                </Link>
                <Link to="/admin/qr-validator" className="action-card">
                  <span className="action-icon">📷</span>
                  <span>QR Validator</span>
                </Link>
                <Link to="/parking-map" className="action-card">
                  <span className="action-icon">🗺</span>
                  <span>Parking Map</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
