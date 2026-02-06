const statusStyles = {
  focusing: {
    ring: 'ring-emerald-400/80',
    label: 'Focusing',
  },
  break: {
    ring: 'ring-amber-400/80',
    label: 'On Break',
  },
  offline: {
    ring: 'ring-slate-600/80',
    label: 'Offline',
  },
};

export function LiveSquadStatus({ members }) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-[#1c2231] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Live Squad Status
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {members.map((member) => {
            const status = statusStyles[member.status] ?? statusStyles.offline;
            return (
              <div key={member.id} className="flex items-center gap-2">
                <div className={`rounded-full ring-2 ${status.ring} bg-slate-800 px-3 py-2 text-[12px] font-semibold text-white`}>
                  {member.initials}
                </div>
                <div className="text-xs">
                  <div className="text-slate-200">{member.name}</div>
                  <div className="text-slate-500">{status.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
