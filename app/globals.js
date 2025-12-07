// Global polyfills for server-side rendering
if (typeof global !== 'undefined') {
  global.self = global;
}

if (typeof globalThis !== 'undefined') {
  globalThis.self = globalThis;
}

// Polyfill for window object in server environment
if (typeof window === 'undefined') {
  global.window = {};
}
