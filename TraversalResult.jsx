import { useStore } from '../../store/useStore';
import { motion, useDragControls } from 'framer-motion';
import { GripHorizontal } from 'lucide-react';

export default function TraversalResult() {
  const { structureType, traversalResult, currentTraversalType } = useStore();
  const dragControls = useDragControls();

  if (!['BST', 'RBT', 'GRAPH'].includes(structureType) || traversalResult.length === 0) {
    return null;
  }

  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="absolute top-6 left-1/2 -translate-x-1/2 pixel-panel z-10 pointer-events-auto"
      style={{ minWidth: '350px', maxWidth: '600px', resize: 'both', overflow: 'hidden' }}
    >
      {/* Drag Header */}
      <div 
        className="panel-header-themed text-white p-2 border-b-4 cursor-grab active:cursor-grabbing flex justify-between items-center"
        style={{ borderColor: 'var(--theme-panel-border, white)' }}
        onPointerDown={(e) => dragControls.start(e)}
      >
        <h2 className="text-[10px] font-bold text-yellow-400 tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase flex items-center">
          <GripHorizontal size={14} className="mr-2 opacity-70 text-white" />
          {currentTraversalType} RESULT
        </h2>
        <div className="flex flex-col gap-[2px]">
          <div className="w-3 h-[2px] bg-white"></div>
          <div className="w-3 h-[2px] bg-white"></div>
          <div className="w-3 h-[2px] bg-white"></div>
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-2 justify-center overflow-y-auto max-h-[200px]">
        {traversalResult.map((val, idx) => (
          <div key={idx} className="flex items-center">
            <span 
              className="inline-block text-white px-3 py-2 text-sm border-2 border-white shadow-[2px_2px_0px_#000]"
              style={{ backgroundColor: 'var(--theme-btn-primary, #e80000)' }}
            >
              {val}
            </span>
            {idx < traversalResult.length - 1 && (
              <span className="text-white ml-2 opacity-50 font-bold text-xs">{'>'}</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
