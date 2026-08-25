/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo } from 'react';
import type { NoteImage } from '../types/note';

interface Props {
  existing: NoteImage[];
  files: File[];
  onExistingChange: (images: NoteImage[]) => void;
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

export function ImageUploader({ existing, files, onExistingChange, onFilesChange, disabled }: Props) {
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    onFilesChange([...files, ...Array.from(list).filter((file) => file.type.startsWith('image/'))]);
  };
  return (
    <div className="image-uploader">
      <label className={`upload-dropzone ${disabled ? 'disabled' : ''}`}><input type="file" accept="image/*" multiple disabled={disabled} onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} /><span className="upload-icon">↥</span><strong>Adicionar imagens</strong><small>PNG, JPG, WEBP ou GIF</small></label>
      {(existing.length > 0 || files.length > 0) && <div className="image-previews">
        {existing.map((image) => <div className="image-preview" key={image.storagePath}><img src={image.url} alt="Imagem já salva na anotação" /><button type="button" onClick={() => onExistingChange(existing.filter((item) => item.storagePath !== image.storagePath))} aria-label="Remover imagem salva">×</button></div>)}
        {files.map((file, index) => <div className="image-preview" key={`${file.name}-${file.lastModified}`}><img src={previews[index]} alt={`Prévia de ${file.name}`} /><button type="button" onClick={() => onFilesChange(files.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remover ${file.name}`}>×</button></div>)}
      </div>}
    </div>
  );
}
