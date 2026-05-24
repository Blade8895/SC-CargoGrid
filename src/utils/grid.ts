import type { CargoPlacement, GridSection, ShipLayout } from '../types/models';

export const ironcladAssault: ShipLayout = {
  id: 'ironclad-assault',
  name: 'Ironclad Assault',
  totalLength: 20,
  sections: [
    { id: 'left', label: 'Left Grid', offsetX: 0, width: 6, length: 20, maxHeight: 6 },
    { id: 'aisle', label: 'Aisle', offsetX: 6, width: 2, length: 20, maxHeight: 0, blocked: true },
    { id: 'right', label: 'Right Grid', offsetX: 8, width: 6, length: 20, maxHeight: 6 }
  ]
};

export const isValidPlacement = (
  section: GridSection | undefined,
  candidate: CargoPlacement,
  existing: CargoPlacement[],
  ignoreId?: string
): boolean => {
  if (!section || section.blocked) return false;
  if (candidate.z + candidate.size.height > section.maxHeight) return false;
  if (candidate.x < section.offsetX || candidate.y < 0) return false;
  if (candidate.x + candidate.size.width > section.offsetX + section.width) return false;
  if (candidate.y + candidate.size.length > section.length) return false;

  for (const p of existing) {
    if (p.id === ignoreId || p.sectionId !== candidate.sectionId) continue;
    const overlap = !(
      candidate.x + candidate.size.width <= p.x ||
      p.x + p.size.width <= candidate.x ||
      candidate.y + candidate.size.length <= p.y ||
      p.y + p.size.length <= candidate.y ||
      candidate.z + candidate.size.height <= p.z ||
      p.z + p.size.height <= candidate.z
    );
    if (overlap) return false;
  }
  return true;
};
