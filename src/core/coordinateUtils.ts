export const PITCH_LENGTH = 120;
export const PITCH_WIDTH = 80;
export const HALF_LENGTH = PITCH_LENGTH / 2; // 60
export const HALF_WIDTH = PITCH_WIDTH / 2;   // 40

export const BALL_RADIUS = 0.45;
export const PLAYER_RADIUS = 0.9;
export const PLAYER_HEIGHT = 2.4;

export interface FormationCoord {
  name: string;
  x: number; // 0..1 normalized
  z: number; // 0..1 normalized
}

export const FORMATION_LAYOUTS: Record<number, FormationCoord> = {
  1: { name: 'Goalkeeper', x: 0.05, z: 0.50 },
  2: { name: 'Right Back', x: 0.25, z: 0.88 },
  3: { name: 'Right Center Back', x: 0.20, z: 0.65 },
  4: { name: 'Center Back', x: 0.18, z: 0.50 },
  5: { name: 'Left Center Back', x: 0.20, z: 0.35 },
  6: { name: 'Left Back', x: 0.25, z: 0.12 },
  7: { name: 'Right Wing Back', x: 0.35, z: 0.88 },
  8: { name: 'Left Wing Back', x: 0.35, z: 0.12 },
  9: { name: 'Right Defensive Midfield', x: 0.38, z: 0.65 },
  10: { name: 'Center Defensive Midfield', x: 0.35, z: 0.50 },
  11: { name: 'Left Defensive Midfield', x: 0.38, z: 0.35 },
  12: { name: 'Right Midfielder', x: 0.50, z: 0.85 },
  13: { name: 'Right Center Midfielder', x: 0.50, z: 0.62 },
  14: { name: 'Center Midfielder', x: 0.50, z: 0.50 },
  15: { name: 'Left Center Midfielder', x: 0.50, z: 0.38 },
  16: { name: 'Left Midfielder', x: 0.50, z: 0.15 },
  17: { name: 'Right Wing', x: 0.68, z: 0.88 },
  18: { name: 'Right Attacking Midfield', x: 0.65, z: 0.65 },
  19: { name: 'Center Attacking Midfield', x: 0.65, z: 0.50 },
  20: { name: 'Left Attacking Midfield', x: 0.65, z: 0.35 },
  21: { name: 'Left Wing', x: 0.68, z: 0.12 },
  22: { name: 'Right Center Forward', x: 0.78, z: 0.60 },
  23: { name: 'Center Forward', x: 0.80, z: 0.50 },
  24: { name: 'Left Center Forward', x: 0.78, z: 0.40 },
};

/**
 * Transforms StatsBomb coordinates [x, y] to 3D world space (centered at origin 0,0,0)
 * World coordinates:
 * - X: [-60, 60] (Length)
 * - Y: Elevation / Height above pitch
 * - Z: [-40, 40] (Width)
 */
export function sbToWorld(
  location: [number, number] | undefined,
  teamId: number,
  period: number,
  homeTeamId: number | null
): { x: number; z: number } | null {
  if (!location || location.length < 2) return null;

  const eventX = location[0];
  const eventZ = location[1]; // StatsBomb Y is pitch width

  const isHome = teamId === homeTeamId;
  const attacksRight = (isHome && period % 2 !== 0) || (!isHome && period % 2 === 0);

  let rawX: number;
  let rawZ: number;

  if (attacksRight) {
    rawX = eventX;
    rawZ = eventZ;
  } else {
    rawX = PITCH_LENGTH - eventX;
    rawZ = PITCH_WIDTH - eventZ;
  }

  // Clamp within bounds
  rawX = Math.max(0, Math.min(PITCH_LENGTH, rawX));
  rawZ = Math.max(0, Math.min(PITCH_WIDTH, rawZ));

  // Center around (0, 0)
  return {
    x: rawX - HALF_LENGTH,
    z: rawZ - HALF_WIDTH
  };
}

/**
 * Converts initial formation slot to world position
 */
export function formationToWorld(
  positionId: number | undefined,
  positionName: string | undefined,
  isHome: boolean
): { x: number; z: number } {
  let pos = positionId ? FORMATION_LAYOUTS[positionId] : undefined;

  if (!pos && positionName) {
    const cleanName = positionName.toLowerCase();
    const match = Object.values(FORMATION_LAYOUTS).find(item =>
      item.name.toLowerCase().includes(cleanName)
    );
    if (match) pos = match;
  }

  if (!pos) {
    pos = { name: 'Default', x: 0.3, z: 0.5 };
  }

  const pitchZ = pos.z * PITCH_WIDTH;
  let pitchX: number;

  if (isHome) {
    pitchX = pos.x * HALF_LENGTH;
  } else {
    pitchX = (1.0 - pos.x) * HALF_LENGTH + HALF_LENGTH;
  }

  // Center around (0, 0)
  return {
    x: pitchX - HALF_LENGTH,
    z: pitchZ - HALF_WIDTH
  };
}
