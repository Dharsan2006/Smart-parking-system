import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ParkingMap from './pages/ParkingMap';
import BookingPage from './pages/BookingPage';
import BookingHistory from './pages/BookingHistory';
import BookingDetail from './pages/BookingDetail';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSlots from './pages/admin/AdminSlots';
import AdminBookings from './pages/admin/AdminBookings';
import QRValidator from './pages/admin/QRValidator';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e2e8f0',
              border: '1px solid #2d2d4e',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/parking-map" element={<PrivateRoute><ParkingMap /></PrivateRoute>} />
          <Route path="/book/:slotId" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><BookingHistory /></PrivateRoute>} />
          <Route path="/bookings/:id" element={<PrivateRoute><BookingDetail /></PrivateRoute>} />
          <Route path="/payment/:bookingId" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/slots" element={<AdminRoute><AdminSlots /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
          <Route path="/admin/qr-validator" element={<AdminRoute><QRValidator /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
