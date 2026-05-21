import { useStore } from '../../store/useStore';
import { motion, useDragControls } from 'framer-motion';
import { GripHorizontal, Activity, ArrowLeftRight, Search } from 'lucide-react';

export default function StatsPanel() {
  const { stats, isAnimating } = useStore();
  const dragControls = useDragControls();

  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="absolute top-6 right-6 pixel-panel z-10 pointer-events-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] bg-black border-4 border-white"
      style={{ minWidth: '220px', resize: 'both', overflow: 'hidden' }}
    >
      {/* Drag Header */}
      <div 
        className="bg-[#5c94fc] text-white p-2 border-b-4 border-white cursor-grab active:cursor-grabbing flex justify-between items-center"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <h2 className="text-[10px] font-bold tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase flex items-center">
          <GripHorizontal size={14} className="mr-2 opacity-70 text-white" />
          STATS
        </h2>
        <div className="flex flex-col gap-[2px]">
          <div className="w-3 h-[2px] bg-white"></div>
          <div className="w-3 h-[2px] bg-white"></div>
          <div className="w-3 h-[2px] bg-white"></div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center text-[var(--color-brand-secondary)]">
            <Activity size={16} className="mr-2" />
            <span>OPERATIONS</span>
          </div>
          <span className="font-bold">{stats.operations}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center text-[#00f0ff]">
            <Search size={16} className="mr-2" />
            <span>COMPARISONS</span>
          </div>
          <span className="font-bold">{stats.comparisons}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center text-[#e80000]">
            <ArrowLeftRight size={16} className="mr-2" />
            <span>SWAPS</span>
          </div>
          <span className="font-bold">{stats.swaps}</span>
        </div>

        {isAnimating && (
          <div className="mt-2 text-center text-[10px] text-[var(--color-brand-secondary)] animate-pulse">
            CALCULATING...
          </div>
        )}
      </div>
    </motion.div>
  );
}
