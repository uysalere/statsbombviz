import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface GoalOverlayProps {
  isVisible: boolean;
  scorerName?: string;
  teamName?: string;
  minute?: number;
}

export const GoalOverlay: React.FC<GoalOverlayProps> = ({
  isVisible,
  scorerName,
  teamName,
  minute
}) => {
  useEffect(() => {
    if (isVisible) {
      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#38bdf8', '#f59e0b', '#10b981', '#f43f5e', '#ffffff']
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center animate-in zoom-in-90 fade-in duration-300">
      <div className="p-8 rounded-3xl bg-slate-950/90 border-2 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.6)] backdrop-blur-xl flex flex-col items-center gap-3 text-center transform scale-110">
        <div className="text-5xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-md">
          GOAL!
        </div>
        {scorerName && (
          <div className="text-xl sm:text-2xl font-bold text-slate-100">
            {scorerName}
          </div>
        )}
        <div className="text-xs sm:text-sm font-semibold text-amber-400 uppercase tracking-widest">
          {teamName} {minute !== undefined && `• ${minute}'`}
        </div>
      </div>
    </div>
  );
};
