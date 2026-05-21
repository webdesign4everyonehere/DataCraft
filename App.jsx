import Scene from './components/3d/Scene';
import ControlPanel from './components/ui/ControlPanel';
import TraversalResult from './components/ui/TraversalResult';
import StatsPanel from './components/ui/StatsPanel';
import { useStore } from './store/useStore';

/* ── Pixel coin SVG ── */
const PixelCoin = ({ style }) => (
  <div className="game-coin" style={style} aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="0" width="4" height="1" fill="#f8d820"/>
      <rect x="1" y="1" width="1" height="1" fill="#f8d820"/>
      <rect x="5" y="1" width="1" height="1" fill="#f8d820"/>
      <rect x="1" y="2" width="1" height="4" fill="#f8d820"/>
      <rect x="5" y="2" width="1" height="4" fill="#f8d820"/>
      <rect x="2" y="2" width="3" height="1" fill="#fff8a0"/>
      <rect x="2" y="7" width="4" height="1" fill="#f8d820"/>
    </svg>
  </div>
);

/* ── Blinking pixel star ── */
const PixelStar = ({ style }) => (
  <div className="pixel-star" style={style} aria-hidden="true">✦</div>
);

function App() {
  return (
    <div className="w-full h-full relative">
      <Scene />

      {/* Scanline overlay for CRT effect */}
      <div className="scanlines pointer-events-none" aria-hidden="true" />

      {/* ── Corner pixel bracket decorations ── */}
      {/* Top-left */}
      <div className="corner-bracket corner-tl pointer-events-none" aria-hidden="true" />
      {/* Top-right */}
      <div className="corner-bracket corner-tr pointer-events-none" aria-hidden="true" />
      {/* Bottom-left */}
      <div className="corner-bracket corner-bl pointer-events-none" aria-hidden="true" />
      {/* Bottom-right */}
      <div className="corner-bracket corner-br pointer-events-none" aria-hidden="true" />

      {/* ── Floating pixel coins (bottom bar area) ── */}
      <div className="pointer-events-none absolute bottom-3 right-6 flex items-center gap-3 z-10" aria-hidden="true">
        <PixelCoin style={{ animationDelay: '0s' }} />
        <PixelCoin style={{ animationDelay: '0.25s' }} />
        <PixelCoin style={{ animationDelay: '0.5s' }} />
        <span className="game-score-label">× ∞</span>
      </div>

      {/* ── DATACRAFT title watermark (bottom-center) ── */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-10 game-watermark" aria-hidden="true">
        ◄ DATACRAFT ►
      </div>

      {/* ── Blinking stars scattered around edges ── */}
      <PixelStar style={{ position:'absolute', top:'12px', left:'50%', marginLeft:'-60px', zIndex:10, animationDelay:'0s' }} />
      <PixelStar style={{ position:'absolute', top:'12px', left:'50%', marginLeft:'40px',  zIndex:10, animationDelay:'0.7s' }} />
      <PixelStar style={{ position:'absolute', bottom:'40px', left:'420px', zIndex:10, animationDelay:'0.4s' }} />
      <PixelStar style={{ position:'absolute', top:'60px', right:'260px', zIndex:10, animationDelay:'1.1s' }} />

      <TraversalResult />
      <StatsPanel />
      <ControlPanel />
    </div>
  );
}

export default App;
