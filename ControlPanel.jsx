import { useStore } from '../../store/useStore';
import { Settings, Play, Pause, RotateCcw, Plus, Minus, Trash2, ArrowUpDown, GripHorizontal, Eye, Globe, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { toggleBackgroundMusic } from '../../utils/audio';

const THEMES = [
  { id: 'mario',   label: '🍄 MARIO',   color: '#e80000' },
  { id: 'zelda',   label: '⚔️ ZELDA',   color: '#2d5016' },
  { id: 'space',   label: '🚀 SPACE',   color: '#5500aa' },
  { id: 'pokemon', label: '⚡ POKEMON', color: '#cc0000' },
];

export default function ControlPanel() {
  const { 
    structureType, setStructureType, 
    clearAll, insertValue, deleteValue, triggerSort, 
    triggerTraversal, isAnimating, theme, setTheme, 
    cameraMode, setCameraMode, isMusicOn, setIsMusicOn
  } = useStore();
  const [inputValue, setInputValue] = useState('');
  const dragControls = useDragControls();

  useEffect(() => {
    toggleBackgroundMusic(isMusicOn);
  }, [isMusicOn]);

  const handleAdd = () => {
    if (inputValue.trim() === '' || isAnimating) return;
    insertValue(Number(inputValue));
    setInputValue('');
  };

  const handleDelete = () => {
    if (inputValue.trim() === '' || isAnimating) return;
    deleteValue(Number(inputValue));
    setInputValue('');
  };

  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="absolute bottom-6 left-6 pixel-panel z-10 pointer-events-auto"
      style={{ width: '384px', minWidth: '300px', minHeight: '300px', maxHeight: '80vh', resize: 'both', overflow: 'hidden' }}
    >
      {/* Drag Handle Header */}
      <div 
        className="panel-header-themed text-white p-2 border-b-4 cursor-grab active:cursor-grabbing flex justify-between items-center"
        style={{ borderColor: 'var(--theme-panel-border, white)' }}
        onPointerDown={(e) => dragControls.start(e)}
      >
        <h1 className="text-sm font-bold tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center">
          <GripHorizontal size={16} className="mr-2 opacity-70" />
          DATACRAFT
        </h1>
        <div className="flex flex-col gap-[2px]">
          <div className="w-4 h-[2px] bg-white"></div>
          <div className="w-4 h-[2px] bg-white"></div>
          <div className="w-4 h-[2px] bg-white"></div>
        </div>
      </div>

      {/* Content Area with Scroll */}
      <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full flex-1 bg-black text-white">

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider">Structure Type</label>
          <select 
            className="pixel-input p-3 text-xs outline-none w-full"
            value={structureType}
            onChange={(e) => setStructureType(e.target.value)}
            disabled={isAnimating}
          >
            <option value="BST">BINARY SEARCH TREE</option>
            <option value="RBT">RED-BLACK TREE</option>
            <option value="TABLE">ARRAY / TABLE</option>
            <option value="GRAPH">GRAPH</option>
          </select>
        </div>

        <div className="flex gap-2 mt-2">
          <input 
            type="number"
            placeholder="VAL"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isAnimating}
            className="flex-1 w-full pixel-input p-3 outline-none text-center text-xs disabled:opacity-50"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button 
            onClick={handleAdd}
            disabled={isAnimating}
            className="btn-pixel bg-[var(--color-brand-tertiary)] p-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={24} />
          </button>
          <button 
            onClick={handleDelete}
            disabled={isAnimating || structureType === 'RBT'}
            className="btn-pixel bg-[var(--color-brand-primary)] p-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title={structureType === 'RBT' ? "Not implemented for RBT yet" : "Delete value"}
          >
            <Minus size={24} />
          </button>
        </div>

        {['BST', 'RBT'].includes(structureType) && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button 
              onClick={() => triggerTraversal('INORDER')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-[var(--color-brand-primary)] text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              INORDER
            </button>
            <button 
              onClick={() => triggerTraversal('PREORDER')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-[var(--color-brand-primary)] text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              PREORDER
            </button>
            <button 
              onClick={() => triggerTraversal('POSTORDER')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-[var(--color-brand-primary)] text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              POSTORDER
            </button>
            <button 
              onClick={() => triggerTraversal('BFS')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-[var(--color-brand-primary)] text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              BFS (WIDTH)
            </button>
          </div>
        )}

        {structureType === 'GRAPH' && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button 
              onClick={() => triggerTraversal('BFS')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-[var(--color-brand-primary)] text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              BFS (WIDTH)
            </button>
            <button 
              onClick={() => triggerTraversal('DFS')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-[var(--color-brand-primary)] text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              DFS (DEPTH)
            </button>
          </div>
        )}

        {structureType === 'TABLE' && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button 
              onClick={() => triggerSort('BUBBLE')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-orange-500 text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              BUBBLE
            </button>
            <button 
              onClick={() => triggerSort('SELECTION')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-orange-500 text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              SELECTION
            </button>
            <button 
              onClick={() => triggerSort('INSERTION')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-orange-500 text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              INSERTION
            </button>
            <button 
              onClick={() => triggerSort('QUICK')}
              disabled={isAnimating}
              className="w-full btn-pixel bg-orange-500 text-white border-white p-2 flex items-center justify-center text-[10px] disabled:opacity-50"
            >
              QUICK
            </button>
          </div>
        )}

        {/* THEME SELECTOR */}
        <div className="mt-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center mb-2">
            <Globe size={12} className="mr-1" /> THEME
          </label>
          <div className="grid grid-cols-2 gap-1">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="btn-pixel p-2 text-[8px] flex items-center justify-center"
                style={{
                  backgroundColor: theme === t.id ? t.color : '#111',
                  borderColor: theme === t.id ? 'white' : '#444',
                  opacity: theme === t.id ? 1 : 0.6,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* CAMERA MODE */}
        <div className="mt-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center mb-2">
            <Eye size={12} className="mr-1" /> CAMERA
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCameraMode('orbit')}
              className="btn-pixel p-2 text-[9px] flex items-center justify-center"
              style={{ backgroundColor: cameraMode === 'orbit' ? 'var(--theme-btn-primary, #e80000)' : '#111', borderColor: cameraMode === 'orbit' ? 'white' : '#444' }}
            >
              🔭 ORBIT
            </button>
            <button
              onClick={() => setCameraMode('fps')}
              className="btn-pixel p-2 text-[9px] flex items-center justify-center"
              style={{ backgroundColor: cameraMode === 'fps' ? 'var(--theme-btn-primary, #e80000)' : '#111', borderColor: cameraMode === 'fps' ? 'white' : '#444' }}
            >
              👁️ FPS
            </button>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="grid grid-cols-3 gap-2 mt-auto pt-4">
          <button 
            onClick={() => setIsMusicOn(!isMusicOn)}
            className="btn-pixel bg-[var(--color-brand-secondary)] text-black border-black p-3 flex items-center justify-center col-span-2 text-xs"
          >
            {isMusicOn ? <Volume2 size={18} className="mr-2"/> : <VolumeX size={18} className="mr-2"/>}
            {isMusicOn ? "MUSIC: ON" : "MUSIC: OFF"}
          </button>
          <button 
            onClick={clearAll}
            disabled={isAnimating}
            className="btn-pixel bg-[var(--color-brand-primary)] p-3 flex items-center justify-center disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
