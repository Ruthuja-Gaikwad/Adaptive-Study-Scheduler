import { Timer } from 'lucide-react';

export function SharedWaypoints({ items }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-[#1c2231] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Shared Waypoints</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Today&apos;s Squad Tasks</h3>
          <p className="mt-1 text-sm text-slate-400">Aligned checkpoints for everyone</p>
        </div>
        <div className="rounded-xl bg-amber-400/10 p-2 text-amber-300">
          <Timer className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-slate-800/70 bg-[#20273a] px-4 py-3 text-sm text-slate-300"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-900 text-indigo-400 accent-indigo-400"
              defaultChecked={item.done}
            />
            <div>
              <p className={`font-semibold ${item.done ? 'text-slate-500 line-through' : 'text-white'}`}>
                {item.title}
              </p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
