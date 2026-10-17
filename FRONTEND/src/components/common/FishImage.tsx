import React, { useState } from 'react';
import { FishIcon } from './Icons';

interface FishImageProps {
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackIconSize?: number;
  borderRadius?: string;
  aspectRatio?: string;
  fit?: 'cover' | 'contain';
}

export const FishImage: React.FC<FishImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  fallbackIconSize = 24,
  borderRadius = 'var(--radius-md)',
  aspectRatio,
  fit = 'cover'
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // If no source or error occurred, show rich stylish fallback
  if (!src || hasError) {
    return (
      <div
        className={`fish-image-fallback ${className}`}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100%',
          borderRadius,
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(14, 165, 233, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-cyan)',
          aspectRatio,
          position: 'relative',
          overflow: 'hidden',
          ...style
        }}
        title={alt}
      >
        <FishIcon size={fallbackIconSize} />
        <span
          style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: 'var(--text-secondary)',
            marginTop: '2px',
            textAlign: 'center',
            padding: '0 4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '90%'
          }}
        >
          {alt.slice(0, 16)}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius,
        overflow: 'hidden',
        background: 'rgba(15, 23, 42, 0.6)',
        aspectRatio,
        ...style
      }}
      className={className}
    >
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 100%)',
            backgroundSize: '200% 100%',
            animation: 'pulse 1.5s infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FishIcon size={fallbackIconSize} className="text-slate-500 opacity-40 animate-pulse" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          borderRadius,
          display: 'block',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.25s ease-in-out, transform 0.3s ease'
        }}
      />
    </div>
  );
};
