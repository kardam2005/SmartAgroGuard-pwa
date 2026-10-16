import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Module4LifecycleHistory({ farmId, farm }) {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [growthCurve, setGrowthCurve] = useState(null);
  const [healthTrend, setHealthTrend] = useState(null);
  const [observations, setObservations] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [seasonStats, setSeasonStats] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    if (farmId) {
      loadHistoryData();
    }
  }, [farmId]);

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      const [ovRes, gcRes, htRes, obsRes, advRes, stRes] = await Promise.all([
        api.get(`/api/v1/history/farm/${farmId}/overview`).catch(err => { console.warn(err); return null; }),
        api.get(`/api/v1/history/farm/${farmId}/growth-curve`).catch(err => { console.warn(err); return null; }),
        api.get(`/api/v1/history/farm/${farmId}/health-trend`).catch(err => { console.warn(err); return null; }),
        api.get(`/api/v1/history/farm/${farmId}/observations`).catch(err => { console.warn(err); return null; }),
        api.get(`/api/v1/history/farm/${farmId}/advisories`).catch(err => { console.warn(err); return null; }),
        api.get(`/api/v1/history/farm/${farmId}/season-statistics`).catch(err => { console.warn(err); return null; })
      ]);

      if (ovRes) setOverview(ovRes.data);
      if (gcRes) {
        setGrowthCurve(gcRes.data);
        if (gcRes.data.points && gcRes.data.points.length > 0) {
          setSelectedPoint(gcRes.data.points[gcRes.data.points.length - 1]);
        }
      }
      if (htRes) setHealthTrend(htRes.data);
      if (obsRes) setObservations(obsRes.data.observations || []);
      if (advRes) setAdvisories(advRes.data.items || []);
      if (stRes) setSeasonStats(stRes.data);
    } catch (err) {
      console.error('Error loading module 4 history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
        <h3 style={{ color: 'var(--text-main)' }}>Compiling Crop Lifecycle History...</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Querying temporal growth metrics, benchmark bands, and disease persistence records.
        </p>
      </div>
    );
  }

  const dq = overview?.data_quality;
  const qualityBadgeColor = dq?.quality_level === 'GOOD' ? '#10B981' : dq?.quality_level === 'LIMITED' ? '#F59E0B' : '#EF4444';

  const healthStatus = overview?.latest_health_status || 'UNKNOWN';
  const healthColor = healthStatus === 'NORMAL' ? '#10B981' : healthStatus === 'STUNTED' ? '#F59E0B' : '#EF4444';

  const points = growthCurve?.points || [];
  const maxVal = Math.max(
    ...points.map(p => Math.max(p.measured_height_cm || 0, p.expected_max_cm || 0)),
    100
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      
      {/* 1. TOP EXECUTIVE SEASON OVERVIEW CARD */}
      <div className="section-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)', borderColor: '#334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '20px', color: '#F8FAFC', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🌾 {farm?.crop_type || 'Corn'} Lifecycle History & Temporal Analytics
              <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                MODULE 4
              </span>
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '4px' }}>
              {farm?.farm_address || farmId} • Variety: <strong>{farm?.variety || 'GAYMH-1'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '5px 12px',
              borderRadius: '20px',
              background: `${qualityBadgeColor}20`,
              color: qualityBadgeColor,
              border: `1px solid ${qualityBadgeColor}50`
            }}>
              Data Quality: {dq?.quality_level || 'UNKNOWN'}
            </span>

            <button
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px' }}
              onClick={loadHistoryData}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* 6 Metric Grid Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Days After Sowing</span>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#F8FAFC', marginTop: '4px' }}>
              {overview?.das_available && overview?.current_das !== null ? `${overview.current_das} d` : 'Unset'}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {overview?.sowing_date ? `Sown: ${overview.sowing_date}` : 'Missing sowing date'}
            </span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Valid Scans</span>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#F8FAFC', marginTop: '4px' }}>
              {overview?.total_scans || 0}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Corn observations
            </span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Growth Stage</span>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#38BDF8', marginTop: '4px' }}>
              {overview?.latest_growth_week || 'N/A'}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Latest visual week</span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Stalk Height</span>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#F8FAFC', marginTop: '4px' }}>
              {overview?.latest_height_cm !== null ? `${overview?.latest_height_cm} cm` : 'No marker'}
            </div>
            <span style={{ fontSize: '11px', color: '#10B981' }}>
              {overview?.latest_height_status || 'WITHIN_EXPECTED'}
            </span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Health Status</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: healthColor, marginTop: '4px' }}>
              {healthStatus}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Multimodal composite</span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Last Scanned</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#F8FAFC', marginTop: '4px' }}>
              {dq?.last_scan_date ? dq.last_scan_date.slice(5) : 'None'}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {dq?.days_since_last_scan !== null ? `${dq.days_since_last_scan} days ago` : ''}
            </span>
          </div>
        </div>

        {/* Quality Notice Banner */}
        {dq?.quality_level === 'INSUFFICIENT' && (
          <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', borderLeft: '4px solid #EF4444', color: '#F8FAFC', fontSize: '13px' }}>
            ⚠️ <strong>Insufficient Scan Data:</strong> At least 2 valid crop scans are required to evaluate height velocity and multi-day temporal trends.
          </div>
        )}

        {dq?.quality_level === 'LIMITED' && (
          <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', borderLeft: '4px solid #F59E0B', color: '#F8FAFC', fontSize: '13px' }}>
            ℹ️ <strong>Limited History Coverage:</strong> {dq.missing_sowing_date ? 'Sowing date is not registered; DAS is omitted.' : `Average interval is ${dq.average_days_between_scans} days with a max gap of ${dq.longest_gap_days} days.`}
          </div>
        )}
      </div>

      {/* 2. GROWTH CURVE & BENCHMARK BAND TRAJECTORY */}
      <div className="section-card" style={{ borderColor: '#334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '17px', color: '#F8FAFC', fontWeight: 'bold' }}>
              📈 Stalk Growth Trajectory vs. Biological Benchmarks
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '12px' }}>
              Measured stalk height plotted against phenological expected range bands
            </p>
          </div>

          {growthCurve?.growth_score_available && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#34D399'
            }}>
              Growth Score: {growthCurve.growth_score_percent}% ({growthCurve.within_expected_scans}/{growthCurve.valid_height_scans} scans on track)
            </div>
          )}
        </div>

        {/* Selected Point Inspector Strip */}
        {selectedPoint && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderLeft: '4px solid #38BDF8',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '16px',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '12px'
          }}>
            <div>
              <span style={{ color: '#64748B' }}>Scan Date / DAS:</span>{' '}
              <strong style={{ color: '#F8FAFC' }}>
                {selectedPoint.scan_date} {selectedPoint.das !== null ? `(Day ${selectedPoint.das})` : ''}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Measured Stalk Height:</span>{' '}
              <strong style={{ color: '#38BDF8' }}>
                {selectedPoint.measured_height_cm !== null ? `${selectedPoint.measured_height_cm} cm` : 'No marker'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Expected Benchmark Band:</span>{' '}
              <strong style={{ color: '#10B981' }}>
                {selectedPoint.expected_min_cm !== null ? `${selectedPoint.expected_min_cm}–${selectedPoint.expected_max_cm} cm` : 'N/A'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Biological Stage:</span>{' '}
              <strong style={{ color: '#F8FAFC' }}>{selectedPoint.growth_week || 'Corn'}</strong>
            </div>
          </div>
        )}

        {/* Visual Chart Container */}
        {points.length > 0 ? (
          <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
            <div style={{ minWidth: '600px', height: '220px', position: 'relative', display: 'flex', alignItems: 'flex-end', borderBottom: '2px solid #334155', paddingLeft: '40px', paddingBottom: '24px' }}>
              
              {/* Guidelines */}
              <div style={{ position: 'absolute', left: '40px', right: 0, bottom: '60px', height: '1px', background: 'rgba(51, 65, 85, 0.4)' }} />
              <div style={{ position: 'absolute', left: '40px', right: 0, bottom: '110px', height: '1px', background: 'rgba(51, 65, 85, 0.4)' }} />
              <div style={{ position: 'absolute', left: '40px', right: 0, bottom: '160px', height: '1px', background: 'rgba(51, 65, 85, 0.4)' }} />
              
              <span style={{ position: 'absolute', left: 0, bottom: '55px', fontSize: '10px', color: '#64748B' }}>50cm</span>
              <span style={{ position: 'absolute', left: 0, bottom: '105px', fontSize: '10px', color: '#64748B' }}>100cm</span>
              <span style={{ position: 'absolute', left: 0, bottom: '155px', fontSize: '10px', color: '#64748B' }}>150cm</span>

              {/* Point Columns */}
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%' }}>
                {points.map((pt, idx) => {
                  const isSelected = selectedPoint === pt;
                  const hasH = pt.measured_height_cm !== null;
                  const hasExp = pt.expected_min_cm !== null && pt.expected_max_cm !== null;

                  const hPix = hasH ? (pt.measured_height_cm / maxVal) * 160 : 0;
                  const expMinPix = hasExp ? (pt.expected_min_cm / maxVal) * 160 : 0;
                  const expMaxPix = hasExp ? (pt.expected_max_cm / maxVal) * 160 : 0;
                  const bandHeight = Math.max(12, expMaxPix - expMinPix);

                  const isOptimal = pt.height_status === 'WITHIN_EXPECTED';

                  return (
                    <div
                      key={`pt-${idx}`}
                      onClick={() => setSelectedPoint(pt)}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        width: '44px',
                        height: '100%',
                        cursor: 'pointer',
                        padding: '0 4px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent'
                      }}
                      title={`${pt.scan_date}: ${pt.measured_height_cm} cm`}
                    >
                      {/* Expected Band */}
                      {hasExp && (
                        <div style={{
                          position: 'absolute',
                          bottom: `${expMinPix + 24}px`,
                          height: `${bandHeight}px`,
                          width: '32px',
                          background: 'rgba(16, 185, 129, 0.22)',
                          border: '1px solid rgba(16, 185, 129, 0.6)',
                          borderRadius: '4px',
                          zIndex: 1
                        }} />
                      )}

                      {/* Actual Height Bar */}
                      {hasH && (
                        <div style={{
                          width: '12px',
                          height: `${Math.max(8, hPix)}px`,
                          borderRadius: '6px',
                          background: isSelected ? '#F59E0B' : isOptimal ? '#38BDF8' : '#EF4444',
                          position: 'relative',
                          zIndex: 2,
                          marginBottom: '24px'
                        }}>
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            position: 'absolute',
                            top: '-5px',
                            left: '1px',
                            boxShadow: '0 0 6px rgba(0,0,0,0.5)'
                          }} />
                        </div>
                      )}

                      {/* X-axis Label */}
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        fontSize: '10px',
                        color: isSelected ? '#38BDF8' : '#64748B',
                        fontWeight: isSelected ? 'bold' : 'normal'
                      }}>
                        {pt.das !== null ? `d${pt.das}` : pt.scan_date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '11px', color: '#94A3B8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#38BDF8', borderRadius: '3px' }} />
                <span>Measured Height (Within Target)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#EF4444', borderRadius: '3px' }} />
                <span>Below Expected (Stunted)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '10px', background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10B981', borderRadius: '2px' }} />
                <span>Expected Range Band (Biological Benchmarks)</span>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: '#64748B', fontStyle: 'italic' }}>No height records mapped yet.</p>
        )}
      </div>

      {/* 3. TEMPORAL OBSERVATIONS (CHANGE DETECTION ALERTS) */}
      <div className="section-card" style={{ borderColor: '#334155' }}>
        <h3 style={{ fontSize: '17px', color: '#F8FAFC', fontWeight: 'bold', marginBottom: '4px' }}>
          🔍 Temporal Change Observations
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '14px' }}>
          Consecutive observation patterns (Stalk shrinkage, Disease persistence episodes, 2-scan recovery)
        </p>

        {observations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {observations.map((obs) => {
              const isWarn = obs.severity === 'WARNING';
              const borderCol = isWarn ? '#F59E0B' : '#10B981';
              return (
                <div
                  key={obs.observation_id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderLeft: `4px solid ${borderCol}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    borderTop: '1px solid #334155',
                    borderRight: '1px solid #334155',
                    borderBottom: '1px solid #334155'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{isWarn ? '⚠️' : '✅'}</span>
                      <strong style={{ color: '#F8FAFC', fontSize: '14px' }}>{obs.headline}</strong>
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748B' }}>
                      ID: {obs.observation_id}
                    </span>
                  </div>
                  <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '6px', lineHeight: '1.5' }}>
                    {obs.detail}
                  </p>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                    Affected Scans: {obs.affected_scans.join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', color: '#34D399', fontSize: '13px' }}>
            ✓ No negative temporal changes or height regressions detected across consecutive scans.
          </div>
        )}
      </div>

      {/* 4. HEALTH & PATHOLOGY TIMELINE TRACK */}
      <div className="section-card" style={{ borderColor: '#334155' }}>
        <h3 style={{ fontSize: '17px', color: '#F8FAFC', fontWeight: 'bold', marginBottom: '4px' }}>
          🩺 Health & Disease Progression Track
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '14px' }}>
          Multimodal health status and detected foliar pathogens across chronological scan dates
        </p>

        {healthTrend?.points?.length > 0 ? (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {healthTrend.points.map((pt, idx) => {
              const isHealthy = pt.health_status === 'NORMAL';
              const dotColor = isHealthy ? '#10B981' : pt.health_status === 'STUNTED' ? '#F59E0B' : '#EF4444';
              return (
                <div
                  key={`ht-${idx}`}
                  style={{
                    minWidth: '110px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '8px',
                    padding: '10px',
                    border: '1px solid #334155',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: dotColor, margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '11px', color: '#F8FAFC', fontWeight: 'bold' }}>{pt.scan_date.slice(5)}</div>
                  <div style={{ fontSize: '10px', color: dotColor, fontWeight: 'bold', marginTop: '2px' }}>
                    {pt.health_status}
                  </div>
                  {pt.disease && pt.disease !== 'Healthy' && (
                    <div style={{ fontSize: '10px', color: '#F87171', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pt.disease}>
                      {pt.disease}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#64748B', fontStyle: 'italic' }}>No health points logged.</p>
        )}
      </div>

      {/* 5. HISTORICAL ADVISORIES & SEASON SUMMARY REPORT BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '10px', fontWeight: 'bold' }}
          onClick={() => setShowStatsModal(true)}
        >
          📊 Open Full Season Report Card & Metrics
        </button>

        <span style={{ fontSize: '12px', color: '#64748B' }}>
          Cataloged Advisories: {advisories.length} • Total Corn Scans: {overview?.total_scans || 0}
        </span>
      </div>

      {/* 6. SEASON STATISTICS MODAL */}
      {showStatsModal && seasonStats && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', color: '#F8FAFC', fontWeight: 'bold' }}>
                📋 Season Summary Report Card
              </h3>
              <button className="btn btn-secondary" onClick={() => setShowStatsModal(false)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Observed Crop Span</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#F8FAFC' }}>
                  {seasonStats.lifecycle_days !== null ? `${seasonStats.lifecycle_days} Days` : 'N/A'}
                </div>
              </div>

              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Growth Score</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#34D399' }}>
                  {seasonStats.growth_score_available ? `${seasonStats.growth_score_percent}%` : 'N/A'}
                </div>
              </div>

              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Disease Incidents</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: seasonStats.disease_incidents > 0 ? '#F87171' : '#34D399' }}>
                  {seasonStats.disease_incidents}
                </div>
              </div>

              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Avg Scan Spacing</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38BDF8' }}>
                  {seasonStats.average_days_between_scans ? `${seasonStats.average_days_between_scans} d` : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px' }}>Confirmed Pathogens:</h4>
              {seasonStats.unique_diseases && seasonStats.unique_diseases.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {seasonStats.unique_diseases.map((d, idx) => (
                    <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                      ⚠️ {d}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#10B981', fontSize: '13px' }}>✓ No confirmed pathogens logged.</p>
              )}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px' }}>Treatment Prescriptions:</h4>
              <div style={{ fontSize: '13px', color: '#F8FAFC', lineHeight: '1.8' }}>
                <div>Total Advisories: <strong>{seasonStats.total_advisories}</strong></div>
                <div>Chemical Regimens: <strong style={{ color: '#FCA5A5' }}>{seasonStats.chemical_advisories}</strong></div>
                <div>Cultural / Non-Chemical Actions: <strong style={{ color: '#7DD3FC' }}>{seasonStats.non_chemical_advisories}</strong></div>
              </div>
            </div>

            <button className="btn btn-secondary btn-block" onClick={() => setShowStatsModal(false)}>
              Close Report
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
