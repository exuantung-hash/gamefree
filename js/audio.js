/* ============================================================
   DEEPWOOD — procedural audio (Web Audio API)
   Gió rừng + chuông tổng hợp, không cần file âm thanh.
   ============================================================ */

const DeepwoodAudio = (() => {
  "use strict";

  let ctx = null;
  let master = null;
  let musicBus = null;
  let sfxBus = null;
  let windStarted = false;
  let chimeTimer = 0;
  let unlocked = false;

  const state = {
    music: 0.35,
    sfx: 0.7,
    muted: false,
  };

  const clamp01 = (v) => Math.min(1, Math.max(0, Number(v) || 0));

  function ensureContext() {
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      return true;
    }

    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return false;

    try {
      ctx = new Ctor();
    } catch (error) {
      return false;
    }

    master = ctx.createGain();
    master.gain.value = state.muted ? 0 : 0.9;
    master.connect(ctx.destination);

    musicBus = ctx.createGain();
    musicBus.gain.value = gainFor(state.music);
    musicBus.connect(master);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = gainFor(state.sfx);
    sfxBus.connect(master);

    buildWind();
    return true;
  }

  function gainFor(value) {
    // Đường cong nhẹ để núm nhỏ vẫn nghe rõ.
    return Math.pow(clamp01(value), 1.35);
  }

  function buildWind() {
    if (!ctx || !musicBus || windStarted) return;
    windStarted = true;

    const seconds = 4;
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Nhiễu nâu nhẹ — nghe như gió lùa qua tán cây.
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 460;
    lowpass.Q.value = 0.7;

    const air = ctx.createGain();
    air.gain.value = 0.55;

    // Dao động rất chậm cho tiếng gió "thở".
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.18;
    lfo.connect(lfoGain).connect(air.gain);

    source.connect(lowpass).connect(air).connect(musicBus);
    source.start();
    lfo.start();
  }

  function tone(options) {
    if (!ctx || !sfxBus) return;

    const {
      freq,
      endFreq = freq,
      dur = 0.18,
      type = "sine",
      peak = 0.05,
      when = 0,
      bus = sfxBus,
    } = options;

    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + dur);
    }

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + Math.min(0.018, dur * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(gain).connect(bus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.06);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (error) {
        /* no-op */
      }
    };
  }

  function chime() {
    if (!ctx || !musicBus || state.muted) return;

    const notes = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
    const base = notes[Math.floor(Math.random() * notes.length)];

    const voice = (freq, when, peak) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.value = freq;
      filter.type = "lowpass";
      filter.frequency.value = 2200;

      const t0 = ctx.currentTime + when;
      const dur = 3.6;

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.09);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(filter).connect(gain).connect(musicBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.1);

      osc.onended = () => {
        try {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch (error) {
          /* no-op */
        }
      };
    };

    voice(base, 0, 0.045);
    voice(base * 1.5, 0.35, 0.022);
    voice(base * 2, 1.1, 0.012);
  }

  function scheduleChime() {
    window.clearTimeout(chimeTimer);
    if (!unlocked) return;

    const delay = 7000 + Math.random() * 8000;
    chimeTimer = window.setTimeout(() => {
      if (ctx && ctx.state === "running" && !state.muted && !document.hidden) {
        chime();
      }
      scheduleChime();
    }, delay);
  }

  function applyVolumes(immediate) {
    if (!ctx) return;

    const now = ctx.currentTime;
    const smooth = immediate ? 0.001 : 0.12;

    if (musicBus) {
      musicBus.gain.setTargetAtTime(gainFor(state.music), now, smooth);
    }
    if (sfxBus) {
      sfxBus.gain.setTargetAtTime(gainFor(state.sfx), now, smooth);
    }
    if (master) {
      master.gain.setTargetAtTime(state.muted ? 0 : 0.9, now, immediate ? 0.001 : 0.06);
    }
  }

  function unlock() {
    if (!ensureContext()) return false;
    unlocked = true;

    if (!chimeTimer) {
      scheduleChime();
    }
    return true;
  }

  function hover() {
    if (state.muted) return;
    if (!ensureContext()) return;
    tone({ freq: 1180, endFreq: 1340, dur: 0.055, type: "triangle", peak: 0.018 });
  }

  function click() {
    if (state.muted) return;
    if (!ensureContext()) return;
    tone({ freq: 660, endFreq: 880, dur: 0.09, type: "triangle", peak: 0.045 });
    tone({ freq: 990, endFreq: 1320, dur: 0.11, when: 0.055, type: "sine", peak: 0.025 });
  }

  function back() {
    if (state.muted) return;
    if (!ensureContext()) return;
    tone({ freq: 560, endFreq: 392, dur: 0.16, type: "triangle", peak: 0.04 });
    tone({ freq: 280, endFreq: 210, dur: 0.2, when: 0.04, type: "sine", peak: 0.025 });
  }

  function toggleSound(on) {
    if (!ensureContext()) return;
    if (on) {
      tone({ freq: 880, endFreq: 1180, dur: 0.12, type: "triangle", peak: 0.035 });
    } else {
      tone({ freq: 520, endFreq: 300, dur: 0.12, type: "triangle", peak: 0.03 });
    }
  }

  function reveal() {
    if (!ensureContext()) return;
    tone({ freq: 392, dur: 0.5, type: "sine", peak: 0.04, bus: musicBus });
    tone({ freq: 587.33, dur: 0.6, when: 0.12, type: "sine", peak: 0.03, bus: musicBus });
    tone({ freq: 783.99, dur: 0.9, when: 0.26, type: "sine", peak: 0.022, bus: musicBus });
  }

  function pickup() {
    if (!ensureContext()) return;
    tone({ freq: 880, endFreq: 1320, dur: 0.16, type: "sine", peak: 0.045 });
    tone({ freq: 1318.5, dur: 0.22, when: 0.05, type: "sine", peak: 0.032 });
    tone({ freq: 1760, dur: 0.3, when: 0.11, type: "sine", peak: 0.02 });
  }

  function win() {
    if (!ensureContext()) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone({ freq, dur: 0.8, when: i * 0.12, type: "sine", peak: 0.04, bus: musicBus });
    });
    tone({ freq: 261.63, dur: 1.6, type: "triangle", peak: 0.03, bus: musicBus });
  }

  function shoot() {
    if (!ensureContext()) return;
    tone({ freq: 1240, endFreq: 460, dur: 0.07, type: "triangle", peak: 0.018 });
  }

  function hit() {
    if (!ensureContext()) return;
    tone({ freq: 190, endFreq: 105, dur: 0.09, type: "square", peak: 0.024 });
    tone({ freq: 520, endFreq: 310, dur: 0.055, type: "triangle", peak: 0.014 });
  }

  function slain() {
    if (!ensureContext()) return;
    tone({ freq: 240, endFreq: 62, dur: 0.32, type: "sawtooth", peak: 0.018 });
    tone({ freq: 660, endFreq: 990, dur: 0.2, when: 0.1, type: "sine", peak: 0.016 });
  }

  function hurt() {
    if (!ensureContext()) return;
    tone({ freq: 150, endFreq: 70, dur: 0.2, type: "sawtooth", peak: 0.035 });
    tone({ freq: 320, endFreq: 180, dur: 0.12, type: "square", peak: 0.018 });
  }

  function toxic() {
    if (!ensureContext()) return;
    tone({ freq: 300, endFreq: 72, dur: 0.5, type: "sawtooth", peak: 0.022 });
    tone({ freq: 620, endFreq: 240, dur: 0.35, when: 0.06, type: "triangle", peak: 0.012 });
  }

  function poisonTick() {
    if (!ensureContext()) return;
    tone({ freq: 210, endFreq: 120, dur: 0.16, type: "sine", peak: 0.012 });
  }

  function firebomb() {
    if (!ensureContext()) return;
    tone({ freq: 420, endFreq: 180, dur: 0.24, type: "triangle", peak: 0.022 });
  }

  function fireBurst() {
    if (!ensureContext()) return;
    tone({ freq: 120, endFreq: 44, dur: 0.35, type: "sawtooth", peak: 0.032 });
    tone({ freq: 360, endFreq: 120, dur: 0.28, when: 0.03, type: "square", peak: 0.016 });
    tone({ freq: 760, endFreq: 420, dur: 0.18, when: 0.08, type: "triangle", peak: 0.012 });
  }

  function slash() {
    if (!ensureContext()) return;
    tone({ freq: 980, endFreq: 320, dur: 0.11, type: "triangle", peak: 0.024 });
    tone({ freq: 1480, endFreq: 620, dur: 0.07, when: 0.02, type: "sine", peak: 0.012 });
  }

  function sawHit() {
    if (!ensureContext()) return;
    tone({ freq: 1540, endFreq: 880, dur: 0.055, type: "square", peak: 0.012 });
    tone({ freq: 420, endFreq: 280, dur: 0.07, type: "triangle", peak: 0.01 });
  }

  function death() {
    if (!ensureContext()) return;
    tone({ freq: 220, endFreq: 55, dur: 1.2, type: "sawtooth", peak: 0.035 });
    tone({ freq: 110, endFreq: 48, dur: 1.5, type: "triangle", peak: 0.03 });
    tone({ freq: 440, endFreq: 130, dur: 0.8, when: 0.15, type: "sine", peak: 0.02 });
  }

  return {
    init(prefs = {}) {
      if (typeof prefs.music === "number") state.music = clamp01(prefs.music);
      if (typeof prefs.sfx === "number") state.sfx = clamp01(prefs.sfx);
      if (typeof prefs.muted === "boolean") state.muted = prefs.muted;
      applyVolumes(true);
    },

    unlock,

    setMusic(value) {
      state.music = clamp01(value);
      applyVolumes(false);
    },

    setSfx(value) {
      state.sfx = clamp01(value);
      applyVolumes(false);
    },

    setMuted(value) {
      state.muted = Boolean(value);
      applyVolumes(false);
    },

    isMuted() {
      return state.muted;
    },

    hover,
    click,
    back,
    toggleSound,
    reveal,
    pickup,
    win,
    shoot,
    hit,
    slain,
    hurt,
    toxic,
    poisonTick,
    firebomb,
    fireBurst,
    slash,
    sawHit,
    death,
  };
})();
