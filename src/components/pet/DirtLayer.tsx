import { motion } from 'framer-motion';

interface DirtLayerProps {
  hygiene: number;
  onClean: () => void;
}

export const DirtLayer = ({ hygiene, onClean }: DirtLayerProps) => {
  if (hygiene >= 95) return null;

  const dirtOpacity = Math.max(0, Math.min(0.8, (100 - hygiene) / 100));

  return (
    <motion.div
      className="absolute inset-0 z-20 cursor-pointer pointer-events-auto rounded-2xl overflow-hidden"
      style={{
        background: `radial-gradient(circle at center, transparent 30%, rgba(60, 40, 10, ${dirtOpacity}) 100%)`, // Muddy vignette
        boxShadow: `inset 0 0 ${100 - hygiene}px rgba(60, 40, 10, ${dirtOpacity})`,
      }}
      onClick={(e) => {
        // Create 3-5 little "pop" or "sparkle" effects where clicked could be nice, but for now just callback
        onClean();
        
        // Visual feedback
        const target = e.currentTarget;
        target.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.98)' },
            { transform: 'scale(1)' }
        ], { duration: 150 });
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
        {/* Dirt Spots (randomly positioned splotches) - simplified as SVG overlays */}
        {hygiene < 80 && (
            <svg className="absolute top-10 left-10 w-20 h-20 opacity-40 text-amber-900" viewBox="0 0 100 100">
                <path fill="currentColor" d="M30,10 Q50,0 70,20 T90,50 T70,90 T30,80 T10,50 T30,10 Z" />
            </svg>
        )}
        {hygiene < 60 && (
            <svg className="absolute bottom-20 right-10 w-24 h-24 opacity-50 text-amber-900" viewBox="0 0 100 100">
                <path fill="currentColor" d="M20,20 Q50,10 80,30 T90,70 T60,95 T20,80 T10,40 Z" />
            </svg>
        )}
        {hygiene < 40 && (
             <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 opacity-30 text-amber-950" viewBox="0 0 100 100">
                <path fill="currentColor" d="M40,10 Q80,0 90,40 T60,90 T10,60 T20,20 Z" />
            </svg>
        )}

      {/* Helper text if very dirty */}
      {hygiene < 50 && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <motion.span 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm"
          >
            Tap to clean! 🧼
          </motion.span>
        </div>
      )}
    </motion.div>
  );
};
