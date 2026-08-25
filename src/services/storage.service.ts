import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';
import type { NoteImage } from '../types/note';

function safeFileName(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function uploadNoteImage(
  noteId: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<NoteImage> {
  const storagePath = `notes/${noteId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const storageRef = ref(getFirebaseStorage(), storagePath);
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

  await new Promise<void>((resolve, reject) => {
    task.on('state_changed',
      (snapshot) => onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      reject,
      resolve,
    );
  });

  return { url: await getDownloadURL(task.snapshot.ref), storagePath };
}

export async function deleteNoteImage(image: NoteImage) {
  await deleteObject(ref(getFirebaseStorage(), image.storagePath));
}

export async function deleteNoteImages(images: NoteImage[]) {
  await Promise.allSettled(images.map(deleteNoteImage));
}
