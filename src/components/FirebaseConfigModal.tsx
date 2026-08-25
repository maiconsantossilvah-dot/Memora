import { useState } from 'react';
import { Modal } from './Modal';
import { isValidFirebaseConfig, testFirebaseConnection } from '../services/firebase';
import type { ConnectionState, FirebaseConfig } from '../types/note';

const blank: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

interface Props {
  open: boolean;
  savedConfig: FirebaseConfig | null;
  connection: ConnectionState;
  onClose: () => void;
  onSave: (config: FirebaseConfig) => Promise<void>;
  onClear: () => void;
}

export function FirebaseConfigModal({ open, savedConfig, connection, onClose, onSave, onClear }: Props) {
  const [config, setConfig] = useState<FirebaseConfig>(() => savedConfig ?? blank);
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  const [message, setMessage] = useState('');

  const set = (key: keyof FirebaseConfig, value: string) => { setConfig((current) => ({ ...current, [key]: value.trim() })); setTested(false); };
  const test = async () => {
    if (!isValidFirebaseConfig(config)) { setMessage('Preencha todos os campos antes de testar.'); return; }
    setTesting(true); setMessage('');
    try { await testFirebaseConnection(config); setTested(true); setMessage('Conexão realizada com sucesso.'); }
    catch (error) { setTested(false); setMessage(error instanceof Error ? error.message : 'Não foi possível conectar.'); }
    finally { setTesting(false); }
  };
  const save = async () => {
    if (!isValidFirebaseConfig(config)) { setMessage('Preencha todos os campos.'); return; }
    try { await onSave(config); onClose(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar.'); }
  };
  const status = testing ? 'connecting' : tested ? 'connected' : connection;

  return (
    <Modal open={open} onClose={onClose} title="Configurar Firebase" eyebrow="PERSISTÊNCIA" size="medium">
      <div className={`connection-banner connection-${status}`}><span className="status-dot" /><div><strong>{status === 'connected' ? 'Conectado' : status === 'connecting' ? 'Conectando' : status === 'error' ? 'Erro' : 'Não configurado'}</strong><p>A configuração web identifica o projeto; a segurança depende das Rules.</p></div></div>
      <div className="form-grid config-form">
        <label><span>API Key</span><input value={config.apiKey} onChange={(e) => set('apiKey', e.target.value)} autoComplete="off" /></label>
        <label><span>Auth Domain</span><input value={config.authDomain} onChange={(e) => set('authDomain', e.target.value)} placeholder="projeto.firebaseapp.com" /></label>
        <label><span>Project ID</span><input value={config.projectId} onChange={(e) => set('projectId', e.target.value)} /></label>
        <label><span>Storage Bucket</span><input value={config.storageBucket} onChange={(e) => set('storageBucket', e.target.value)} /></label>
        <label><span>Messaging Sender ID</span><input value={config.messagingSenderId} onChange={(e) => set('messagingSenderId', e.target.value)} /></label>
        <label><span>App ID</span><input value={config.appId} onChange={(e) => set('appId', e.target.value)} /></label>
      </div>
      {message && <p className={`form-message ${tested ? 'success' : ''}`} role="status">{message}</p>}
      <div className="modal-actions split-actions">
        <button type="button" className="danger-ghost" onClick={onClear} disabled={testing}>Limpar configuração</button>
        <div><button type="button" className="secondary-control" onClick={test} disabled={testing}>{testing ? 'Testando…' : 'Testar conexão'}</button><button type="button" className="primary-button" onClick={save} disabled={testing || connection === 'connecting'}>Salvar</button></div>
      </div>
    </Modal>
  );
}
