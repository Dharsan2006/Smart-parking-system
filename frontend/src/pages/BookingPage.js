import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { parkingService } from '../services/parkingService';
import { bookingService } from '../services/bookingService';
import toast from 'react-hot-toast';
import './BookingPage.css';

const BookingPage = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 5 * 60000);
  const defaultEnd = new Date(now.getTime() + 65 * 60000);

  const toLocalInput = (d) => {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    vehicleNumber: '',
    startTime: toLocalInput(defaultStart),
    endTime: toLocalInput(defaultEnd),
  });

  useEffect(() => {
    parkingService.getSlotById(slotId)
      .then(res => setSlot(res.data))
      .catch(() => { toast.error('Slot not found'); navigate('/parking-map'); })
      .finally(() => setLoading(false));
  }, [slotId]);

  const getDuration = () => {
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    const hours = (end - start) / 3600000;
    return hours > 0 ? hours : 0;
  };

  const getEstimatedCost = () => {
    if (!slot) return 0;
    const hours = getDuration();
    return (2.0 + hours * slot.pricePerHour).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (getDuration() <= 0) {
      toast.error('End time must be after start time');
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookingService.createBooking({
        slotId: parseInt(slotId),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        vehicleNumber: form.vehicleNumber,
      });
      toast.success('Booking confirmed!');
      navigate(`/bookings/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><div className="loading-state">Loading slot details...</div></Layout>;

  const typeIcons = { REGULAR: '🚗', COMPACT: '🚙', HANDICAPPED: '♿', EV_CHARGING: '⚡' };

  return (
    <Layout>
      <div className="booking-page">
        <div className="booking-header">
          <button className="back-btn" onClick={() => navigate('/parking-map')}>← Back</button>
          <h1>Book Parking Slot</h1>
        </div>

        <div className="booking-layout">
          {/* Slot Info */}
          <div className="slot-info-card">
            <div className="slot-display">
              <div className="slot-big-icon">{typeIcons[slot?.slotType] || '🚗'}</div>
              <div className="slot-big-number">{slot?.slotNumber}</div>
              <div className="slot-available-badge">Available</div>
            </div>
            <div className="slot-details">
              <div className="detail-row">
                <span>Floor</span>
                <strong>{slot?.floorNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Type</span>
                <strong>{slot?.slotType}</strong>
              </div>
              <div className="detail-row">
                <span>Rate</span>
                <strong>${slot?.pricePerHour}/hour</strong>
              </div>
              <div className="detail-row">
                <span>Base Fee</span>
                <strong>$2.00</strong>
              </div>
            </div>

            <div className="cost-preview">
              <div className="cost-row">
                <span>Duration</span>
                <span>{getDuration().toFixed(1)} hours</span>
              </div>
              <div className="cost-row total">
                <span>Estimated Total</span>
                <span>${getEstimatedCost()}</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="booking-form-card">
            <h2>Booking Details</h2>
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label>Vehicle Number *</label>
                <input
                  type="text"
                  value={form.vehicleNumber}
                  onChange={e => setForm({ ...form, vehicleNumber: e.target.value })}
                  placeholder="e.g. ABC-1234"
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  min={toLocalInput(now)}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  min={form.startTime}
                  required
                />
              </div>

              <div className="pricing-note">
                <span>💡</span>
                <span>Final amount is calculated based on actual parking duration. Base fee $2.00 + ${slot?.pricePerHour}/hr</span>
              </div>

              <button type="submit" className="book-btn" disabled={submitting}>
                {submitting ? 'Confirming...' : `Confirm Booking — $${getEstimatedCost()}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
