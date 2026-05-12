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
      // Light, pleasant "bubble / water drop" sound
      osc.type = 'sine';
      
      // Pitch sweeps up quickly to create the "bloop" effect
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(1000, t + 0.05);

      // Volume envelope: smooth, fast, light
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      
      osc.start(t);
      osc.stop(t + 0.07);
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
