import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function HarvestReadinessCard({ selectedFarm }) {
  const [das, setDas] = useState(105);
  const [growthStage, setGrowthStage] = useState('R6');
  const [gdd, setGdd] = useState(1520);
  const [moisture, setMoisture] = useState(17.5);
  const [harvestData, setHarvestData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    evaluateHarvest();
  }, [das, growthStage, gdd, moisture]);

  const evaluateHarvest = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/v1/harvest/evaluate', {
        farm_id: selectedFarm?.farm_id || 'default',
        das: parseInt(das) || 105,
        growth_stage: growthStage,
        cumulative_gdd: parseFloat(gdd) || 1500.0,
        estimated_grain_moisture_pct: parseFloat(moisture) || 18.0,
        last_chemical_spray_date: '2026-08-20',
        last_chemical_id: 'PROPICONAZOLE_25_EC',
        forecast_rain_next_3_days_mm: 0.0
      });
      setHarvestData(res.data);
    } catch (err) {
      console.error('Failed to evaluate harvest readiness:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!harvestData) return null;

  const isGreen = harvestData.overall_status === 'GREEN_LIGHT_HARVEST';

  return (
    <div className="card shadow-lg" style={{ background: '#0F172A', color: '#F8FAFC', borderRadius: '16px', border: '1px solid #1E293B', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1E293B', paddingBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: isGreen ? '#10B981' : '#F59E0B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌾 Optimal Harvest Readiness & Post-Harvest Advisor
          </h2>
          <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '13px' }}>
            5-Pillar Decision Engine: Black Layer • GDD • Grain Moisture • PHI Safety • 72h Weather
          </p>
        </div>
        <div style={{
          background: isGreen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          color: isGreen ? '#10B981' : '#F59E0B',
          border: isGreen ? '1px solid #10B981' : '1px solid #F59E0B',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          {isGreen ? '✓ GREEN LIGHT FOR HARVEST' : '⏳ HARVEST HOLD'} ({harvestData.harvest_readiness_score_pct}%)
        </div>
      </div>

      {/* Interactive Criteria Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>
            Growth Stage: <strong>{growthStage}</strong>
          </label>
          <select
            value={growthStage}
            onChange={(e) => setGrowthStage(e.target.value)}
            style={{ width: '100%', background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '8px', padding: '8px', fontSize: '13px' }}
          >
            <option value="R6">R6 (Black Layer Matured)</option>
            <option value="R5">R5 (Dent Stage)</option>
            <option value="R4">R4 (Dough Stage)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>
            Grain Moisture Content: <strong>{moisture}%</strong>
          </label>
          <input
            type="range"
            min="10"
            max="30"
            step="0.5"
            value={moisture}
            onChange={(e) => setMoisture(Number(e.target.value))}
            style={{ width: '100%', marginTop: '6px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B' }}>
            <span>Target: &le; 20%</span>
            <span>Current: {moisture}%</span>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}>
            Cumulative GDD: <strong>{gdd} °C-days</strong>
          </label>
          <input
            type="range"
            min="1200"
            max="1800"
            step="20"
            value={gdd}
            onChange={(e) => setGdd(Number(e.target.value))}
            style={{ width: '100%', marginTop: '6px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B' }}>
            <span>Target: &ge; 1450</span>
            <span>Current: {gdd}</span>
          </div>
        </div>
      </div>

      {/* 5-Criteria Status Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {harvestData.criteria_breakdown.map((c, i) => (
          <div
            key={i}
            style={{
              background: '#1E293B',
              padding: '12px',
              borderRadius: '10px',
              borderLeft: c.is_passed ? '4px solid #10B981' : '4px solid #F59E0B'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC' }}>{c.criterion_name}</div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: c.is_passed ? '#10B981' : '#F59E0B' }}>
                {c.is_passed ? '✓ PASS' : 'HOLD'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{c.explanation}</div>
          </div>
        ))}
      </div>

      {/* Post-Harvest Storage & Aflatoxin Prevention Guide */}
      <div style={{ background: '#1E293B', padding: '16px', borderRadius: '12px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#38BDF8', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🛡️ Post-Harvest Storage & Aflatoxin Prevention Protocol:
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
          {harvestData.post_harvest_storage_protocol.map((step, i) => (
            <div key={i} style={{ background: '#0F172A', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#CBD5E1' }}>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
