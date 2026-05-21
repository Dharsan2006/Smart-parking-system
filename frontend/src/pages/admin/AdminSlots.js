import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import ParkingGrid from '../../components/parking/ParkingGrid';
import { parkingService } from '../../services/parkingService';
import useWebSocket from '../../hooks/useWebSocket';
import toast from 'react-hot-toast';
import './AdminSlots.css';

const SLOT_TYPES = ['REGULAR', 'COMPACT', 'HANDICAPPED', 'EV_CHARGING'];
const SLOT_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];

const defaultForm = {
  slotNumber: '', floorNumber: 1, slotType: 'REGULAR',
  status: 'AVAILABLE', pricePerHour: 5.0
};

const AdminSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState('grid');

  useWebSocket('/topic/slots', (updatedSlots) => setSlots(updatedSlots));

  const fetchSlots = () => {
    parkingService.getAllSlots()
      .then(res => setSlots(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSlots(); }, []);

  const openCreate = () => {
    setEditSlot(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (slot) => {
    setEditSlot(slot);
    setForm({
      slotNumber: slot.slotNumber,
      floorNumber: slot.floorNumber,
      slotType: slot.slotType,
      status: slot.status,
      pricePerHour: slot.pricePerHour,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editSlot) {
        await parkingService.updateSlot(editSlot.id, form);
        toast.success('Slot updated');
      } else {
        await parkingService.createSlot(form);
        toast.success('Slot created');
      }
      setShowModal(false);
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await parkingService.deleteSlot(id);
      toast.success('Slot deleted');
      fetchSlots();
    } catch (err) {
      toast.error('Failed to delete slot');
    }
  };

  const statusColors = {
    AVAILABLE: '#10b981', OCCUPIED: '#ef4444',
    RESERVED: '#f59e0b', MAINTENANCE: '#6b7280'
  };

  return (
    <Layout>
      <div className="admin-slots-page">
        <div className="page-header">
          <div>
            <h1>Parking Slots</h1>
            <p>{slots.length} total slots</p>
          </div>
          <div className="header-actions">
            <div className="view-toggle">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Grid</button>
              <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
            </div>
            <button className="btn-primary" onClick={openCreate}>+ Add Slot</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading slots...</div>
        ) : view === 'grid' ? (
          <div className="admin-grid-wrapper">
            <ParkingGrid
              slots={slots}
              onSlotClick={(slot) => openEdit(slot)}
            />
            <p className="grid-hint">Click any slot to edit it</p>
          </div>
        ) : (
          <div className="slots-table-wrap">
            <table className="slots-table">
              <thead>
                <tr>
                  <th>Slot #</th>
                  <th>Floor</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Price/hr</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td><strong>{slot.slotNumber}</strong></td>
                    <td>{slot.floorNumber}</td>
                    <td>{slot.slotType}</td>
                    <td>
                      <span className="status-dot" style={{ background: statusColors[slot.status] }}></span>
                      {slot.status}
                    </td>
                    <td>${slot.pricePerHour}</td>
                    <td>
                      <div className="table-actions">
                        <button className="edit-btn" onClick={() => openEdit(slot)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(slot.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editSlot ? 'Edit Slot' : 'Add New Slot'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Slot Number *</label>
                    <input
                      type="text"
                      value={form.slotNumber}
                      onChange={e => setForm({ ...form, slotNumber: e.target.value })}
                      placeholder="e.g. A-01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Floor Number *</label>
                    <input
                      type="number"
                      value={form.floorNumber}
                      onChange={e => setForm({ ...form, floorNumber: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Slot Type</label>
                    <select value={form.slotType} onChange={e => setForm({ ...form, slotType: e.target.value })}>
                      {SLOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {SLOT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Price per Hour ($)</label>
                  <input
                    type="number"
                    value={form.pricePerHour}
                    onChange={e => setForm({ ...form, pricePerHour: parseFloat(e.target.value) })}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit" disabled={submitting}>
                    {submitting ? 'Saving...' : editSlot ? 'Update Slot' : 'Create Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminSlots;
