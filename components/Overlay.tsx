import React from 'react';
import { AppMode, HandGesture } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface OverlayProps {
  mode: AppMode;
  currentGesture: HandGesture;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Overlay: React.FC<OverlayProps> = ({ mode, currentGesture, onUpload }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10 text-white select-none">
      
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-serif text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] tracking-tighter">
            Merry Christmas
          </h1>
          <p className="text-amber-200/70 text-sm tracking-widest mt-2 uppercase">
            Gesture Interactive Experience
          </p>
        </div>
        
        <div className="pointer-events-auto">
             <label className="cursor-pointer bg-white/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-100 px-4 py-2 rounded-full backdrop-blur-md transition-colors text-sm flex items-center gap-2">
                <span>Add Photos</span>
                <input type="file" multiple accept="image/*" onChange={onUpload} className="hidden" />
             </label>
        </div>
      </header>

      {/* Mode Status */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <AnimatePresence mode="wait">
            {mode === AppMode.TREE && (
                 <motion.div 
                    key="tree"
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }}
                    className="text-center"
                 >
                 </motion.div>
            )}
            {mode === AppMode.SCATTER && (
                 <motion.div 
                    key="scatter"
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 0.5, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="text-2xl font-light tracking-[0.5em] text-amber-100/30 uppercase"
                 >
                    Awaiting Focus
                 </motion.div>
            )}
          </AnimatePresence>
      </div>

      {/* Footer / Instructions */}
      <footer className="flex justify-between items-end">
        <div className="space-y-4">
            <InstructionItem 
                active={currentGesture === HandGesture.CLOSED_FIST} 
                label="Fist" 
                desc="Form Tree" 
            />
             <InstructionItem 
                active={currentGesture === HandGesture.OPEN_PALM} 
                label="Open Hand" 
                desc="Scatter Stars" 
            />
             <InstructionItem 
                active={currentGesture === HandGesture.PINCH} 
                label="Pinch" 
                desc="Grab Memory" 
            />
        </div>

        <div className="text-right space-y-1">
            <div className="text-xs text-amber-500/50 uppercase tracking-widest">Current Status</div>
            <div className={`text-xl font-bold transition-colors duration-300 ${
                mode === AppMode.ZOOM ? 'text-amber-300' : 'text-white/80'
            }`}>
                {mode === AppMode.TREE ? 'TREE FORMATION' : mode === AppMode.SCATTER ? 'ETHEREAL SCATTER' : 'MEMORY RECALL'}
            </div>
        </div>
      </footer>
    </div>
  );
};

const InstructionItem: React.FC<{ active: boolean; label: string; desc: string }> = ({ active, label, desc }) => (
    <div className={`flex items-center gap-3 transition-all duration-300 ${active ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' : 'bg-white'}`} />
        <div>
            <div className="text-xs uppercase font-bold text-amber-100">{label}</div>
            <div className="text-[10px] text-amber-200/60">{desc}</div>
        </div>
    </div>
);

export default Overlay;