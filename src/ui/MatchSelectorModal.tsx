import React, { useState } from 'react';
import { Dice5, ExternalLink, Link as LinkIcon, Search, Trophy, X } from 'lucide-react';
import { CURATED_MATCHES, RANDOM_GAME_IDS, STATSBOMB_BASE_URL } from '../data/curatedMatches';
import { MatchInfo } from '../types/statsbomb';

interface MatchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMatch: (match: MatchInfo) => void;
  onLoadCustomUrl: (url: string) => void;
  isLoading: boolean;
}

export const MatchSelectorModal: React.FC<MatchSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectMatch,
  onLoadCustomUrl,
  isLoading
}) => {
  const [search, setSearch] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const filteredMatches = CURATED_MATCHES.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.competition.toLowerCase().includes(search.toLowerCase()) ||
    m.homeTeam.toLowerCase().includes(search.toLowerCase()) ||
    m.awayTeam.toLowerCase().includes(search.toLowerCase())
  );

  const handleRandomMatch = () => {
    const randomId = RANDOM_GAME_IDS[Math.floor(Math.random() * RANDOM_GAME_IDS.length)];
    const existing = CURATED_MATCHES.find(m => String(m.id) === randomId);
    if (existing) {
      onSelectMatch(existing);
    } else {
      onLoadCustomUrl(`${STATSBOMB_BASE_URL}${randomId}.json`);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    try {
      const parsed = new URL(customUrl.trim());
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        setErrorMsg('');
        onLoadCustomUrl(customUrl.trim());
      } else {
        setErrorMsg('Please enter a valid HTTP/HTTPS URL.');
      }
    } catch (_) {
      setErrorMsg('Invalid URL format. Please paste a valid raw JSON URL.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Select Match</h2>
              <p className="text-xs text-slate-400">Choose a historic match or paste your own StatsBomb JSON</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by team, competition, tournament..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={handleRandomMatch}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-semibold text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition-all"
          >
            <Dice5 className="w-4 h-4" />
            <span>Random Match</span>
          </button>
        </div>

        {/* Match List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Curated Classic Matches ({filteredMatches.length})
          </div>

          {filteredMatches.map((match) => (
            <button
              key={match.id}
              onClick={() => onSelectMatch(match)}
              disabled={isLoading}
              className="w-full text-left p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-sky-500/50 transition-all flex items-center justify-between group active:scale-[0.99]"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 group-hover:text-sky-300 transition-colors">
                    {match.homeTeam} vs {match.awayTeam}
                  </span>
                  {match.homeScore !== undefined && match.awayScore !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono font-bold">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="text-sky-400 font-medium">{match.competition}</span>
                  {match.season && <span>• {match.season}</span>}
                  {match.date && <span>• {match.date}</span>}
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <ExternalLink className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        {/* Custom URL Input Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70">
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              Or Load Custom StatsBomb Open Data URL:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="submit"
                disabled={isLoading || !customUrl.trim()}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-xs transition-all active:scale-95"
              >
                Load
              </button>
            </div>
            {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};
