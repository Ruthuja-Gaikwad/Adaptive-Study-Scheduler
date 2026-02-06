export function ActivityFeed({ events }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800/80 bg-[#1c2231] p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Activity Feed</p>
        <h3 className="mt-2 text-lg font-semibold text-white">Live Squad Events</h3>
        <p className="mt-1 text-sm text-slate-400">Real-time updates from the squad</p>
      </div>

      <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-slate-800/70 bg-[#20273a] px-4 py-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{event.time}</span>
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                {event.tag}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-200">{event.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
