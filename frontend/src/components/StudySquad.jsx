import React, { useEffect, useState } from 'react';
import { Users, BookOpen, MessageSquare, Trophy, CheckCircle2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CreateJoinSquad } from './group/CreateJoinSquad';
import { useDarkMode } from '../contexts/DarkModeContext';

const MemberAvatar = ({ name, status, avatar, isSyncing, isDarkMode }) => (
  <div className="flex flex-col items-center gap-1 group">
    <div
      className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold text-white
      ${status === 'focusing'
        ? `border-emerald-500 bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.35)]${isSyncing ? ' animate-pulse' : ''}`
        : status === 'break'
          ? 'border-amber-500 bg-amber-500/20'
          : isDarkMode
            ? 'border-slate-600 bg-slate-800 text-slate-100'
            : 'border-slate-300 bg-slate-200 text-slate-700'}`}
    >
      {avatar}
      {status === 'focusing' && (
        <span
          className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 bg-emerald-500 animate-pulse ${
            isDarkMode ? 'border-[#0F172A]' : 'border-white'
          }`}
        />
      )}
    </div>
    <span
      className={`text-[10px] ${
        isDarkMode
          ? 'text-slate-400 group-hover:text-slate-200'
          : 'text-slate-500 group-hover:text-slate-700'
      }`}
    >
      {name}
    </span>
  </div>
);

const SquadTaskItem = ({ title, usersCompleted, isDarkMode }) => (
  <div
    className={`flex items-center justify-between rounded-2xl border p-3 shadow-sm transition-all hover:shadow-md ${
      isDarkMode ? 'border-[#1E293B] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded border ${
          usersCompleted.length >= 2
            ? 'border-emerald-500 bg-emerald-500'
            : isDarkMode
              ? 'border-slate-600'
              : 'border-slate-300'
        }`}
      >
        {usersCompleted.length >= 2 && <CheckCircle2 size={12} className="text-white" />}
      </div>
      <span className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
        {title}
      </span>
    </div>
    <div className="flex -space-x-1.5">
      {usersCompleted.map((u) => (
        <div
          key={u}
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-emerald-500 text-[8px] font-bold text-white ${
            isDarkMode ? 'border-[#0F172A]' : 'border-white'
          }`}
        >
          {u}
        </div>
      ))}
    </div>
  </div>
);

const SharedTimer = ({ timeLabel, isActive, isDarkMode }) => (
  <div
    className={`flex items-center gap-3 rounded-3xl border px-4 py-3 shadow-sm ${
      isDarkMode ? 'border-[#1E293B] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <span
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${
          isDarkMode ? 'text-slate-300' : 'text-slate-500'
        }`}
      >
        Shared Timer
      </span>
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
          isDarkMode
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}
      >
        In Sync
      </span>
    </div>
    <div className="ml-auto flex items-center gap-2">
      <span className={`text-2xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>
        {timeLabel}
      </span>
      {isActive && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
    </div>
  </div>
);

export function StudySquad() {
  const { isDarkMode } = useDarkMode();
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);

  useEffect(() => {
    if (!isTimerActive) return undefined;
    if (secondsLeft <= 0) {
      setIsTimerActive(false);
      return undefined;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerActive, secondsLeft]);

  const handleSyncTimer = () => {
    setSecondsLeft(25 * 60);
    setIsTimerActive(true);
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const timeLabel = `${minutes}:${seconds}`;

  return (
    <div
      className={`mx-auto max-w-6xl space-y-8 p-4 text-[14px] ${
        isDarkMode ? 'bg-[#0F172A] text-slate-200' : 'bg-[#F8FAFC] text-slate-700'
      }`}
    >
      <div
        className={`flex flex-col gap-6 rounded-3xl border p-8 backdrop-blur-md ${
          isDarkMode
            ? 'border-[#1E293B] bg-[#0F172A]/70'
            : 'border-[#E2E8F0] bg-white/80'
        }`}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-500">
              <Users size={28} />
            </div>
            <div>
              <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-[#334155]'}`}>
                UPSC WARRIORS
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  4 Members Active in War Room
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="px-6" onClick={handleSyncTimer}>
              Sync Timer
            </Button>
            <Button
              variant="ghost"
              className={`px-4 ${
                isDarkMode
                  ? 'text-slate-300 hover:text-slate-100'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setIsSquadModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Create Squad
            </Button>
            <Button className="px-6">
              <MessageSquare size={18} /> Join Audio
            </Button>
          </div>
        </div>
        <SharedTimer timeLabel={timeLabel} isActive={isTimerActive} isDarkMode={isDarkMode} />
      </div>

      <div className="flex flex-wrap gap-8 px-2">
        <MemberAvatar name="You" status="focusing" avatar="Me" isSyncing={isTimerActive} isDarkMode={isDarkMode} />
        <MemberAvatar name="Rahul" status="focusing" avatar="RK" isDarkMode={isDarkMode} />
        <MemberAvatar name="Sneha" status="break" avatar="SP" isDarkMode={isDarkMode} />
        <MemberAvatar name="Amit" status="offline" avatar="AV" isDarkMode={isDarkMode} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className={`rounded-3xl border shadow-sm ${
            isDarkMode ? 'border-[#1E293B] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'
          }`}
        >
          <div className="mb-6 flex items-center gap-2">
            <BookOpen size={22} className="text-emerald-500" />
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-[#334155]'}`}>
              Current Focus: Indian Polity
            </h3>
          </div>
          <div className="space-y-3">
            <SquadTaskItem title="Fundamental Rights (Art 12-18)" usersCompleted={['Me', 'RK', 'SP']} isDarkMode={isDarkMode} />
            <SquadTaskItem title="Directive Principles" usersCompleted={['Me', 'RK']} isDarkMode={isDarkMode} />
            <SquadTaskItem title="Preamble Deep-dive" usersCompleted={['SP']} isDarkMode={isDarkMode} />
          </div>
        </Card>

        <Card
          className={`rounded-3xl border shadow-sm ${
            isDarkMode ? 'border-[#1E293B] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'
          }`}
        >
          <div className="mb-6 flex items-center gap-2">
            <Trophy size={22} className="text-amber-500" />
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-[#334155]'}`}>
              Squad XP
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Rahul K.', xp: '2.4k' },
              { name: 'You', xp: '1.8k' },
              { name: 'Sneha P.', xp: '1.2k' },
            ].map((u, i) => (
              <div key={u.name} className="flex items-center justify-between text-sm">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                  {i + 1}. {u.name}
                </span>
                <span className={`font-mono font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {u.xp}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          className={`rounded-3xl border shadow-sm ${
            isDarkMode ? 'border-[#1E293B] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'
          }`}
        >
          <div className="mb-6 flex items-center gap-2">
            <Trophy size={22} className="text-emerald-500" />
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-100' : 'text-[#334155]'}`}>
              Consistency Boost
            </h3>
          </div>
          <div className={`space-y-3 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <p>• 18-day squad streak active</p>
            <p>• 4 members synced today</p>
            <p>• Next checkpoint at 6:30 PM</p>
          </div>
        </Card>
      </div>

      <CreateJoinSquad isOpen={isSquadModalOpen} onClose={() => setIsSquadModalOpen(false)} />
    </div>
  );
}