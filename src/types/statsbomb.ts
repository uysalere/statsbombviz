export interface StatsBombPlayer {
  id: number;
  name: string;
}

export interface StatsBombTeam {
  id: number;
  name: string;
}

export interface StatsBombPosition {
  id: number;
  name: string;
}

export interface StatsBombLineupPlayer {
  player: StatsBombPlayer;
  position: StatsBombPosition;
  jersey_number: number;
}

export interface StatsBombTactics {
  formation: number | string;
  lineup: StatsBombLineupPlayer[];
}

export interface StatsBombFreezeFramePlayer {
  location: [number, number];
  player: StatsBombPlayer;
  position: StatsBombPosition;
  teammate: boolean;
}

export interface StatsBombPass {
  recipient?: StatsBombPlayer;
  length?: number;
  angle?: number;
  height?: { id: number; name: string };
  end_location?: [number, number];
  type?: { id: number; name: string };
  outcome?: { id: number; name: string };
}

export interface StatsBombShot {
  statsbomb_xg?: number;
  end_location?: [number, number, number?];
  key_pass_id?: string;
  type?: { id: number; name: string };
  outcome?: { id: number; name: string };
  freeze_frame?: StatsBombFreezeFramePlayer[];
}

export interface StatsBombCarry {
  end_location: [number, number];
}

export interface StatsBombFoulCommitted {
  offensive?: boolean;
  type?: { id: number; name: string };
  card?: { id: number; name: string };
  opponent?: StatsBombPlayer;
}

export interface StatsBombSubstitution {
  replacement: StatsBombPlayer;
  outcome?: { id: number; name: string };
}

export interface StatsBombDuel {
  type?: { id: number; name: string };
  outcome?: { id: number; name: string };
  opponent?: StatsBombPlayer;
}

export interface StatsBombEvent {
  id: string;
  index: number;
  period: number;
  timestamp: string;
  minute: number;
  second: number;
  type: {
    id: number;
    name: string;
  };
  possession: number;
  possession_team: StatsBombTeam;
  play_pattern?: { id: number; name: string };
  team: StatsBombTeam;
  player?: StatsBombPlayer;
  position?: StatsBombPosition;
  location?: [number, number];
  duration?: number;
  under_pressure?: boolean;
  tactics?: StatsBombTactics;
  pass?: StatsBombPass;
  shot?: StatsBombShot;
  carry?: StatsBombCarry;
  foul_committed?: StatsBombFoulCommitted;
  foul_won?: { defensive?: boolean };
  substitution?: StatsBombSubstitution;
  duel?: StatsBombDuel;
  goalkeeper?: {
    type?: { id: number; name: string };
    outcome?: { id: number; name: string };
    position?: { id: number; name: string };
  };
  ball_receipt?: {
    outcome?: { id: number; name: string };
  };
  interception?: { outcome?: { id: number; name: string } };
  bad_behaviour?: { card?: { id: number; name: string } };
  freeze_frame?: StatsBombFreezeFramePlayer[];
  [key: string]: any;
}

export interface ActivePlayerState {
  id: number;
  name: string;
  jerseyNumber: number | string;
  teamId: number;
  positionId?: number;
  positionName?: string;
  isHome: boolean;
  x: number;
  y: number; // Statsbomb Y corresponds to world Z
  visible: boolean;
  isHighlighted?: boolean;
  highlightColor?: string;
  role?: string;
}

export interface MatchInfo {
  id: string | number;
  name: string;
  competition: string;
  season: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date?: string;
  dataUrl: string;
}

export type CameraMode = 'broadcast' | 'tactical' | 'ball' | 'goal' | 'orbit';
export type PlayerRenderStyle = 'broadcast' | 'tactical';
export type LightingTheme = 'night' | 'day';
