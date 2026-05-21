// Simple web audio API synths for game-like sounds
let audioCtx;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playBlip = (frequency = 440, type = 'sine', duration = 0.1) => {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

let musicInterval = null;
let noteIndex = 0;

// Retro arpeggio progression: Am - F - G - Em
const retroTune = [
  440, 523.25, 659.25, 880,      440, 523.25, 659.25, 880,
  349.23, 440, 523.25, 698.46,   349.23, 440, 523.25, 698.46,
  392, 493.88, 587.33, 783.99,   392, 493.88, 587.33, 783.99,
  329.63, 392, 493.88, 659.25,   329.63, 392, 493.88, 659.25
];

export const toggleBackgroundMusic = (play) => {
  try {
    const ctx = getContext();
    if (play) {
      if (!musicInterval) {
        musicInterval = setInterval(() => {
          const freq = retroTune[noteIndex];
          
          if (freq > 0) {
            const osc = ctx.createOscillator();
            osc.type = 'square'; // 8-bit sound
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            const env = ctx.createGain();
            env.gain.setValueAtTime(0.02, ctx.currentTime);
            env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            
            osc.connect(env);
            env.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          }
          
          noteIndex = (noteIndex + 1) % retroTune.length;
        }, 150); // 150ms per note (fast arpeggio)
      }
    } else {
      if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
      }
    }
  } catch (e) {
    console.error("Audio error:", e);
  }
};
