// diamond-frontend/src/features/handModel/HandModelViewer_v2.jsx
// Uses realistic ring images instead of canvas drawings for authentic try-on visualization
// Photo-realistic rings overlay on the hand model

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

// ─── Ring Catalog: Maps shape/metal/carat to image file ────────────────────────
// Structure: TYPE-METAL-CARAT.png
// Available images: solitaire-white_gold-1ct.png, solitaire-white_gold-1.5ct.png,
//                   solitaire-yellow_gold-1ct.png, three-stone-platinum-1ct.png
const RING_CATALOG = {
  solitaire: {
    white_gold: {
      1: 'solitaire-white_gold-1ct.png',
      1.5: 'solitaire-white_gold-1.5ct.png',
    },
    yellow_gold: {
      1: 'solitaire-yellow_gold-1ct.png',
    },
  },
  'three-stone': {
    platinum: {
      1: 'three-stone-platinum-1ct.png',
    },
  },
};

// Ring position & scale calibration for hand model (1024×1536)
const RING_POSITIONING = {
  // Ring finger center position on hand
  cx_ratio: 0.62,     // 62% of hand width (ring finger)
  cy_ratio: 0.52,     // 52% of hand height (center of ring finger)
  
  // Base scale: MUCH SMALLER to fit properly on finger
  baseScale: 0.45,    // VERY SMALL: was 0.70, now 0.45 for proper finger fit
  scalePerCarat: 0.05, // minimal scaling between carats (was 0.08)
  
  // Offset from finger center
  offsetX: 30,        // Position on ring finger
  offsetY: 2,         // Slight down adjustment
  
  // Rotation
  rotationDeg: 0,     // Straight horizontal
};

const SHAPES = [
  { id: 'solitaire',   label: 'Solitaire' },
  { id: 'three-stone', label: '3-Stone' },
];

const METALS = [
  { id: 'white_gold', label: 'White Gold' },
  { id: 'yellow_gold', label: 'Yellow Gold' },
  { id: 'platinum',    label: 'Platinum' },
];

const SHAPE_ICONS = {
  solitaire:   <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>,
  'three-stone': <g><circle cx="10" cy="10" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="4" cy="10" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="16" cy="10" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5"/></g>,
  halo:        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>,
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function HandModelViewer({
  isOpen,
  onClose,
  selectedShape: propShape = 'solitaire',
  selectedCarat: propCarat = 1,
  selectedMetal: propMetal = 'white_gold',
}) {
  const [activeTab, setActiveTab] = useState('diamond');
  const [shape, setShape] = useState(propShape);
  const [carat, setCarat] = useState(propCarat);
  const [metal, setMetal] = useState(propMetal);
  const [zoom, setZoom] = useState(1);
  const [ringImageLoaded, setRingImageLoaded] = useState(false);
  const [ringImageError, setRingImageError] = useState(false);

  const imgRef = useRef(null);
  const ringImgRef = useRef(null);
  const wrapRef = useRef(null);

  // Sync props → state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShape(propShape || 'solitaire');
      setCarat(propCarat || 1);
      setMetal(propMetal || 'white_gold');
      setRingImageError(false);
    }
  }, [isOpen, propShape, propCarat, propMetal]);

  // Get ring image path for current selection
  const getRingImagePath = useCallback(() => {
    const shapeRings = RING_CATALOG[shape];
    if (!shapeRings) return null;
    
    const metalRings = shapeRings[metal];
    if (!metalRings) return null;
    
    const imageName = metalRings[carat];
    if (!imageName) return null;
    
    return `/rings/${imageName}`;
  }, [shape, metal, carat]);

  // Calculate scale based on carat
  const calculateScale = useCallback(() => {
    const { baseScale, scalePerCarat } = RING_POSITIONING;
    return baseScale + (carat - 1) * scalePerCarat;
  }, [carat]);

  if (!isOpen) return null;

  const metalObj = METALS.find(m => m.id === metal) || METALS[0];
  const ringImagePath = getRingImagePath();
  const ringScale = calculateScale();

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.55)',
               display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'#fff', borderRadius:12, boxShadow:'0 24px 64px rgba(0,0,0,0.28)',
                 display:'flex', width:'100%', maxWidth:920, maxHeight:'92vh',
                 overflow:'hidden', position:'relative' }}
      >
        {/* Close */}
        <button onClick={onClose}
          style={{ position:'absolute', top:12, right:12, zIndex:10, width:32, height:32,
                   borderRadius:'50%', background:'#f1f5f9', border:'none', cursor:'pointer',
                   display:'flex', alignItems:'center', justifyContent:'center', color:'#475569' }}>
          <X size={16} />
        </button>

        {/* ── LEFT PANEL ────────────────────────────────────────────────────── */}
        <div style={{ width:300, flexShrink:0, borderRight:'1px solid #e2e8f0',
                      display:'flex', flexDirection:'column', overflowY:'auto' }}>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #e2e8f0' }}>
            {[
              { id:'diamond', emoji:'💎', lines:['Your','Ring'] },
              { id:'hand',    emoji:'✋', lines:['Your','Hand'] },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ flex:1, padding:'14px 8px', border:'none', background:'none', cursor:'pointer',
                         display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                         borderBottom: activeTab === t.id ? '3px solid #1e3a6e' : '3px solid transparent',
                         color: activeTab === t.id ? '#1e3a6e' : '#94a3b8',
                         fontSize:11, fontWeight:600 }}>
                <span style={{ fontSize:18 }}>{t.emoji}</span>
                {t.lines.map((l,i) => <span key={i} style={{ lineHeight:1.1 }}>{i===1?<b>{l}</b>:l}</span>)}
              </button>
            ))}
          </div>

          {/* Ring Configuration Tab */}
          {activeTab === 'diamond' && (
            <div style={{ padding:16, flex:1 }}>

              {/* Setting type */}
              <p style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase',
                          letterSpacing:'.06em', marginBottom:8 }}>Setting Type</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:18 }}>
                {SHAPES.map(s => (
                  <button key={s.id} title={s.label} onClick={() => { setShape(s.id); setCarat(1); setRingImageError(false); }}
                    style={{ flex:1, minWidth:80, padding:8, borderRadius:7,
                             border: shape === s.id ? '2px solid #1e3a6e' : '1.5px solid #cbd5e1',
                             background: shape === s.id ? '#e8edf8' : '#f8fafc',
                             cursor:'pointer', fontSize:12, fontWeight:500,
                             color: shape === s.id ? '#1e3a6e' : '#334155' }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Carat selector */}
              <p style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase',
                          letterSpacing:'.06em', marginBottom:8 }}>Carat Weight</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:18 }}>
                {[0.3, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3].map(c => {
                  const available = RING_CATALOG[shape]?.[metal]?.[c];
                  return (
                    <button key={c}
                      disabled={!available}
                      onClick={() => { setCarat(c); setRingImageError(false); }}
                      style={{ width:50, padding:8, borderRadius:6, fontSize:11, fontWeight:600,
                               border: carat === c ? '2px solid #1e3a6e' : '1px solid #cbd5e1',
                               background: carat === c ? '#dbeafe' : available ? '#f8fafc' : '#f1f5f9',
                               cursor: available ? 'pointer' : 'not-allowed',
                               color: carat === c ? '#1e3a6e' : available ? '#334155' : '#cbd5e1',
                               opacity: available ? 1 : 0.5 }}>
                      {c}ct
                    </button>
                  );
                })}
              </div>

              {/* Metal selector */}
              <p style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase',
                          letterSpacing:'.06em', marginBottom:8 }}>Metal</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {METALS.map(m => {
                  const available = RING_CATALOG[shape]?.[m.id]?.[carat];
                  return (
                    <button key={m.id}
                      disabled={!available}
                      onClick={() => { setMetal(m.id); setRingImageError(false); }}
                      style={{ padding:10, borderRadius:7, fontSize:12, fontWeight:500,
                               border:'1px solid #e2e8f0', background:'#f8fafc',
                               cursor: available ? 'pointer' : 'not-allowed',
                               opacity: available ? 1 : 0.5,
                               color: '#334155',
                               textAlign:'left',
                               transition:'all 0.2s ease',
                               borderColor: metal === m.id ? '#1e3a6e' : '#e2e8f0',
                               backgroundColor: metal === m.id ? '#e8edf8' : '#f8fafc' }}>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hand Tab */}
          {activeTab === 'hand' && (
            <div style={{ padding:20, flex:1, display:'flex', flexDirection:'column',
                          alignItems:'center', gap:16 }}>
              <div style={{ textAlign:'center', padding:16, border:'1px solid #e2e8f0',
                            borderRadius:10, width:'100%' }}>
                <div style={{ width:100, height:100, margin:'0 auto 10px', background:'#f1f5f9',
                              borderRadius:8, display:'flex', alignItems:'center',
                              justifyContent:'center', fontSize:11, color:'#94a3b8' }}>
                  QR Code<br/>Coming Soon
                </div>
                <p style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>
                  Scan QR code on your phone to view the ring on your own hand.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL — hand + realistic ring overlay ──────────── */}
        <div style={{ flex:1, position:'relative', background:'#f8f7f5',
                      display:'flex', flexDirection:'column' }}>

          {/* Zoom controls */}
          <div style={{ position:'absolute', bottom:56, left:14, zIndex:5,
                        display:'flex', flexDirection:'column', gap:6 }}>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.2))}
              style={{ width:32, height:32, borderRadius:'50%', background:'#fff',
                       border:'1px solid #e2e8f0', cursor:'pointer',
                       display:'flex', alignItems:'center', justifyContent:'center',
                       boxShadow:'0 2px 6px rgba(0,0,0,0.08)' }}>
              <ZoomIn size={14} color="#334155" />
            </button>
            <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
              style={{ width:32, height:32, borderRadius:'50%', background:'#fff',
                       border:'1px solid #e2e8f0', cursor:'pointer',
                       display:'flex', alignItems:'center', justifyContent:'center',
                       boxShadow:'0 2px 6px rgba(0,0,0,0.08)' }}>
              <ZoomOut size={14} color="#334155" />
            </button>
          </div>

          {/* Hand + ring display */}
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                        overflow:'hidden', padding:16 }}>
            <div ref={wrapRef}
              style={{ position:'relative', display:'inline-block',
                       transform:`scale(${zoom})`, transformOrigin:'center center',
                       transition:'transform 0.2s ease' }}>
              
              {/* Hand model image */}
              <img
                ref={imgRef}
                src="/hand-model.png"
                alt="Hand model"
                style={{ display:'block', maxHeight:520, maxWidth:'100%',
                         userSelect:'none', pointerEvents:'none' }}
              />
              
              {/* Photorealistic ring image overlay */}
              {ringImagePath && (
                <img
                  ref={ringImgRef}
                  src={ringImagePath}
                  alt={`${shape} ring`}
                  onLoad={() => { setRingImageLoaded(true); setRingImageError(false); }}
                  onError={() => { setRingImageError(true); setRingImageLoaded(false); }}
                  style={{
                    position: 'absolute',
                    left: `calc(${RING_POSITIONING.cx_ratio * 100}% + ${RING_POSITIONING.offsetX}px)`,
                    top: `calc(${RING_POSITIONING.cy_ratio * 100}% + ${RING_POSITIONING.offsetY}px)`,
                    transform: `translate(-50%, -50%) scale(${ringScale}) rotate(${RING_POSITIONING.rotationDeg}deg)`,
                    maxHeight: '140px',
                    maxWidth: '140px',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
                    opacity: ringImageLoaded ? 1 : 0.5,
                    transition: 'opacity 0.3s ease',
                  }}
                />
              )}

              {/* Fallback/Error messages */}
              {ringImageError && (
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
                              textAlign:'center', color:'#ef4444', fontSize:12, maxWidth:200,
                              background:'rgba(255,255,255,0.95)', padding:12, borderRadius:8,
                              border:'1px solid #fecaca' }}>
                  <p style={{ marginBottom:6, fontWeight:600 }}>Ring image not found</p>
                  <p style={{ fontSize:11, color:'#dc2626' }}>
                    {ringImagePath ? `Missing: ${ringImagePath.split('/').pop()}` : 'Invalid ring selection'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom info bar */}
          <div style={{ padding:'10px 16px', borderTop:'1px solid #e2e8f0',
                        background:'#fff', fontSize:12, color:'#64748b',
                        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span>
              {shape.charAt(0).toUpperCase() + shape.slice(1).replace('-', ' ')} · {carat}ct · {metalObj.label}
            </span>
            <span style={{ fontSize:11, color:'#94a3b8' }}>
              {ringImageLoaded ? '✓ Ring loaded' : ringImageError ? '✗ Image error' : '⏳ Loading...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
