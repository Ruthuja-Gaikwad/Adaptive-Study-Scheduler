import { Users } from 'lucide-react';

export function SquadHeader({ groupName, onJoinVoice, onSyncPomodoro }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-300">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Group Study Squad</p>
          <h1 className="text-2xl font-semibold text-white">{groupName}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Coordinate focus, keep the streak alive, and conquer today&apos;s goals.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onJoinVoice}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
        >
          Join Voice Room
        </button>
        <button
          type="button"
          onClick={onSyncPomodoro}
          className="rounded-lg border border-indigo-400/60 px-4 py-2 text-[13px] font-semibold text-indigo-200 transition hover:border-indigo-300 hover:text-white"
        >
          Sync Pomodoro
        </button>
        <button
          type="button"
          className="px-3 py-2 text-[13px] font-semibold text-slate-400 transition hover:text-white"
        >
          Invite Squad
        </button>
      </div>
    </div>
  );
}
