'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Settings, Sun } from 'lucide-react';
import { Sidebar, type Page } from './components/Sidebar';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { NoteForm, type NoteFormSubmission } from './components/NoteForm';
import { NoteDetails } from './components/NoteDetails';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toast, type ToastMessage } from './components/Toast';
import { NotesPage } from './pages/NotesPage';
import { CalendarPage } from './pages/CalendarPage';
import { TagsPage } from './pages/TagsPage';
import { initializeFirebase, isValidFirebaseConfig } from './services/firebase';
import { createNote, deleteNote, subscribeToNotes, updateNote } from './services/notes.service';
import { deleteNoteImage, uploadNoteImage } from './services/storage.service';
import type { ConnectionState, FirebaseConfig, Note } from './types/note';

const FIREBASE_KEY = 'memora.firebase.config';
const THEME_KEY = 'memora.theme';

function readStoredConfig(): FirebaseConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = JSON.parse(localStorage.getItem(FIREBASE_KEY) ?? 'null') as Partial<FirebaseConfig> | null;
    return saved && isValidFirebaseConfig(saved) ? saved : null;
  } catch { return null; }
}

function readStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'dark' || saved === 'light' ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [page, setPage] = useState<Page>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>('unconfigured');
  const [config, setConfig] = useState<FirebaseConfig | null>(readStoredConfig);
  const [configOpen, setConfigOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [details, setDetails] = useState<Note | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const initialConfigRef = useRef(config);

  const notify = useCallback((text: string, type: 'success' | 'error' = 'success') => setToast({ id: Date.now(), text, type }), []);

  const connect = useCallback(async (firebaseConfig: FirebaseConfig) => {
    setConnection('connecting'); setLoading(true);
    unsubscribeRef.current?.();
    try {
      await initializeFirebase(firebaseConfig);
      unsubscribeRef.current = subscribeToNotes(
        (items) => { setNotes(items); setLoading(false); setConnection('connected'); },
        () => { setLoading(false); setConnection('error'); notify('Não foi possível carregar as anotações. Verifique as Rules do Firestore.', 'error'); },
      );
      setConnection('connected');
    } catch (error) {
      setLoading(false); setConnection('error');
      throw error;
    }
  }, [notify]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const initialTheme = readStoredTheme();
    document.documentElement.dataset.theme = initialTheme;
    const frame = window.requestAnimationFrame(() => setTheme(initialTheme));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const initialConfig = initialConfigRef.current;
    if (initialConfig) void connect(initialConfig).catch(() => notify('Não foi possível conectar ao Firebase salvo.', 'error'));
    return () => unsubscribeRef.current?.();
  }, [connect, notify]);

  const saveConfig = async (firebaseConfig: FirebaseConfig) => {
    await connect(firebaseConfig);
    localStorage.setItem(FIREBASE_KEY, JSON.stringify(firebaseConfig));
    setConfig(firebaseConfig); notify('Configuração salva. Firebase conectado.');
  };
  const clearConfig = () => {
    unsubscribeRef.current?.(); unsubscribeRef.current = null;
    localStorage.removeItem(FIREBASE_KEY); setConfig(null); setNotes([]); setConnection('unconfigured'); setConfigOpen(false); notify('Configuração removida.');
  };
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'; setTheme(next); document.documentElement.dataset.theme = next; localStorage.setItem(THEME_KEY, next);
  };
  const startCreate = () => {
    if (connection !== 'connected') { setConfigOpen(true); return; }
    setEditing(null); setFormOpen(true);
  };
  const startEdit = (note: Note) => { setDetails(null); setEditing(note); setFormOpen(true); };

  const saveNote = async (submission: NoteFormSubmission) => {
    setBusy(true); setUploadProgress(null);
    try {
      let noteId = editing?.id;
      if (!noteId) noteId = await createNote({ ...submission.fields, images: [] });
      const progress = submission.newFiles.map(() => 0);
      const uploaded = await Promise.all(submission.newFiles.map((file, index) => uploadNoteImage(noteId!, file, (value) => {
        progress[index] = value; setUploadProgress(Math.round(progress.reduce((sum, item) => sum + item, 0) / progress.length));
      })));
      const images = [...submission.keptImages, ...uploaded];
      await updateNote(noteId, { ...submission.fields, images });
      await Promise.allSettled(submission.removedImages.map(deleteNoteImage));
      setFormOpen(false); setEditing(null); setUploadProgress(null);
      notify(editing ? 'Alterações salvas.' : 'Anotação criada.');
    } catch (error) {
      notify(error instanceof Error ? `Não foi possível salvar: ${error.message}` : 'Não foi possível salvar a anotação.', 'error');
    } finally { setBusy(false); setUploadProgress(null); }
  };

  const changeStatus = async (note: Note, status: Note['status']) => {
    setBusy(true);
    try { await updateNote(note.id, { status }); setDetails(null); notify(status === 'completed' ? 'Anotação concluída.' : 'Anotação arquivada.'); }
    catch { notify('Não foi possível atualizar a anotação.', 'error'); }
    finally { setBusy(false); }
  };
  const removeNote = async () => {
    if (!details) return;
    setBusy(true);
    try { await deleteNote(details); setConfirmDelete(false); setDetails(null); notify('Anotação excluída.'); }
    catch { notify('Não foi possível excluir a anotação.', 'error'); }
    finally { setBusy(false); }
  };
  const selectTag = (tag: string) => { setSelectedTag(tag); setPage('notes'); };

  return (
    <main className="app-shell">
      <Sidebar page={page} onPageChange={setPage} connection={connection} onConfigure={() => setConfigOpen(true)} />
      <section className="workspace">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark">m</span>memora</div><div className="topbar-actions"><button className="icon-button" onClick={toggleTheme} aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}>{theme === 'light' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}</button><button className="config-button" onClick={() => setConfigOpen(true)} aria-label="Configurar Firebase"><Settings size={16} aria-hidden="true" /><span>Configurar Firebase</span></button></div></header>
        <div className="content">
          {page === 'notes' && <NotesPage notes={notes} loading={loading} connection={connection} selectedTag={selectedTag} onSelectedTagChange={setSelectedTag} onOpen={setDetails} onCreate={startCreate} onConfigure={() => setConfigOpen(true)} />}
          {page === 'calendar' && <CalendarPage notes={notes} onOpen={setDetails} />}
          {page === 'tags' && <TagsPage notes={notes} onSelect={selectTag} />}
        </div>
      </section>
      {configOpen && <FirebaseConfigModal open savedConfig={config} connection={connection} onClose={() => setConfigOpen(false)} onSave={saveConfig} onClear={clearConfig} />}
      {formOpen && <NoteForm open note={editing} saving={busy} uploadProgress={uploadProgress} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={saveNote} />}
      <NoteDetails note={confirmDelete ? null : details} busy={busy} onClose={() => setDetails(null)} onEdit={() => details && startEdit(details)} onComplete={() => details && void changeStatus(details, 'completed')} onArchive={() => details && void changeStatus(details, 'archived')} onDelete={() => setConfirmDelete(true)} />
      <ConfirmDialog open={confirmDelete} busy={busy} onCancel={() => setConfirmDelete(false)} onConfirm={() => void removeNote()} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
