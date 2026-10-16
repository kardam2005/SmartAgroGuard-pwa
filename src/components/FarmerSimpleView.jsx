import React, { useState } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES, saveLanguage } from '../services/translations';

export default function FarmerSimpleView({
  selectedFarm,
  suitabilityEval,
  activeScan,
  onNavigateTab,
  weatherData,
  isSimpleMode,
  onToggleMode,
  currentLang = 'gu-IN',
  onLanguageChange
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Get active translation dictionary
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS['gu-IN'];
  const tf = t.farmerView;

  // Derive key agronomic parameters
  const farmArea = selectedFarm?.farm_area ? parseFloat(selectedFarm.farm_area) : 2.5;
  const das = activeScan?.diagnostic?.growth_stage ? (activeScan.diagnostic.growth_stage * 7) : 42;
  const stageWeek = Math.min(12, Math.max(1, Math.ceil(das / 7)));
  const disease = activeScan?.diagnostic?.disease_status || 'Healthy';
  const hasDisease = disease !== 'Healthy';
  const isStunted = activeScan?.diagnostic?.height_status === 'BELOW_EXPECTED';
  const isSpraySafe = weatherData?.spray_safety?.is_spray_safe ?? true;
  const windKmh = weatherData?.weather?.wind_speed_kmh || 8.5;

  // Compute knapsack tanks
  const totalTanks = Math.ceil(farmArea * 13.5);
  const soilStatus = isStunted ? 'DRY' : 'OPTIMAL';
  const motorHours = isStunted ? (farmArea * 0.8).toFixed(1) : (farmArea * 0.5).toFixed(1);

  // Handle language switch and persistence
  const handleSelectLanguage = (langCode) => {
    saveLanguage(langCode);
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
    const newT = TRANSLATIONS[langCode] || TRANSLATIONS['gu-IN'];
    setToastMsg(newT.nav.langSavedToast);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Text for Speech Synthesis in current language
  const spokenNarrationText = `${tf.title}. ${tf.subtitle(selectedFarm?.village, selectedFarm?.district, das)}. ${
    soilStatus === 'DRY' ? tf.waterActionRun(motorHours) : tf.waterActionOk
  }. ${
    isSpraySafe
      ? (hasDisease ? `${tf.spraySafe(windKmh)} ${tf.sprayDose(totalTanks)}` : `${tf.spraySafe(windKmh)} ${tf.sprayNoDisease}`)
      : tf.sprayHold(windKmh)
  }. ${
    soilStatus === 'DRY' ? tf.fertActionHold : tf.fertActionUrea(stageWeek)
  }`;

  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this device.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spokenNarrationText);
    utterance.lang = currentLang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleShareWhatsApp = () => {
    const textToShare = `🌾 *${t.nav.brandName} - ${tf.title}*\n📍 ${tf.subtitle(selectedFarm?.village, selectedFarm?.district, das)}\n\n💧 *${tf.waterTitle}:* ${
      soilStatus === 'DRY' ? tf.waterActionRun(motorHours) : tf.waterActionOk
    }\n\n🌿 *${tf.sprayTitle}:* ${
      isSpraySafe ? (hasDisease ? `${tf.spraySafe(windKmh)} ${tf.sprayDose(totalTanks)}` : tf.sprayNoDisease) : tf.sprayHold(windKmh)
    }\n\n⚡ *${tf.fertTitle}:* ${
      soilStatus === 'DRY' ? tf.fertActionHold : tf.fertActionUrea(stageWeek)
    }\n\n_${t.nav.brandName} ${t.nav.brandTagline}_`;

    const encoded = encodeURIComponent(textToShare);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* TOAST NOTIFICATION ON LANGUAGE SAVE */}
      {toastMsg && (
        <div style={{
          background: '#10B981',
          color: '#000000',
          fontWeight: '800',
          fontSize: '13px',
          padding: '10px 18px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{toastMsg}</span>
          <span style={{ fontSize: '11px', background: '#000', color: '#FFF', padding: '2px 8px', borderRadius: '12px' }}>
            Persistent / સાચવેલ
          </span>
        </div>
      )}

      {/* TOP BAR: Language Selector & Voice/WhatsApp Actions */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        border: '1.5px solid #334155',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
      }}>
        {/* Left: Simple Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            🌱
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
              {tf.title}
            </h2>
            <p style={{ margin: '2px 0 0', color: '#94A3B8', fontSize: '13px' }}>
              {tf.subtitle(selectedFarm?.village, selectedFarm?.district, das)}
            </p>
          </div>
        </div>

        {/* Right: Language Pill & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Vernacular Language Selector with Persistence */}
          <div style={{ display: 'flex', background: '#0F172A', padding: '4px', borderRadius: '10px', border: '1px solid #334155' }}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                style={{
                  background: currentLang === lang.code ? '#10B981' : 'transparent',
                  color: currentLang === lang.code ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: currentLang === lang.code ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Audio Listen Button */}
          <button
            type="button"
            onClick={handleToggleAudio}
            style={{
              background: isPlayingAudio ? '#EF4444' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            {isPlayingAudio ? tf.stopBtn : tf.listenBtn}
          </button>

          {/* WhatsApp Share */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            style={{
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
            }}
          >
            {tf.whatsappBtn}
          </button>
        </div>
      </div>

      {/* 3 PRIMARY ACTION CARDS (WATER, SPRAY, FERTILIZER) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* CARD 1: WATER & MOTOR RUN */}
        <div style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
          border: '1.5px solid #0284C7',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', background: 'rgba(2, 132, 199, 0.2)', color: '#38BDF8', padding: '4px 10px', borderRadius: '20px' }}>
                {tf.waterTag}
              </span>
              <span style={{ fontSize: '26px' }}>💧</span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F8FAFC', margin: '0 0 8px' }}>
              {tf.waterTitle}
            </h3>

            <div style={{
              background: 'rgba(2, 132, 199, 0.1)',
              borderLeft: '4px solid #38BDF8',
              padding: '12px',
              borderRadius: '0 8px 8px 0',
              marginBottom: '14px'
            }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#E0F2FE', lineHeight: '1.5' }}>
                {soilStatus === 'DRY' ? tf.waterActionRun(motorHours) : tf.waterActionOk}
              </p>
            </div>

            {/* Quick Soil Barometer */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
                <span>{tf.soilMoistureLabel}</span>
                <strong style={{ color: soilStatus === 'DRY' ? '#F59E0B' : '#10B981' }}>
                  {soilStatus === 'DRY' ? tf.soilDry : tf.soilOptimal}
                </strong>
              </div>
              <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: soilStatus === 'DRY' ? '35%' : '80%',
                  background: soilStatus === 'DRY' ? '#F59E0B' : '#10B981',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('irrigation')}
            style={{
              width: '100%',
              background: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {tf.waterBtn}
          </button>
        </div>

        {/* CARD 2: MEDICINE & KNAPSACK PUMPS */}
        <div style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
          border: `1.5px solid ${isSpraySafe ? '#10B981' : '#EF4444'}`,
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '800',
                background: isSpraySafe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isSpraySafe ? '#34D399' : '#F87171',
                padding: '4px 10px',
                borderRadius: '20px'
              }}>
                {isSpraySafe ? '🟢 ' + tf.sprayTag : '🔴 ' + tf.sprayTag}
              </span>
              <span style={{ fontSize: '26px' }}>🌿</span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F8FAFC', margin: '0 0 8px' }}>
              {tf.sprayTitle}
            </h3>

            <div style={{
              background: isSpraySafe ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderLeft: `4px solid ${isSpraySafe ? '#10B981' : '#EF4444'}`,
              padding: '12px',
              borderRadius: '0 8px 8px 0',
              marginBottom: '14px'
            }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#F8FAFC', lineHeight: '1.5' }}>
                {isSpraySafe ? (
                  hasDisease ? (
                    <>
                      <span>{tf.spraySafe(windKmh)}</span><br />
                      <strong style={{ color: '#FCD34D' }}>{tf.sprayDose(totalTanks)}</strong>
                    </>
                  ) : (
                    <span>{tf.sprayNoDisease}</span>
                  )
                ) : (
                  <span style={{ color: '#FCA5A5' }}>{tf.sprayHold(windKmh)}</span>
                )}
              </p>
            </div>

            {/* Quick Tank Visualizer */}
            <div style={{
              background: '#1E293B',
              padding: '10px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🪣</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC' }}>
                    {totalTanks} {tf.knapsackPumps}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    {farmArea} {t.dosage.acres} ({tf.fieldSize})
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#38BDF8' }}>
                  {tf.capMeasure}
                </span>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{tf.perWater}</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('dosage')}
            style={{
              width: '100%',
              background: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {tf.sprayBtn}
          </button>
        </div>

        {/* CARD 3: FERTILIZER & NUTRITION */}
        <div style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
          border: '1.5px solid #F59E0B',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', padding: '4px 10px', borderRadius: '20px' }}>
                {tf.fertTag}
              </span>
              <span style={{ fontSize: '26px' }}>⚡</span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#F8FAFC', margin: '0 0 8px' }}>
              {tf.fertTitle}
            </h3>

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              borderLeft: '4px solid #F59E0B',
              padding: '12px',
              borderRadius: '0 8px 8px 0',
              marginBottom: '14px'
            }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#FEF3C7', lineHeight: '1.5' }}>
                {soilStatus === 'DRY' ? tf.fertActionHold : tf.fertActionUrea(stageWeek)}
              </p>
            </div>

            {/* Stage Timeline Badge */}
            <div style={{
              background: '#1E293B',
              padding: '10px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              border: '1px solid #334155'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{tf.stageLabel}</span>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC' }}>
                  Week {stageWeek} (DAS {das})
                </div>
              </div>
              <span style={{ fontSize: '11px', background: '#334155', color: '#CBD5E1', padding: '3px 8px', borderRadius: '6px' }}>
                {stageWeek <= 5 ? tf.stageVegetative : tf.stageReproductive}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('recommendation')}
            style={{
              width: '100%',
              background: '#F59E0B',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {tf.fertBtn}
          </button>
        </div>

      </div>

    </div>
  );
}
