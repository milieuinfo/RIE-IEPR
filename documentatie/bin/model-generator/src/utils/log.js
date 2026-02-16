// Lightweight logging helper for the model-generator
// Controlled by environment variable MODEL_GENERATOR_DEBUG=1
export function debug(...args) {
  if (process && process.env && process.env.MODEL_GENERATOR_DEBUG === '1') {
    if (typeof console !== 'undefined' && typeof console.log === 'function')
      console.log('[DEBUG]', ...args);
  }
}

export function info(...args) {
  if (typeof console !== 'undefined') {
    if (typeof console.info === 'function') console.info(...args);
    else if (typeof console.log === 'function') console.log(...args);
  }
}

export function warn(...args) {
  if (typeof console !== 'undefined') {
    if (typeof console.warn === 'function') console.warn(...args);
    else if (typeof console.log === 'function') console.log(...args);
  }
}

export default { debug, info, warn };
