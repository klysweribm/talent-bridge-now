import '@testing-library/jest-dom';

// Silenciar warnings de React Router v6 → v7 future flags en tests
const originalWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  const msg = String(args[0] ?? '');
  if (msg.includes('React Router Future Flag Warning')) return;
  originalWarn(...args);
};
