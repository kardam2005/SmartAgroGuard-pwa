import React, { useState } from 'react';

export default function HomePage({ onLogin, onGetStarted, isAuthenticated, onGoToDashboard, onLogout }) {
  const [activeDiseaseTab, setActiveDiseaseTab] = useState('nlb');

  const diseaseData = {
    nlb: {
      name: 'Northern Corn Leaf Blight',
      pathogen: 'Exserohilum turcicum',
      severity: 'High (Up to 50% yield loss if untreated)',
      symptoms: 'Long, elliptical, cigar-shaped grayish-green or tan lesions (3-15 cm). Lesions begin on lower leaves and rapidly spread upward during humid weather.',
      recommendation: 'Spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin + Difenoconazole @ 1 ml/L. Ensure complete canopy coverage.',
      color: '#EF4444',
      badge: 'Pathology Alert'
    },
    rust: {
      name: 'Common Rust',
      pathogen: 'Puccinia sorghi',
      severity: 'Moderate to High in cool, moist climates',
      symptoms: 'Small, circular to elongated cinnamon-brown pustules scattered over both leaf surfaces. Pustules rupture the epidermis releasing powdery urediniospores.',
      recommendation: 'Apply Propiconazole 25% EC @ 1 ml/L or Tebuconazole @ 1 ml/L at first sign of pustule emergence.',
      color: '#F59E0B',
      badge: 'Fungal Pathogen'
    },
    gls: {
      name: 'Gray Leaf Spot',
      pathogen: 'Cercospora zeae-maydis',
      severity: 'Severe in continuous no-till corn regimes',
      symptoms: 'Distinct rectangular, pale brown to gray lesions strictly delimited by leaf veins. Lesions may coalesce during prolonged high relative humidity.',
      recommendation: 'Foliar application of Pyraclostrobin @ 1.5 ml/L or Carbendazim + Mancozeb @ 2 g/L during tasseling.',
      color: '#8B5CF6',
      badge: 'Vein-Delimited'
    },
    healthy: {
      name: 'Healthy Crop Baseline',
      pathogen: 'None (Optimal Plant Vigor)',
      severity: 'Normal (Zero pathology detected)',
      symptoms: 'Uniform dark emerald green foliage, robust photosynthetic surface area, balanced venation, and expected internodal spacing.',
      recommendation: 'Continue standard scheduled NPK top-dressing (Urea @ 40-50 kg/ha at V8/tasseling) and maintain tensiometer-based irrigation.',
      color: '#10B981',
      badge: 'Optimal Vigor'
    }
  };

  const currentDisease = diseaseData[activeDiseaseTab];

  return (
    <div className="landing-container">
      {/* Top Floating Glassmorphic Navigation */}
      <header className="landing-navbar">
        <div className="landing-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-icon">🌱</span>
          <div className="brand-text">
            <span className="brand-name">Smart AgroGuard</span>
            <span className="brand-tagline">AI Precision Agritech</span>
          </div>
        </div>

        <nav className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Capabilities</a>
          <a href="#diagnostic-preview" className="landing-nav-link">AI Scanner</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#disease-matrix" className="landing-nav-link">Diseases</a>
          <a href="#impact" className="landing-nav-link">Impact</a>
        </nav>

        <div className="landing-nav-actions">
          {isAuthenticated ? (
            <>
              <button className="btn btn-primary" onClick={onGoToDashboard}>
                🌾 Open Dashboard →
              </button>
              <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '8px 16px', fontSize: '13px' }}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={onLogin} style={{ padding: '8px 20px', fontSize: '14px' }}>
                Sign In
              </button>
              <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '8px 20px', fontSize: '14px' }}>
                Get Started Free
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          <span>✨ Precision Agritech v3.0 • Multimodal AI Diagnostic Engine</span>
        </div>

        <h1 className="hero-title">
          Intelligent Crop Health, <br />
          <span className="hero-gradient-text">Disease Detection</span> & Precision Advisory
        </h1>

        <p className="hero-subtitle">
          Protect your hybrid maize harvest with real-time foliar pathology identification, 
          GPS-validated agro-climatic suitability analysis, dynamic NPK fertilizer optimization, 
          and meteorological lifecycle tracking.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <button className="btn btn-primary btn-lg" onClick={onGoToDashboard}>
              🌾 Launch Farm Portal Now →
            </button>
          ) : (
            <>
              <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
                🚀 Get Started Free
              </button>
              <button className="btn btn-secondary btn-lg" onClick={onLogin}>
                🔑 Farmer Login
              </button>
            </>
          )}
          <a href="#features" className="btn btn-outline btn-lg">
            🌿 Explore Capabilities ↓
          </a>
        </div>

        {/* Hero Quick Stat Badges */}
        <div className="hero-stats">
          <div className="hero-stat-card">
            <span className="stat-number">98.4%</span>
            <span className="stat-label">Diagnostic Accuracy</span>
            <span className="stat-sub">Validated on Foliar Fungi</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-number">11 Weeks</span>
            <span className="stat-label">Growth Tracking</span>
            <span className="stat-sub">Vegetative & Reproductive</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-number">4-Tier</span>
            <span className="stat-label">Suitability Engine</span>
            <span className="stat-sub">GPS & Planning Zones</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-number">100%</span>
            <span className="stat-label">Dynamic Fertilizer</span>
            <span className="stat-sub">Deficit-Corrected NPK</span>
          </div>
        </div>
      </section>

      {/* Interactive AI Scanner & Telemetry Mockup */}
      <section className="landing-section" id="diagnostic-preview">
        <div className="section-header-center">
          <span className="section-pill">LIVE AI DIAGNOSTIC SYSTEM</span>
          <h2 className="section-heading">How AgroGuard Diagnoses Crops in Real-Time</h2>
          <p className="section-subheading">
            Submit a single field photo to trigger computer vision pathology, GPS Haversine verification, 
            and targeted chemical/organic treatment synthesis.
          </p>
        </div>

        <div className="scanner-showcase-container">
          <div className="showcase-card showcase-visual">
            <div className="showcase-card-header">
              <span className="live-indicator">● LIVE CAMERA SCAN</span>
              <span className="crop-tag">Zea mays L. (Hybrid Corn)</span>
            </div>
            
            <div className="leaf-preview-box">
              <div className="simulated-leaf-graphic">
                <div className="leaf-stem"></div>
                <div className="leaf-body">
                  <div className="leaf-rib"></div>
                  {/* Bounding Box on Blight Lesion */}
                  <div className="detection-box">
                    <div className="box-label">Northern Leaf Blight (96.2%)</div>
                    <div className="box-corner tl"></div>
                    <div className="box-corner tr"></div>
                    <div className="box-corner bl"></div>
                    <div className="box-corner br"></div>
                  </div>
                  <div className="lesion-graphic lesion-1"></div>
                  <div className="lesion-graphic lesion-2"></div>
                </div>
              </div>
              <div className="scan-crosshair"></div>
              <div className="scan-line-anim"></div>
            </div>

            <div className="showcase-card-footer">
              <div className="footer-meta-item">
                <span className="meta-muted">Estimated Stalk Height</span>
                <span className="meta-val">118.5 cm (Normal V8)</span>
              </div>
              <div className="footer-meta-item">
                <span className="meta-muted">Marker Ratio</span>
                <span className="meta-val">0.42 cm/px</span>
              </div>
              <div className="footer-meta-item">
                <span className="meta-muted">Pathology State</span>
                <span className="meta-val text-danger">INFECTED (Fungal)</span>
              </div>
            </div>
          </div>

          <div className="showcase-card showcase-telemetry">
            <div className="showcase-card-header">
              <span className="telemetry-badge">⚡ MULTIMODAL SYNTHESIS</span>
              <span className="confidence-pill">Confidence: 96.2%</span>
            </div>

            <div className="telemetry-body">
              <div className="telemetry-row highlight-danger">
                <div className="telemetry-icon">🚨</div>
                <div>
                  <div className="row-title">Pathology: Northern Leaf Blight (NLB)</div>
                  <div className="row-desc">Pathogen: <em>Exserohilum turcicum</em>. Cigar-shaped necrotic lesions detected across 18% leaf area.</div>
                </div>
              </div>

              <div className="telemetry-row">
                <div className="telemetry-icon">📍</div>
                <div>
                  <div className="row-title">Location & Zone Suitability</div>
                  <div className="row-desc">Panchmahal, Gujarat (Zone 13: Gujarat Plains & Hills) • GPS Haversine Delta: 85m (Verified).</div>
                </div>
              </div>

              <div className="telemetry-row">
                <div className="telemetry-icon">⛅</div>
                <div>
                  <div className="row-title">Microclimate Context</div>
                  <div className="row-desc">Temp: 28.5°C • Humidity: 78% (High Fungal Risk) • Rainfall 24h: 0 mm (Foliar spray window open).</div>
                </div>
              </div>

              <div className="telemetry-prescription">
                <div className="prescription-header">
                  <span>💊 Immediate Precision Advisory</span>
                  <span className="rx-tag">Prescription #AG-9402</span>
                </div>
                <div className="prescription-body">
                  <div className="rx-item">
                    <strong>Fungicide Spray:</strong> Apply Mancozeb 75% WP @ 2.5 g/L water (500g/ha) within 48 hours to halt upward progression.
                  </div>
                  <div className="rx-item">
                    <strong>Nutritional Support:</strong> Top-dress Urea @ 45 kg/ha + 0.5% Zinc Sulfate foliar spray at V8 stage.
                  </div>
                </div>
              </div>

              <div className="telemetry-cta">
                <button className="btn btn-primary btn-block" onClick={isAuthenticated ? onGoToDashboard : onGetStarted}>
                  {isAuthenticated ? 'Go to Full Diagnostic Console →' : 'Try AgroGuard With Your Farm →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Modules Architecture Section */}
      <section className="landing-section" id="features">
        <div className="section-header-center">
          <span className="section-pill">FULL-STACK AGRONOMIC INTELLIGENCE</span>
          <h2 className="section-heading">Four Integrated Precision Modules</h2>
          <p className="section-subheading">
            AgroGuard is engineered to address every stage of the maize cultivation lifecycle, 
            from sowing window validation to post-infection foliar remediation.
          </p>
        </div>

        <div className="features-grid">
          {/* Module 1 */}
          <div className="feature-card">
            <div className="feature-icon-box bg-emerald">
              <span>📍</span>
            </div>
            <div className="feature-module-tag">MODULE 1</div>
            <h3 className="feature-title">Two-Tier Location & Multi-Tier Agro-Climatic Suitability</h3>
            <p className="feature-description">
              Compares farmer-declared administrative boundaries against device GPS coordinates using the Haversine formula. 
              Hierarchically evaluates Indian Planning Commission agro-climatic zones, soil textures, and regional Kharif/Rabi sowing windows.
            </p>
            <ul className="feature-list">
              <li>✓ Automated 1000m GPS Haversine verification</li>
              <li>✓ 15 Agro-Climatic Sub-Zones & soil texture profiling</li>
              <li>✓ Sowing window delay penalty calculations</li>
            </ul>
          </div>

          {/* Module 2 */}
          <div className="feature-card">
            <div className="feature-icon-box bg-blue">
              <span>🔬</span>
            </div>
            <div className="feature-module-tag">MODULE 2</div>
            <h3 className="feature-title">Crop Growth Stage & Dual-Path Pathology Detection</h3>
            <p className="feature-description">
              Classifies vegetative growth weeks (Week 1 to Week 11) using deep convolutional networks. Measures physical stalk height in centimeters 
              via pixel-ratio reference markers and diagnoses foliar diseases with deep neural networks and OpenCV edge fallback.
            </p>
            <ul className="feature-list">
              <li>✓ Pre-screening maize leaf species morphological filter</li>
              <li>✓ Quantified stalk height & benchmark growth curve</li>
              <li>✓ Detection of Leaf Blight, Common Rust, and Gray Leaf Spot</li>
            </ul>
          </div>

          {/* Module 3 */}
          <div className="feature-card">
            <div className="feature-icon-box bg-purple">
              <span>💊</span>
            </div>
            <div className="feature-module-tag">MODULE 3</div>
            <h3 className="feature-title">Dynamic Fertilizer Advisory & Treatment Engine</h3>
            <p className="feature-description">
              Calculates stage-specific Nitrogen (N), Phosphorus (P₂O₅), and Potassium (K₂O) split applications based on hybrid variety (GAYMH-1, HQPM-1) 
              and observed stalk deficits. Generates actionable commercial chemical and organic biocontrol prescriptions.
            </p>
            <ul className="feature-list">
              <li>✓ Split-dose timing (Basal, V4 Knee-High, V8 Tasseling)</li>
              <li>✓ Dynamic deficit compensation based on DAS benchmarks</li>
              <li>✓ Active ingredient chemical dosages and organic manure rates</li>
            </ul>
          </div>

          {/* Module 4 */}
          <div className="feature-card">
            <div className="feature-icon-box bg-amber">
              <span>🌦️</span>
            </div>
            <div className="feature-module-tag">MODULE 4</div>
            <h3 className="feature-title">Real-Time Weather, Smart Irrigation & Lifecycle Timeline</h3>
            <p className="feature-description">
              Tracks live temperature, relative humidity, wind speed, and rain probability at farm coordinates. 
              Computes daily crop evapotranspiration (ETc) to prevent water stress and maintains an immutable longitudinal diagnostic history.
            </p>
            <ul className="feature-list">
              <li>✓ Penman-Monteith Evapotranspiration & irrigation timers</li>
              <li>✓ Rain-delay advisory to avoid spray wash-off</li>
              <li>✓ Visual historical scan trajectory and recovery monitoring</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-section bg-surface" id="how-it-works">
        <div className="section-header-center">
          <span className="section-pill">SIMPLE 4-STEP WORKFLOW</span>
          <h2 className="section-heading">How AgroGuard Works in Practice</h2>
          <p className="section-subheading">
            Engineered for high usability in the field by farmers, agronomists, and agricultural extension officers.
          </p>
        </div>

        <div className="workflow-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h4 className="step-title">Register & Pin Farm</h4>
            <p className="step-description">
              Enter your village, district, sowing date, and hybrid variety (e.g. GAYMH-1). The engine verifies your coordinates against agro-climatic databases.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h4 className="step-title">Capture Foliage Photo</h4>
            <p className="step-description">
              Point your smartphone camera at the maize stalk and upper canopy leaves. Use the camera framing overlay for optimal lighting and contrast.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h4 className="step-title">Instant AI Diagnosis</h4>
            <p className="step-description">
              The dual-path AI analyzes fungal patterns, checks vegetative height vs expected DAS, and combines live weather context.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <h4 className="step-title">Execute Advisory</h4>
            <p className="step-description">
              Receive precise, commercial dosage recommendations (Urea, DAP, MOP, Mancozeb) formatted in clear farmer-friendly metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Maize Diseases Matrix Section */}
      <section className="landing-section" id="disease-matrix">
        <div className="section-header-center">
          <span className="section-pill">PATHOLOGY INTELLIGENCE</span>
          <h2 className="section-heading">Target Maize Foliar Pathologies</h2>
          <p className="section-subheading">
            AgroGuard's computer vision models are specialized in discriminating between devastating maize diseases and healthy foliar baselines.
          </p>
        </div>

        <div className="disease-tabs">
          <button 
            className={`disease-tab ${activeDiseaseTab === 'nlb' ? 'active' : ''}`}
            onClick={() => setActiveDiseaseTab('nlb')}
          >
            🍂 Northern Leaf Blight
          </button>
          <button 
            className={`disease-tab ${activeDiseaseTab === 'rust' ? 'active' : ''}`}
            onClick={() => setActiveDiseaseTab('rust')}
          >
            🍁 Common Rust
          </button>
          <button 
            className={`disease-tab ${activeDiseaseTab === 'gls' ? 'active' : ''}`}
            onClick={() => setActiveDiseaseTab('gls')}
          >
            🌫️ Gray Leaf Spot
          </button>
          <button 
            className={`disease-tab ${activeDiseaseTab === 'healthy' ? 'active' : ''}`}
            onClick={() => setActiveDiseaseTab('healthy')}
          >
            🌿 Healthy Maize Baseline
          </button>
        </div>

        <div className="disease-display-card">
          <div className="disease-header">
            <div>
              <span className="disease-badge" style={{ backgroundColor: `${currentDisease.color}20`, color: currentDisease.color, borderColor: currentDisease.color }}>
                {currentDisease.badge}
              </span>
              <h3 className="disease-display-title">{currentDisease.name}</h3>
              <p className="disease-pathogen">Scientific Pathogen: <em>{currentDisease.pathogen}</em></p>
            </div>
            <div className="disease-severity-badge">
              <strong>Risk Level:</strong> {currentDisease.severity}
            </div>
          </div>

          <div className="disease-body-grid">
            <div className="disease-info-block">
              <h4 className="block-title">Field Symptoms & Identification</h4>
              <p className="block-text">{currentDisease.symptoms}</p>
            </div>

            <div className="disease-info-block highlight-prescription">
              <h4 className="block-title">Agronomic Management & Remedy</h4>
              <p className="block-text">{currentDisease.recommendation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Agronomic Trust Section */}
      <section className="landing-section bg-surface" id="impact">
        <div className="section-header-center">
          <span className="section-pill">AGRONOMIC IMPACT</span>
          <h2 className="section-heading">Engineered for Quantifiable Farm Yield Gains</h2>
          <p className="section-subheading">
            Helping agricultural communities minimize crop loss, reduce redundant pesticide application, and optimize water utilization.
          </p>
        </div>

        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-metric">+22%</div>
            <h4 className="impact-title">Average Yield Protection</h4>
            <p className="impact-text">
              Early intervention against Northern Corn Leaf Blight prevents irreversible canopy defoliation during critical grain-filling stages.
            </p>
          </div>

          <div className="impact-card">
            <div className="impact-metric">-35%</div>
            <h4 className="impact-title">Chemical Spray Reduction</h4>
            <p className="impact-text">
              Targeted fungicide recommendations and weather-aware spray delay alerts eliminate blanket uncalibrated chemical applications.
            </p>
          </div>

          <div className="impact-card">
            <div className="impact-metric">&lt; 3 Sec</div>
            <h4 className="impact-title">Diagnostic Turnaround</h4>
            <p className="impact-text">
              Deep convolutional inference returns growth metrics, disease classification, and fertilizer advice directly to the field in seconds.
            </p>
          </div>

          <div className="impact-card">
            <div className="impact-metric">15+</div>
            <h4 className="impact-title">Agro-Climatic Zones</h4>
            <p className="impact-text">
              Tailored calibration for Indian agricultural belts including Gujarat Plains, Western Himalayas, and Trans-Gangetic Plains.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="landing-cta-banner">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Protect Your Maize Crops with AI?</h2>
          <p className="cta-subtitle">
            Experience smart agricultural diagnostics, automated fertilizer scheduling, and real-time disease detection today.
          </p>
          <div className="cta-buttons">
            {isAuthenticated ? (
              <button className="btn btn-primary btn-xl" onClick={onGoToDashboard}>
                🌾 Open Farm Portal →
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-xl" onClick={onGetStarted}>
                  🚀 Create Free Account Now
                </button>
                <button className="btn btn-outline btn-xl" onClick={onLogin}>
                  🔑 Sign In with Existing Account
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-col-brand">
            <div className="footer-brand">🌱 Smart AgroGuard</div>
            <p className="footer-tagline">
              Autonomous Crop Growth Assessment, Foliar Pathology Detection & Precision Agronomic Advisory System.
            </p>
            <p className="footer-copy">
              © {new Date().getFullYear()} Smart AgroGuard Platform. Built with React & FastAPI.
            </p>
          </div>

          <div className="footer-col">
            <h5 className="footer-heading">Platform Modules</h5>
            <a href="#features" className="footer-link">Module 1: Location & Suitability</a>
            <a href="#features" className="footer-link">Module 2: Disease Detection & Height</a>
            <a href="#features" className="footer-link">Module 3: Precision Fertilizer Engine</a>
            <a href="#features" className="footer-link">Module 4: Weather & History</a>
          </div>

          <div className="footer-col">
            <h5 className="footer-heading">Pathologies</h5>
            <a href="#disease-matrix" className="footer-link">Northern Leaf Blight</a>
            <a href="#disease-matrix" className="footer-link">Common Rust</a>
            <a href="#disease-matrix" className="footer-link">Gray Leaf Spot</a>
            <a href="#disease-matrix" className="footer-link">Healthy Vigor Baselines</a>
          </div>

          <div className="footer-col">
            <h5 className="footer-heading">Access</h5>
            {isAuthenticated ? (
              <button className="btn btn-primary btn-block" onClick={onGoToDashboard}>
                Launch Dashboard
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-block" style={{ marginBottom: '8px' }} onClick={onLogin}>
                  Sign In
                </button>
                <button className="btn btn-secondary btn-block" onClick={onGetStarted}>
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
