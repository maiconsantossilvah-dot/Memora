import type { Note } from '../../types/note';

export function getCalendarNotes(notes: Note[]) {
  return notes.filter((note) => note.addToCalendar && note.status !== 'archived');
}

export function getNotesForDate(notes: Note[], date: string) {
  return getCalendarNotes(notes).filter((note) => note.date === date);
}
