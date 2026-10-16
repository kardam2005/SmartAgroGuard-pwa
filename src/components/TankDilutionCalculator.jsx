import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TRANSLATIONS } from '../services/translations';

export default function TankDilutionCalculator({ selectedFarm, activeScan, currentLang = 'gu-IN', onApplyDose }) {
  const [chemicals, setChemicals] = useState([]);
  const [selectedChemId, setSelectedChemId] = useState('PROPICONAZOLE_25_EC');
  const [areaAcres, setAreaAcres] = useState(selectedFarm?.farm_area ? parseFloat(selectedFarm.farm_area) : 2.5);
  const [tankCapacity, setTankCapacity] = useState(15); // 15L or 20L
  const [waterPerAcre, setWaterPerAcre] = useState(200);
  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS['gu-IN'];
  const td = t.dosage;

  const diagnosedDisease = activeScan?.diagnostic?.disease_status;
  const isDiagnosed = diagnosedDisease && diagnosedDisease !== 'Healthy';

  useEffect(() => {
    fetchChemicals();
  }, []);

  useEffect(() => {
    if (selectedFarm?.farm_area) {
      setAreaAcres(parseFloat(selectedFarm.farm_area) || 2.5);
    }
  }, [selectedFarm]);

  // Auto-select medicine if disease is diagnosed by the AI Scan
  useEffect(() => {
    if (chemicals.length > 0 && isDiagnosed) {
      const match = chemicals.find(c => 
        (c.target_diseases && c.target_diseases.some(d => d.toLowerCase().includes(diagnosedDisease.toLowerCase()) || diagnosedDisease.toLowerCase().includes(d.toLowerCase()))) ||
        (activeScan?.pesticide_treatment?.product_name && c.trade_names.some(t => activeScan.pesticide_treatment.product_name.includes(t)))
      );
      if (match) {
        setSelectedChemId(match.chemical_id);
      }
    }
  }, [chemicals, diagnosedDisease]);

  useEffect(() => {
    if (selectedChemId) {
      calculateDosage();
    }
  }, [selectedChemId, areaAcres, tankCapacity, waterPerAcre]);

  const fetchChemicals = async () => {
    try {
      const res = await api.get('/api/v1/dosage/chemicals');
      setChemicals(res.data);
      if (res.data.length > 0 && !isDiagnosed) {
        setSelectedChemId(res.data[0].chemical_id);
      }
    } catch (err) {
      console.error('Failed to fetch chemicals:', err);
    }
  };

  const calculateDosage = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/v1/dosage/calculate', {
        chemical_id: selectedChemId,
        area_acres: parseFloat(areaAcres) || 1.0,
        tank_capacity_liters: parseFloat(tankCapacity) || 15.0,
        water_volume_per_acre_liters: parseFloat(waterPerAcre) || 200.0
      });
      setCalculationResult(res.data);
    } catch (err) {
      console.error('Dosage calculation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedChem = chemicals.find(c => c.chemical_id === selectedChemId);

  return (
    <div className="card shadow-lg" style={{ background: '#0F172A', color: '#F8FAFC', borderRadius: '16px', border: '1px solid #1E293B', padding: '24px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1E293B', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {td.title}
          </h2>
          <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '13px' }}>
            {td.subtitle}
          </p>
        </div>
        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
          {td.cibrcBadge}
        </span>
      </div>

      {/* AI AUTO-PRESCRIPTION BANNER (WHEN SCANNED) */}
      {isDiagnosed ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1.5px solid #10B981',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🎯</span>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {td.autoSelectedBadge}
              </span>
              <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: '#FFFFFF', fontWeight: '700' }}>
                {td.detectedDiseaseLabel}: {diagnosedDisease}
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#CBD5E1' }}>
                {td.autoMatchedDesc(selectedChem?.trade_names[0] || 'Recommended Medicine')}
              </p>
            </div>
          </div>
          <span style={{ background: '#10B981', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
            ✓ AI Prescribed
          </span>
        </div>
      ) : (
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '22px' }}>💡</span>
          <div style={{ fontSize: '12px', color: '#BAE6FD', lineHeight: '1.5' }}>
            {td.manualHelpText}
          </div>
        </div>
      )}

      {/* QUICK ACREAGE PRESETS */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px' }}>
          {td.step1}
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[1.0, 2.0, 2.5, 4.5, 5.0].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAreaAcres(preset)}
              style={{
                background: parseFloat(areaAcres) === preset ? '#10B981' : '#1E293B',
                color: parseFloat(areaAcres) === preset ? '#000' : '#E2E8F0',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {preset} {td.acres}
            </button>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={areaAcres}
              onChange={(e) => setAreaAcres(e.target.value)}
              placeholder="Custom"
              style={{ width: '80px', background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '8px', padding: '7px 10px', fontSize: '13px' }}
            />
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>{td.acres}</span>
          </div>
        </div>
      </div>

      {/* INPUT CONTROLS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Chemical Selector with Disease Tags */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
            {td.step2}
          </label>
          <select
            value={selectedChemId}
            onChange={(e) => setSelectedChemId(e.target.value)}
            style={{ width: '100%', background: '#1E293B', color: '#F8FAFC', border: '1.5px solid #334155', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '600' }}
          >
            {chemicals.map((c) => {
              const targets = [...(c.target_diseases || []), ...(c.target_pests || [])].slice(0, 2).join(', ');
              return (
                <option key={c.chemical_id} value={c.chemical_id}>
                  {c.trade_names[0]} ({c.active_ingredient}) {targets ? `— For: ${targets}` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Knapsack Pump Size */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>
            {td.step3}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[15, 20].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setTankCapacity(size)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: tankCapacity === size ? '2px solid #38BDF8' : '1px solid #334155',
                  background: tankCapacity === size ? 'rgba(56, 189, 248, 0.2)' : '#1E293B',
                  color: tankCapacity === size ? '#38BDF8' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                🪣 {size} {td.litersPump}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* RESULTS HERO SECTION */}
      {calculationResult && (
        <div>
          
          {/* BIG 3-METRIC SUMMARY CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            
            {/* Total Pumps Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: '1.5px solid #38BDF8',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>🪣</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>{td.totalPumpsCard}</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#38BDF8', margin: '4px 0' }}>
                {calculationResult.total_tanks_required} <span style={{ fontSize: '16px' }}>Pumps</span>
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                {td.capacityEach(tankCapacity)}
              </div>
            </div>

            {/* Medicine Per Pump Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: '1.5px solid #10B981',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>🧪</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>{td.perPumpCard}</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10B981', margin: '4px 0' }}>
                {calculationResult.chemical_per_tank} <span style={{ fontSize: '16px' }}>{calculationResult.unit}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                {td.stdCapDesc}
              </div>
            </div>

            {/* Total Medicine Needed */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: '1.5px solid #F59E0B',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>🧴</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>{td.totalBottleCard}</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#F59E0B', margin: '4px 0' }}>
                {calculationResult.total_chemical_needed} <span style={{ fontSize: '16px' }}>{calculationResult.unit}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                {td.inTotalWater(calculationResult.total_water_liters)}
              </div>
            </div>

            {/* Safe Harvest Wait (PHI) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: '1.5px solid #EC4899',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>⏳</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>{td.phiCard}</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#EC4899', margin: '4px 0' }}>
                {calculationResult.phi_days} <span style={{ fontSize: '16px' }}>Days</span>
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                {td.phiDesc(calculationResult.phi_days)}
              </div>
            </div>

          </div>

          {/* VISUAL PUMP MIXING INSTRUCTION (FARMER FRIENDLY) */}
          <div style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            border: '1.5px solid #334155',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {td.howToMixTitle}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '18px' }}>1️⃣</span>
                <h4 style={{ fontSize: '13px', margin: '4px 0', color: '#38BDF8' }}>{td.step1Title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E1' }}>{td.step1Desc(tankCapacity)}</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '18px' }}>2️⃣</span>
                <h4 style={{ fontSize: '13px', margin: '4px 0', color: '#10B981' }}>{td.step2Title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E1' }}>{td.step2Desc(calculationResult.chemical_per_tank, calculationResult.unit)}</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '18px' }}>3️⃣</span>
                <h4 style={{ fontSize: '13px', margin: '4px 0', color: '#F59E0B' }}>{td.step3Title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E1' }}>{td.step3Desc}</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '18px' }}>4️⃣</span>
                <h4 style={{ fontSize: '13px', margin: '4px 0', color: '#A78BFA' }}>{td.step4Title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E1' }}>{td.step4Desc}</p>
              </div>
            </div>
          </div>

          {/* SAFETY PPE ALERT */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #F59E0B',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <div>
                <strong style={{ color: '#FCD34D', fontSize: '13px' }}>{td.safetyTitle}</strong>
                <div style={{ color: '#CBD5E1', fontSize: '12px', marginTop: '2px' }}>
                  {td.safetyDesc}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '11px', background: '#F59E0B', color: '#000', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
              {td.reiLabel(calculationResult.rei_hours)}
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
