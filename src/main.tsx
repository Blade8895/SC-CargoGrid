import React from 'react';
import { createRoot } from 'react-dom/client';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { nanoid } from 'nanoid';
import type { CargoContainer, CargoPlacement, MissionOrder } from './types/models';
import { ironcladAssault, isValidPlacement } from './utils/grid';
import { AppState, loadState, saveState } from './state/storage';
import './styles.css';

const sizes = ['1x1x1', '1x2x1', '2x2x1', '2x2x2', '4x2x2', '6x2x2', '8x2x2'];
const parseSize = (s: string) => {
  const [l, w, h] = s.split('x').map(Number);
  return { length: l, width: w, height: h };
};
const defaultState = (): AppState => ({
  orders: [],
  selectedOrderId: null,
  archivedOrders: [],
  shipGrid: { shipId: ironcladAssault.id, placements: [] }
});

function App() {
  const [state, setState] = React.useState<AppState>(() => loadState() ?? defaultState());
  const [active, setActive] = React.useState<any>(null);
  const [isCreatingOrder, setIsCreatingOrder] = React.useState(false);

  React.useEffect(() => saveState(state), [state]);

  const selected = state.orders.find((o) => o.id === state.selectedOrderId) ?? null;

  const addOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const order: MissionOrder = {
      id: nanoid(),
      name: String(fd.get('name') || ''),
      pickup: String(fd.get('pickup') || ''),
      delivery: String(fd.get('delivery') || ''),
      rewardAuec: Number(fd.get('reward') || 0),
      notes: String(fd.get('notes') || ''),
      status: 'planned',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      containers: []
    };

    setState((s) => ({ ...s, orders: [order, ...s.orders], selectedOrderId: order.id }));
    setIsCreatingOrder(false);
    e.currentTarget.reset();
  };

  const addContainer = (e: React.FormEvent<HTMLFormElement>) => {
    if (!selected) return;
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const size = parseSize(String(fd.get('size')));
    const c: CargoContainer = {
      id: nanoid(),
      name: String(fd.get('name') || ''),
      size,
      color: selected.color,
      quantity: Number(fd.get('qty') || 1)
    };
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === selected.id ? { ...o, containers: [...o.containers, c] } : o))
    }));
    e.currentTarget.reset();
  };

  const onDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;
    setActive(null);
    if (!over) return;

    const data = active.data.current as any;
    if (!data) return;

    if (over.id === 'unload-zone' && data.kind === 'ship-placement') {
      setState((s) => ({
        ...s,
        shipGrid: { ...s.shipGrid, placements: s.shipGrid.placements.filter((p) => p.id !== data.placement.id) }
      }));
      return;
    }

    if (String(over.id).startsWith('ship-cell') && (data.kind === 'container' || data.kind === 'ship-placement')) {
      const [, sectionId, xs, ys, zs] = String(over.id).split(':');
      const x = Number(xs);
      const y = Number(ys);
      const z = Number(zs);
      const section = ironcladAssault.sections.find((s) => s.id === sectionId);
      const base =
        data.kind === 'container'
          ? {
              id: nanoid(),
              orderId: data.orderId,
              containerId: data.container.id,
              target: 'ship' as const,
              sectionId,
              x,
              y,
              z,
              size: data.container.size,
              color: data.container.color,
              label:
                data.container.name ||
                `${data.container.size.length}x${data.container.size.width}x${data.container.size.height}`
            }
          : { ...data.placement, x, y, z, sectionId };

      setState((s) => {
        const ok = isValidPlacement(section, base, s.shipGrid.placements, data.kind === 'ship-placement' ? data.placement.id : undefined);
        if (!ok) return s;
        const next =
          data.kind === 'ship-placement'
            ? s.shipGrid.placements.map((p) => (p.id === base.id ? base : p))
            : [...s.shipGrid.placements, base];
        const loadedIds = new Set(next.map((p) => p.orderId));
        return {
          ...s,
          shipGrid: { ...s.shipGrid, placements: next },
          orders: s.orders.map((o) => (loadedIds.has(o.id) ? { ...o, status: 'loaded' } : o))
        };
      });
    }
  };

  const loadedReward = state.orders.filter((o) => o.status === 'loaded').reduce((a, b) => a + b.rewardAuec, 0);

  return (
    <DndContext onDragStart={(e) => setActive(e.active.data.current)} onDragEnd={onDragEnd}>
      <div className="app">
        <aside className="panel">
          <div className="heading-row">
            <h3>Aufträge</h3>
            <button type="button" onClick={() => setIsCreatingOrder(true)}>Neuer Auftrag</button>
          </div>
          {state.orders.map((o) => (
            <button key={o.id} className={o.id === state.selectedOrderId ? 'active' : ''} onClick={() => setState((s) => ({ ...s, selectedOrderId: o.id }))}>
              {o.name} · {o.status}
            </button>
          ))}
        </aside>

        <main>
          {isCreatingOrder ? (
            <section className="main-panel">
              <div className="heading-row"><h2>Auftrag erstellen</h2><button type="button" onClick={() => setIsCreatingOrder(false)}>Schließen</button></div>
              <p>Während der Auftragserstellung ist das Schiffsgrid minimiert.</p>
              <form onSubmit={addOrder}>
                <input name="name" placeholder="Auftragsname" required />
                <input name="pickup" placeholder="Abholort" required />
                <input name="delivery" placeholder="Lieferort" required />
                <input name="reward" type="number" placeholder="Belohnung in aUEC" required />
                <textarea name="notes" placeholder="Notiz (optional)" />
                <button>Auftrag anlegen</button>
              </form>
            </section>
          ) : (
            <>
              <h2>Ship Grid · {ironcladAssault.name}</h2>
              <ShipGrid placements={state.shipGrid.placements} />
              <div id="unload"><UnloadZone /></div>
            </>
          )}
        </main>

        <aside className="panel">
          {selected && (
            <>
              <h3>Fracht: {selected.name}</h3>
              {selected.containers.map((c) => (
                <DraggableContainer key={c.id} container={c} orderId={selected.id} />
              ))}
              <form onSubmit={addContainer}>
                <select name="size">{sizes.map((s) => <option key={s}>{s}</option>)}</select>
                <input name="qty" type="number" min={1} defaultValue={1} />
                <input name="name" placeholder="Anzeigename" />
                <button>Container hinzufügen</button>
              </form>
            </>
          )}
          <hr />
          <p>Geladene Belohnung: {loadedReward.toLocaleString()} aUEC</p>
          <p>Erledigt: {state.archivedOrders.length}</p>
        </aside>
      </div>
      <DragOverlay>{active?.kind && <div className="drag">{active.kind === 'container' ? 'Container' : 'Placement'}</div>}</DragOverlay>
    </DndContext>
  );
}

function DraggableContainer({ container, orderId }: { container: CargoContainer; orderId: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `container:${orderId}:${container.id}`,
    data: { kind: 'container', container, orderId }
  });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="card" style={{ background: container.color, transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined }}>
      {container.name || 'Container'} · {container.size.length}x{container.size.width}x{container.size.height}
    </div>
  );
}

function ShipGrid({ placements }: { placements: CargoPlacement[] }) {
  const cells: React.ReactNode[] = [];
  for (const section of ironcladAssault.sections) {
    for (let y = 0; y < section.length; y++) {
      for (let x = section.offsetX; x < section.offsetX + section.width; x++) {
        const id = `ship-cell:${section.id}:${x}:${y}:0`;
        cells.push(<DropCell key={id} id={id} blocked={!!section.blocked} />);
      }
    }
  }
  return <div className="grid">{cells}{placements.map((p) => <ShipPlacement key={p.id} p={p} />)}</div>;
}
function DropCell({ id, blocked }: { id: string; blocked: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className={`cell ${blocked ? 'blocked' : ''} ${isOver ? (blocked ? 'bad' : 'ok') : ''}`} />;
}
function ShipPlacement({ p }: { p: CargoPlacement }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: `placement:${p.id}`, data: { kind: 'ship-placement', placement: p } });
  return <div ref={setNodeRef} {...listeners} {...attributes} className="placement" style={{ left: p.x * 26, top: p.y * 20, width: p.size.width * 26, height: p.size.length * 20, background: p.color, transform: transform ? `translate(${transform.x}px,${transform.y}px)` : undefined }}>{p.label}</div>;
}
function UnloadZone() {
  const { setNodeRef, isOver } = useDroppable({ id: 'unload-zone' });
  return <div ref={setNodeRef} className={`unload ${isOver ? 'ok' : ''}`}>Ausladezone</div>;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
