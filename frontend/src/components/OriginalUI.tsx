import React from 'react';
export const GlassPanel: React.FC<{
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'orange' | 'slate';
}> = ({ children, className = '', glowColor = 'cyan' }) => {
  const borderStyles =
    glowColor === 'orange'
      ? 'border-orange-500/40 shadow-[0_0_25px_rgba(249,115,22,0.12)]'
      : glowColor === 'slate'
      ? 'border-slate-600/60 shadow-[0_0_20px_rgba(148,163,184,0.1)]'
      : 'border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.14)]';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-950/65 backdrop-blur-xl border ${borderStyles} text-slate-100 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-cyan-500/[0.03] pointer-events-none" />
      {children}
    </div>
  );
};

export const PlanetMiniThumb: React.FC<{ world: 'Mars' | 'Moon' | 'Earth' }> = ({ world }) => {
  const photoConfig = {
    Mars: {
      src: '/textures/mars_original_thumbnail.jpg',
      fallback: '/textures/mars_original_thumbnail.jpg',
      border: 'border-orange-400/60 shadow-[0_0_15px_rgba(249,115,22,0.55)]',
      bg: 'bg-orange-950'
    },
    Moon: {
      src: '/textures/moon_original_thumbnail.jpg',
      fallback: '/textures/moon_original_thumbnail.jpg',
      border: 'border-slate-300/60 shadow-[0_0_15px_rgba(148,163,184,0.5)]',
      bg: 'bg-slate-900'
    },
    Earth: {
      src: '/textures/earth_original_thumbnail.jpg',
      fallback: '/textures/earth_original_thumbnail.jpg',
      border: 'border-cyan-400/70 shadow-[0_0_16px_rgba(6,182,212,0.65)]',
      bg: 'bg-sky-950'
    }
  }[world];

  return (
    <div
      className={`relative w-12 h-12 rounded-full shrink-0 overflow-hidden border ${photoConfig.border} ${photoConfig.bg}`}
    >
      <img
        src={photoConfig.src}
        alt={world}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== photoConfig.fallback) {
            target.src = photoConfig.fallback;
          }
        }}
        className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500"
      />
      {/* 3D spherical inner shading */}
      <div className="absolute inset-0 rounded-full shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.8),inset_2px_2px_6px_rgba(255,255,255,0.25)] pointer-events-none" />
    </div>
  );
};
