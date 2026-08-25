import { useMemo, useState } from 'react';
import { ArrowRight, NotebookPen, Plus, Search, Sparkles } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import type { ConnectionState, Note } from '../types/note';

type Sort = 'recent' | 'oldest' | 'date' | 'updated';

interface Props {
  notes: Note[];
  loading: boolean;
  connection: ConnectionState;
  selectedTag: string;
  onSelectedTagChange: (tag: string) => void;
  onOpen: (note: Note) => void;
  onCreate: () => void;
  onConfigure: () => void;
}

export function NotesPage({ notes, loading, connection, selectedTag, onSelectedTagChange, onOpen, onCreate, onConfigure }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState('');
  const [calendar, setCalendar] = useState('all');
  const [sort, setSort] = useState<Sort>('recent');
  const tags = useMemo(() => [...new Set(notes.flatMap((note) => note.tags))].sort((a, b) => a.localeCompare(b)), [notes]);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return notes.filter((note) => {
      const matchesSearch = !term || `${note.title} ${note.description} ${note.tags.join(' ')}`.toLocaleLowerCase('pt-BR').includes(term);
      const matchesStatus = status === 'all' || note.status === status;
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      const matchesDate = !date || note.date === date;
      const matchesCalendar = calendar === 'all' || note.addToCalendar === (calendar === 'with');
      return matchesSearch && matchesStatus && matchesTag && matchesDate && matchesCalendar;
    }).sort((a, b) => {
      if (sort === 'oldest') return a.createdAt.toMillis() - b.createdAt.toMillis();
      if (sort === 'date') return a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? '');
      if (sort === 'updated') return b.updatedAt.toMillis() - a.updatedAt.toMillis();
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
  }, [notes, search, status, selectedTag, date, calendar, sort]);
  const hasFilters = Boolean(search || selectedTag || date || status !== 'all' || calendar !== 'all');
  const clear = () => { setSearch(''); setStatus('all'); onSelectedTagChange(''); setDate(''); setCalendar('all'); };

  return <>
    <div className="hero-row"><div><p className="eyebrow">SEU ESPAÇO PESSOAL</p><h1>Minhas anotações</h1><p className="subtitle">Tudo o que importa, organizado do seu jeito.</p></div><button className="primary-button" onClick={onCreate}><Plus size={17} aria-hidden="true" /> Nova anotação</button></div>
    <div className="toolbar notes-toolbar">
      <label className="search"><Search size={16} aria-hidden="true" /><input aria-label="Pesquisar anotações" placeholder="Pesquisar título, descrição ou tag…" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      <select aria-label="Filtrar por status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Todos os status</option><option value="pending">Pendentes</option><option value="completed">Concluídas</option><option value="archived">Arquivadas</option></select>
      <select aria-label="Filtrar por tag" value={selectedTag} onChange={(e) => onSelectedTagChange(e.target.value)}><option value="">Todas as tags</option>{tags.map((tag) => <option key={tag} value={tag}>#{tag}</option>)}</select>
      <select aria-label="Filtrar por agenda" value={calendar} onChange={(e) => setCalendar(e.target.value)}><option value="all">Agenda: todas</option><option value="with">Com agenda</option><option value="without">Sem agenda</option></select>
      <input className="date-filter" aria-label="Filtrar por data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <select aria-label="Ordenar anotações" value={sort} onChange={(e) => setSort(e.target.value as Sort)}><option value="recent">Mais recentes</option><option value="oldest">Mais antigas</option><option value="date">Data da anotação</option><option value="updated">Última atualização</option></select>
    </div>

    {connection !== 'connected' ? <section className="welcome-card"><div className="welcome-icon"><Sparkles size={23} aria-hidden="true" /></div><div><p className="eyebrow">PRIMEIROS PASSOS</p><h2>Seu espaço está pronto para ganhar vida.</h2><p>Configure o Firebase para registrar ideias, imagens e compromissos com persistência.</p></div><button className="secondary-button" onClick={onConfigure}>Configurar Firebase <ArrowRight size={15} aria-hidden="true" /></button></section>
      : loading ? <div className="loading-grid" aria-label="Carregando anotações">{[1,2,3].map((item) => <div className="loading-card" key={item}><span /><span /><span /></div>)}</div>
      : filtered.length ? <><div className="section-row"><h2>{hasFilters ? 'Resultados' : 'Visão geral'}</h2><span>{filtered.length} {filtered.length === 1 ? 'anotação' : 'anotações'}</span></div><div className="notes-grid">{filtered.map((note) => <NoteCard note={note} onClick={() => onOpen(note)} key={note.id} />)}</div></>
      : <div className="empty-state"><span><NotebookPen size={24} aria-hidden="true" /></span><h2>{hasFilters ? 'Nenhum resultado encontrado' : 'Nenhuma anotação ainda'}</h2><p>{hasFilters ? 'Tente remover alguns filtros ou buscar por outro termo.' : 'Crie sua primeira anotação para começar a organizar suas ideias.'}</p><button className="primary-button" onClick={hasFilters ? clear : onCreate}>{hasFilters ? 'Limpar filtros' : <><Plus size={17} aria-hidden="true" /> Criar anotação</>}</button></div>}
  </>;
}
