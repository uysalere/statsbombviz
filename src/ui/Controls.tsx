import React from 'react';
import { FastForward, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentIndex: number;
  totalEvents: number;
  onSeek: (index: number) => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  goalIndices: number[];
  cardIndices: number[];
  shotIndices: number[];
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onTogglePlay,
  currentIndex,
  totalEvents,
  onSeek,
  onStepForward,
  onStepBackward,
  onReset,
  playbackSpeed,
  onSpeedChange,
  goalIndices
}) => {
  const speeds = [0.25, 0.5, 1.0, 2.0, 4.0];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-3xl pointer-events-none">
      <div className="pointer-events-auto p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-2xl backdrop-blur-xl flex flex-col gap-3">
        {/* Timeline Scrubber */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Event {currentIndex + 1} of {Math.max(1, totalEvents)}</span>
            <span>{Math.round(((currentIndex + 1) / Math.max(1, totalEvents)) * 100)}%</span>
          </div>

          <div className="relative w-full h-4 flex items-center group">
            {/* Scrubber Input */}
            <input
              type="range"
              min={0}
              max={Math.max(0, totalEvents - 1)}
              value={currentIndex}
              onChange={(e) => onSeek(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:h-2 transition-all z-10"
            />

            {/* Goal Markers */}
            {totalEvents > 0 &&
              goalIndices.map((idx) => {
                const pct = (idx / (totalEvents - 1)) * 100;
                return (
                  <div
                    key={`goal-${idx}`}
                    style={{ left: `${pct}%` }}
                    title={`Goal at Event #${idx}`}
                    className="absolute -top-1 w-2.5 h-3.5 bg-amber-400 rounded-sm shadow-[0_0_8px_rgba(251,191,36,0.9)] transform -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center text-[8px] font-black text-slate-950"
                  >
                    ⚽
                  </div>
                );
              })}
          </div>
        </div>

        {/* Playback Button Deck */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Main Transport Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onReset}
              title="Reset Simulation"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onStepBackward}
              title="Previous Event"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePlay}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={onStepForward}
              title="Next Event"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-slate-800">
            <FastForward className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  playbackSpeed === s
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
