import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { bookingService } from '../../services/bookingService';
import toast from 'react-hot-toast';
import './QRValidator.css';

const QRValidator = () => {
  const [qrInput, setQrInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('entry'); // entry or exit

  const handleValidate = async () => {
    if (!qrInput.trim()) {
      toast.error('Please enter a QR code');
      return;
    }
    setLoading(true);
    try {
      const res = await bookingService.validateQR(qrInput.trim());
      setResult(res.data);
      toast.success('QR code validated successfully');
    } catch (err) {
      toast.error(err.response?.data || 'Invalid QR code');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const res = await bookingService.exitParking(result.id);
      setResult(res.data);
      toast.success('Exit recorded successfully');
    } catch (err) {
      toast.error(err.response?.data || 'Failed to record exit');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    PENDING: '#f59e0b', CONFIRMED: '#3b82f6',
    ACTIVE: '#10b981', COMPLETED: '#6b7280', CANCELLED: '#ef4444'
  };

  return (
    <Layout>
      <div className="qr-validator-page">
        <div className="page-header">
          <h1>QR Code Validator</h1>
          <p>Validate parking entry and exit QR codes</p>
        </div>

        <div className="validator-layout">
          <div className="validator-card">
            <div className="mode-toggle">
              <button className={mode === 'entry' ? 'active' : ''} onClick={() => setMode('entry')}>
                🚗 Entry Validation
              </button>
              <button className={mode === 'exit' ? 'active' : ''} onClick={() => setMode('exit')}>
                🚪 Exit Recording
              </button>
            </div>

            <div className="qr-input-section">
              <label>QR Code Content</label>
              <textarea
                value={qrInput}
                onChange={e => setQrInput(e.target.value)}
                placeholder="Paste QR code content here or scan with a QR reader..."
                rows={4}
              />
              <button className="validate-btn" onClick={handleValidate} disabled={loading}>
                {loading ? 'Validating...' : '🔍 Validate QR Code'}
              </button>
            </div>

            {result && (
              <div className="validation-result">
                <div className="result-header">
                  <span className="result-icon">✓</span>
                  <h3>Booking Found</h3>
                </div>

                <div className="result-grid">
                  <div className="result-item">
                    <span>Booking ID</span>
                    <strong>#{result.id}</strong>
                  </div>
                  <div className="result-item">
                    <span>User</span>
                    <strong>{result.userName}</strong>
                  </div>
                  <div className="result-item">
                    <span>Slot</span>
                    <strong>{result.slotNumber} (Floor {result.floorNumber})</strong>
                  </div>
                  <div className="result-item">
                    <span>Vehicle</span>
                    <strong>{result.vehicleNumber}</strong>
                  </div>
                  <div className="result-item">
                    <span>Start Time</span>
                    <strong>{result.startTime ? new Date(result.startTime).toLocaleString() : 'Not started'}</strong>
                  </div>
                  <div className="result-item">
                    <span>End Time</span>
                    <strong>{result.endTime ? new Date(result.endTime).toLocaleString() : '-'}</strong>
                  </div>
                  <div className="result-item">
                    <span>Status</span>
                    <strong style={{ color: statusColors[result.status] }}>{result.status}</strong>
                  </div>
                  <div className="result-item">
                    <span>Amount</span>
                    <strong>₹{result.totalAmount?.toFixed(2) || '-'}</strong>
                  </div>
                </div>

                {result.status === 'ACTIVE' && (
                  <button className="exit-btn" onClick={handleExit} disabled={loading}>
                    🚪 Record Exit & Calculate Charges
                  </button>
                )}

                {result.status === 'CONFIRMED' && (
                  <div className="entry-allowed">
                    ✓ Entry Allowed — Slot {result.slotNumber} is reserved for this vehicle
                  </div>
                )}

                {result.status === 'COMPLETED' && (
                  <div className="already-exited">
                    ✓ Vehicle has already exited. Duration: {result.durationHours?.toFixed(2)}h
                  </div>
                )}

                {result.status === 'CANCELLED' && (
                  <div className="entry-denied">
                    ✗ Entry Denied — Booking has been cancelled
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="instructions-card">
            <h3>How to Use</h3>
            <div className="instruction-steps">
              <div className="step">
                <div className="step-num">1</div>
                <div>
                  <strong>Entry Validation</strong>
                  <p>Scan the customer's QR code at the entrance. The system will verify the booking and mark it as ACTIVE.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div>
                  <strong>Exit Recording</strong>
                  <p>When the vehicle exits, scan the QR code again. The system will calculate the actual duration and charges.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div>
                  <strong>Payment</strong>
                  <p>After exit is recorded, the customer can make payment through the app based on actual parking time.</p>
                </div>
              </div>
            </div>

            <div className="status-guide">
              <h4>Status Guide</h4>
              <div className="status-item"><span style={{color:'#3b82f6'}}>●</span> CONFIRMED — Booking confirmed, entry allowed</div>
              <div className="status-item"><span style={{color:'#10b981'}}>●</span> ACTIVE — Vehicle is currently parked</div>
              <div className="status-item"><span style={{color:'#6b7280'}}>●</span> COMPLETED — Vehicle has exited</div>
              <div className="status-item"><span style={{color:'#ef4444'}}>●</span> CANCELLED — Booking cancelled, deny entry</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QRValidator;
