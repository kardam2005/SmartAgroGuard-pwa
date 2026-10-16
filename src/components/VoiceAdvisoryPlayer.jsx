import React, { useState } from 'react';

export default function VoiceAdvisoryPlayer({ textToRead, title = "Audio Advisory Narration" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState('en-IN');

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in your browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!textToRead) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div style={{ background: '#1E293B', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={handleToggleSpeak}
          style={{
            background: isPlaying ? '#EF4444' : '#10B981',
            color: '#FFF',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}
        >
          {isPlaying ? '⏹' : '🔊'}
        </button>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC' }}>
            {isPlaying ? 'Playing Audio Advisory...' : title}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            Vernacular Text-to-Speech for Field Usability
          </div>
        </div>
      </div>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{ background: '#0F172A', color: '#CBD5E1', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', fontSize: '11px' }}
      >
        <option value="en-IN">English (India)</option>
        <option value="hi-IN">हिन्दी (Hindi)</option>
        <option value="gu-IN">ગુજરાતી (Gujarati)</option>
        <option value="mr-IN">मराठी (Marathi)</option>
      </select>
    </div>
  );
}
