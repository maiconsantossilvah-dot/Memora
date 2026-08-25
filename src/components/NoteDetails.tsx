/* eslint-disable @next/next/no-img-element */
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { CalendarDays, Check } from 'lucide-react';
import { Modal } from './Modal';
import type { Note } from '../types/note';

interface Props {
  note: Note | null;
  busy: boolean;
  onClose: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function NoteDetails({ note, busy, onClose, onEdit, onComplete, onArchive, onDelete }: Props) {
  const label = note?.status === 'completed' ? 'Concluída' : note?.status === 'archived' ? 'Arquivada' : 'Pendente';
  return (
    <Modal open={Boolean(note)} onClose={busy ? () => undefined : onClose} title={note?.title ?? ''} eyebrow="ANOTAÇÃO" size="large">
      {note && <div className="details-content">
        <div className="details-meta"><span className={`status-pill ${note.status}`}>{label}</span>{note.addToCalendar && <span className="agenda-badge"><CalendarDays size={13} aria-hidden="true" /> Na agenda</span>}</div>
        {note.description && <p className="details-description">{note.description}</p>}
        {note.images.length > 0 && <div className="details-gallery">{note.images.map((image, index) => <a href={image.url} target="_blank" rel="noreferrer" key={image.storagePath}><img src={image.url} alt={`${note.title}, imagem ${index + 1}`} /></a>)}</div>}
        {note.tags.length > 0 && <div className="tag-list">{note.tags.map((tag) => <span className="tag plain" key={tag}>#{tag}</span>)}</div>}
        <dl className="details-list"><div><dt>Data</dt><dd>{format(parseISO(note.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}{note.time ? ` às ${note.time}` : ''}</dd></div><div><dt>Criada em</dt><dd>{format(note.createdAt.toDate(), "dd/MM/yyyy 'às' HH:mm")}</dd></div><div><dt>Última atualização</dt><dd>{format(note.updatedAt.toDate(), "dd/MM/yyyy 'às' HH:mm")}</dd></div></dl>
        <div className="details-actions"><button className="secondary-control" onClick={onEdit} disabled={busy}>Editar</button>{note.status !== 'completed' && <button className="secondary-control" onClick={onComplete} disabled={busy}><Check size={15} aria-hidden="true" /> Marcar como concluída</button>}{note.status !== 'archived' && <button className="secondary-control" onClick={onArchive} disabled={busy}>Arquivar</button>}<button className="danger-ghost" onClick={onDelete} disabled={busy}>{busy ? 'Excluindo…' : 'Excluir'}</button></div>
      </div>}
    </Modal>
  );
}
