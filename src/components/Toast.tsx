import { useEffect } from 'react';

export interface ToastMessage { id: number; text: string; type: 'success' | 'error' }

export function Toast({ toast, onClose }: { toast: ToastMessage | null; onClose: () => void }) {
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(onClose, 3600); return () => window.clearTimeout(timer); }, [toast, onClose]);
  if (!toast) return null;
  return <div className={`toast ${toast.type}`} role="status"><span>{toast.type === 'success' ? '✓' : '!'}</span><p>{toast.text}</p><button onClick={onClose} aria-label="Fechar aviso">×</button></div>;
}
