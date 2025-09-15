;(function initTTS(global) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

  const state = {
    defaultOptions: { rate: 1, pitch: 1, volume: 1, interrupt: true },
    voices: [],
    voicesReady: false,
    voicesListeners: new Set(),
    currentUtterances: [],
    isPaused: false,
  };

  function isSupported() {
    return Boolean(synth && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
  }

  function fetchVoices() {
    if (!isSupported()) return [];
    const voices = synth.getVoices() || [];
    state.voices = voices.slice();
    state.voicesReady = voices.length > 0;
    return state.voices;
  }

  function onVoicesChanged(callback) {
    if (typeof callback === 'function') {
      state.voicesListeners.add(callback);
    }
    // If voices already loaded, fire immediately
    if (state.voicesReady) {
      try { callback(state.voices.slice()); } catch (_) {}
    }
  }

  function notifyVoicesChanged() {
    state.voicesListeners.forEach(cb => {
      try { cb(state.voices.slice()); } catch (_) {}
    });
  }

  if (isSupported()) {
    // Some browsers load voices async
    window.speechSynthesis.onvoiceschanged = () => {
      fetchVoices();
      notifyVoicesChanged();
    };
    // Also try an immediate fetch
    setTimeout(() => {
      if (!state.voicesReady) {
        fetchVoices();
        if (state.voicesReady) notifyVoicesChanged();
      }
    }, 0);
  }

  function getVoices() {
    return state.voices.slice();
  }

  function setDefaults(options) {
    state.defaultOptions = { ...state.defaultOptions, ...(options || {}) };
  }

  function chooseVoice({ voiceName, lang }) {
    const voices = state.voices;
    if (!voices || voices.length === 0) return undefined;
    if (voiceName) {
      const byName = voices.find(v => v && v.name === voiceName);
      if (byName) return byName;
    }
    if (lang) {
      // Prefer exact match, then same base language
      const exact = voices.find(v => v && v.lang && v.lang.toLowerCase() === lang.toLowerCase());
      if (exact) return exact;
      const base = lang.split('-')[0].toLowerCase();
      const partial = voices.find(v => v && v.lang && v.lang.toLowerCase().startsWith(base));
      if (partial) return partial;
    }
    // Fallback: default or first
    return voices.find(v => v && v.default) || voices[0];
  }

  function splitIntoChunks(text, maxLen) {
    const limit = Math.max(160, Math.min(maxLen || 300, 600));
    const sentences = text
      .replace(/\s+/g, ' ')
      .split(/(?<=[\.!?\u0964\u3002])\s+/u);
    const chunks = [];
    let buffer = '';
    for (const sentence of sentences) {
      if ((buffer + ' ' + sentence).trim().length > limit) {
        if (buffer) chunks.push(buffer.trim());
        if (sentence.length > limit) {
          // Hard split very long sentences
          for (let i = 0; i < sentence.length; i += limit) {
            chunks.push(sentence.slice(i, i + limit));
          }
          buffer = '';
        } else {
          buffer = sentence;
        }
      } else {
        buffer = (buffer ? buffer + ' ' : '') + sentence;
      }
    }
    if (buffer) chunks.push(buffer.trim());
    return chunks.length > 0 ? chunks : [text];
  }

  function stop() {
    if (!isSupported()) return;
    state.currentUtterances.length = 0;
    try { synth.cancel(); } catch (_) {}
  }

  function pause() {
    if (!isSupported()) return;
    try { synth.pause(); state.isPaused = true; } catch (_) {}
  }

  function resume() {
    if (!isSupported()) return;
    try { synth.resume(); state.isPaused = false; } catch (_) {}
  }

  function isSpeaking() {
    return !!(synth && synth.speaking);
  }

  function speak(text, options = {}) {
    if (!isSupported()) {
      console.warn('Web Speech API is not supported in this browser.');
      return Promise.resolve();
    }
    const opts = { ...state.defaultOptions, ...options };
    if (!text || !String(text).trim()) return Promise.resolve();
    
    // In some engines, speaking immediately after cancel() can ignore new pitch.
    // We'll ensure the engine fully stops before starting again.
    const wasSpeaking = isSpeaking();
    if (opts.interrupt) stop();

    const voice = chooseVoice({ voiceName: opts.voiceName, lang: opts.lang });
    const language = (opts.lang || (voice && voice.lang) || undefined);
    const chunks = splitIntoChunks(String(text));

    // Normalize and clamp values to browser-supported ranges
    const toFiniteOr = (val, fallback) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return Number.isFinite(num) ? num : fallback;
    };
    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    const effectiveRate = clamp(toFiniteOr(opts.rate, state.defaultOptions.rate), 0.5, 2);
    const effectivePitch = clamp(toFiniteOr(opts.pitch, state.defaultOptions.pitch), 0, 2);
    const effectiveVolume = clamp(toFiniteOr(opts.volume, state.defaultOptions.volume), 0, 1);

    const utterances = chunks.map(chunk => {
      const u = new SpeechSynthesisUtterance(chunk);
      // Set prosody first; assign voice last for better application on some engines
      u.volume = effectiveVolume;
      u.rate = effectiveRate;
      u.pitch = effectivePitch;
      if (language) u.lang = language;
      if (voice) u.voice = voice;
      // Re-assert pitch/rate at start as some engines reset on queueing
      u.onstart = () => {
        try {
          u.rate = effectiveRate;
          u.pitch = effectivePitch;
        } catch (_) {}
      };
      return u;
    });

    state.currentUtterances = utterances.slice();

    const startSpeaking = () => new Promise(resolve => {
      let remaining = utterances.length;
      utterances.forEach(u => {
        u.onend = () => {
          remaining -= 1;
          if (remaining <= 0) {
            resolve();
          }
        };
        u.onerror = () => {
          // Continue but resolve when all attempted
          remaining -= 1;
          if (remaining <= 0) resolve();
        };
        try { synth.speak(u); } catch (_) { remaining -= 1; }
      });
    });

    // Wait until engine stops if we interrupted while speaking, then add a stabilization delay
    const waitUntilIdle = (timeoutMs = 800) => new Promise(resolve => {
      const start = Date.now();
      const tick = () => {
        if (!synth || !synth.speaking) return resolve();
        if (Date.now() - start > timeoutMs) return resolve();
        setTimeout(tick, 20);
      };
      tick();
    });

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    if (wasSpeaking) {
      return waitUntilIdle().then(() => delay(120)).then(() => startSpeaking());
    }
    // Even if not speaking, a tiny delay can help settings stick on some voices
    return delay(20).then(() => startSpeaking());
  }

  const api = {
    isSupported: isSupported(),
    getVoices,
    onVoicesChanged,
    setDefaults,
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
  };

  global.TTS = api;
})(typeof window !== 'undefined' ? window : this);


