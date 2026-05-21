import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';
import './PaymentPage.css';

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: '🏦' },
  { value: 'UPI', label: 'UPI', icon: '📱' },
  { value: 'WALLET', label: 'Wallet', icon: '👛' },
  { value: 'CASH', label: 'Cash', icon: '💵' },
];

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    bookingService.getBookingById(bookingId)
      .then(res => {
        setBooking(res.data);
        if (res.data.status !== 'COMPLETED') {
          toast.error('Payment only available for completed bookings');
          navigate(`/bookings/${bookingId}`);
        }
      })
      .catch(() => navigate('/bookings'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    setProcessing(true);
    try {
      await paymentService.processPayment(parseInt(bookingId), paymentMethod);
      toast.success('Payment successful!');
      navigate(`/bookings/${bookingId}`);
    } catch (err) {
      toast.error(err.response?.data || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Layout><div className="loading-state">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="payment-page">
        <div className="payment-header">
          <button className="back-btn" onClick={() => navigate(`/bookings/${bookingId}`)}>← Back</button>
          <h1>Make Payment</h1>
        </div>

        <div className="payment-layout">
          {/* Summary */}
          <div className="payment-summary">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Booking ID</span>
              <strong>#{booking?.id}</strong>
            </div>
            <div className="summary-row">
              <span>Slot</span>
              <strong>{booking?.slotNumber} (Floor {booking?.floorNumber})</strong>
            </div>
            <div className="summary-row">
              <span>Vehicle</span>
              <strong>{booking?.vehicleNumber}</strong>
            </div>
            <div className="summary-row">
              <span>Duration</span>
              <strong>{booking?.durationHours?.toFixed(2)} hours</strong>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Base Fee</span>
              <strong>$2.00</strong>
            </div>
            <div className="summary-row">
              <span>Parking Fee</span>
              <strong>${((booking?.totalAmount || 0) - 2).toFixed(2)}</strong>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <strong>${booking?.totalAmount?.toFixed(2)}</strong>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-methods-card">
            <h3>Select Payment Method</h3>
            <div className="methods-grid">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.value}
                  className={`method-btn ${paymentMethod === m.value ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod(m.value)}
                >
                  <span className="method-icon">{m.icon}</span>
                  <span className="method-label">{m.label}</span>
                </button>
              ))}
            </div>

            <button
              className="pay-btn"
              onClick={handlePayment}
              disabled={processing || !paymentMethod}
            >
              {processing ? 'Processing...' : `Pay $${booking?.totalAmount?.toFixed(2)}`}
            </button>

            <p className="secure-note">🔒 Secure payment processing</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentPage;
