import { deleteApp, getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { collection, getDocs, getFirestore, limit, query, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import type { FirebaseConfig } from '../types/note';

const APP_NAME = 'memora-client';
let activeApp: FirebaseApp | null = null;
let activeDb: Firestore | null = null;
let activeStorage: FirebaseStorage | null = null;

export function isValidFirebaseConfig(config: Partial<FirebaseConfig>): config is FirebaseConfig {
  return ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
    .every((key) => Boolean(config[key as keyof FirebaseConfig]?.trim()));
}

export async function initializeFirebase(config: FirebaseConfig) {
  if (!isValidFirebaseConfig(config)) throw new Error('Preencha todos os campos da configuração.');

  const existing = getApps().find((app) => app.name === APP_NAME);
  if (existing && existing.options.projectId !== config.projectId) await deleteApp(existing);

  activeApp = getApps().find((app) => app.name === APP_NAME) ?? initializeApp(config, APP_NAME);
  activeDb = getFirestore(activeApp);
  activeStorage = getStorage(activeApp);
  return { app: activeApp, db: activeDb, storage: activeStorage };
}

export async function testFirebaseConnection(config: FirebaseConfig) {
  const { db } = await initializeFirebase(config);
  await getDocs(query(collection(db, 'notes'), limit(1)));
}

export function getFirebaseDb() {
  if (!activeDb) throw new Error('Firebase não configurado.');
  return activeDb;
}

export function getFirebaseStorage() {
  if (!activeStorage) throw new Error('Firebase Storage não configurado.');
  return activeStorage;
}

export function getCurrentFirebaseApp() {
  if (activeApp) return activeApp;
  const existing = getApps().find((app) => app.name === APP_NAME);
  return existing ? getApp(APP_NAME) : null;
}
