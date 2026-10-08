import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SimulationEventEngine } from './core/eventEngine';
import { sbToWorld } from './core/coordinateUtils';
import { CURATED_MATCHES } from './data/curatedMatches';
import { FootballBall } from './scene/ball';
import { MatchCameraController } from './scene/cameras';
import { FootballPitch } from './scene/pitch';
import { PlayerMeshGroup } from './scene/players';
import { StadiumEnvironment } from './scene/stadiumEnvironment';
import { CameraMode, LightingTheme, MatchInfo, PlayerRenderStyle, StatsBombEvent } from './types/statsbomb';
import { Controls } from './ui/Controls';
import { GoalOverlay } from './ui/GoalOverlay';
import { Header } from './ui/Header';
import { MatchSelectorModal } from './ui/MatchSelectorModal';
import { MinimapRadar } from './ui/MinimapRadar';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation State
  const engineRef = useRef<SimulationEventEngine>(new SimulationEventEngine());
  const [currentMatch, setCurrentMatch] = useState<MatchInfo>(CURATED_MATCHES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Match Presentation State
  const [homeTeamName, setHomeTeamName] = useState<string>('Argentina');
  const [awayTeamName, setAwayTeamName] = useState<string>('France');
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [period, setPeriod] = useState<number>(1);
  const [minute, setMinute] = useState<number>(0);
  const [second, setSecond] = useState<number>(0);
  const [currentEventType, setCurrentEventType] = useState<string>('');
  const [currentEventPlayer, setCurrentEventPlayer] = useState<string>('');

  // 3D Visual Customization
  const [cameraMode, setCameraMode] = useState<CameraMode>('broadcast');
  const [renderStyle, setRenderStyle] = useState<PlayerRenderStyle>('broadcast');
  const [lightingTheme, setLightingTheme] = useState<LightingTheme>('night');

  // UI Modals & Overlays
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const [goalCelebration, setGoalCelebration] = useState<{
    visible: boolean;
    scorer?: string;
    team?: string;
    minute?: number;
  }>({ visible: false });

  // 3D Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraControllerRef = useRef<MatchCameraController | null>(null);
  const pitchRef = useRef<FootballPitch | null>(null);
  const ballRef = useRef<FootballBall | null>(null);
  const environmentRef = useRef<StadiumEnvironment | null>(null);
  const playerMeshesRef = useRef<Map<number, PlayerMeshGroup>>(new Map());

  // Ball position state for minimap
  const [ballMinimapPos, setBallMinimapPos] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [activePlayerIds, setActivePlayerIds] = useState<Set<number>>(new Set());

  // Playback timer & tracking refs (breaks circular dependency cycles)
  const currentIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const playbackSpeedRef = useRef<number>(1.0);
  const renderStyleRef = useRef<PlayerRenderStyle>('broadcast');
  const playbackTimeoutRef = useRef<number | null>(null);

  // Sync refs with states
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    renderStyleRef.current = renderStyle;
    playerMeshesRef.current.forEach((pm) => pm.setStyle(renderStyle));
  }, [renderStyle]);

  // Initialize Three.js Scene once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 500);
    camera.position.set(0, 48, 68);

    // 3. Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    containerRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Camera Controller
    const camController = new MatchCameraController(camera, renderer.domElement);
    cameraControllerRef.current = camController;

    // 5. Environment & Lights
    const env = new StadiumEnvironment(scene);
    scene.add(env.group);
    environmentRef.current = env;

    // 6. Pitch
    const pitch = new FootballPitch();
    scene.add(pitch.group);
    pitchRef.current = pitch;

    // 7. Ball
    const ball = new FootballBall();
    scene.add(ball.group);
    ballRef.current = ball;

    // 8. Render Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Update 3D systems
      pitch.update(delta);
      ball.update(delta);
      playerMeshesRef.current.forEach((pm) => pm.update(delta));

      const bPos = ball.getPosition();
      camController.update(delta, bPos);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Camera Mode
  useEffect(() => {
    if (cameraControllerRef.current) {
      cameraControllerRef.current.setMode(cameraMode);
    }
  }, [cameraMode]);

  // Update Lighting Theme
  useEffect(() => {
    if (environmentRef.current) {
      environmentRef.current.setTheme(lightingTheme);
    }
  }, [lightingTheme]);

  // Clear existing player meshes
  const clearPlayers = useCallback(() => {
    if (!sceneRef.current) return;
    playerMeshesRef.current.forEach((pm) => {
      sceneRef.current?.remove(pm.group);
      pm.dispose();
    });
    playerMeshesRef.current.clear();
  }, []);

  // Apply state to 3D scene (used for seek, step, reset)
  const applyStateToScene = useCallback((index: number) => {
    const engine = engineRef.current;
    if (!engine.events.length || index < 0 || index >= engine.events.length) return;

    const state = engine.calculateStateAt(index);
    const event = engine.events[index];

    currentIndexRef.current = index;
    setCurrentIndex(index);
    setHomeScore(state.homeScore);
    setAwayScore(state.awayScore);

    if (event) {
      setPeriod(event.period || 1);
      setMinute(event.minute || 0);
      setSecond(event.second || 0);
      setCurrentEventType(event.type?.name || 'Event');
      setCurrentEventPlayer(event.player ? `${event.player.name} (${event.team?.name || ''})` : '');
    }

    // Update Ball
    if (ballRef.current) {
      ballRef.current.setPosition(state.ballPos.x, state.ballPos.y, state.ballPos.z);
      setBallMinimapPos({ x: state.ballPos.x, z: state.ballPos.z });
    }

    // 1. Determine who is in action (last 6 and next 3 turns)
    const { involvedIds, primaryPlayerId } = engine.getInvolvedPlayerIdsInWindow(index, 6, 3);
    setActivePlayerIds(involvedIds);

    // 2. Update Players
    Object.entries(state.playerPositions).forEach(([idStr, pos]) => {
      const id = parseInt(idStr, 10);
      let pm = playerMeshesRef.current.get(id);

      if (!pm) {
        const pData = engine.players[id];
        if (pData && sceneRef.current) {
          pm = new PlayerMeshGroup(pData, renderStyleRef.current);
          sceneRef.current.add(pm.group);
          playerMeshesRef.current.set(id, pm);
        }
      }

      if (pm) {
        pm.setPositionImmediate(pos.x, pos.z);
        const inAction = involvedIds.has(id);
        pm.setInAction(inAction, true, id === primaryPlayerId);
      }
    });
  }, []);

  // Process a single step during active playback
  const stepPlayback = useCallback(() => {
    const engine = engineRef.current;
    const curIdx = currentIndexRef.current;

    if (curIdx + 1 >= engine.events.length) {
      setIsPlaying(false);
      return;
    }

    const nextIdx = curIdx + 1;
    currentIndexRef.current = nextIdx;
    setCurrentIndex(nextIdx);

    const ev = engine.events[nextIdx];
    if (!ev) return;

    setPeriod(ev.period || 1);
    setMinute(ev.minute || 0);
    setSecond(ev.second || 0);
    const eventType = ev.type?.name || 'Event';
    setCurrentEventType(eventType);
    setCurrentEventPlayer(ev.player ? `${ev.player.name} (${ev.team?.name || ''})` : '');

    const speedScale = 1 / Math.max(0.1, playbackSpeedRef.current);
    let stepDurationMs = 250 * speedScale;

    // Update players in action (window of turns)
    const { involvedIds, primaryPlayerId } = engine.getInvolvedPlayerIdsInWindow(nextIdx, 6, 3);
    setActivePlayerIds(involvedIds);

    // Smoothly fade in players in action and fade out others
    playerMeshesRef.current.forEach((pm, id) => {
      const inAction = involvedIds.has(id);
      pm.setInAction(inAction, false, id === primaryPlayerId);
    });

    // Event specific physics & animations
    const isHome = ev.team?.id === engine.homeTeam.id;
    const worldPos = ev.location ? sbToWorld(ev.location, ev.team.id, ev.period, engine.homeTeam.id) : null;

    // 1. Move player on ball if applicable
    if (ev.player && worldPos) {
      const pm = playerMeshesRef.current.get(ev.player.id);
      if (pm) {
        pm.moveTo(worldPos.x, worldPos.z, 200 * speedScale);
        pm.setHighlight(0xfef08a, 400 * speedScale); // Yellow highlight
      }
    }

    // 2. Handle Freeze Frames (defenders positioning for shot/duel)
    if (ev.shot?.freeze_frame) {
      ev.shot.freeze_frame.forEach((ff) => {
        const ffPos = sbToWorld(ff.location, ev.team.id, ev.period, engine.homeTeam.id);
        const ffPm = playerMeshesRef.current.get(ff.player.id);
        if (ffPm && ffPos) {
          ffPm.moveTo(ffPos.x, ffPos.z, 300 * speedScale);
        }
      });
    }

    // 3. Handle Pass
    if (eventType === 'Pass' && ev.pass?.end_location && ballRef.current) {
      const endPos = sbToWorld(ev.pass.end_location, ev.team.id, ev.period, engine.homeTeam.id);
      if (endPos) {
        stepDurationMs = 450 * speedScale;
        ballRef.current.flyTo(endPos.x, endPos.z, 0.45, stepDurationMs, 'pass', () => {
          setBallMinimapPos({ x: endPos.x, z: endPos.z });
        });

        if (ev.pass.recipient) {
          const recPm = playerMeshesRef.current.get(ev.pass.recipient.id);
          if (recPm) {
            recPm.moveTo(endPos.x, endPos.z, stepDurationMs);
            recPm.setHighlight(0x38bdf8, 500 * speedScale);
          }
        }
      }
    }
    // 4. Handle Shot
    else if (eventType === 'Shot' && ev.shot?.end_location && ballRef.current) {
      const isGoal = ev.shot.outcome?.name === 'Goal';
      const endPos = sbToWorld(
        [ev.shot.end_location[0], ev.shot.end_location[1]],
        ev.team.id,
        ev.period,
        engine.homeTeam.id
      );

      if (endPos) {
        stepDurationMs = 500 * speedScale;
        ballRef.current.flyTo(endPos.x, endPos.z, 1.2, stepDurationMs, 'shot', () => {
          setBallMinimapPos({ x: endPos.x, z: endPos.z });
          if (isGoal) {
            if (isHome) setHomeScore((s) => s + 1);
            else setAwayScore((s) => s + 1);

            // Trigger Goal Celebration!
            cameraControllerRef.current?.triggerGoalShake(900, 0.9);
            setGoalCelebration({
              visible: true,
              scorer: ev.player?.name,
              team: ev.team?.name,
              minute: ev.minute
            });
            setTimeout(() => {
              setGoalCelebration({ visible: false });
            }, 3000);
          }
        });
      }
    }
    // 5. Handle Carry
    else if (eventType === 'Carry' && ev.carry?.end_location && ballRef.current && ev.player) {
      const endPos = sbToWorld(ev.carry.end_location, ev.team.id, ev.period, engine.homeTeam.id);
      if (endPos) {
        stepDurationMs = 350 * speedScale;
        ballRef.current.flyTo(endPos.x, endPos.z, 0.45, stepDurationMs, 'carry', () => {
          setBallMinimapPos({ x: endPos.x, z: endPos.z });
        });
        const carryPm = playerMeshesRef.current.get(ev.player.id);
        if (carryPm) carryPm.moveTo(endPos.x, endPos.z, stepDurationMs);
      }
    }
    // 6. Handle Foul
    else if (eventType === 'Foul Committed' && ev.player) {
      const foulPm = playerMeshesRef.current.get(ev.player.id);
      if (foulPm) foulPm.setHighlight(0xf43f5e, 700 * speedScale); // Red highlight
      stepDurationMs = 400 * speedScale;
    }
    // 7. General Ball Placement
    else if (worldPos && ballRef.current) {
      ballRef.current.flyTo(worldPos.x, worldPos.z, 0.45, 180 * speedScale, 'default');
      setBallMinimapPos({ x: worldPos.x, z: worldPos.z });
    }

    if (isPlayingRef.current) {
      playbackTimeoutRef.current = window.setTimeout(stepPlayback, stepDurationMs);
    }
  }, []);

  // Manage Playback active loop
  useEffect(() => {
    if (isPlaying) {
      playbackTimeoutRef.current = window.setTimeout(stepPlayback, 50);
    } else {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
    }
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
    };
  }, [isPlaying, stepPlayback]);

  // Load Match Data from URL
  const loadMatch = useCallback(async (matchOrUrl: MatchInfo | string) => {
    const url = typeof matchOrUrl === 'string' ? matchOrUrl : matchOrUrl.dataUrl;
    setIsLoading(true);
    setIsPlaying(false);
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const rawEvents: StatsBombEvent[] = await res.json();

      clearPlayers();
      const engine = engineRef.current;
      const parsed = engine.loadMatchData(rawEvents);

      setTotalEvents(parsed.events.length);
      setHomeTeamName(parsed.homeTeam.name);
      setAwayTeamName(parsed.awayTeam.name);

      if (typeof matchOrUrl !== 'string') {
        setCurrentMatch(matchOrUrl);
      } else {
        setCurrentMatch({
          id: 'custom',
          name: `${parsed.homeTeam.name} vs ${parsed.awayTeam.name}`,
          competition: 'Custom Match',
          season: '',
          homeTeam: parsed.homeTeam.name,
          awayTeam: parsed.awayTeam.name,
          dataUrl: url
        });
      }

      // Initialize initial player meshes
      if (sceneRef.current) {
        Object.values(parsed.players).forEach((p) => {
          const pm = new PlayerMeshGroup(p, renderStyleRef.current);
          sceneRef.current?.add(pm.group);
          playerMeshesRef.current.set(p.id, pm);
        });
      }

      applyStateToScene(0);
      setIsMatchModalOpen(false);
    } catch (err) {
      console.error('Failed to load match data:', err);
      alert('Error loading match data. Please verify the URL.');
    } finally {
      setIsLoading(false);
    }
  }, [applyStateToScene, clearPlayers]);

  // Load first match once on initial mount
  useEffect(() => {
    loadMatch(CURATED_MATCHES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seek handler
  const handleSeek = (newIndex: number) => {
    setIsPlaying(false);
    applyStateToScene(newIndex);
  };

  // Step handlers
  const handleStepForward = () => {
    setIsPlaying(false);
    const cur = currentIndexRef.current;
    if (cur + 1 < totalEvents) applyStateToScene(cur + 1);
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    const cur = currentIndexRef.current;
    if (cur > 0) applyStateToScene(cur - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    applyStateToScene(0);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Broadcast Header HUD */}
      <Header
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeScore={homeScore}
        awayScore={awayScore}
        period={period}
        minute={minute}
        second={second}
        currentEventType={currentEventType}
        currentEventPlayer={currentEventPlayer}
        cameraMode={cameraMode}
        onCameraChange={setCameraMode}
        renderStyle={renderStyle}
        onRenderStyleChange={setRenderStyle}
        lightingTheme={lightingTheme}
        onLightingChange={setLightingTheme}
        onOpenMatchModal={() => setIsMatchModalOpen(true)}
        matchTitle={currentMatch.name}
      />

      {/* 2D Minimap Radar */}
      <MinimapRadar
        players={engineRef.current.players}
        ballPos={ballMinimapPos}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        activePlayerIds={activePlayerIds}
      />

      {/* Playback Controls Deck */}
      <Controls
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        currentIndex={currentIndex}
        totalEvents={totalEvents}
        onSeek={handleSeek}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onReset={handleReset}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
        goalIndices={engineRef.current.goalIndices}
        cardIndices={engineRef.current.cardIndices}
        shotIndices={engineRef.current.shotIndices}
      />

      {/* Match Selector Modal */}
      <MatchSelectorModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        onSelectMatch={loadMatch}
        onLoadCustomUrl={loadMatch}
        isLoading={isLoading}
      />

      {/* Goal Celebration Overlay */}
      <GoalOverlay
        isVisible={goalCelebration.visible}
        scorerName={goalCelebration.scorer}
        teamName={goalCelebration.team}
        minute={goalCelebration.minute}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-200">Loading StatsBomb Event Stream...</span>
          </div>
        </div>
      )}
    </div>
  );
};
