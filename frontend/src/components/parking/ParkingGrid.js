import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ParkingGrid.css';

const statusConfig = {
  AVAILABLE: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Available', icon: '✓' },
  OCCUPIED:  { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  label: 'Occupied',  icon: '✗' },
  RESERVED:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Reserved',  icon: '⏱' },
  MAINTENANCE:{ color: '#6b7280', bg: 'rgba(107,114,128,0.15)',label: 'Maintenance',icon: '🔧' },
};

const typeIcons = {
  REGULAR: '🚗',
  COMPACT: '🚙',
  HANDICAPPED: '♿',
  EV_CHARGING: '⚡',
};

const ParkingGrid = ({ slots, onSlotClick, selectable = false, selectedSlotId = null }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Group by floor
  const floors = [...new Set(slots.map(s => s.floorNumber))].sort();

  const handleClick = (slot) => {
    if (onSlotClick) {
      onSlotClick(slot);
      return;
    }
    if (!isAdmin() && slot.status === 'AVAILABLE') {
      navigate(`/book/${slot.id}`);
    }
  };

  return (
    <div className="parking-grid-container">
      {/* Legend */}
      <div className="grid-legend">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="legend-item">
            <span className="legend-dot" style={{ background: config.color }}></span>
            <span>{config.label}</span>
          </div>
        ))}
      </div>

      {floors.map(floor => (
        <div key={floor} className="floor-section">
          <div className="floor-header">
            <h3>Floor {floor}</h3>
            <div className="floor-stats">
              <span className="stat available">
                {slots.filter(s => s.floorNumber === floor && s.status === 'AVAILABLE').length} Available
              </span>
              <span className="stat occupied">
                {slots.filter(s => s.floorNumber === floor && s.status === 'OCCUPIED').length} Occupied
              </span>
              <span className="stat reserved">
                {slots.filter(s => s.floorNumber === floor && s.status === 'RESERVED').length} Reserved
              </span>
            </div>
          </div>

          <div className="slots-grid">
            {slots
              .filter(s => s.floorNumber === floor)
              .map(slot => {
                const config = statusConfig[slot.status] || statusConfig.AVAILABLE;
                const isSelected = selectedSlotId === slot.id;
                const isClickable = !isAdmin() && slot.status === 'AVAILABLE';

                return (
                  <div
                    key={slot.id}
                    className={`slot-card ${slot.status.toLowerCase()} ${isSelected ? 'selected' : ''} ${isClickable ? 'clickable' : ''}`}
                    style={{
                      '--slot-color': config.color,
                      '--slot-bg': config.bg,
                    }}
                    onClick={() => handleClick(slot)}
                    onMouseEnter={() => setHoveredSlot(slot.id)}
                    onMouseLeave={() => setHoveredSlot(null)}
                    title={`${slot.slotNumber} - ${config.label}`}
                  >
                    <div className="slot-type-icon">{typeIcons[slot.slotType] || '🚗'}</div>
                    <div className="slot-number">{slot.slotNumber}</div>
                    <div className="slot-status-icon">{config.icon}</div>
                    <div className="slot-price">₹{slot.pricePerHour}/hr</div>

                    {hoveredSlot === slot.id && (
                      <div className="slot-tooltip">
                        <div><strong>{slot.slotNumber}</strong></div>
                        <div>Type: {slot.slotType}</div>
                        <div>Status: {config.label}</div>
                        <div>Price: ₹{slot.pricePerHour}/hr</div>
                        {isClickable && <div className="tooltip-action">Click to Book</div>}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {slots.length === 0 && (
        <div className="empty-grid">
          <p>🅿 No parking slots available</p>
        </div>
      )}
    </div>
  );
};

export default ParkingGrid;
