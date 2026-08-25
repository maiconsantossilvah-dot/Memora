/* eslint-disable @next/next/no-img-element */
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { Note } from '../types/note';

const statusLabel = { pending: 'Pendente', completed: 'Concluída', archived: 'Arquivada' };

export function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  const description = note.description || 'Sem descrição.';
  return (
    <article className={`note-card status-${note.status}`} onClick={onClick} tabIndex={0} role="button" onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onClick()} aria-label={`Abrir anotação ${note.title}`}>
      {note.images[0] && <div className="note-card-image"><img src={note.images[0].url} alt={`Imagem de ${note.title}`} />{note.images.length > 1 && <span>+{note.images.length - 1}</span>}</div>}
      <div className="note-card-body">
        <div className="note-card-top"><span className={`status-pill ${note.status}`}>{note.status === 'completed' ? '✓ ' : ''}{statusLabel[note.status]}</span>{note.addToCalendar && <span className="calendar-mark" title="Na agenda">□</span>}</div>
        <h3>{note.title}</h3><p>{description}</p>
        {note.tags.length > 0 && <div className="tag-list">{note.tags.slice(0, 3).map((tag) => <span className="tag plain" key={tag}>#{tag}</span>)}{note.tags.length > 3 && <span className="more-tags">+{note.tags.length - 3}</span>}</div>}
        <footer><span>{format(parseISO(note.date), "d 'de' MMM", { locale: ptBR })}{note.time ? ` · ${note.time}` : ''}</span><span>→</span></footer>
      </div>
    </article>
  );
}
