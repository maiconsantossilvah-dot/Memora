import type { Timestamp } from 'firebase/firestore';

export type NoteStatus = 'pending' | 'completed' | 'archived';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface NoteImage {
  url: string;
  storagePath: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  images: NoteImage[];
  tags: string[];
  date: string;
  time?: string;
  addToCalendar: boolean;
  status: NoteStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId?: string;
}

export type NoteFields = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;

export type ConnectionState = 'unconfigured' | 'connecting' | 'connected' | 'error';
