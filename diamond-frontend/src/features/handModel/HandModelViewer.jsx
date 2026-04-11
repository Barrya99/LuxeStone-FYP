// diamond-frontend/src/features/handModel/HandModelViewer.jsx
// Inspired by RareCarat's ring viewer - shows ring on realistic hand model
// Features: shape selector, carat-based diamond sizing, skin tone slider, upload photo tab

import { useState, useRef, useCallback } from 'react';
import { X, Upload, ZoomIn, ZoomOut, Camera } from 'lucide-react';

// ─── Diamond shape data ────────────────────────────────────────────────────────
// Each shape has its own carat → mm dimensions table (length x width)
const SHAPES = [
  { id: 'round',    label: 'Round',    icon: '⬤' },
  { id: 'princess', label: 'Princess', icon: '◼' },
  { id: 'cushion',  label: 'Cushion',  icon: '▪' },
  { id: 'heart',    label: 'Heart',    icon: '♥' },
  { id: 'oval',     label: 'Oval',     icon: '⬭' },
  { id: 'pear',     label: 'Pear',     icon: '💧' },
  { id: 'asscher',  label: 'Asscher',  icon: '◈' },
  { id: 'emerald',  label: 'Emerald',  icon: '▭' },
  { id: 'radiant',  label: 'Radiant',  icon: '✦' },
  { id: 'marquise', label: 'Marquise', icon: '◇' },
];

const CARAT_DATA = {
  round: [
    { ct: 0.3,  l: 4.3,  w: 4.3  }, { ct: 0.4,  l: 4.7,  w: 4.7  },
    { ct: 0.5,  l: 5.0,  w: 5.0  }, { ct: 0.75, l: 5.8,  w: 5.8  },
    { ct: 1,    l: 6.3,  w: 6.3  }, { ct: 1.25, l: 6.9,  w: 6.9  },
    { ct: 1.5,  l: 7.2,  w: 7.3  }, { ct: 1.75, l: 7.7,  w: 7.7  },
    { ct: 2,    l: 8.0,  w: 8.0  }, { ct: 2.5,  l: 8.6,  w: 8.6  },
    { ct: 3,    l: 9.2,  w: 9.2  }, { ct: 3.5,  l: 9.4,  w: 9.4  },
    { ct: 4,    l: 10.1, w: 10.1 }, { ct: 4.5,  l: 10.3, w: 10.3 },
    { ct: 5,    l: 11.0, w: 11.0 },
  ],
  princess: [
    { ct: 0.3,  l: 3.8,  w: 3.6  }, { ct: 0.4,  l: 4.1,  w: 4.0  },
    { ct: 0.5,  l: 4.4,  w: 4.3  }, { ct: 0.75, l: 5.0,  w: 4.9  },
    { ct: 1,    l: 5.5,  w: 5.3  }, { ct: 1.25, l: 5.9,  w: 5.8  },
    { ct: 1.5,  l: 6.3,  w: 6.2  }, { ct: 1.75, l: 6.6,  w: 6.5  },
    { ct: 2,    l: 7.0,  w: 6.9  }, { ct: 2.5,  l: 7.5,  w: 7.4  },
    { ct: 3,    l: 7.9,  w: 7.8  }, { ct: 3.5,  l: 8.1,  w: 7.9  },
    { ct: 4,    l: 8.3,  w: 8.1  }, { ct: 4.5,  l: 9.0,  w: 8.8  },
    { ct: 5,    l: 9.6,  w: 9.3  },
  ],
  cushion: [
    { ct: 0.3,  l: 4.0,  w: 3.8  }, { ct: 0.4,  l: 4.3,  w: 4.1  },
    { ct: 0.5,  l: 4.6,  w: 4.4  }, { ct: 0.75, l: 5.3,  w: 5.0  },
    { ct: 1,    l: 5.9,  w: 5.4  }, { ct: 1.25, l: 6.4,  w: 5.8  },
    { ct: 1.5,  l: 6.8,  w: 6.3  }, { ct: 1.75, l: 7.0,  w: 6.6  },
    { ct: 2,    l: 7.3,  w: 6.9  }, { ct: 2.5,  l: 7.9,  w: 7.5  },
    { ct: 3,    l: 8.4,  w: 7.9  }, { ct: 3.5,  l: 8.7,  w: 8.1  },
    { ct: 4,    l: 9.3,  w: 8.7  }, { ct: 4.5,  l: 9.5,  w: 8.9  },
    { ct: 5,    l: 10.2, w: 9.4  },
  ],
  oval: [
    { ct: 0.3,  l: 5.1,  w: 3.4  }, { ct: 0.4,  l: 5.5,  w: 3.7  },
    { ct: 0.5,  l: 6.0,  w: 4.0  }, { ct: 0.75, l: 6.7,  w: 4.5  },
    { ct: 1,    l: 7.7,  w: 5.5  }, { ct: 1.25, l: 8.4,  w: 5.9  },
    { ct: 1.5,  l: 9.0,  w: 6.3  }, { ct: 1.75, l: 9.4,  w: 6.5  },
    { ct: 2,    l: 10.0, w: 7.0  }, { ct: 2.5,  l: 10.8, w: 7.5  },
    { ct: 3,    l: 11.5, w: 8.0  }, { ct: 3.5,  l: 12.0, w: 8.3  },
    { ct: 4,    l: 12.8, w: 8.8  }, { ct: 4.5,  l: 13.2, w: 9.1  },
    { ct: 5,    l: 14.0, w: 9.7  },
  ],
  emerald: [
    { ct: 0.3,  l: 4.5,  w: 3.2  }, { ct: 0.4,  l: 4.9,  w: 3.5  },
    { ct: 0.5,  l: 5.2,  w: 3.7  }, { ct: 0.75, l: 5.8,  w: 4.2  },
    { ct: 1,    l: 6.5,  w: 4.5  }, { ct: 1.25, l: 7.0,  w: 5.0  },
    { ct: 1.5,  l: 7.4,  w: 5.3  }, { ct: 1.75, l: 7.8,  w: 5.6  },
    { ct: 2,    l: 8.1,  w: 5.8  }, { ct: 2.5,  l: 8.8,  w: 6.2  },
    { ct: 3,    l: 9.5,  w: 6.7  }, { ct: 3.5,  l: 10.0, w: 7.0  },
    { ct: 4,    l: 10.5, w: 7.4  }, { ct: 4.5,  l: 11.0, w: 7.7  },
    { ct: 5,    l: 11.5, w: 8.1  },
  ],
  asscher: [
    { ct: 0.3,  l: 3.9,  w: 3.8  }, { ct: 0.4,  l: 4.2,  w: 4.1  },
    { ct: 0.5,  l: 4.5,  w: 4.4  }, { ct: 0.75, l: 5.1,  w: 5.0  },
    { ct: 1,    l: 5.8,  w: 5.7  }, { ct: 1.25, l: 6.2,  w: 6.1  },
    { ct: 1.5,  l: 6.5,  w: 6.4  }, { ct: 1.75, l: 6.8,  w: 6.7  },
    { ct: 2,    l: 7.1,  w: 7.0  }, { ct: 2.5,  l: 7.7,  w: 7.6  },
    { ct: 3,    l: 8.2,  w: 8.1  }, { ct: 3.5,  l: 8.6,  w: 8.5  },
    { ct: 4,    l: 9.0,  w: 8.9  }, { ct: 4.5,  l: 9.4,  w: 9.3  },
    { ct: 5,    l: 9.8,  w: 9.7  },
  ],
  pear: [
    { ct: 0.3,  l: 5.8,  w: 3.8  }, { ct: 0.4,  l: 6.2,  w: 4.0  },
    { ct: 0.5,  l: 6.5,  w: 4.2  }, { ct: 0.75, l: 7.2,  w: 4.7  },
    { ct: 1,    l: 8.0,  w: 5.2  }, { ct: 1.25, l: 8.8,  w: 5.7  },
    { ct: 1.5,  l: 9.5,  w: 6.1  }, { ct: 1.75, l: 10.0, w: 6.4  },
    { ct: 2,    l: 10.5, w: 6.8  }, { ct: 2.5,  l: 11.5, w: 7.4  },
    { ct: 3,    l: 12.3, w: 7.8  }, { ct: 3.5,  l: 12.8, w: 8.2  },
    { ct: 4,    l: 13.5, w: 8.7  }, { ct: 4.5,  l: 14.0, w: 9.0  },
    { ct: 5,    l: 14.8, w: 9.4  },
  ],
  heart: [
    { ct: 0.3,  l: 4.3,  w: 4.4  }, { ct: 0.4,  l: 4.7,  w: 4.8  },
    { ct: 0.5,  l: 5.0,  w: 5.1  }, { ct: 0.75, l: 5.8,  w: 5.9  },
    { ct: 1,    l: 6.5,  w: 6.6  }, { ct: 1.25, l: 7.1,  w: 7.2  },
    { ct: 1.5,  l: 7.5,  w: 7.6  }, { ct: 1.75, l: 7.9,  w: 8.0  },
    { ct: 2,    l: 8.3,  w: 8.4  }, { ct: 2.5,  l: 9.0,  w: 9.1  },
    { ct: 3,    l: 9.6,  w: 9.7  }, { ct: 3.5,  l: 10.1, w: 10.2 },
    { ct: 4,    l: 10.6, w: 10.7 }, { ct: 4.5,  l: 11.0, w: 11.1 },
    { ct: 5,    l: 11.5, w: 11.6 },
  ],
  radiant: [
    { ct: 0.3,  l: 4.2,  w: 3.5  }, { ct: 0.4,  l: 4.5,  w: 3.8  },
    { ct: 0.5,  l: 4.8,  w: 4.0  }, { ct: 0.75, l: 5.4,  w: 4.5  },
    { ct: 1,    l: 6.1,  w: 5.1  }, { ct: 1.25, l: 6.6,  w: 5.5  },
    { ct: 1.5,  l: 7.0,  w: 5.9  }, { ct: 1.75, l: 7.4,  w: 6.2  },
    { ct: 2,    l: 7.8,  w: 6.5  }, { ct: 2.5,  l: 8.5,  w: 7.1  },
    { ct: 3,    l: 9.0,  w: 7.5  }, { ct: 3.5,  l: 9.5,  w: 7.9  },
    { ct: 4,    l: 9.9,  w: 8.3  }, { ct: 4.5,  l: 10.4, w: 8.7  },
    { ct: 5,    l: 10.8, w: 9.0  },
  ],
  marquise: [
    { ct: 0.3,  l: 7.0,  w: 3.5  }, { ct: 0.4,  l: 7.5,  w: 3.8  },
    { ct: 0.5,  l: 8.0,  w: 4.0  }, { ct: 0.75, l: 9.0,  w: 4.5  },
    { ct: 1,    l: 10.0, w: 5.0  }, { ct: 1.25, l: 10.9, w: 5.5  },
    { ct: 1.5,  l: 11.5, w: 5.8  }, { ct: 1.75, l: 12.0, w: 6.0  },
    { ct: 2,    l: 12.8, w: 6.4  }, { ct: 2.5,  l: 13.5, w: 6.8  },
    { ct: 3,    l: 14.3, w: 7.1  }, { ct: 3.5,  l: 15.0, w: 7.5  },
    { ct: 4,    l: 15.8, w: 7.9  }, { ct: 4.5,  l: 16.2, w: 8.1  },
    { ct: 5,    l: 17.0, w: 8.5  },
  ],
};

// ─── SVG Diamond shape renderers ──────────────────────────────────────────────
function DiamondSVG({ shape, width, height, metalColor = '#E8E8E8' }) {
  const w = width;
  const h = height;
  const cx = w / 2;
  const cy = h / 2;

  // Shared styles
  const facetColor1 = '#ffffff';
  const facetColor2 = '#c8d8e8';
  const facetColor3 = '#a0b8cc';
  const outline = '#90a8bb';

  const shapes = {
    round: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <radialGradient id="dg-round" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#d0e8f8" />
            <stop offset="100%" stopColor="#7ab0cc" />
          </radialGradient>
          <radialGradient id="dg-inner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(200,230,255,0.3)" />
          </radialGradient>
          <filter id="sparkle">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={Math.min(w, h) / 2 - 1} fill="url(#dg-round)" stroke={outline} strokeWidth="0.5" />
        {/* Facet lines */}
        <circle cx={cx} cy={cy} r={Math.min(w, h) * 0.28} fill="url(#dg-inner)" stroke={outline} strokeWidth="0.3" opacity="0.7" />
        <line x1={cx} y1={2} x2={cx} y2={h - 2} stroke={outline} strokeWidth="0.3" opacity="0.4" />
        <line x1={2} y1={cy} x2={w - 2} y2={cy} stroke={outline} strokeWidth="0.3" opacity="0.4" />
        <line x1={4} y1={4} x2={w - 4} y2={h - 4} stroke={outline} strokeWidth="0.3" opacity="0.3" />
        <line x1={w - 4} y1={4} x2={4} y2={h - 4} stroke={outline} strokeWidth="0.3" opacity="0.3" />
        {/* Sparkle */}
        <circle cx={cx - w * 0.15} cy={cy - h * 0.2} r="1.2" fill="white" opacity="0.9" filter="url(#sparkle)" />
        <circle cx={cx + w * 0.1} cy={cy - h * 0.1} r="0.7" fill="white" opacity="0.7" />
      </svg>
    ),
    princess: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id="dg-princess" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#c8e0f0" />
            <stop offset="100%" stopColor="#6a9ab4" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width={w - 2} height={h - 2} rx="1" fill="url(#dg-princess)" stroke={outline} strokeWidth="0.5" />
        <rect x={w * 0.2} y={h * 0.2} width={w * 0.6} height={h * 0.6} fill="none" stroke={outline} strokeWidth="0.3" opacity="0.5" />
        <line x1="1" y1="1" x2={cx} y2={cy} stroke={outline} strokeWidth="0.3" opacity="0.4" />
        <line x1={w - 1} y1="1" x2={cx} y2={cy} stroke={outline} strokeWidth="0.3" opacity="0.4" />
        <line x1="1" y1={h - 1} x2={cx} y2={cy} stroke={outline} strokeWidth="0.3" opacity="0.4" />
        <line x1={w - 1} y1={h - 1} x2={cx} y2={cy} stroke={outline} strokeWidth="0.3" opacity="0.4" />
        <circle cx={cx - w * 0.12} cy={cy - h * 0.18} r="1.2" fill="white" opacity="0.9" />
      </svg>
    ),
    cushion: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <radialGradient id="dg-cushion" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#cce4f4" />
            <stop offset="100%" stopColor="#72a4c0" />
          </radialGradient>
        </defs>
        <rect x="1" y="1" width={w - 2} height={h - 2} rx={Math.min(w, h) * 0.25} fill="url(#dg-cushion)" stroke={outline} strokeWidth="0.5" />
        <rect x={w * 0.18} y={h * 0.18} width={w * 0.64} height={h * 0.64} rx={Math.min(w, h) * 0.1} fill="none" stroke={outline} strokeWidth="0.3" opacity="0.5" />
        <line x1={cx} y1="2" x2={cx} y2={h - 2} stroke={outline} strokeWidth="0.3" opacity="0.3" />
        <line x1="2" y1={cy} x2={w - 2} y2={cy} stroke={outline} strokeWidth="0.3" opacity="0.3" />
        <circle cx={cx - w * 0.13} cy={cy - h * 0.18} r="1.2" fill="white" opacity="0.9" />
      </svg>
    ),
    oval: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <radialGradient id="dg-oval" cx="38%" cy="32%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#cce4f4" />
            <stop offset="100%" stopColor="#72a4c0" />
          </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy} rx={w / 2 - 1} ry={h / 2 - 1} fill="url(#dg-oval)" stroke={outline} strokeWidth="0.5" />
        <ellipse cx={cx} cy={cy} rx={w * 0.28} ry={h * 0.28} fill="none" stroke={outline} strokeWidth="0.3" opacity="0.5" />
        <line x1={cx} y1="2" x2={cx} y2={h - 2} stroke={outline} strokeWidth="0.3" opacity="0.35" />
        <line x1="2" y1={cy} x2={w - 2} y2={cy} stroke={outline} strokeWidth="0.3" opacity="0.35" />
        <circle cx={cx - w * 0.12} cy={cy - h * 0.2} r="1.2" fill="white" opacity="0.9" />
      </svg>
    ),
    emerald: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id="dg-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f8ff" />
            <stop offset="50%" stopColor="#b8d8ee" />
            <stop offset="100%" stopColor="#5a94b0" />
          </linearGradient>
        </defs>
        <polygon points={`4,${h * 0.15} ${w - 4},${h * 0.15} ${w - 1},${h * 0.35} ${w - 1},${h * 0.65} ${w - 4},${h * 0.85} 4,${h * 0.85} 1,${h * 0.65} 1,${h * 0.35}`} fill="url(#dg-emerald)" stroke={outline} strokeWidth="0.5" />
        <rect x={w * 0.18} y={h * 0.22} width={w * 0.64} height={h * 0.56} fill="none" stroke={outline} strokeWidth="0.3" opacity="0.5" />
        <line x1={cx} y1={h * 0.15} x2={cx} y2={h * 0.85} stroke={outline} strokeWidth="0.3" opacity="0.3" />
        <circle cx={cx - w * 0.12} cy={cy - h * 0.18} r="1.2" fill="white" opacity="0.85" />
      </svg>
    ),
    asscher: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id="dg-asscher" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f8ff" />
            <stop offset="50%" stopColor="#b8d8ee" />
            <stop offset="100%" stopColor="#5a94b0" />
          </linearGradient>
        </defs>
        <polygon points={`${w * 0.2},1 ${w * 0.8},1 ${w - 1},${h * 0.2} ${w - 1},${h * 0.8} ${w * 0.8},${h - 1} ${w * 0.2},${h - 1} 1,${h * 0.8} 1,${h * 0.2}`} fill="url(#dg-asscher)" stroke={outline} strokeWidth="0.5" />
        <polygon points={`${w * 0.3},${h * 0.1} ${w * 0.7},${h * 0.1} ${w * 0.9},${h * 0.3} ${w * 0.9},${h * 0.7} ${w * 0.7},${h * 0.9} ${w * 0.3},${h * 0.9} ${w * 0.1},${h * 0.7} ${w * 0.1},${h * 0.3}`} fill="none" stroke={outline} strokeWidth="0.3" opacity="0.5" />
        <circle cx={cx - w * 0.12} cy={cy - h * 0.18} r="1.2" fill="white" opacity="0.9" />
      </svg>
    ),
    pear: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <radialGradient id="dg-pear" cx="45%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#cce4f4" />
            <stop offset="100%" stopColor="#72a4c0" />
          </radialGradient>
        </defs>
        <path d={`M ${cx} 1 C ${w - 2} ${h * 0.1}, ${w - 2} ${h * 0.45}, ${cx} ${h * 0.55} C ${2} ${h * 0.45}, ${2} ${h * 0.1}, ${cx} 1 Z`} fill="url(#dg-pear)" stroke={outline} strokeWidth="0.5" />
        <circle cx={cx} cy={h * 0.78} r={h * 0.19} fill="url(#dg-pear)" stroke={outline} strokeWidth="0.5" />
        <circle cx={cx - w * 0.1} cy={h * 0.2} r="1.1" fill="white" opacity="0.9" />
      </svg>
    ),
    heart: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <radialGradient id="dg-heart" cx="38%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#cce4f4" />
            <stop offset="100%" stopColor="#72a4c0" />
          </radialGradient>
        </defs>
        <path d={`M ${cx} ${h - 2} L 2 ${h * 0.38} C 2 ${h * 0.1} ${cx * 0.4} ${h * 0.05} ${cx * 0.7} ${h * 0.2} L ${cx} ${h * 0.42} L ${cx + cx * 0.3} ${h * 0.2} C ${cx + cx * 0.6} ${h * 0.05} ${w - 2} ${h * 0.1} ${w - 2} ${h * 0.38} Z`} fill="url(#dg-heart)" stroke={outline} strokeWidth="0.5" />
        <circle cx={cx * 0.65} cy={h * 0.28} r="1.2" fill="white" opacity="0.9" />
      </svg>
    ),
    radiant: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id="dg-radiant" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f8ff" />
            <stop offset="45%" stopColor="#c0daf0" />
            <stop offset="100%" stopColor="#62a0bc" />
          </linearGradient>
        </defs>
        <polygon points={`${w * 0.15},1 ${w * 0.85},1 ${w - 1},${h * 0.15} ${w - 1},${h * 0.85} ${w * 0.85},${h - 1} ${w * 0.15},${h - 1} 1,${h * 0.85} 1,${h * 0.15}`} fill="url(#dg-radiant)" stroke={outline} strokeWidth="0.5" />
        <polygon points={`${w * 0.25},${h * 0.1} ${w * 0.75},${h * 0.1} ${w * 0.9},${h * 0.25} ${w * 0.9},${h * 0.75} ${w * 0.75},${h * 0.9} ${w * 0.25},${h * 0.9} ${w * 0.1},${h * 0.75} ${w * 0.1},${h * 0.25}`} fill="none" stroke={outline} strokeWidth="0.3" opacity="0.5" />
        <line x1={cx} y1="1" x2={cx} y2={h - 1} stroke={outline} strokeWidth="0.3" opacity="0.3" />
        <circle cx={cx - w * 0.1} cy={cy - h * 0.15} r="1.2" fill="white" opacity="0.9" />
      </svg>
    ),
    marquise: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <radialGradient id="dg-marquise" cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#cce4f4" />
            <stop offset="100%" stopColor="#72a4c0" />
          </radialGradient>
        </defs>
        <path d={`M ${cx} 1 Q ${w - 1} ${cy} ${cx} ${h - 1} Q 1 ${cy} ${cx} 1 Z`} fill="url(#dg-marquise)" stroke={outline} strokeWidth="0.5" />
        <path d={`M ${cx} ${h * 0.15} Q ${w * 0.85} ${cy} ${cx} ${h * 0.85} Q ${w * 0.15} ${cy} ${cx} ${h * 0.15} Z`} fill="none" stroke={outline} strokeWidth="0.3" opacity="0.4" />
        <circle cx={cx - w * 0.08} cy={cy - h * 0.2} r="1.2" fill="white" opacity="0.9" />
      </svg>
    ),
  };

  return shapes[shape] || shapes.round;
}

// ─── SVG Hand with ring composite ──────────────────────────────────────────────
function HandWithRing({ skinTone, selectedShape, selectedCarat, metalColor }) {
  // Skin tone: 0 = lightest, 100 = darkest
  const skinBase = `hsl(${25 + skinTone * 0.03}, ${65 - skinTone * 0.3}%, ${82 - skinTone * 0.5}%)`;
  const skinShadow = `hsl(${22 + skinTone * 0.03}, ${60 - skinTone * 0.3}%, ${70 - skinTone * 0.5}%)`;
  const skinHighlight = `hsl(${28 + skinTone * 0.02}, ${55 - skinTone * 0.2}%, ${90 - skinTone * 0.4}%)`;
  const nailColor = `hsl(${15 + skinTone * 0.05}, ${40 - skinTone * 0.2}%, ${85 - skinTone * 0.45}%)`;

  // Get carat data for sizing the ring on the finger
  const data = CARAT_DATA[selectedShape] || CARAT_DATA.round;
  const caratRow = data.find(d => d.ct === selectedCarat) || data[6]; // default 1.5ct
  // Scale: 1mm ≈ 3.8px at this hand SVG size
  const scale = 3.8;
  const dW = caratRow.w * scale;
  const dH = caratRow.l * scale;

  // Ring band thickness scales slightly with size
  const bandH = 12 + dW * 0.08;

  return (
    <svg
      viewBox="0 0 420 580"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="skin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={skinHighlight} />
          <stop offset="50%" stopColor={skinBase} />
          <stop offset="100%" stopColor={skinShadow} />
        </linearGradient>
        <linearGradient id="skin-finger" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={skinShadow} />
          <stop offset="30%" stopColor={skinBase} />
          <stop offset="70%" stopColor={skinBase} />
          <stop offset="100%" stopColor={skinShadow} />
        </linearGradient>
        <linearGradient id="metal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8f8f8" />
          <stop offset="30%" stopColor={metalColor} />
          <stop offset="70%" stopColor={metalColor} />
          <stop offset="100%" stopColor="#b0b0b0" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.15)" />
        </filter>
        <filter id="ring-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(255,255,255,0.6)" />
        </filter>
        <clipPath id="hand-clip">
          <rect x="0" y="0" width="420" height="580" />
        </clipPath>
      </defs>

      {/* ── PALM ── */}
      <g filter="url(#shadow)">
        <path
          d="M 80 380 Q 60 460 65 540 Q 100 570 200 572 Q 310 570 350 540 Q 360 460 340 380 Q 290 350 210 348 Q 130 350 80 380 Z"
          fill="url(#skin-grad)"
          stroke={skinShadow}
          strokeWidth="0.5"
        />
      </g>

      {/* ── THUMB ── */}
      <path
        d="M 80 380 Q 50 360 38 330 Q 28 295 42 272 Q 55 252 76 256 Q 95 260 100 288 Q 105 315 108 345"
        fill={skinBase}
        stroke={skinShadow}
        strokeWidth="0.5"
      />
      <path
        d="M 42 270 Q 50 256 65 258 Q 80 260 86 270"
        fill={nailColor}
        stroke={skinShadow}
        strokeWidth="0.5"
      />

      {/* ── INDEX FINGER ── */}
      <path
        d="M 120 350 Q 112 300 114 240 Q 116 185 128 162 Q 142 140 158 142 Q 172 145 178 165 Q 185 185 182 240 Q 180 295 175 350"
        fill="url(#skin-finger)"
        stroke={skinShadow}
        strokeWidth="0.5"
      />
      <ellipse cx="143" cy="153" rx="15" ry="10" fill={nailColor} stroke={skinShadow} strokeWidth="0.5" />
      {/* Knuckle lines */}
      <path d="M 117 265 Q 148 260 181 265" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.3" />
      <path d="M 116 305 Q 148 300 180 305" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.3" />

      {/* ── MIDDLE FINGER ── */}
      <path
        d="M 178 348 Q 172 295 173 228 Q 174 168 186 143 Q 198 118 214 118 Q 230 118 242 143 Q 254 168 255 228 Q 255 295 250 348"
        fill="url(#skin-finger)"
        stroke={skinShadow}
        strokeWidth="0.5"
      />
      <ellipse cx="214" cy="130" rx="16" ry="10" fill={nailColor} stroke={skinShadow} strokeWidth="0.5" />
      <path d="M 175 255 Q 214 250 253 255" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.3" />
      <path d="M 175 298 Q 214 293 253 298" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.3" />

      {/* ── RING FINGER (with ring) ── */}
      <path
        d="M 252 348 Q 246 295 247 230 Q 248 172 260 148 Q 272 126 287 126 Q 302 126 314 148 Q 326 172 327 230 Q 328 295 322 348"
        fill="url(#skin-finger)"
        stroke={skinShadow}
        strokeWidth="0.5"
      />
      <ellipse cx="287" cy="138" rx="15" ry="10" fill={nailColor} stroke={skinShadow} strokeWidth="0.5" />
      <path d="M 249 258 Q 287 253 325 258" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.3" />
      <path d="M 249 300 Q 287 295 325 300" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.3" />

      {/* ── RING BAND on ring finger ── */}
      {/* Band shadow */}
      <rect
        x={287 - dW / 2 - 2}
        y={296}
        width={dW + 4}
        height={bandH + 2}
        rx={bandH / 2 + 1}
        fill="rgba(0,0,0,0.15)"
      />
      {/* Band itself */}
      <rect
        x={287 - dW / 2}
        y={295}
        width={dW}
        height={bandH}
        rx={bandH / 2}
        fill="url(#metal-grad)"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.5"
        filter="url(#ring-glow)"
      />

      {/* ── DIAMOND on ring finger ── */}
      <g
        transform={`translate(${287 - dW / 2}, ${295 - dH - 2})`}
        filter="url(#ring-glow)"
      >
        <DiamondSVG shape={selectedShape} width={dW} height={dH} metalColor={metalColor} />
      </g>

      {/* ── LITTLE FINGER ── */}
      <path
        d="M 324 348 Q 320 305 321 255 Q 322 210 332 190 Q 342 170 355 170 Q 368 170 377 192 Q 386 214 384 258 Q 382 305 375 348"
        fill="url(#skin-finger)"
        stroke={skinShadow}
        strokeWidth="0.5"
      />
      <ellipse cx="355" cy="181" rx="13" ry="9" fill={nailColor} stroke={skinShadow} strokeWidth="0.5" />
      <path d="M 322 270 Q 353 265 383 270" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.3" />
      <path d="M 322 308 Q 353 303 383 308" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

// ─── Shape Icon SVGs (mini) ─────────────────────────────────────────────────
function ShapeIcon({ shape, active }) {
  const color = active ? '#fff' : '#334155';
  const size = 20;
  const icons = {
    round:    <circle cx="10" cy="10" r="8" fill="none" stroke={color} strokeWidth="1.5" />,
    princess: <rect x="2" y="2" width="16" height="16" fill="none" stroke={color} strokeWidth="1.5" />,
    cushion:  <rect x="2" y="2" width="16" height="16" rx="4" fill="none" stroke={color} strokeWidth="1.5" />,
    heart:    <path d="M 10 16 L 2 8 C 2 4 6 3 8 5 L 10 7 L 12 5 C 14 3 18 4 18 8 Z" fill="none" stroke={color} strokeWidth="1.5" />,
    oval:     <ellipse cx="10" cy="10" rx="8" ry="5" fill="none" stroke={color} strokeWidth="1.5" />,
    pear:     <path d="M 10 2 C 16 2 18 7 15 11 L 10 18 L 5 11 C 2 7 4 2 10 2 Z" fill="none" stroke={color} strokeWidth="1.5" />,
    asscher:  <polygon points="6,2 14,2 18,6 18,14 14,18 6,18 2,14 2,6" fill="none" stroke={color} strokeWidth="1.5" />,
    emerald:  <polygon points="4,4 16,4 19,8 19,12 16,16 4,16 1,12 1,8" fill="none" stroke={color} strokeWidth="1.5" />,
    radiant:  <polygon points="5,2 15,2 18,5 18,15 15,18 5,18 2,15 2,5" fill="none" stroke={color} strokeWidth="1.5" />,
    marquise: <path d="M 10 2 Q 18 10 10 18 Q 2 10 10 2 Z" fill="none" stroke={color} strokeWidth="1.5" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      {icons[shape] || icons.round}
    </svg>
  );
}

// ─── Metal colors ──────────────────────────────────────────────────────────────
const METALS = [
  { id: 'white_gold', label: 'White Gold', color: '#E8E8E8' },
  { id: 'yellow_gold', label: 'Yellow Gold', color: '#D4A520' },
  { id: 'rose_gold', label: 'Rose Gold', color: '#C8837A' },
  { id: 'platinum', label: 'Platinum', color: '#D8D8D8' },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function HandModelViewer({
  isOpen,
  onClose,
  selectedShape: propShape = 'round',
  selectedCarat: propCarat = 1.5,
  selectedMetal: propMetal = 'white_gold',
}) {
  const [activeTab, setActiveTab] = useState('diamond'); // 'diamond' | 'hand'
  const [shape, setShape] = useState(propShape);
  const [selectedCarat, setSelectedCarat] = useState(propCarat);
  const [skinTone, setSkinTone] = useState(20); // 0=light, 100=dark
  const [metal, setMetal] = useState(propMetal);
  const [zoom, setZoom] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  const metalColor = METALS.find(m => m.id === metal)?.color || '#E8E8E8';
  const caratList = (CARAT_DATA[shape] || CARAT_DATA.round).map(d => d.ct);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result);
    reader.readAsDataURL(file);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          display: 'flex',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '92vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Close button ── */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: '#f1f5f9', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#475569', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
        >
          <X size={16} />
        </button>

        {/* ── LEFT PANEL: Controls ── */}
        <div style={{
          width: '320px', flexShrink: 0,
          borderRight: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            {[
              { id: 'diamond', icon: '💎', label: 'Your Diamond' },
              { id: 'hand',    icon: '✋', label: 'Your Hand' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '14px 8px',
                  border: 'none', background: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  borderBottom: activeTab === tab.id ? '3px solid #1e3a6e' : '3px solid transparent',
                  color: activeTab === tab.id ? '#1e3a6e' : '#94a3b8',
                  transition: 'all 0.15s',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
                }}
              >
                <span style={{ fontSize: 20 }}>{tab.icon}</span>
                {tab.label.split(' ').map((w, i) => (
                  <span key={i} style={{ display: 'block', lineHeight: 1.1 }}>
                    {i === 1 ? <strong>{w}</strong> : w}
                  </span>
                ))}
              </button>
            ))}
          </div>

          {/* ── DIAMOND TAB ── */}
          {activeTab === 'diamond' && (
            <div style={{ padding: '16px', flex: 1 }}>
              {/* Shape icons row */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16,
              }}>
                {SHAPES.map(s => (
                  <button
                    key={s.id}
                    title={s.label}
                    onClick={() => setShape(s.id)}
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      border: shape === s.id ? '2px solid #1e3a6e' : '1.5px solid #cbd5e1',
                      background: shape === s.id ? '#1e3a6e' : '#f8fafc',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', padding: 0,
                    }}
                  >
                    <ShapeIcon shape={s.id} active={shape === s.id} />
                  </button>
                ))}
              </div>

              {/* Carat table */}
              <div style={{
                maxHeight: 320, overflowY: 'auto',
                border: '1px solid #e2e8f0', borderRadius: 8,
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <tbody>
                    {(CARAT_DATA[shape] || CARAT_DATA.round).map((row, i) => (
                      <tr
                        key={row.ct}
                        onClick={() => setSelectedCarat(row.ct)}
                        style={{
                          background: selectedCarat === row.ct
                            ? '#dbeafe'
                            : i % 2 === 0 ? '#fff' : '#f8fafc',
                          cursor: 'pointer',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => {
                          if (selectedCarat !== row.ct)
                            e.currentTarget.style.background = '#eff6ff';
                        }}
                        onMouseLeave={e => {
                          if (selectedCarat !== row.ct)
                            e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f8fafc';
                        }}
                      >
                        <td style={{
                          padding: '7px 12px', color: '#334155', fontWeight: 500,
                          borderBottom: '1px solid #f1f5f9',
                        }}>
                          {shape}
                        </td>
                        <td style={{
                          padding: '7px 8px', color: '#1e3a6e', fontWeight: 700,
                          borderBottom: '1px solid #f1f5f9',
                          textAlign: 'center',
                        }}>
                          {row.ct}
                        </td>
                        <td style={{
                          padding: '7px 8px', color: '#64748b',
                          borderBottom: '1px solid #f1f5f9',
                          textAlign: 'center',
                        }}>
                          {row.l}
                        </td>
                        <td style={{
                          padding: '7px 4px', color: '#94a3b8',
                          borderBottom: '1px solid #f1f5f9',
                          textAlign: 'center',
                        }}>x</td>
                        <td style={{
                          padding: '7px 8px', color: '#64748b',
                          borderBottom: '1px solid #f1f5f9',
                          textAlign: 'center',
                        }}>
                          {row.w}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Metal selector */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Metal
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {METALS.map(m => (
                    <button
                      key={m.id}
                      title={m.label}
                      onClick={() => setMetal(m.id)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: m.color,
                        border: metal === m.id ? '3px solid #1e3a6e' : '2px solid #cbd5e1',
                        cursor: 'pointer', outline: 'none',
                        boxShadow: metal === m.id ? '0 0 0 2px white, 0 0 0 4px #1e3a6e' : 'none',
                        transition: 'all 0.15s',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HAND TAB ── */}
          {activeTab === 'hand' && (
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              {/* QR placeholder */}
              <div style={{
                textAlign: 'center', padding: '16px',
                border: '1px solid #e2e8f0', borderRadius: 10, width: '100%',
              }}>
                <div style={{
                  width: 120, height: 120, margin: '0 auto 12px',
                  background: '#f1f5f9', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#94a3b8',
                }}>
                  QR Code<br/>Coming Soon
                </div>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Scan the QR code with your phone<br />to view the ring on your hand.
                </p>
              </div>

              {/* Or divider */}
              <div style={{ fontSize: 14, color: '#1e3a6e', fontWeight: 700 }}>Or</div>

              {/* Upload section */}
              <div style={{ width: '100%', textAlign: 'center' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '10px 24px', background: '#1e3a6e', color: '#fff',
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, display: 'flex',
                    alignItems: 'center', gap: 8, margin: '0 auto 16px',
                  }}
                >
                  <Upload size={15} />
                  Upload a Picture
                </button>
                <ul style={{ textAlign: 'left', padding: '0 0 0 20px', margin: 0, fontSize: 12, color: '#64748b', lineHeight: 2 }}>
                  <li>Separate your fingers</li>
                  <li>Take off any rings</li>
                  <li>Use a contrasting background</li>
                </ul>
                <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 12, lineHeight: 1.5 }}>
                  By using this tool, I consent to capture<br />and store images for Virtual Try-On.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Hand Viewer ── */}
        <div style={{
          flex: 1, position: 'relative', background: '#f8fafc',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Zoom controls */}
          <div style={{
            position: 'absolute', bottom: 56, left: 16, zIndex: 5,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <button
              onClick={() => setZoom(z => Math.min(2, z + 0.2))}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#fff', border: '1px solid #e2e8f0',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              <ZoomIn size={14} color="#334155" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#fff', border: '1px solid #e2e8f0',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              <ZoomOut size={14} color="#334155" />
            </button>
          </div>

          {/* Hand display */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 16 }}>
            <div style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.25s ease',
              transformOrigin: 'center center',
              width: '100%', maxWidth: 380, maxHeight: 520,
            }}>
              {uploadedImage && activeTab === 'hand' ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img
                    src={uploadedImage}
                    alt="Your hand"
                    style={{ width: '100%', borderRadius: 12, display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: '30%', left: '40%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.85,
                  }}>
                    <DiamondSVG
                      shape={shape}
                      width={(CARAT_DATA[shape] || CARAT_DATA.round).find(d => d.ct === selectedCarat)?.w * 5 || 40}
                      height={(CARAT_DATA[shape] || CARAT_DATA.round).find(d => d.ct === selectedCarat)?.l * 5 || 48}
                      metalColor={metalColor}
                    />
                  </div>
                </div>
              ) : (
                <HandWithRing
                  skinTone={skinTone}
                  selectedShape={shape}
                  selectedCarat={selectedCarat}
                  metalColor={metalColor}
                />
              )}
            </div>
          </div>

          {/* Skin tone slider */}
          <div style={{
            padding: '12px 20px 16px',
            borderTop: '1px solid #e2e8f0',
            background: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ZoomIn size={16} color="#64748b" />
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={skinTone}
                  onChange={e => setSkinTone(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, cursor: 'pointer',
                    appearance: 'none', WebkitAppearance: 'none',
                    background: `linear-gradient(to right,
                      hsl(28,55%,85%) 0%,
                      hsl(25,60%,68%) 40%,
                      hsl(22,55%,52%) 70%,
                      hsl(20,50%,30%) 100%
                    )`,
                    borderRadius: 4, outline: 'none', border: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4, paddingLeft: 28 }}>
              <span>Lighter</span>
              <span>Darker</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}