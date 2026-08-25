import { Modal } from './Modal';

export function ConfirmDialog({ open, busy, onCancel, onConfirm }: { open: boolean; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <Modal open={open} onClose={busy ? () => undefined : onCancel} title="Excluir anotação?" eyebrow="AÇÃO PERMANENTE" size="small"><p className="confirm-copy">A anotação e todas as imagens armazenadas serão removidas permanentemente. Esta ação não pode ser desfeita.</p><div className="modal-actions"><button className="secondary-control" onClick={onCancel} disabled={busy}>Cancelar</button><button className="danger-button" onClick={onConfirm} disabled={busy}>{busy ? 'Excluindo…' : 'Excluir permanentemente'}</button></div></Modal>;
}
