import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Module4WeatherDashboard({ farmId, farm }) {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [allAlerts, setAllAlerts] = useState([]);
  const [acknowledgingId, setAcknowledgingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedForecastTab, setSelectedForecastTab] = useState('hourly'); // 'hourly' or 'alerts'

  useEffect(() => {
    if (farmId) {
      loadWeatherDashboard();
    }
  }, [farmId]);

  const loadWeatherDashboard = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [overviewRes, alertsRes] = await Promise.all([
        api.get(`/api/v1/weather/farm/${farmId}/overview`),
        api.get(`/api/v1/weather/farm/${farmId}/alerts?active_only=false&limit=20`).catch(() => ({ data: [] }))
      ]);

      if (overviewRes && overviewRes.data) {
        setWeatherData(overviewRes.data);
      }
      if (alertsRes && alertsRes.data) {
        setAllAlerts(alertsRes.data);
      }
    } catch (err) {
      console.error('Failed to load weather overview:', err);
      setErrorMsg('Could not retrieve meteorological intelligence. Retrying or displaying offline estimates.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    setAcknowledgingId(alertId);
    try {
      await api.post(`/api/v1/weather/alerts/${alertId}/acknowledge`);
      // Update local state to deactivate the alert
      setWeatherData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          alerts: prev.alerts.map(a => a.alert_id === alertId ? { ...a, is_active: false } : a)
        };
      });
      setAllAlerts(prev => prev.map(a => a.alert_id === alertId ? { ...a, is_active: false } : a));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setAcknowledgingId(null);
    }
  };

  if (loading) {
    return (
      <div className="section-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px', animation: 'spin 2s linear infinite' }}>🌦️</div>
        <h3 style={{ color: 'var(--text-main)' }}>Synchronizing Meteorological Feed...</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Querying high-resolution 48-hour atmospheric forecasts and evaluating biological crop hazard rules.
        </p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="section-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h4 style={{ color: '#EF4444' }}>Weather Intelligence Unavailable</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '8px 0 16px' }}>{errorMsg || 'Failed to connect to weather service.'}</p>
        <button onClick={loadWeatherDashboard} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>
          ↻ Retry Connection
        </button>
      </div>
    );
  }

  const { weather, spray_safety, source, alerts = [], hourly_forecast_48h = [] } = weatherData;

  // Temperature physiological comfort indicator
  const tempVal = weather?.temperature_c || 25.0;
  const tempStatus = tempVal < 10.0 ? { label: 'Cold Stress Risk', color: '#38BDF8' }
    : tempVal <= 32.0 ? { label: 'Optimal Corn Growth Zone', color: '#10B981' }
    : { label: 'Heat Stress Range', color: '#F59E0B' };

  // Humidity status
  const rhVal = weather?.relative_humidity_percent || 65;
  const rhStatus = rhVal >= 85 ? { label: 'High Spore Germination Risk', color: '#F59E0B' }
    : { label: 'Vegetative Moisture Zone', color: '#10B981' };

  // Spray status
  const isSpraySafe = spray_safety?.is_spray_safe;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', maxWidth: '100%', minWidth: 0, width: '100%' }}>
      
      {/* 1. Header Banner & Data Provenance */}
      <div className="section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 className="sidebar-title" style={{ margin: 0 }}>🌦️ Weather Intelligence & Risk Early-Warning</h3>
            <span style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: 600,
              background: source?.status === 'LIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: source?.status === 'LIVE' ? '#10B981' : '#F59E0B',
              border: `1px solid ${source?.status === 'LIVE' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
            }}>
              ● {source?.status || 'LIVE'} {source?.is_fallback ? '(Agro-Climatic Normal)' : ''}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Registered Farm: <strong style={{ color: 'var(--text-main)' }}>{weatherData.farm_address}</strong>
          </p>
        </div>

        <button 
          onClick={loadWeatherDashboard}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          ↻ Refresh Weather
        </button>
      </div>

      {/* Fallback Warning Notice if applicable */}
      {source?.is_fallback && (
        <div style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px',
          padding: '14px 18px',
          color: '#F59E0B',
          fontSize: '13px'
        }}>
          ⚠️ <strong>Live Sensor Network Down:</strong> Active predictions are operating in robust fallback mode using validated IMD Agro-Climatic Normals for Gujarat Zone III. Spray operations default to conservative safety gates.
        </div>
      )}

      {/* 2. Primary Atmospheric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '16px' }}>
        
        {/* Temperature Card */}
        <div className="section-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ambient Temperature</span>
            <span style={{ fontSize: '20px' }}>🌡️</span>
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--text-main)', margin: '8px 0 4px', fontWeight: 700 }}>
            {tempVal.toFixed(1)}°C
          </h2>
          <div style={{ fontSize: '12px', color: tempStatus.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tempStatus.color }}></span>
            {tempStatus.label}
          </div>
        </div>

        {/* Relative Humidity Card */}
        <div className="section-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Canopy Relative Humidity</span>
            <span style={{ fontSize: '20px' }}>💧</span>
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--text-main)', margin: '8px 0 4px', fontWeight: 700 }}>
            {rhVal}%
          </h2>
          <div style={{ fontSize: '12px', color: rhStatus.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: rhStatus.color }}></span>
            {rhStatus.label}
          </div>
        </div>

        {/* Antecedent Rainfall Card */}
        <div className="section-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recent Rainfall (24h / 48h)</span>
            <span style={{ fontSize: '20px' }}>🌧️</span>
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--text-main)', margin: '8px 0 4px', fontWeight: 700 }}>
            {(weather?.rainfall_last_24h_mm || 0).toFixed(1)} mm
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            48h Cumulative: {(weather?.rainfall_last_48h_mm || 0).toFixed(1)} mm
          </div>
        </div>

        {/* Operational Spray Safety Card */}
        <div className="section-card" style={{ margin: 0, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Spray Safety Gate</span>
            <span style={{ fontSize: '20px' }}>🛡️</span>
          </div>
          <h2 style={{ fontSize: '22px', color: isSpraySafe ? '#10B981' : '#EF4444', margin: '12px 0 4px', fontWeight: 700 }}>
            {isSpraySafe ? '✓ SPRAY AUTHORIZED' : '⛔ HOLD SPRAY'}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Wind: {(weather?.wind_speed_kmh || 0).toFixed(1)} km/h {isSpraySafe ? '(Within ≤18 km/h limit)' : '(Drift Risk)'}
          </div>
        </div>

      </div>

      {/* 3. Active Biological Hazard Alerts (Table 1.6.7) */}
      <div className="section-card">
        <h4 style={{ color: 'var(--text-main)', fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🚨</span> Active Biological Hazard Alerts ({alerts.filter(a => a.is_active).length})
        </h4>

        {alerts.length === 0 || alerts.every(a => !a.is_active || a.alert_type === 'None') ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <span style={{ fontSize: '28px' }}>✅</span>
            <div>
              <h4 style={{ color: '#10B981', margin: 0, fontSize: '15px' }}>Atmospheric Conditions Optimal for Maize</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
                No active frost chilling risk, torrential precipitation, or high-humidity fungal incubation thresholds detected. Standard field operations safe.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {alerts.filter(a => a.is_active && a.alert_type !== 'None').map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              const isWarn = alert.severity === 'WARNING';
              const badgeBg = isCrit ? 'rgba(239,68,68,0.15)' : isWarn ? 'rgba(249,115,22,0.15)' : 'rgba(234,179,8,0.15)';
              const badgeBorder = isCrit ? 'rgba(239,68,68,0.4)' : isWarn ? 'rgba(249,115,22,0.4)' : 'rgba(234,179,8,0.4)';
              const badgeColor = isCrit ? '#EF4444' : isWarn ? '#F97316' : '#EAB308';

              return (
                <div 
                  key={alert.alert_id} 
                  style={{
                    background: badgeBg,
                    border: `1px solid ${badgeBorder}`,
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: badgeColor,
                        color: '#FFFFFF'
                      }}>
                        {alert.severity}
                      </span>
                      <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px' }}>{alert.title}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({alert.alert_id})</span>
                    </div>

                    <button
                      onClick={() => handleAcknowledge(alert.alert_id)}
                      disabled={acknowledgingId === alert.alert_id}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {acknowledgingId === alert.alert_id ? 'Acknowledging...' : '✓ Acknowledge Alert'}
                    </button>
                  </div>

                  <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '14px' }}>
                    {alert.message}
                  </p>

                  {alert.guidance && alert.guidance.length > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Agronomic Response Guidance:
                      </strong>
                      <ul style={{ margin: '6px 0 0', paddingLeft: '18px', color: 'var(--text-main)', fontSize: '13px' }}>
                        {alert.guidance.map((g, idx) => (
                          <li key={idx} style={{ marginTop: '3px' }}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Spray Safety & Rainfastness Gate Details (Module 3 Hand-Off) */}
      <div className="section-card">
        <h4 style={{ color: 'var(--text-main)', fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧪</span> Module 3 Chemical Treatment Safety Window
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(15,23,42,0.4)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wind Drift Assessment</span>
            <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 600, color: spray_safety?.wind_safe ? '#10B981' : '#EF4444' }}>
              {spray_safety?.wind_safe ? '✓ Wind Speed Compliant (≤18 km/h)' : '❌ High Wind Drift Hazard'}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Current velocity: {(weather?.wind_speed_kmh || 0).toFixed(1)} km/h.
            </p>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.4)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rainfastness Washout Window</span>
            <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 600, color: spray_safety?.rain_safe ? '#10B981' : '#EF4444' }}>
              {spray_safety?.rain_safe ? '✓ Safe 4-Hour Dry Window Clear' : '❌ Rain Washout Threat'}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {spray_safety?.rain_expected 
                ? `Precipitation expected in ${spray_safety.hours_until_rain}h.` 
                : 'No precipitation forecast in next 24 hours.'}
            </p>
          </div>
        </div>

        {spray_safety?.blocking_reasons && spray_safety.blocking_reasons.length > 0 && (
          <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={{ color: '#EF4444', fontSize: '13px', fontWeight: 600 }}>Active Chemical Spray Restrictions:</span>
            <ul style={{ margin: '4px 0 0', paddingLeft: '18px', color: '#EF4444', fontSize: '12px' }}>
              {spray_safety.blocking_reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5. 48-Hour Micro-Climate Hourly Matrix & Historical Alerts Tabs */}
      <div className="section-card">
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => setSelectedForecastTab('hourly')}
            style={{
              background: selectedForecastTab === 'hourly' ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: selectedForecastTab === 'hourly' ? '#10B981' : 'var(--text-muted)',
              border: `1px solid ${selectedForecastTab === 'hourly' ? 'rgba(16,185,129,0.4)' : 'transparent'}`,
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            📊 48-Hour Hourly Timeline ({hourly_forecast_48h.length} pts)
          </button>
          <button
            onClick={() => setSelectedForecastTab('alerts')}
            style={{
              background: selectedForecastTab === 'alerts' ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: selectedForecastTab === 'alerts' ? '#10B981' : 'var(--text-muted)',
              border: `1px solid ${selectedForecastTab === 'alerts' ? 'rgba(16,185,129,0.4)' : 'transparent'}`,
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            📑 Alert History Feed ({allAlerts.length})
          </button>
        </div>

        {selectedForecastTab === 'hourly' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '12px', minWidth: '760px' }}>
              {hourly_forecast_48h.slice(0, 24).map((pt, idx) => {
                const dt = new Date(pt.timestamp);
                const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isCold = pt.temperature_c <= 7.0;
                const hasRain = pt.rainfall_mm > 0;

                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(15,23,42,0.4)',
                      border: `1px solid ${isCold ? '#38BDF8' : hasRain ? '#60A5FA' : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      padding: '12px 14px',
                      minWidth: '100px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+{idx}h ({timeStr})</span>
                    <span style={{ fontSize: '18px', margin: '4px 0' }}>
                      {hasRain ? '🌧️' : pt.temperature_c <= 7 ? '❄️' : (pt.is_day ? '☀️' : '🌙')}
                    </span>
                    <strong style={{ fontSize: '15px', color: isCold ? '#38BDF8' : 'var(--text-main)' }}>
                      {pt.temperature_c.toFixed(1)}°
                    </strong>
                    <span style={{ fontSize: '11px', color: pt.relative_humidity_percent >= 90 ? '#F59E0B' : 'var(--text-muted)' }}>
                      {pt.relative_humidity_percent.toFixed(0)}% RH
                    </span>
                    {hasRain && (
                      <span style={{ fontSize: '10px', color: '#60A5FA', fontWeight: 600 }}>
                        {pt.rainfall_mm.toFixed(1)} mm
                      </span>
                    )}
                    <span style={{ fontSize: '10px', color: pt.wind_speed_kmh > 18 ? '#EF4444' : 'var(--text-muted)' }}>
                      💨 {pt.wind_speed_kmh.toFixed(0)}k
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedForecastTab === 'alerts' && (
          <div style={{ overflowX: 'auto' }}>
            {allAlerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No recorded alerts for this farm cycle yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Alert ID</th>
                    <th style={{ padding: '8px' }}>Hazard Type</th>
                    <th style={{ padding: '8px' }}>Severity</th>
                    <th style={{ padding: '8px' }}>Trigger Value</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allAlerts.map(a => (
                    <tr key={a.alert_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-main)' }}>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>{a.alert_id}</td>
                      <td style={{ padding: '8px' }}>{a.alert_type}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          background: a.severity === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                          color: a.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B'
                        }}>
                          {a.severity}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        {a.trigger_value !== null ? `${a.trigger_value} ${a.trigger_unit || ''}` : 'N/A'}
                      </td>
                      <td style={{ padding: '8px' }}>
                        {a.is_active ? <span style={{ color: '#EF4444' }}>● Active</span> : <span style={{ color: '#10B981' }}>✓ Acknowledged</span>}
                      </td>
                      <td style={{ padding: '8px', color: 'var(--text-muted)' }}>
                        {new Date(a.alert_date || a.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
