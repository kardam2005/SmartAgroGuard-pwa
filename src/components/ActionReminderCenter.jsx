import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ActionReminderCenter({ selectedFarm }) {
  const [reminders, setReminders] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFarm?.farm_id) {
      fetchReminders();
    }
  }, [selectedFarm]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/reminders/farm/${selectedFarm?.farm_id || 'default'}`);
      setReminders(res.data.reminders || []);
      setActiveCount(res.data.active_count || 0);
      setOverdueCount(res.data.overdue_count || 0);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (reminderId) => {
    try {
      await api.post(`/api/v1/reminders/${reminderId}/complete`, { notes: 'Completed in field' });
      fetchReminders();
    } catch (err) {
      console.error('Failed to complete reminder:', err);
    }
  };

  return (
    <div className="card shadow-lg" style={{ background: '#0F172A', color: '#F8FAFC', borderRadius: '16px', border: '1px solid #1E293B', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1E293B', paddingBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔔 Proactive Reminders & Missed Action Center
          </h2>
          <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '13px' }}>
            Automated Escalations, Biological Delay Warnings & Field Operations Tracker
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {overdueCount > 0 && (
            <span style={{ background: '#EF4444', color: '#FFF', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
              🚨 {overdueCount} Overdue
            </span>
          )}
          <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
            {activeCount} Active Tasks
          </span>
        </div>
      </div>

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reminders.map((r) => {
          const isOverdue = r.status.includes('ESCALATED') || r.status === 'OVERDUE';
          const isCompleted = r.status === 'COMPLETED';

          return (
            <div
              key={r.reminder_id}
              style={{
                background: isCompleted ? '#1E293B' : isOverdue ? 'rgba(239, 68, 68, 0.08)' : '#1E293B',
                border: isCompleted ? '1px solid #334155' : isOverdue ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #334155',
                borderRadius: '12px',
                padding: '16px',
                opacity: isCompleted ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: isCompleted ? '#10B981' : isOverdue ? '#EF4444' : '#38BDF8',
                      color: '#FFF',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {r.action_type}
                    </span>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC', margin: 0, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {r.title}
                    </h4>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    📅 Target: <strong>{r.target_date}</strong> ({r.target_window})
                  </div>
                </div>

                {!isCompleted && (
                  <button
                    onClick={() => handleMarkCompleted(r.reminder_id)}
                    style={{
                      background: '#10B981',
                      color: '#FFF',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Mark Done
                  </button>
                )}
                {isCompleted && (
                  <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '700' }}>✓ Completed</span>
                )}
              </div>

              <p style={{ fontSize: '13px', color: '#CBD5E1', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                {r.description}
              </p>

              {/* Biological Cost Escalation Warning */}
              {r.biological_delay_cost && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginTop: '6px', borderLeft: '3px solid #EF4444' }}>
                  <strong>{r.escalation_warning}</strong><br />
                  🔬 Biological Impact: {r.biological_delay_cost}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
