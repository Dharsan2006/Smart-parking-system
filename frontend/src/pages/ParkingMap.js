import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import ParkingGrid from '../components/parking/ParkingGrid';
import { parkingService } from '../services/parkingService';
import useWebSocket from '../hooks/useWebSocket';
import './ParkingMap.css';

const ParkingMap = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [wsConnected, setWsConnected] = useState(false);

  const { connected } = useWebSocket('/topic/slots', (updatedSlots) => {
    setSlots(updatedSlots);
    setWsConnected(true);
  });

  useEffect(() => {
    parkingService.getAllSlots()
      .then(res => setSlots(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredSlots = filter === 'ALL' ? slots : slots.filter(s => s.status === filter);

  return (
    <Layout>
      <div className="parking-map-page">
        <div className="page-header">
          <div>
            <h1>🅿 Parking Map</h1>
            <p>Click on an available slot to book it</p>
          </div>
          <div className="ws-indicator">
            <span className={`ws-dot ${connected ? 'connected' : 'disconnected'}`}></span>
            <span>{connected ? 'Live Updates' : 'Connecting...'}</span>
          </div>
        </div>

        <div className="filter-bar">
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? `All (${slots.length})` :
               f === 'AVAILABLE' ? `Available (${slots.filter(s => s.status === 'AVAILABLE').length})` :
               f === 'OCCUPIED' ? `Occupied (${slots.filter(s => s.status === 'OCCUPIED').length})` :
               f === 'RESERVED' ? `Reserved (${slots.filter(s => s.status === 'RESERVED').length})` :
               `Maintenance (${slots.filter(s => s.status === 'MAINTENANCE').length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">Loading parking map...</div>
        ) : (
          <ParkingGrid slots={filteredSlots} />
        )}
      </div>
    </Layout>
  );
};

export default ParkingMap;
