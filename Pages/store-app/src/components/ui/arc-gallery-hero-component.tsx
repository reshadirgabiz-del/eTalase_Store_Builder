'use client';

import React, { useEffect, useState } from 'react';

type ArcGalleryHeroProps = {
  images: string[];
  startAngle?: number;
  endAngle?: number;
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  onPrimaryCtaClick?: () => void;
  onSecondaryCtaClick?: () => void;
};

export const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  startAngle = 20,
  endAngle = 160,
  radiusLg = 480,
  radiusMd = 360,
  radiusSm = 260,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  className = '',
  title = 'Discover Our Collection',
  subtitle = 'Curated pieces crafted for the modern lifestyle.',
  primaryCtaText = 'Shop Now',
  secondaryCtaText = 'Our Story',
  onPrimaryCtaClick,
  onSecondaryCtaClick,
}) => {
  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardSize: cardSizeLg,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
      } else {
        setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);

  const count = Math.max(images.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  return (
    <section
      className={`relative overflow-hidden text-store-text min-h-screen flex flex-col ${className}`}
      style={{ background: 'linear-gradient(160deg, #FDF2F8 0%, #FFFFFF 45%, #FCE7F3 100%)' }}
    >
      {/* Decorative blobs: lavender top-left, peach top-right */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #E9D5FF 0%, transparent 70%)' }} />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #FED7AA 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-48 opacity-20" style={{ background: 'radial-gradient(ellipse, #FBCFE8 0%, transparent 70%)' }} />
      </div>

      <div
        className="relative mx-auto"
        style={{
          width: '100%',
          height: dimensions.radius * 1.2,
        }}
      >
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
          {images.map((src, i) => {
            const angle = startAngle + step * i;
            const angleRad = (angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;

            return (
              <div
                key={i}
                className="absolute opacity-0 animate-fade-in-up"
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: `calc(50% + ${x}px)`,
                  bottom: `${y}px`,
                  transform: `translate(-50%, 50%)`,
                  animationDelay: `${i * 80}ms`,
                  animationFillMode: 'forwards',
                  zIndex: count - i,
                }}
              >
                <div
                  className="rounded-2xl shadow-xl overflow-hidden ring-1 ring-store-border bg-store-card transition-transform hover:scale-105 w-full h-full cursor-pointer"
                  style={{ transform: `rotate(${angle / 4}deg)` }}
                >
                  <img
                    src={src}
                    alt={`Product ${i + 1}`}
                    className="block w-full h-full object-cover"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop`;
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 -mt-40 md:-mt-52 lg:-mt-64">
        <div
          className="text-center max-w-2xl px-6 opacity-0 animate-fade-in"
          style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}
        >
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-store-text leading-tight">
            {title}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-store-muted font-sans font-light leading-relaxed max-w-lg mx-auto">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onPrimaryCtaClick}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-store-primary text-store-bg font-sans font-medium text-sm tracking-widest uppercase hover:bg-store-secondary transition-colors duration-200 cursor-pointer"
            >
              {primaryCtaText}
            </button>
            <button
              onClick={onSecondaryCtaClick}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-store-border text-store-text font-sans font-medium text-sm tracking-widest uppercase hover:bg-store-border transition-colors duration-200 cursor-pointer"
            >
              {secondaryCtaText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 60%); }
          to   { opacity: 1; transform: translate(-50%, 50%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation-name: fade-in-up;
          animation-duration: 0.8s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fade-in {
          animation-name: fade-in;
          animation-duration: 0.6s;
          animation-timing-function: ease-out;
        }
      `}</style>
    </section>
  );
};
