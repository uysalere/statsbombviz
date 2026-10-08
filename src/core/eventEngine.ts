import { ActivePlayerState, StatsBombEvent } from '../types/statsbomb';
import { formationToWorld, sbToWorld } from './coordinateUtils';

export interface ParsedMatchData {
  events: StatsBombEvent[];
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  players: Record<number, ActivePlayerState>;
  goalIndices: number[];
  cardIndices: number[];
  shotIndices: number[];
}

export class SimulationEventEngine {
  public events: StatsBombEvent[] = [];
  public homeTeam: { id: number; name: string } = { id: 0, name: 'Home' };
  public awayTeam: { id: number; name: string } = { id: 0, name: 'Away' };
  public players: Record<number, ActivePlayerState> = {};
  public goalIndices: number[] = [];
  public cardIndices: number[] = [];
  public shotIndices: number[] = [];

  public currentIndex: number = 0;
  public homeScore: number = 0;
  public awayScore: number = 0;

  constructor() {}

  public loadMatchData(events: StatsBombEvent[]): ParsedMatchData {
    this.events = events;
    this.currentIndex = 0;
    this.homeScore = 0;
    this.awayScore = 0;
    this.players = {};
    this.goalIndices = [];
    this.cardIndices = [];
    this.shotIndices = [];

    // 1. Identify Teams from Starting XI events
    const startingXIs = events.filter(e => e.type && e.type.id === 35);
    if (startingXIs.length >= 2) {
      this.homeTeam = { id: startingXIs[0].team.id, name: startingXIs[0].team.name };
      this.awayTeam = { id: startingXIs[1].team.id, name: startingXIs[1].team.name };
    } else {
      const firstTeam = events.find(e => e.team && e.team.id)?.team;
      const secondTeam = events.find(e => e.team && e.team.id && e.team.id !== firstTeam?.id)?.team;
      this.homeTeam = firstTeam || { id: 1, name: 'Home Team' };
      this.awayTeam = secondTeam || { id: 2, name: 'Away Team' };
    }

    // 2. Parse Lineups and initial positions
    startingXIs.forEach(event => {
      const lineup = event.tactics?.lineup;
      const teamId = event.team.id;
      const isHome = teamId === this.homeTeam.id;

      if (lineup) {
        lineup.forEach(p => {
          const initPos = formationToWorld(p.position?.id, p.position?.name, isHome);
          this.players[p.player.id] = {
            id: p.player.id,
            name: p.player.name,
            jerseyNumber: p.jersey_number,
            teamId: teamId,
            positionId: p.position?.id,
            positionName: p.position?.name,
            isHome: isHome,
            x: initPos.x,
            y: initPos.z,
            visible: true
          };
        });
      }
    });

    // 3. Scan for Goals, Cards, and Shots for Timeline Markers
    events.forEach((ev, idx) => {
      const typeName = ev.type?.name;
      if (typeName === 'Shot') {
        this.shotIndices.push(idx);
        if (ev.shot?.outcome?.name === 'Goal') {
          this.goalIndices.push(idx);
        }
      } else if (typeName === 'Bad Behaviour' || ev.foul_committed?.card) {
        this.cardIndices.push(idx);
      }
    });

    return {
      events: this.events,
      homeTeam: this.homeTeam,
      awayTeam: this.awayTeam,
      players: this.players,
      goalIndices: this.goalIndices,
      cardIndices: this.cardIndices,
      shotIndices: this.shotIndices
    };
  }

  /**
   * Returns players in action within the last and next couple turns (window).
   */
  public getInvolvedPlayerIdsInWindow(
    currentIndex: number,
    lookback: number = 5,
    lookahead: number = 3
  ): {
    involvedIds: Set<number>;
    primaryPlayerId: number | null;
  } {
    const involvedIds = new Set<number>();
    let primaryPlayerId: number | null = null;

    if (!this.events || this.events.length === 0) {
      return { involvedIds, primaryPlayerId };
    }

    const currentEv = this.events[currentIndex];
    if (currentEv && currentEv.player?.id) {
      primaryPlayerId = currentEv.player.id;
    }

    const start = Math.max(0, currentIndex - lookback);
    const end = Math.min(this.events.length - 1, currentIndex + lookahead);

    for (let i = start; i <= end; i++) {
      const ev = this.events[i];
      if (!ev) continue;

      if (ev.player?.id) involvedIds.add(ev.player.id);
      if (ev.pass?.recipient?.id) involvedIds.add(ev.pass.recipient.id);
      if (ev.foul_committed?.opponent?.id) involvedIds.add(ev.foul_committed.opponent.id);
      if (ev.duel?.opponent?.id) involvedIds.add(ev.duel.opponent.id);

      const ff = ev.shot?.freeze_frame || ev.freeze_frame;
      if (Array.isArray(ff)) {
        ff.forEach(p => {
          if (p.player?.id) involvedIds.add(p.player.id);
        });
      }

      if (ev.substitution?.replacement?.id) involvedIds.add(ev.substitution.replacement.id);
    }

    return { involvedIds, primaryPlayerId };
  }

  /**
   * Fast forward or seek to an event index, calculating exact score and positions
   */
  public calculateStateAt(targetIndex: number): {
    homeScore: number;
    awayScore: number;
    ballPos: { x: number; y: number; z: number };
    playerPositions: Record<number, { x: number; z: number; visible: boolean }>;
  } {
    let hScore = 0;
    let aScore = 0;
    const posMap: Record<number, { x: number; z: number; visible: boolean }> = {};

    // Reset to initial positions
    Object.values(this.players).forEach(p => {
      posMap[p.id] = { x: p.x, z: p.y, visible: true };
    });

    let lastBallPos = { x: 0, y: 0.45, z: 0 };

    const limit = Math.min(targetIndex, this.events.length - 1);
    for (let i = 0; i <= limit; i++) {
      const ev = this.events[i];
      if (!ev) continue;

      // Track score
      if (ev.type?.name === 'Shot' && ev.shot?.outcome?.name === 'Goal') {
        if (ev.team?.id === this.homeTeam.id) hScore++;
        else if (ev.team?.id === this.awayTeam.id) aScore++;
      }

      // Track player location
      const pId = ev.player?.id;
      if (pId && ev.location) {
        const wPos = sbToWorld(ev.location, ev.team.id, ev.period, this.homeTeam.id);
        if (wPos) {
          posMap[pId] = { x: wPos.x, z: wPos.z, visible: true };
          lastBallPos = { x: wPos.x, y: 0.45, z: wPos.z };
        }
      }

      // Pass recipient / end location
      if (ev.type?.name === 'Pass' && ev.pass?.end_location) {
        const endPos = sbToWorld(ev.pass.end_location, ev.team.id, ev.period, this.homeTeam.id);
        if (endPos) {
          lastBallPos = { x: endPos.x, y: 0.45, z: endPos.z };
          if (ev.pass.recipient?.id) {
            posMap[ev.pass.recipient.id] = { x: endPos.x, z: endPos.z, visible: true };
          }
        }
      }

      // Carry end location
      if (ev.type?.name === 'Carry' && ev.carry?.end_location && pId) {
        const carryEnd = sbToWorld(ev.carry.end_location, ev.team.id, ev.period, this.homeTeam.id);
        if (carryEnd) {
          posMap[pId] = { x: carryEnd.x, z: carryEnd.z, visible: true };
          lastBallPos = { x: carryEnd.x, y: 0.45, z: carryEnd.z };
        }
      }

      // Shot end location
      if (ev.type?.name === 'Shot' && ev.shot?.end_location) {
        const shotEnd = sbToWorld(
          [ev.shot.end_location[0], ev.shot.end_location[1]],
          ev.team.id,
          ev.period,
          this.homeTeam.id
        );
        if (shotEnd) {
          lastBallPos = { x: shotEnd.x, y: 0.45, z: shotEnd.z };
        }
      }
    }

    this.currentIndex = limit;
    this.homeScore = hScore;
    this.awayScore = aScore;

    return {
      homeScore: hScore,
      awayScore: aScore,
      ballPos: lastBallPos,
      playerPositions: posMap
    };
  }
}
