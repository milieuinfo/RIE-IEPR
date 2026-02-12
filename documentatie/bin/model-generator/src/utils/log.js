// Lightweight logging helper for the model-generator
// Controlled by environment variable MODEL_GENERATOR_DEBUG=1
export function debug(...args) {
  try {
    if (process && process.env && process.env.MODEL_GENERATOR_DEBUG === '1') {
      // Use console.log for debug output to ensure visibility in all runners
        if (console && typeof console.log === 'function') console.log('[DEBUG]', ...args);
    }
  } catch (e) { /* ignore */ }
}

export function info(...args) {
  try { if (console && typeof console.info === 'function') console.info(...args); else if (console && typeof console.log === 'function') console.log(...args); } catch (e) { /* ignore */ }
}

export function warn(...args) {
  try { if (console && typeof console.warn === 'function') console.warn(...args); else if (console && typeof console.log === 'function') console.log(...args); } catch (e) { /* ignore */ }
}

export default { debug, info, warn };
