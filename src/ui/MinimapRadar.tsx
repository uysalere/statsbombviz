import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { ActivePlayerState } from '../types/statsbomb';

interface MinimapRadarProps {
  players: Record<number, ActivePlayerState>;
  ballPos: { x: number; z: number };
  homeTeamName: string;
  awayTeamName: string;
  activePlayerIds?: Set<number>;
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({
  players,
  ballPos,
  activePlayerIds
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Pitch aspect ratio is 120 : 80 = 1.5 : 1
  const mapWidth = isExpanded ? 240 : 160;
  const mapHeight = mapWidth / 1.5;

  // Convert centered 3D coords [-60..60, -40..40] to radar [0..mapWidth, 0..mapHeight]
  const toRadarX = (wx: number) => ((wx + 60) / 120) * mapWidth;
  const toRadarY = (wz: number) => ((wz + 40) / 80) * mapHeight;

  return (
    <div className="absolute top-20 right-4 z-20 pointer-events-auto">
      <div className="p-2 rounded-2xl bg-slate-900/85 border border-slate-700/60 shadow-2xl backdrop-blur-md flex flex-col gap-1.5 transition-all">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tactical Radar</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-0.5"
            title={isExpanded ? 'Shrink' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>

        <svg
          width={mapWidth}
          height={mapHeight}
          className="rounded-lg bg-emerald-950/80 border border-emerald-700/40"
        >
          {/* Pitch Markings */}
          <rect x={1} y={1} width={mapWidth - 2} height={mapHeight - 2} fill="none" stroke="#22c55e" strokeWidth={0.8} opacity={0.5} />
          {/* Halfway line */}
          <line x1={mapWidth / 2} y1={0} x2={mapWidth / 2} y2={mapHeight} stroke="#22c55e" strokeWidth={0.8} opacity={0.5} />
          {/* Center Circle */}
          <circle cx={mapWidth / 2} cy={mapHeight / 2} r={mapHeight * 0.15} fill="none" stroke="#22c55e" strokeWidth={0.8} opacity={0.5} />

          {/* Left Penalty Box */}
          <rect x={0} y={mapHeight * 0.22} width={mapWidth * 0.15} height={mapHeight * 0.56} fill="none" stroke="#22c55e" strokeWidth={0.8} opacity={0.5} />
          {/* Right Penalty Box */}
          <rect x={mapWidth * 0.85} y={mapHeight * 0.22} width={mapWidth * 0.15} height={mapHeight * 0.56} fill="none" stroke="#22c55e" strokeWidth={0.8} opacity={0.5} />

          {/* Players */}
          {Object.values(players).map((p) => {
            const rx = toRadarX(p.x);
            const ry = toRadarY(p.y);
            const color = p.isHome ? '#38bdf8' : '#f43f5e';
            const inAction = !activePlayerIds || activePlayerIds.has(p.id);

            return (
              <circle
                key={`radar-${p.id}`}
                cx={rx}
                cy={ry}
                r={inAction ? (isExpanded ? 4 : 2.8) : (isExpanded ? 2.2 : 1.5)}
                fill={color}
                opacity={inAction ? 1.0 : 0.25}
                stroke={inAction ? '#ffffff' : '#0f172a'}
                strokeWidth={inAction ? 1 : 0.5}
                className={inAction ? 'transition-all duration-300' : ''}
              />
            );
          })}

          {/* Ball */}
          <circle
            cx={toRadarX(ballPos.x)}
            cy={toRadarY(ballPos.z)}
            r={isExpanded ? 3.5 : 2.5}
            fill="#ffffff"
            stroke="#fbbf24"
            strokeWidth={1.2}
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
};
