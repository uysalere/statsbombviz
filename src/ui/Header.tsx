import React from 'react';
import { Camera, Eye, Moon, Sun, Trophy, Video } from 'lucide-react';
import { CameraMode, LightingTheme, PlayerRenderStyle } from '../types/statsbomb';

interface HeaderProps {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  period: number;
  minute: number;
  second: number;
  currentEventType?: string;
  currentEventPlayer?: string;
  cameraMode: CameraMode;
  onCameraChange: (mode: CameraMode) => void;
  renderStyle: PlayerRenderStyle;
  onRenderStyleChange: (style: PlayerRenderStyle) => void;
  lightingTheme: LightingTheme;
  onLightingChange: (theme: LightingTheme) => void;
  onOpenMatchModal: () => void;
  matchTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  period,
  minute,
  second,
  currentEventType,
  currentEventPlayer,
  cameraMode,
  onCameraChange,
  renderStyle,
  onRenderStyleChange,
  lightingTheme,
  onLightingChange,
  onOpenMatchModal,
  matchTitle
}) => {
  const minStr = String(minute).padStart(2, '0');
  const secStr = String(second).padStart(2, '0');

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4 pointer-events-none flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Match Select & Brand */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onOpenMatchModal}
            className="group flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 shadow-lg backdrop-blur-md transition-all active:scale-95 text-xs sm:text-sm font-semibold text-slate-200"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Select Match</span>
              <span className="block max-w-[140px] sm:max-w-[190px] truncate font-bold text-slate-100">
                {matchTitle || `${homeTeamName} vs ${awayTeamName}`}
              </span>
            </div>
          </button>
        </div>

        {/* Live Broadcast Scoreboard */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-4 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-2xl backdrop-blur-md">
          {/* Home Team */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            <span className="font-bold text-xs sm:text-sm text-slate-100 max-w-[90px] sm:max-w-[120px] truncate">
              {homeTeamName}
            </span>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="font-extrabold text-lg sm:text-xl text-sky-400 tabular-nums">{homeScore}</span>
            <span className="text-slate-500 font-bold">:</span>
            <span className="font-extrabold text-lg sm:text-xl text-rose-400 tabular-nums">{awayScore}</span>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-slate-100 max-w-[90px] sm:max-w-[120px] truncate text-right">
              {awayTeamName}
            </span>
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          </div>

          {/* Clock & Half */}
          <div className="pl-2 border-l border-slate-700/80 flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
            <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-sans">
              {period}H
            </span>
            <span>{minStr}:{secStr}</span>
          </div>
        </div>

        {/* Camera, Style & Environment Toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Camera Dropdown / Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
            <button
              onClick={() => onCameraChange('broadcast')}
              title="Broadcast TV Cam"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                cameraMode === 'broadcast'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden md:inline">TV</span>
            </button>
            <button
              onClick={() => onCameraChange('tactical')}
              title="Tactical 2D Top-Down"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                cameraMode === 'tactical'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tactical</span>
            </button>
            <button
              onClick={() => onCameraChange('ball')}
              title="Ball Follow Cam"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                cameraMode === 'ball'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ball</span>
            </button>
            <button
              onClick={() => onCameraChange('orbit')}
              title="Free Orbit Camera"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                cameraMode === 'orbit'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Orbit
            </button>
          </div>

          {/* Render Style Toggle (Broadcast vs Tactical) */}
          <button
            onClick={() => onRenderStyleChange(renderStyle === 'broadcast' ? 'tactical' : 'broadcast')}
            title={`Render Mode: ${renderStyle === 'broadcast' ? 'Broadcast Figures' : 'Tactical Pucks'}`}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 text-slate-300 hover:text-white backdrop-blur-md transition-all active:scale-95"
          >
            <span className="text-xs font-bold px-1">
              {renderStyle === 'broadcast' ? '3D' : 'Tactics'}
            </span>
          </button>

          {/* Day / Night Toggle */}
          <button
            onClick={() => onLightingChange(lightingTheme === 'night' ? 'day' : 'night')}
            title="Toggle Day/Night Lighting"
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 text-slate-300 hover:text-white backdrop-blur-md transition-all active:scale-95"
          >
            {lightingTheme === 'night' ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Active Event Banner */}
      {currentEventType && (
        <div className="self-center pointer-events-auto px-3.5 py-1 rounded-full bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">{currentEventType}</span>
          {currentEventPlayer && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{currentEventPlayer}</span>
            </>
          )}
        </div>
      )}
    </header>
  );
};
