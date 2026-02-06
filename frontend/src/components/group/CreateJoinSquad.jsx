import React, { useState } from 'react';
import { Globe, Plus, Shield, UserPlus, X } from 'lucide-react';
import { Button } from '../ui/button';

export function CreateJoinSquad({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('create');
  const [privacy, setPrivacy] = useState('public');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-join-squad-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-6 text-[14px] text-[#334155] shadow-xl dark:border-[#1E293B] dark:bg-[#0F172A] dark:text-slate-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Study Squad</p>
            <h2 id="create-join-squad-title" className="text-xl font-semibold text-slate-900 dark:text-white">
              Create or Join a Squad
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 border-b border-slate-200 text-sm dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-3 font-semibold transition ${activeTab === 'create' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            Create New Squad
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`pb-3 font-semibold transition ${activeTab === 'join' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            Join via Code
          </button>
        </div>

        {activeTab === 'create' ? (
          <div className="mt-6 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Squad Name
              </label>
              <input
                type="text"
                placeholder="e.g., Night Owls"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Target Exam
              </label>
              <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <option>UPSC</option>
                <option>JEE</option>
                <option>GATE</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Privacy
              </label>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${privacy === 'public' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                >
                  <Globe className="h-4 w-4" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${privacy === 'private' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                >
                  <Shield className="h-4 w-4" />
                  Private
                </button>
              </div>
            </div>

            <Button className="w-full">
              <Plus className="h-4 w-4" /> Generate Invite Link
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Invite Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <Button variant="secondary" className="w-full">
              <UserPlus className="h-4 w-4" /> Search for Squad
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
