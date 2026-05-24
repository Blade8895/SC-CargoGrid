import type { CargoGrid, MissionOrder } from '../types/models';

const KEY = 'sc-cargo-grid-v1';

export interface AppState {
  orders: MissionOrder[];
  selectedOrderId: string | null;
  shipGrid: CargoGrid;
  archivedOrders: MissionOrder[];
}

export const loadState = (): AppState | null => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
};

export const saveState = (state: AppState) => localStorage.setItem(KEY, JSON.stringify(state));
