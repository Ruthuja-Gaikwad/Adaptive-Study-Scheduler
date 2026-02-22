import React, { useEffect, useState } from 'react';
import { Globe, Plus, Shield, UserPlus, X, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabaseClient';
import { useSessionBootstrap } from '../../contexts/SessionBootstrapContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

const SQUAD_ROLE_OPTIONS = {
  project: ['Architect', 'Coder', 'Designer', 'Researcher'],
  study: ['Sage', 'Scholar', 'Note-taker', 'Quiz-master'],
};

const getDefaultRole = (type) => (type === 'project' ? 'Architect' : 'Sage');

export function CreateJoinSquad({ isOpen, onClose, onSquadChange }) {
  const { sessionUser, isSessionLoading } = useSessionBootstrap();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  const [privacy, setPrivacy] = useState('public');
  const [loading, setLoading] = useState(false);
  const [squadType, setSquadType] = useState('study');
  const [createRole, setCreateRole] = useState(getDefaultRole('study'));
  const [joinRole, setJoinRole] = useState(getDefaultRole('study'));
  const [joinSquadType, setJoinSquadType] = useState('');
  const [joinSquadId, setJoinSquadId] = useState(null);
  const [isFetchingJoinSquad, setIsFetchingJoinSquad] = useState(false);

  // Create tab states
  const [squadName, setSquadName] = useState('');
  const [studyGoal, setStudyGoal] = useState('');
  const [generatedInviteCode, setGeneratedInviteCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Join tab state
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const nextDefault = getDefaultRole(squadType);
    if (!SQUAD_ROLE_OPTIONS[squadType]?.includes(createRole)) {
      setCreateRole(nextDefault);
    }
  }, [squadType, createRole]);

  useEffect(() => {
    if (!joinSquadType) return;
    const nextDefault = getDefaultRole(joinSquadType);
    if (!SQUAD_ROLE_OPTIONS[joinSquadType]?.includes(joinRole)) {
      setJoinRole(nextDefault);
    }
  }, [joinSquadType, joinRole]);

  useEffect(() => {
    const trimmed = inviteCode.trim();
    if (trimmed.length !== 6) {
      setJoinSquadType('');
      setJoinSquadId(null);
      return;
    }

    let isActive = true;
    const fetchSquadMeta = async () => {
      setIsFetchingJoinSquad(true);
      try {
        const { data, error } = await supabase
          .from('squads')
          .select('id, squad_type')
          .eq('invite_code', trimmed.toUpperCase())
          .maybeSingle();

        if (error) {
          console.error('[SQUAD_JOIN] Error fetching squad type:', error.message);
          if (isActive) {
            setJoinSquadType('');
            setJoinSquadId(null);
          }
          return;
        }

        if (isActive) {
          setJoinSquadType((data?.squad_type || 'study').toLowerCase());
          setJoinSquadId(data?.id || null);
        }
      } catch (err) {
        console.error('[SQUAD_JOIN] Error fetching squad type:', err);
        if (isActive) {
          setJoinSquadType('');
          setJoinSquadId(null);
        }
      } finally {
        if (isActive) {
          setIsFetchingJoinSquad(false);
        }
      }
    };

    fetchSquadMeta();
    return () => {
      isActive = false;
    };
  }, [inviteCode]);

  const updateMemberRole = async (squadId, role) => {
    if (!squadId || !role || !sessionUser?.id) return;
    const { error } = await supabase
      .from('squad_members')
      .update({ role })
      .eq('student_id', sessionUser.id)
      .eq('squad_id', squadId);

    if (error) {
      console.error('[SQUAD_ROLE] Error updating role:', error.message);
    }
  };

  // Copy invite code to clipboard
  const copyInviteCode = async () => {
    if (!generatedInviteCode) return;
    try {
      await navigator.clipboard.writeText(generatedInviteCode);
      setCopiedCode(true);
      toast.success('Invite code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy invite code');
    }
  };

  // Create Squad Logic using direct inserts instead of RPC
  const handleCreateSquad = async () => {
    if (!squadName.trim()) {
      toast.error('Please enter a squad name');
      return;
    }

    if (!sessionUser?.id) {
      toast.error('User not logged in');
      return;
    }

    setLoading(true);
    try {
      console.log('[SQUAD_CREATE] Creating squad:', { squadName, studyGoal, privacy, squadType });

      // Call RPC function to create squad and add user
      const { data, error } = await supabase.rpc('create_and_join_squad', {
        p_squad_name: squadName,
        p_study_goal: studyGoal || `${squadName} Study Session`,
        p_creator_id: sessionUser.id,
        p_squad_type: squadType,
      });

      if (error) {
        console.error('[SQUAD_CREATE] Error creating squad:', error);
        toast.error(`Failed to create squad: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log('[SQUAD_CREATE] ✅ Squad created via RPC:', data);
      onSquadChange?.();

      const createdSquadId = data?.squad_id || data?.id || data?.squad?.id || null;
      if (createdSquadId) {
        await updateMemberRole(createdSquadId, createRole);
      } else {
        const { data: memberData } = await supabase
          .from('squad_members')
          .select('squad_id')
          .eq('student_id', sessionUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memberData?.squad_id) {
          await updateMemberRole(memberData.squad_id, createRole);
        }
      }

      // Extract invite code from RPC response
      const inviteCode = data?.invite_code || Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedInviteCode(inviteCode);
      toast.success(`Squad "${squadName}" created! Invite code: ${inviteCode}`);
    } catch (err) {
      console.error('[SQUAD_CREATE] Error:', err);
      toast.error('Failed to create squad');
    } finally {
      setLoading(false);
    }
  };

  // Proceed to squad after invite code is generated
  const handleProceedToSquad = () => {
    setSquadName('');
    setStudyGoal('');
    setPrivacy('public');
    setSquadType('study');
    setCreateRole(getDefaultRole('study'));
    setGeneratedInviteCode(null);
    onClose();
    navigate('/study-squad');
  };

  // Join Squad Logic
  const handleJoinSquad = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    if (!joinRole) {
      toast.error('Please choose a role before joining');
      return;
    }

    if (!joinSquadType) {
      toast.error('Unable to determine squad type. Check the invite code.');
      return;
    }

    if (!sessionUser?.id) {
      toast.error('User not logged in');
      return;
    }

    setLoading(true);
    try {
      console.log('[SQUAD_JOIN] Joining squad with code:', inviteCode);

      // Call RPC function to join squad by code
      const { error } = await supabase.rpc('join_squad_by_code', {
        p_invite_code: inviteCode.toUpperCase(),
        p_student_id: sessionUser.id,
      });

      if (error) {
        console.error('[SQUAD_JOIN] Error joining squad:', error.message);
        toast.error(`Failed to join squad: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log('[SQUAD_JOIN] ✅ Successfully joined squad');
      if (joinSquadId) {
        await updateMemberRole(joinSquadId, joinRole);
      }
      onSquadChange?.();
      toast.success('Successfully joined the squad! 🎉');

      // Reset form and close modal
      setInviteCode('');
      setJoinRole(getDefaultRole(joinSquadType || 'study'));
      setJoinSquadType('');
      setJoinSquadId(null);
      onClose();

      // Redirect to StudySquad view
      navigate('/study-squad');
    } catch (err) {
      console.error('[SQUAD_JOIN] Error:', err);
      toast.error('Failed to join squad');
    } finally {
      setLoading(false);
    }
  };

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
            {generatedInviteCode ? (
              // Invite Code Display Screen
              <>
                <div className="rounded-2xl bg-indigo-50 p-6 text-center dark:bg-indigo-500/10">
                  <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">Your Squad Invite Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-300">
                      {generatedInviteCode}
                    </code>
                    <button
                      type="button"
                      onClick={copyInviteCode}
                      className={`rounded-lg p-2 transition ${
                        copiedCode
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {copiedCode ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    Share this code with friends to invite them to your squad
                  </p>
                </div>

                <Button className="w-full" onClick={handleProceedToSquad}>
                  Go to Squad
                </Button>
              </>
            ) : (
              // Squad Creation Form
              <>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Squad Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Night Owls"
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    disabled={loading}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {squadType === 'project' ? 'Project Milestone' : 'Study Goal / Description'}
                  </label>
                  <textarea
                    placeholder="e.g., Final Project Sprint, JEE Mocks, UPSC Current Affairs..."
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value)}
                    disabled={loading}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Your Role
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {SQUAD_ROLE_OPTIONS[squadType].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setCreateRole(role)}
                        disabled={loading}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${createRole === role ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Squad Type
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSquadType('project')}
                      disabled={loading}
                      className={`flex flex-1 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${squadType === 'project' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                    >
                      Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setSquadType('study')}
                      disabled={loading}
                      className={`flex flex-1 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${squadType === 'study' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                    >
                      Study Group
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Privacy
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPrivacy('public')}
                      disabled={loading}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${privacy === 'public' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                    >
                      <Globe className="h-4 w-4" />
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrivacy('private')}
                      disabled={loading}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${privacy === 'private' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                    >
                      <Shield className="h-4 w-4" />
                      Private
                    </button>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={handleCreateSquad}
                  disabled={loading || isSessionLoading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Create Squad & Generate Invite Link
                    </>
                  )}
                </Button>
              </>
            )}
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
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={loading}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Your Role
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(SQUAD_ROLE_OPTIONS[joinSquadType || 'study'] || SQUAD_ROLE_OPTIONS.study).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setJoinRole(role)}
                    disabled={loading || isFetchingJoinSquad}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${joinRole === role ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-[11px] ${isFetchingJoinSquad ? 'text-amber-500' : 'text-slate-400'}`}>
                {isFetchingJoinSquad
                  ? 'Detecting squad type...'
                  : joinSquadType
                    ? `Squad type: ${joinSquadType === 'project' ? 'Project' : 'Study Group'}`
                    : 'Enter invite code to detect squad type.'}
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleJoinSquad}
              disabled={loading || isSessionLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Join Squad
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
