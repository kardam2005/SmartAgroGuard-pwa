import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function LifecycleTimeline({ selectedFarm, onTriggerScan }) {
  const [timelineData, setTimelineData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFarm?.farm_id) {
      fetchTimeline();
    }
  }, [selectedFarm]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const sowingDate = selectedFarm?.sowing_date || '2026-06-28';
      const res = await api.get(`/api/v1/lifecycle/timeline/${selectedFarm?.farm_id || 'default'}`, {
        params: { sowing_date: sowingDate }
      });
      setTimelineData(res.data);
      setSelectedWeek(res.data.active_milestone);
    } catch (err) {
      console.error('Failed to fetch lifecycle timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!timelineData) return null;

  return (
    <div className="card shadow-lg" style={{ background: '#0F172A', color: '#F8FAFC', borderRadius: '16px', border: '1px solid #1E293B', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1E293B', paddingBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📅 12-Week Maize Lifecycle & Scan Roadmap
          </h2>
          <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '13px' }}>
            Sowing Date: {timelineData.sowing_date} • Current DAS: <strong>{timelineData.current_das} Days</strong> • Season Progress: <strong>{timelineData.progress_pct}%</strong>
          </p>
        </div>
        <button
          onClick={onTriggerScan}
          className="btn btn-primary"
          style={{ background: '#10B981', borderColor: '#10B981', padding: '8px 16px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer' }}
        >
          📸 Take Weekly Scan #{timelineData.current_week_number}
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', background: '#1E293B', borderRadius: '10px', height: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ width: `${timelineData.progress_pct}%`, background: 'linear-gradient(90deg, #10B981, #38BDF8)', height: '100%' }} />
      </div>

      {/* 12-Week Horizontal Milestone Stepper */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '12px', marginBottom: '20px' }}>
        {timelineData.all_milestones.map((m) => {
          const isActive = selectedWeek?.week_number === m.week_number;
          const isCurrentWeek = timelineData.current_week_number === m.week_number;
          return (
            <div
              key={m.week_number}
              onClick={() => setSelectedWeek(m)}
              style={{
                minWidth: '95px',
                padding: '10px 8px',
                borderRadius: '10px',
                background: isActive ? 'rgba(16, 185, 129, 0.2)' : isCurrentWeek ? 'rgba(56, 189, 248, 0.15)' : '#1E293B',
                border: isActive ? '2px solid #10B981' : isCurrentWeek ? '2px solid #38BDF8' : '1px solid #334155',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '700', color: m.critical_window ? '#EF4444' : '#94A3B8' }}>
                {m.critical_window ? '🔥 W' + m.week_number : 'Week ' + m.week_number}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', margin: '2px 0' }}>
                {m.growth_stage}
              </div>
              <div style={{ fontSize: '10px', color: m.status === 'COMPLETED' ? '#10B981' : m.status === 'ACTIVE' ? '#38BDF8' : '#64748B' }}>
                {m.status === 'COMPLETED' ? '✓ Done' : m.status === 'ACTIVE' ? '⚡ Active' : 'Upcoming'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Week Detailed Card */}
      {selectedWeek && (
        <div style={{ background: '#1E293B', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                WEEK {selectedWeek.week_number} • DAS {selectedWeek.das_start} - {selectedWeek.das_end}
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F8FAFC', margin: '6px 0 0 0' }}>
                {selectedWeek.stage_title} ({selectedWeek.growth_stage})
              </h3>
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'right' }}>
              <div>{selectedWeek.calendar_start_date} – {selectedWeek.calendar_end_date}</div>
              <div style={{ color: selectedWeek.scans_completed_count > 0 ? '#10B981' : '#F59E0B', fontWeight: '600' }}>
                📸 {selectedWeek.scans_completed_count} Scan(s) Logged
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {/* Scouting Checklist */}
            <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#38BDF8', margin: '0 0 8px 0' }}>
                🔍 Field Scouting Checklist:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#CBD5E1', lineHeight: '1.6' }}>
                {selectedWeek.scouting_checklist.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Agronomic Operations */}
            <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#10B981', margin: '0 0 8px 0' }}>
                🚜 Prescribed Fertigation & Operations:
              </h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#CBD5E1', lineHeight: '1.5' }}>
                {selectedWeek.agronomic_operations}
              </p>
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', color: '#38BDF8' }}>
                🔔 {selectedWeek.reminder_copy}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
