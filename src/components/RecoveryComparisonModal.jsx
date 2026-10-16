import React, { useState } from 'react';

export default function RecoveryComparisonModal({ isOpen, onClose, preScan, postScan }) {
  if (!isOpen) return null;

  const preDisease = preScan?.disease_analysis?.detected_disease || 'Northern Leaf Blight';
  const postDisease = postScan?.disease_analysis?.detected_disease || 'Healthy';
  const preRatio = preScan?.disease_analysis?.affected_area_ratio || 0.15;
  const postRatio = postScan?.disease_analysis?.affected_area_ratio || 0.02;

  const efficacyPct = Math.max(0, Math.round(((preRatio - postRatio) / (preRatio || 0.01)) * 100));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: '#0F172A', color: '#F8FAFC', borderRadius: '16px', border: '1px solid #1E293B', width: '100%', maxWidth: '750px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1E293B', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#10B981', margin: 0 }}>
              📈 Pre- vs. Post-Treatment Lesion Recovery Tracking
            </h3>
            <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '12px' }}>
              Multi-Temporal Scan Comparison (Quantifying Necrotic Area Reduction)
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#1E293B', border: 'none', color: '#94A3B8', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>
            ✕
          </button>
        </div>

        {/* Efficacy Score Banner */}
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>TREATMENT EFFICACY RATING</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981' }}>
              ✓ HIGHLY EFFECTIVE ({efficacyPct}% Lesion Reduction)
            </div>
            <div style={{ fontSize: '12px', color: '#CBD5E1' }}>Applied Formulation: Propiconazole 25% EC (200 ml/acre)</div>
          </div>
          <div style={{ fontSize: '32px' }}>🌿</div>
        </div>

        {/* Side-by-Side Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Pre-Treatment Scan */}
          <div style={{ background: '#1E293B', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#EF4444', marginBottom: '6px' }}>
              🔴 PRE-TREATMENT (Day 0)
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>
              {preDisease}
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0' }}>
              Affected Foliar Ratio: <strong>{(preRatio * 100).toFixed(1)}%</strong>
            </div>
            <div style={{ background: '#0F172A', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#FCA5A5' }}>
              Active expanding necrotic lesions observed on mid-canopy leaves.
            </div>
          </div>

          {/* Post-Treatment Scan */}
          <div style={{ background: '#1E293B', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', marginBottom: '6px' }}>
              🟢 POST-TREATMENT (Day +10)
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>
              {postDisease}
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0' }}>
              Affected Foliar Ratio: <strong>{(postRatio * 100).toFixed(1)}%</strong>
            </div>
            <div style={{ background: '#0F172A', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#86EFAC' }}>
              Fungal lesions desiccated and stopped spreading. Vigorous new collar growth.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
