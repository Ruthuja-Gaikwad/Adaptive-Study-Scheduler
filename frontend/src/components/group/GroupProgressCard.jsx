import { BookOpen } from 'lucide-react';
import { Progress } from '../ui/progress';

export function GroupProgressCard({ subject, completed, total, highlight }) {
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#1c2231] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Group Progress</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{subject}</h3>
          <p className="mt-1 text-sm text-slate-400">Shared syllabus completion</p>
        </div>
        <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-300">
          <BookOpen className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Covered {completed} modules</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="mt-3 h-2.5 bg-slate-800" />
        <p className="mt-3 text-xs text-slate-500">Next up: {highlight}</p>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
        <span>Daily target: 2 modules</span>
        <span className="font-semibold text-white">On track</span>
      </div>
    </div>
  );
}
