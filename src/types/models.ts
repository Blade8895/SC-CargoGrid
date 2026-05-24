export type OrderStatus = 'planned' | 'loaded' | 'done';

export interface CargoContainer {
  id: string;
  name?: string;
  color: string;
  size: { length: number; width: number; height: number };
  quantity: number;
}

export interface CargoPlacement {
  id: string;
  orderId: string;
  containerId: string;
  target: 'order' | 'ship';
  sectionId?: string;
  x: number;
  y: number;
  z: number;
  size: { length: number; width: number; height: number };
  color: string;
  label: string;
}

export interface MissionOrder {
  id: string;
  name: string;
  pickup: string;
  delivery: string;
  rewardAuec: number;
  notes?: string;
  color: string;
  status: OrderStatus;
  containers: CargoContainer[];
}

export interface GridSection {
  id: string;
  label: string;
  offsetX: number;
  width: number;
  length: number;
  maxHeight: number;
  blocked?: boolean;
}

export interface ShipLayout {
  id: string;
  name: string;
  sections: GridSection[];
  totalLength: number;
}

export interface CargoGrid {
  shipId: string;
  placements: CargoPlacement[];
}
