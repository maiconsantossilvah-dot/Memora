import { useMemo } from 'react';
import { ArrowRight, Hash } from 'lucide-react';
import type { Note } from '../types/note';

export function TagsPage({ notes, onSelect }: { notes: Note[]; onSelect: (tag: string) => void }) {
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach((note) => note.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [notes]);
  return <><div className="hero-row"><div><p className="eyebrow">ORGANIZAÇÃO</p><h1>Tags</h1><p className="subtitle">Encontre grupos de ideias sem precisar procurar.</p></div></div>{tags.length ? <div className="tags-grid">{tags.map(([tag, count]) => <button key={tag} onClick={() => onSelect(tag)}><span><Hash size={19} aria-hidden="true" /></span><div><strong>{tag}</strong><small>{count} {count === 1 ? 'anotação' : 'anotações'}</small></div><ArrowRight size={15} aria-hidden="true" /></button>)}</div> : <div className="empty-state"><span><Hash size={24} aria-hidden="true" /></span><h2>Nenhuma tag utilizada</h2><p>Adicione tags às suas anotações para vê-las agrupadas aqui.</p></div>}</>;
}
