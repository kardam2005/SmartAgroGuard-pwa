import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TRANSLATIONS } from '../services/translations';

export default function IrrigationDashboard({ selectedFarm, currentLang = 'gu-IN' }) {
  const [soilType, setSoilType] = useState(selectedFarm?.soil_type || 'Sandy Loam (Goradu)');
  const [areaAcres, setAreaAcres] = useState(selectedFarm?.farm_area ? parseFloat(selectedFarm.farm_area) : 2.5);
  const [das, setDas] = useState(48);
  const [irrigationMethod, setIrrigationMethod] = useState('Drip');
  const [simulatedVwc, setSimulatedVwc] = useState(22.0);
  const [irrigData, setIrrigData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sensorIngestFeedback, setSensorIngestFeedback] = useState('');
  const [showAdvancedMath, setShowAdvancedMath] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS['gu-IN'];
  const ti = t.irrigation;

  useEffect(() => {
    if (selectedFarm?.soil_type) setSoilType(selectedFarm.soil_type);
    if (selectedFarm?.farm_area) setAreaAcres(parseFloat(selectedFarm.farm_area) || 2.5);
  }, [selectedFarm]);

  useEffect(() => {
    calculateIrrigation();
  }, [soilType, areaAcres, das, irrigationMethod, simulatedVwc]);

  const calculateIrrigation = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/v1/irrigation/calculate', {
        area_acres: parseFloat(areaAcres) || 1.0,
        soil_type: soilType,
        das: parseInt(das) || 45,
        temperature_c: 31.5,
        humidity_percent: 62,
        wind_speed_kmh: 8.5,
        solar_radiation_mj: 19.2,
        rainfall_7d_mm: 2.0,
        irrigation_method: irrigationMethod,
        simulated_soil_vwc_pct: parseFloat(simulatedVwc)
      });
      setIrrigData(res.data);
    } catch (err) {
      console.error('Irrigation calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSensorTransmit = async () => {
    try {
      setSensorIngestFeedback('📡 Transmitting IoT sensor packet via MQTT/LoRaWAN...');
      await api.post('/api/v1/irrigation/telemetry/soil', {
        farm_id: selectedFarm?.farm_id || 'f_simulated',
        sensor_id: 'PROBE_01_15CM',
        depth_cm: 15,
        volumetric_water_content_pct: parseFloat(simulatedVwc),
        soil_temperature_c: 28.5
      });
      setSensorIngestFeedback(`✅ Packet Ingested: VWC=${simulatedVwc}% @ 15cm probe depth.`);
      setTimeout(() => setSensorIngestFeedback(''), 4000);
    } catch (err) {
      setSensorIngestFeedback('⚠️ Telemetry ingestion failed');
    }
  };

  const needsWater = irrigData?.soil_status?.is_irrigation_needed;
  const runtimeHours = irrigData?.recommended_runtime_hours || 0;

  return (
    <div className="card shadow-lg" style={{ background: '#0F172A', color: '#F8FAFC', borderRadius: '16px', border: '1px solid #1E293B', padding: '24px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1E293B', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#38BDF8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {ti.title}
          </h2>
          <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '13px' }}>
            {ti.subtitle}
          </p>
        </div>
        
        {/* Toggle Mode Button */}
        <button
          type="button"
          onClick={() => setShowAdvancedMath(!showAdvancedMath)}
          style={{
            background: showAdvancedMath ? '#38BDF8' : '#1E293B',
            color: showAdvancedMath ? '#000' : '#38BDF8',
            border: '1px solid #38BDF8',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {showAdvancedMath ? ti.viewingAdvMode : ti.switchAdvMode}
        </button>
      </div>

      {/* BIG PUMP RUNTIME HERO CARD */}
      {irrigData && (
        <div style={{
          background: needsWater 
            ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: `2px solid ${needsWater ? '#38BDF8' : '#10B981'}`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: needsWater ? '#0284C7' : '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
            }}>
              {needsWater ? '⚡' : '✓'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: needsWater ? '#38BDF8' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {needsWater ? ti.wateringNeededBadge : ti.optimalMoistureBadge}
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF', margin: '4px 0' }}>
                {needsWater 
                  ? ti.runMotorTitle(irrigationMethod, runtimeHours) 
                  : ti.noIrrigationTitle}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>
                {needsWater
                  ? ti.suppliesVolume((irrigData.total_water_volume_liters / 1000).toFixed(1), areaAcres)
                  : ti.saveWaterSub}
              </p>
            </div>
          </div>

          <div style={{
            background: '#0F172A',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid #334155',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700' }}>{ti.soilWaterStatus}</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: needsWater ? '#F59E0B' : '#10B981', marginTop: '2px' }}>
              {irrigData.soil_status.moisture_deficit_status}
            </div>
          </div>
        </div>
      )}

      {/* QUICK PRESETS FOR FIELD & METHOD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Delivery Method */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
            {ti.methodLabel}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Drip', 'Furrow'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setIrrigationMethod(method)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: irrigationMethod === method ? '2px solid #38BDF8' : '1px solid #334155',
                  background: irrigationMethod === method ? 'rgba(56, 189, 248, 0.2)' : '#1E293B',
                  color: irrigationMethod === method ? '#38BDF8' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                {method === 'Drip' ? ti.dripMethod : ti.furrowMethod}
              </button>
            ))}
          </div>
        </div>

        {/* Days After Sowing */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
            {ti.cropAgeLabel(das)}
          </label>
          <input
            type="range"
            min="5"
            max="115"
            value={das}
            onChange={(e) => setDas(Number(e.target.value))}
            style={{ width: '100%', marginTop: '6px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            <span>{ti.stageSmall}</span>
            <span>{ti.stageTassel}</span>
            <span>{ti.stageHarvest}</span>
          </div>
        </div>

        {/* Soil Type */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
            {ti.soilTypeLabel}
          </label>
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            style={{ width: '100%', background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '600' }}
          >
            <option value="Sandy Loam (Goradu)">Sandy Loam (Goradu - Gujarat)</option>
            <option value="Clay Loam">Clay Loam (Gangetic Alluvium - Bihar)</option>
            <option value="Black Cotton Soil (Vertisol)">Black Cotton Soil (Vertisol - Deccan)</option>
            <option value="Alluvial Silt Loam">Alluvial Silt Loam</option>
          </select>
        </div>

      </div>

      {/* STUNTING ADVICE BANNER */}
      {irrigData && (
        <div style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          border: '1.5px solid #334155',
          borderRadius: '14px',
          padding: '18px',
          marginBottom: '20px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FCD34D', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {ti.stuntingTitle}
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#E2E8F0', lineHeight: '1.6' }}>
            {irrigData.stunting_triage_note}
          </p>
        </div>
      )}

      {/* EXPANDABLE SCIENTIFIC FAO-56 EQUATIONS (FOR AGRONOMISTS & EXPERTS) */}
      {showAdvancedMath && irrigData && (
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px dashed #334155'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38BDF8', marginBottom: '14px' }}>
            🔬 Advanced FAO-56 Penman-Monteith Evapotranspiration Telemetry
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#1E293B', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #38BDF8' }}>
              <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>CROP COEFFICIENT (Kc)</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#38BDF8' }}>
                {irrigData.kc_crop_coefficient}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{irrigData.growth_stage_code} ({irrigData.growth_stage_name})</div>
            </div>

            <div style={{ background: '#1E293B', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
              <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>WATER DEMAND (ETc)</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                {irrigData.etc_crop_water_demand_mm_per_day} <span style={{ fontSize: '13px' }}>mm/day</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>ET0: {irrigData.et0_reference_mm_per_day} mm/day</div>
            </div>

            <div style={{ background: '#1E293B', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>LITERS PER ACRE</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
                {irrigData.daily_water_liters_per_acre} <span style={{ fontSize: '13px' }}>L/Acre</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>1mm = 4046.86 L/Acre</div>
            </div>

            <div style={{ background: '#1E293B', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #8B5CF6' }}>
              <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>SOIL VWC LEVEL</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>
                {irrigData.soil_status.current_estimated_vwc_pct}%
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>MAD: {irrigData.soil_status.management_allowed_depletion_pct}%</div>
            </div>
          </div>

          {/* Virtual IoT Probe simulation button */}
          <div style={{ background: '#1E293B', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC' }}>IoT Sensor Ingestion Simulator</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Simulate MQTT / LoRaWAN packet from depth 15cm soil probe</div>
            </div>
            <button
              type="button"
              onClick={handleSimulateSensorTransmit}
              style={{ background: '#38BDF8', color: '#000', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              📡 Ingest Telemetry Packet
            </button>
          </div>

          {sensorIngestFeedback && (
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', marginTop: '10px' }}>
              {sensorIngestFeedback}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
