import {
  addDoc,
  collection,
  deleteField,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { deleteNoteImages } from './storage.service';
import type { Note, NoteFields, NoteImage } from '../types/note';

const notesCollection = () => collection(getFirebaseDb(), 'notes');

function compactFields(fields: Partial<NoteFields>) {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}

function mapNote(id: string, data: DocumentData): Note {
  return {
    id,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    images: Array.isArray(data.images) ? data.images : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    date: String(data.date ?? ''),
    time: data.time ? String(data.time) : undefined,
    addToCalendar: Boolean(data.addToCalendar),
    status: data.status === 'completed' || data.status === 'archived' ? data.status : 'pending',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
    userId: data.userId ? String(data.userId) : undefined,
  };
}

export function subscribeToNotes(
  onChange: (notes: Note[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(query(notesCollection(), orderBy('updatedAt', 'desc')),
    (snapshot) => onChange(snapshot.docs.map((item) => mapNote(item.id, item.data()))),
    (error) => onError(error),
  );
}

export async function createNote(fields: NoteFields) {
  const ref = await addDoc(notesCollection(), { ...compactFields(fields), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateNote(id: string, fields: Partial<NoteFields>) {
  const payload: Record<string, unknown> = compactFields(fields);
  if ('time' in fields && fields.time === undefined) payload.time = deleteField();
  await updateDoc(doc(getFirebaseDb(), 'notes', id), { ...payload, updatedAt: serverTimestamp() });
}

export async function replaceNoteImages(id: string, images: NoteImage[]) {
  await updateNote(id, { images });
}

export async function deleteNote(note: Note) {
  await deleteNoteImages(note.images);
  await deleteDoc(doc(getFirebaseDb(), 'notes', note.id));
}
