import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';

interface EventGallerySlideshowProps {
  images: string[];
  autoPlayInterval?: number; // in ms, default 5000
  eventTitle?: string;
}

const EventGallerySlideshow: React.FC<EventGallerySlideshowProps> = ({
  images,
  autoPlayInterval = 5000,
  eventTitle = 'Event',
}) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = images.length;

  const goTo = useCallback(
    (index: number, dir: number) => {
      setDirection(dir);
      setCurrent(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount]
  );

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (isPaused || slideCount <= 1) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [next, isPaused, autoPlayInterval, slideCount]);

  if (!images || images.length === 0) return null;

  // Single image — just render it, no controls
  if (images.length === 1) {
    return (
      <div className="w-full rounded-2xl overflow-hidden border border-white/10 mb-8">
        <img
          src={images[0]}
          alt={`${eventTitle} photo`}
          className="w-full h-64 md:h-80 object-cover"
        />
      </div>
    );
  }

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div
      className="w-full mb-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-[#7c3aed]/10 rounded-lg">
          <Images size={14} className="text-[#7c3aed]" />
        </div>
        <span className="text-sm font-medium text-gray-400">
          Event Gallery
        </span>
        <span className="text-xs text-gray-600 ml-auto">
          {current + 1} / {slideCount}
        </span>
      </div>

      {/* Slideshow container */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a1a]/60 group">
        {/* Image viewport */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.img
              key={current}
              src={images[current]}
              alt={`${eventTitle} photo ${current + 1}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.25 },
              }}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </AnimatePresence>

          {/* Gradient overlay at bottom for dots visibility */}
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all duration-200 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all duration-200 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > current ? 1 : -1)}
              className={`transition-all duration-300 rounded-full ${
                idx === current
                  ? 'w-6 h-2 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] shadow-[0_0_8px_rgba(0,212,255,0.5)]'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Auto-play indicator */}
      {!isPaused && slideCount > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
          <span className="text-[10px] text-gray-600">Auto-playing</span>
        </div>
      )}
    </div>
  );
};

export default EventGallerySlideshow;
