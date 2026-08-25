import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

export function normalizeTag(value: string) {
  return value.trim().toLocaleLowerCase('pt-BR').replace(/^#/, '').replace(/\s+/g, '-');
}

export function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const tag = normalizeTag(draft);
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); add(); }
    if (event.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
  };
  return (
    <div className="tag-input-wrap">
      <div className="tag-input">
        {value.map((tag) => <span className="tag" key={tag}>#{tag}<button type="button" onClick={() => onChange(value.filter((item) => item !== tag))} aria-label={`Remover tag ${tag}`}><X size={12} aria-hidden="true" /></button></span>)}
        <input aria-label="Adicionar tag" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} onBlur={add} placeholder={value.length ? 'Adicionar…' : 'Digite e pressione Enter'} />
      </div>
      <small>Pressione Enter para adicionar. Duplicatas são ignoradas.</small>
    </div>
  );
}
