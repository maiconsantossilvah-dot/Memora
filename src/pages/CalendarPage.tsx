import { useMemo, useState } from 'react';
import { ArrowRight, CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { getCalendarNotes, getNotesForDate } from '../services/calendar/calendar.service';
import type { Note } from '../types/note';

export function CalendarPage({ notes, onOpen }: { notes: Note[]; onOpen: (note: Note) => void }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const calendarNotes = useMemo(() => getCalendarNotes(notes), [notes]);
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }) });
  const selectedNotes = getNotesForDate(notes, selectedDate);

  return <>
    <div className="hero-row calendar-hero"><div><p className="eyebrow">PLANEJAMENTO</p><h1>Agenda</h1><p className="subtitle">Anotações marcadas para acompanhar no tempo.</p></div><div className="month-controls"><button aria-label="Mês anterior" onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft size={17} aria-hidden="true" /></button><strong>{format(month, 'MMMM yyyy', { locale: ptBR })}</strong><button aria-label="Próximo mês" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={17} aria-hidden="true" /></button></div></div>
    <div className="calendar-layout">
      <section className="calendar-card" aria-label={`Calendário de ${format(month, 'MMMM yyyy', { locale: ptBR })}`}>
        <div className="weekdays">{['DOM','SEG','TER','QUA','QUI','SEX','SÁB'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">{days.map((day) => { const key = format(day, 'yyyy-MM-dd'); const dayNotes = getNotesForDate(notes, key); const selected = key === selectedDate; return <button key={key} className={`${!isSameMonth(day, month) ? 'outside' : ''} ${selected ? 'selected' : ''}`} onClick={() => setSelectedDate(key)} aria-label={`${format(day, "d 'de' MMMM", { locale: ptBR })}, ${dayNotes.length} anotações`}><span className="day-number">{format(day, 'd')}</span><span className="day-events">{dayNotes.slice(0, 2).map((note) => <i key={note.id}>{note.time && <b>{note.time}</b>}{note.title}</i>)}{dayNotes.length > 2 && <em>+{dayNotes.length - 2}</em>}</span></button>; })}</div>
      </section>
      <aside className="day-panel"><p className="eyebrow">DIA SELECIONADO</p><h2>{format(parseISO(selectedDate), "d 'de' MMMM", { locale: ptBR })}</h2>{selectedNotes.length ? <div className="day-notes">{selectedNotes.map((note) => <button key={note.id} onClick={() => onOpen(note)}><span className={`event-dot ${note.status}`} /><div><strong>{note.title}</strong><small>{note.time || 'Sem horário'} · {note.status === 'completed' ? 'Concluída' : 'Pendente'}</small></div><ArrowRight size={14} aria-hidden="true" /></button>)}</div> : <div className="day-empty"><CalendarX2 size={26} aria-hidden="true" /><p>Nenhuma anotação neste dia.</p></div>}<footer>{calendarNotes.length} {calendarNotes.length === 1 ? 'item' : 'itens'} na agenda</footer></aside>
    </div>
  </>;
}
