import { Zap } from 'lucide-react';

export function ConsistencyLeaderboard({ entries }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-[#1c2231] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Consistency Leaderboard</p>
          <h3 className="mt-2 text-lg font-semibold text-white">XP Earned Today</h3>
          <p className="mt-1 text-sm text-slate-400">Top focus contributors</p>
        </div>
        <div className="rounded-xl bg-teal-400/10 p-2 text-teal-300">
          <Zap className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-[#20273a] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                {entry.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{entry.name}</p>
                <p className="text-xs text-slate-500">#{index + 1} today</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald-300">{entry.xp} XP</p>
              <p className="text-xs text-slate-500">{entry.sessions} sessions</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
