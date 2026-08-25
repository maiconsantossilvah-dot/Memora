import type { ConnectionState } from '../types/note';

export type Page = 'notes' | 'calendar' | 'tags';

interface SidebarProps {
  page: Page;
  onPageChange: (page: Page) => void;
  connection: ConnectionState;
  onConfigure: () => void;
}

const labels: Record<ConnectionState, string> = {
  unconfigured: 'Não configurado', connecting: 'Conectando', connected: 'Conectado', error: 'Erro de conexão',
};

export function Sidebar({ page, onPageChange, connection, onConfigure }: SidebarProps) {
  const items: Array<{ id: Page; icon: string; label: string }> = [
    { id: 'notes', icon: '▤', label: 'Anotações' }, { id: 'calendar', icon: '□', label: 'Agenda' }, { id: 'tags', icon: '#', label: 'Tags' },
  ];
  return (
    <>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">m</span><span>memora</span></div>
        <nav aria-label="Navegação principal">
          {items.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => onPageChange(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        </nav>
        {connection !== 'connected' && <div className="sidebar-card"><span className="eyebrow">FIREBASE</span><strong>Conecte seu espaço</strong><p>Salve suas ideias com segurança na nuvem.</p><button onClick={onConfigure}>Configurar agora →</button></div>}
        <div className={`sidebar-footer connection-${connection}`}><span className="status-dot" />{labels[connection]}</div>
      </aside>
      <nav className="mobile-nav" aria-label="Navegação mobile">
        {items.map((item) => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => onPageChange(item.id)}>{item.icon}<span>{item.label}</span></button>)}
      </nav>
    </>
  );
}
