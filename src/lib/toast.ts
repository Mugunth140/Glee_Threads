export type ToastType = 'success' | 'info' | 'error';

export interface ToastOptions {
  type?: ToastType;
  duration?: number; // ms
}

export function showToast(message: string, options: ToastOptions = {}) {
  if (typeof window === 'undefined') return;
  const detail = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
    message,
    type: options.type || 'info',
    duration: typeof options.duration === 'number' ? options.duration : 3500,
  };
  window.dispatchEvent(new CustomEvent('glee-toast', { detail }));
}

export default showToast;
