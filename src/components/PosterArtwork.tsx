import React, { useState } from 'react';
import { ContentItem } from '../types/streamnest.ts';

interface PosterArtworkProps {
  item: ContentItem;
  variant?: 'poster' | 'backdrop' | 'thumbnail';
  className?: string;
  showBadges?: boolean;
}

export const PosterArtwork: React.FC<PosterArtworkProps> = ({
  item,
  variant = 'poster',
  className = '',
  showBadges = true,
}) => {
  const isBackdrop = variant === 'backdrop';
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const imageSrc = isBackdrop
    ? item.backdropUrl || item.posterUrl
    : item.posterUrl || item.backdropUrl;

  // Distinct SVG art motifs per genre/artStyle as a rich stylized fallback
  const renderVisualMotif = () => {
    switch (item.artStyle) {
      case 'scifi':
      case 'space':
        return (
          <g>
            <radialGradient id={`glow-${item.id}`} cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#EAB308" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#065F46" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#050B08" stopOpacity="0" />
            </radialGradient>
            <rect width="100%" height="100%" fill={`url(#glow-${item.id})`} />
            <circle cx="50%" cy="38%" r={isBackdrop ? "140" : "85"} fill="none" stroke="#FDE047" strokeWidth="2" strokeDasharray="6 8" opacity="0.4" />
            <circle cx="50%" cy="38%" r={isBackdrop ? "90" : "55"} fill="none" stroke="#34D399" strokeWidth="1.5" opacity="0.6" />
            <circle cx="50%" cy="38%" r={isBackdrop ? "35" : "22"} fill="#FEF08A" opacity="0.9" />
            <line x1="0" y1="90%" x2="100%" y2="90%" stroke="#10B981" strokeWidth="1" opacity="0.3" />
          </g>
        );

      case 'cyberpunk':
        return (
          <g>
            <linearGradient id={`cyber-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064E3B" />
              <stop offset="40%" stopColor="#14532D" />
              <stop offset="100%" stopColor="#050B08" />
            </linearGradient>
            <rect width="100%" height="100%" fill={`url(#cyber-${item.id})`} />
            <rect x="15%" y="30%" width="12%" height="70%" fill="#065F46" opacity="0.9" />
            <rect x="30%" y="20%" width="16%" height="80%" fill="#047857" opacity="0.8" />
            <rect x="52%" y="15%" width="20%" height="85%" fill="#15803D" opacity="0.9" />
            <rect x="75%" y="28%" width="14%" height="72%" fill="#065F46" opacity="0.85" />
            <line x1="15%" y1="30%" x2="15%" y2="100%" stroke="#FACC15" strokeWidth="2" opacity="0.85" />
            <line x1="72%" y1="15%" x2="72%" y2="100%" stroke="#10B981" strokeWidth="2" opacity="0.75" />
          </g>
        );

      case 'fantasy':
        return (
          <g>
            <radialGradient id={`fan-${item.id}`} cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#854D0E" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#064E3B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#050B08" />
            </radialGradient>
            <rect width="100%" height="100%" fill={`url(#fan-${item.id})`} />
            <circle cx="50%" cy="32%" r={isBackdrop ? "65" : "38"} fill="none" stroke="#FACC15" strokeWidth="1.5" opacity="0.7" />
          </g>
        );

      case 'kids':
      case 'family':
      case 'animation':
        return (
          <g>
            <radialGradient id={`kids-${item.id}`} cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#FACC15" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#050B08" />
            </radialGradient>
            <rect width="100%" height="100%" fill={`url(#kids-${item.id})`} />
            <circle cx="35%" cy="30%" r={isBackdrop ? "55" : "32"} fill="#FDE047" opacity="0.6" />
            <circle cx="65%" cy="35%" r={isBackdrop ? "45" : "26"} fill="#34D399" opacity="0.5" />
            <circle cx="50%" cy="50%" r={isBackdrop ? "80" : "50"} fill="none" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4 6" opacity="0.5" />
            <path d="M 0 500 Q 200 420 400 500" stroke="#10B981" strokeWidth="3" fill="none" opacity="0.4" />
          </g>
        );

      default:
        return (
          <g>
            <linearGradient id={`def-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14532D" />
              <stop offset="100%" stopColor="#050B08" />
            </linearGradient>
            <rect width="100%" height="100%" fill={`url(#def-${item.id})`} />
            <circle cx="50%" cy="40%" r="50" fill="#EAB308" opacity="0.25" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative overflow-hidden select-none bg-[#050B08] ${
        isBackdrop ? 'aspect-video' : 'aspect-[3/4]'
      } ${className}`}
    >
      {/* Underlying Styled SVG Motif (Instant render & robust fallback) */}
      <svg
        className="w-full h-full object-cover absolute inset-0 z-0"
        viewBox={isBackdrop ? "0 0 1000 562" : "0 0 400 533"}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`base-bg-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="50%" stopColor="#0D2818" />
            <stop offset="100%" stopColor="#050B08" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill={`url(#base-bg-${item.id})`} />
        {renderVisualMotif()}
      </svg>

      {/* High-Resolution Photographic Image Banner according to movie name */}
      {imageSrc && !imageError && (
        <img
          src={imageSrc}
          alt={item.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Cinematic Vignette & Deep Forest Green Gradient Scrims for pristine readability */}
      <div className="absolute inset-0 z-15 bg-gradient-to-t from-[#050B08] via-[#050B08]/60 to-transparent" />
      <div className="absolute inset-0 z-15 bg-gradient-to-r from-[#050B08]/80 via-transparent to-transparent" />

      {/* Content Branding Overlay */}
      <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between z-20 pointer-events-none">
        {/* Top Badges */}
        {showBadges && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-emerald-300 bg-emerald-950/85 px-2 py-0.5 rounded border border-emerald-500/40 backdrop-blur-sm">
                {item.type === 'series' ? 'Series' : 'Movie'}
              </span>
              {item.language && (
                <span className="text-[10px] font-medium text-yellow-300 bg-yellow-950/80 px-2 py-0.5 rounded border border-yellow-500/40 backdrop-blur-sm">
                  {item.language}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {item.isPanIndia && (
                <span className="text-[9px] font-bold tracking-wider uppercase text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                  PAN-INDIA
                </span>
              )}
              <span className="text-[10px] font-mono font-medium text-slate-200 bg-black/70 px-2 py-0.5 rounded border border-white/15 backdrop-blur-sm">
                {item.videoQuality}
              </span>
            </div>
          </div>
        )}

        {/* Bottom Title & Specs */}
        <div className="mt-auto">
          <p className="text-xs font-semibold text-yellow-400 tracking-wide uppercase mb-1 drop-shadow">
            {item.genre.slice(0, 2).join(' · ')}
          </p>
          <h4
            className={`font-bold tracking-tight text-white leading-tight drop-shadow-lg ${
              isBackdrop ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'
            }`}
          >
            {item.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-300 drop-shadow">
            <span className="text-yellow-400 font-semibold">★ {item.imdbScore}</span>
            <span>·</span>
            <span>{item.year}</span>
            <span>·</span>
            <span className="text-emerald-300 font-mono">{item.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
