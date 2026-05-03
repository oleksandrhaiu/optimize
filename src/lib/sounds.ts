let audioCtx: AudioContext | null = null;

/**
 * Plays a short UI sound effect using the Web Audio API.
 * This ensures sounds play reliably on mobile devices without needing audio files.
 * 
 * @param type 'pop' for positive actions (checking), 'unpop' for reverting actions.
 * @param enabled Whether sounds are enabled in user preferences.
 */
export function playSound(type: 'pop' | 'unpop', enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined') return;
  
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume context if suspended (Safari often suspends until first user interaction)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'pop') {
      // Satisfying "Bubble/Pop" sound
      // Core bubble: low to high sweep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.04);

      // Volume envelope: very quick attack, fast decay
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      
      osc.start(t);
      osc.stop(t + 0.1);

      // Add a tiny "click" at the very beginning for texture
      const clickOsc = audioCtx.createOscillator();
      const clickGain = audioCtx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(2000, t);
      clickGain.gain.setValueAtTime(0.05, t);
      clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.01);
      clickOsc.connect(clickGain);
      clickGain.connect(audioCtx.destination);
      clickOsc.start(t);
      clickOsc.stop(t + 0.01);
    } else {
      // Lower, "un-bubble" sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      
      osc.start(t);
      osc.stop(t + 0.12);
    }
  } catch (err) {
    console.warn('Web Audio API not supported or failed to play', err);
  }
}
