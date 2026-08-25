import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { Modal } from './Modal';
import { TagInput } from './TagInput';
import { ImageUploader } from './ImageUploader';
import type { Note, NoteFields, NoteImage, NoteStatus } from '../types/note';

export interface NoteFormSubmission {
  fields: Omit<NoteFields, 'images'>;
  keptImages: NoteImage[];
  newFiles: File[];
  removedImages: NoteImage[];
}

interface Props {
  open: boolean;
  note: Note | null;
  saving: boolean;
  uploadProgress: number | null;
  onClose: () => void;
  onSubmit: (submission: NoteFormSubmission) => Promise<void>;
}

const initial = () => ({ title: '', description: '', tags: [] as string[], date: format(new Date(), 'yyyy-MM-dd'), time: '', addToCalendar: false, status: 'pending' as NoteStatus });

export function NoteForm({ open, note, saving, uploadProgress, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(() => note ? { title: note.title, description: note.description, tags: note.tags, date: note.date, time: note.time ?? '', addToCalendar: note.addToCalendar, status: note.status } : initial());
  const [existingImages, setExistingImages] = useState<NoteImage[]>(() => note?.images ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) { setError('Informe um título para continuar.'); return; }
    if (!form.date) { setError('Escolha a data da anotação.'); return; }
    setError('');
    await onSubmit({
      fields: { title: form.title.trim(), description: form.description.trim(), tags: form.tags, date: form.date, time: form.time || undefined, addToCalendar: form.addToCalendar, status: form.status },
      keptImages: existingImages,
      newFiles: files,
      removedImages: (note?.images ?? []).filter((image) => !existingImages.some((kept) => kept.storagePath === image.storagePath)),
    });
  };

  return (
    <Modal open={open} onClose={saving ? () => undefined : onClose} title={note ? 'Editar anotação' : 'Nova anotação'} eyebrow={note ? 'ATUALIZAR' : 'REGISTRAR IDEIA'} size="large">
      <form className="note-form" onSubmit={submit}>
        <div className="form-grid">
          <label className="span-2"><span>Título *</span><input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="O que você quer lembrar?" disabled={saving} /></label>
          <label className="span-2"><span>Descrição</span><textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes, contexto, próximos passos…" disabled={saving} /></label>
          <div className="span-2 field-group"><span className="field-label">Imagens</span><ImageUploader existing={existingImages} files={files} onExistingChange={setExistingImages} onFilesChange={setFiles} disabled={saving} /></div>
          <div className="span-2 field-group"><span className="field-label">Tags</span><TagInput value={form.tags} onChange={(tags) => setForm({ ...form, tags })} /></div>
          <label><span>Data *</span><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} disabled={saving} /></label>
          <label><span>Horário <small>opcional</small></span><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} disabled={saving} /></label>
          <label><span>Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as NoteStatus })} disabled={saving}><option value="pending">Pendente</option><option value="completed">Concluída</option><option value="archived">Arquivada</option></select></label>
          <label className="toggle-field"><span><strong>Adicionar à agenda</strong><small>Aparecerá na visualização mensal.</small></span><input type="checkbox" checked={form.addToCalendar} onChange={(e) => setForm({ ...form, addToCalendar: e.target.checked })} disabled={saving} /><i aria-hidden="true" /></label>
        </div>
        {uploadProgress !== null && <div className="upload-progress" role="status"><span style={{ width: `${uploadProgress}%` }} /><small>Enviando imagens… {uploadProgress}%</small></div>}
        {error && <p className="form-message" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="secondary-control" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Salvando…' : note ? 'Salvar alterações' : 'Criar anotação'}</button></div>
      </form>
    </Modal>
  );
}
