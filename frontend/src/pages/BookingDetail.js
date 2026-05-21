import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { bookingService } from '../services/bookingService';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import './BookingDetail.css';

const statusConfig = {
  PENDING:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CONFIRMED: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  ACTIVE:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  COMPLETED: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  CANCELLED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await bookingService.getBookingById(id);
      setBooking(res.data);
    } catch {
      toast.error('Booking not found');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooking(); }, [id]);

  const handleExit = async () => {
    setExiting(true);
    try {
      const res = await bookingService.exitParking(id);
      setBooking(res.data);
      toast.success('Exit recorded. Please proceed to payment.');
    } catch (err) {
      toast.error(err.response?.data || 'Failed to record exit');
    } finally {
      setExiting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(id);
      setBooking(res.data);
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = () => {
    const content = `
SMARTPARK - PARKING INVOICE
============================
Booking ID: #${booking.id}
Date: ${new Date(booking.bookingTime).toLocaleString()}

PARKING DETAILS
---------------
Slot: ${booking.slotNumber} (Floor ${booking.floorNumber})
Vehicle: ${booking.vehicleNumber}
Start: ${booking.startTime ? new Date(booking.startTime).toLocaleString() : 'N/A'}
End: ${booking.actualExitTime ? new Date(booking.actualExitTime).toLocaleString() : booking.endTime ? new Date(booking.endTime).toLocaleString() : 'N/A'}
Duration: ${booking.durationHours ? booking.durationHours.toFixed(2) + ' hours' : 'N/A'}

PAYMENT SUMMARY
---------------
Base Fee: $2.00
Parking Fee: $${((booking.totalAmount || 0) - 2).toFixed(2)}
Total Amount: $${(booking.totalAmount || 0).toFixed(2)}
Status: ${booking.payment?.status || 'PENDING'}
${booking.payment?.transactionId ? 'Transaction ID: ' + booking.payment.transactionId : ''}

Thank you for using SmartPark!
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-booking-${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Layout><div className="loading-state">Loading booking details...</div></Layout>;
  if (!booking) return null;

  const config = statusConfig[booking.status] || statusConfig.PENDING;

  return (
    <Layout>
      <div className="booking-detail-page">
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate('/bookings')}>← Back</button>
          <div>
            <h1>Booking #{booking.id}</h1>
            <span className="status-badge-large" style={{ background: config.bg, color: config.color }}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="detail-layout">
          {/* Left: Info */}
          <div className="detail-main">
            <div className="info-card">
              <h3>Parking Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span>Slot</span>
                  <strong>{booking.slotNumber}</strong>
                </div>
                <div className="info-item">
                  <span>Floor</span>
                  <strong>{booking.floorNumber}</strong>
                </div>
                <div className="info-item">
                  <span>Vehicle</span>
                  <strong>{booking.vehicleNumber}</strong>
                </div>
                <div className="info-item">
                  <span>Booked At</span>
                  <strong>{new Date(booking.bookingTime).toLocaleString()}</strong>
                </div>
                <div className="info-item">
                  <span>Start Time</span>
                  <strong>{booking.startTime ? new Date(booking.startTime).toLocaleString() : 'Not started'}</strong>
                </div>
                <div className="info-item">
                  <span>End Time</span>
                  <strong>{booking.actualExitTime ? new Date(booking.actualExitTime).toLocaleString() : booking.endTime ? new Date(booking.endTime).toLocaleString() : '-'}</strong>
                </div>
                <div className="info-item">
                  <span>Duration</span>
                  <strong>{booking.durationHours ? `${booking.durationHours.toFixed(2)} hours` : '-'}</strong>
                </div>
                <div className="info-item">
                  <span>Total Amount</span>
                  <strong className="amount">${booking.totalAmount?.toFixed(2) || '-'}</strong>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {booking.payment && (
              <div className="info-card">
                <h3>Payment Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span>Amount</span>
                    <strong>${booking.payment.amount?.toFixed(2)}</strong>
                  </div>
                  <div className="info-item">
                    <span>Method</span>
                    <strong>{booking.payment.paymentMethod || '-'}</strong>
                  </div>
                  <div className="info-item">
                    <span>Transaction ID</span>
                    <strong>{booking.payment.transactionId || '-'}</strong>
                  </div>
                  <div className="info-item">
                    <span>Status</span>
                    <strong style={{ color: booking.payment.status === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>
                      {booking.payment.status}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="action-buttons">
              {booking.status === 'ACTIVE' && (
                <button className="action-btn exit" onClick={handleExit} disabled={exiting}>
                  {exiting ? 'Recording...' : '🚗 Record Exit'}
                </button>
              )}
              {booking.status === 'COMPLETED' && !booking.payment && (
                <Link to={`/payment/${booking.id}`} className="action-btn pay">
                  💳 Make Payment
                </Link>
              )}
              {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                <button className="action-btn cancel" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? 'Cancelling...' : '✗ Cancel Booking'}
                </button>
              )}
              {booking.status === 'COMPLETED' && (
                <button className="action-btn download" onClick={handleDownloadInvoice}>
                  📄 Download Invoice
                </button>
              )}
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="qr-section">
            <div className="qr-card">
              <h3>Entry QR Code</h3>
              <p>Show this at the parking entrance</p>
              <div className="qr-wrapper">
                {booking.qrCode ? (
                  <img src={booking.qrCode} alt="QR Code" className="qr-image" />
                ) : (
                  <QRCodeSVG
                    value={`BOOKING:${booking.id}`}
                    size={200}
                    bgColor="#1a1a2e"
                    fgColor="#818cf8"
                    level="H"
                  />
                )}
              </div>
              <div className="qr-info">
                <span>Booking #{booking.id}</span>
                <span>{booking.slotNumber}</span>
              </div>
              {(booking.status === 'CANCELLED' || booking.status === 'COMPLETED') && (
                <div className="qr-invalid">
                  {booking.status === 'CANCELLED' ? '✗ Cancelled' : '✓ Used'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingDetail;
