import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Zap, AlertTriangle, Radio, Cpu, Loader2, CircleDot, BookOpen, Plus, MessageSquare, Clock, Send, X, Download, ExternalLink, FileText, Activity, Image } from 'lucide-react';
import { Button } from './ui/button';
import { CreateJoinSquad } from './group/CreateJoinSquad';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../lib/supabaseClient';
import { useSessionBootstrap } from '../contexts/SessionBootstrapContext';
import { toast } from 'sonner';

// ============================================
// SUBTLE BACKGROUND EFFECTS
// ============================================
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" stroke="currentColor" />
    </motion.svg>
  </div>
);

// ============================================
// MEMBER AVATAR WITH AUDIO STATUS
// ============================================
const TacticalMemberAvatar = ({ name, role, status, avatar, isSyncing, isAudioConnected }) => (
  <div className="flex flex-col items-center gap-2">
    {/* Avatar Circle */}
    <div
      className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-xs font-bold text-white transition-all`}
      style={{
        backgroundColor: status === 'focusing' ? '#10b981' : '#374151',
        borderColor: status === 'focusing' ? '#34d399' : '#4b5563',
      }}
    >
      {avatar}
      {status === 'focusing' && (
        <span
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 animate-pulse"
          style={{ backgroundColor: '#10b981', borderColor: '#111827' }}
        />
      )}
      {/* Audio Waveform Indicator */}
      {isAudioConnected && (
        <span className="absolute -bottom-1 -right-1 flex items-center gap-px bg-indigo-500 rounded-full px-1 py-0.5 border border-gray-800">
          <span className="w-0.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDuration: '0.6s' }} />
          <span className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDuration: '0.4s', animationDelay: '0.1s' }} />
          <span className="w-0.5 h-1 bg-white rounded-full animate-pulse" style={{ animationDuration: '0.5s', animationDelay: '0.2s' }} />
        </span>
      )}
    </div>

    {/* Name Label */}
    <div className="text-center">
      <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>{name}</p>
    </div>
  </div>
);

// ============================================
// POWER CORE GAUGE (SQUAD XP)
// ============================================
const PowerCoreGauge = ({ squadXp, totalPossibleXp }) => {
  const percentage = totalPossibleXp ? Math.min((squadXp / totalPossibleXp) * 100, 100) : 0;

  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* SVG Circle */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="#374151" strokeWidth="2" />

        {/* Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#6366F1"
          strokeWidth="2.5"
          strokeDasharray={`${(percentage / 100) * 264} 264`}
          strokeLinecap="round"
          style={{ transformOrigin: '50px 50px', transform: 'rotate(-90deg)' }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xl font-bold" style={{ color: '#6366F1' }}>
          {Math.round(percentage)}%
        </p>
        <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#9ca3af' }}>Sync</p>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export function StudySquad() {
  const { isDarkMode } = useDarkMode();
  const { sessionUser, isSessionLoading } = useSessionBootstrap();
  const [squad, setSquad] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [sharedTasksLoading, setSharedTasksLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // New feature states
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showArchives, setShowArchives] = useState(false);
  const [archiveItems, setArchiveItems] = useState([
    { id: 1, name: 'Study Guide - Chapter 3.pdf', type: 'pdf', url: '#', uploadedBy: 'Alice', date: '2h ago' },
    { id: 2, name: 'Mind Map - Calculus.png', type: 'image', url: '#', uploadedBy: 'David', date: '3h ago' },
    { id: 3, name: 'Lecture Notes - Week 5.pdf', type: 'pdf', url: '#', uploadedBy: 'Bob', date: '5h ago' },
    { id: 4, name: 'Khan Academy - Calculus', type: 'link', url: 'https://khanacademy.org', uploadedBy: 'Carol', date: '1d ago' },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef(null);

  const sortSharedTasks = (items) =>
    [...items].sort((a, b) => {
      const aTime = new Date(a?.created_at || 0).getTime();
      const bTime = new Date(b?.created_at || 0).getTime();
      return bTime - aTime;
    });

  const isGroupObjectiveTask = (task) => task?.student_id == null && task?.user_id == null;

  // Fetch squad and members
  useEffect(() => {
    if (isSessionLoading || !sessionUser?.id) return;

    let realtimeChannel;
    let tasksChannel;

    const fetchSharedTasks = async (squadId) => {
      try {
        setSharedTasksLoading(true);
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('squad_id', squadId)
          .order('created_at', { ascending: false });

        console.log('[SQUAD] Tasks Data:', { data, error });

        if (error) throw error;
        setSharedTasks(sortSharedTasks(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error('[SQUAD] Error fetching tasks:', err);
        setSharedTasks([]);
      } finally {
        setSharedTasksLoading(false);
      }
    };

    const fetchChatMessages = async (squadId) => {
      try {
        const { data, error } = await supabase
          .from('squad_messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            profiles!squad_messages_sender_id_fkey(full_name)
          `)
          .eq('squad_id', squadId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        const formattedMessages = (data || []).map((msg) => ({
          id: msg.id,
          sender: msg.profiles?.full_name || 'Squad Member',
          text: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: msg.sender_id === sessionUser?.id,
        }));
        
        setChatMessages(formattedMessages);
      } catch (err) {
        console.error('[SQUAD] Error fetching messages:', err);
        setChatMessages([]);
      }
    };

    const fetchSquadData = async () => {
      try {
        setLoading(true);

        const { data: membership, error: membershipError } = await supabase
          .from('squad_members')
          .select('squad_id')
          .eq('student_id', sessionUser.id)
          .limit(1)
          .maybeSingle();

        console.log('[SQUAD] Membership Check:', { membership, membershipError });

        if (membershipError || !membership?.squad_id) {
          console.warn('[SQUAD] No membership found or RLS denied:', membershipError);
          setSquad(null);
          setMembers([]);
          setSharedTasks([]);
          setLoading(false);
          return;
        }

        const squadId = membership.squad_id;
        console.log('[SQUAD] Found squad ID:', squadId);

        const { data: squadData, error: squadError } = await supabase
          .from('squads')
          .select('*')
          .eq('id', squadId)
          .single();

        if (squadError) {
          console.error('[SQUAD] Squad fetch error:', squadError);
          throw squadError;
        }
        console.log('[SQUAD] Squad data:', squadData);
        setSquad(squadData);

        const { data: membersData, error: membersError } = await supabase
          .from('squad_members')
          .select(`
            id,
            student_id,
            role,
            is_on_frequency,
            current_session_xp,
            profiles!squad_members_student_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('squad_id', squadId)
          .order('current_session_xp', { ascending: false });

        console.log('[SQUAD] Members Data:', { membersData, membersError });

        if (membersError) {
          console.error('[SQUAD] Members fetch error (likely RLS):', membersError);
        } else if (membersData && membersData.length > 0) {
          const formattedMembers = membersData.map(m => ({
            ...m,
            full_name: m.profiles?.full_name || 'Anonymous Student',
            avatar_url: m.profiles?.avatar_url
          }));
          console.log('[SQUAD] Formatted members:', formattedMembers);
          setMembers(formattedMembers);
        } else {
          console.warn('[SQUAD] No members returned');
          setMembers([]);
        }

        await fetchSharedTasks(squadId);
        await fetchChatMessages(squadId);
        setLoading(false);
      } catch (err) {
        console.error('[SQUAD] Error fetching squad:', err);
        setLoading(false);
      }
    };

    fetchSquadData();

    return () => {
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
      if (tasksChannel) supabase.removeChannel(tasksChannel);
    };
  }, [isSessionLoading, sessionUser]);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerActive || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          toast.info('⏱️ Timer completed!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, secondsLeft]);

  // Automatic snap to bottom for chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Realtime listener for messages and audio presence
  useEffect(() => {
    if (!squad?.id) return;

    console.log('[SQUAD] Setting up realtime subscriptions for squad:', squad.id);

    const channel = supabase
      .channel(`squad_room_${squad.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public',
          table: 'squad_messages',
          filter: `squad_id=eq.${squad.id}`
        },
        (payload) => {
          console.log('[SQUAD] New message received:', payload);
          const newMessage = {
            id: payload.new.id,
            sender: sessionUser?.id === payload.new.sender_id 
              ? (sessionUser?.user_metadata?.full_name || 'You')
              : 'Squad Member',
            text: payload.new.content,
            timestamp: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: payload.new.sender_id === sessionUser?.id,
          };
          setChatMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public',
          table: 'squad_members',
          filter: `squad_id=eq.${squad.id}`
        },
        (payload) => {
          console.log('[SQUAD] Member update received:', payload);
          setMembers(prev => {
            const updated = prev.map(m => {
              if (m.id === payload.new.id) {
                return {
                  ...payload.new,
                  full_name: payload.new.profiles?.full_name || m.full_name,
                  avatar_url: payload.new.profiles?.avatar_url || m.avatar_url
                };
              }
              return m;
            });
            console.log('[SQUAD] Members updated:', updated);
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public',
          table: 'tasks',
          filter: `squad_id=eq.${squad.id}`
        },
        (payload) => {
          console.log('[SQUAD] New task received:', payload);
          setSharedTasks(prev => sortSharedTasks([payload.new, ...prev]));
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public',
          table: 'tasks',
          filter: `squad_id=eq.${squad.id}`
        },
        (payload) => {
          console.log('[SQUAD] Task update received:', payload);
          setSharedTasks(prev => 
            prev.map(t => t.id === payload.new.id ? payload.new : t)
          );
        }
      )
      .subscribe((status) => {
        console.log('[SQUAD] Subscription status:', status);
      });

    return () => {
      console.log('[SQUAD] Cleaning up realtime subscriptions');
      supabase.removeChannel(channel);
    };
  }, [squad?.id, sessionUser?.id]);

  const handleTaskComplete = async (taskId) => {
    if (!taskId) return;
    setCompletingTaskId(taskId);
    try {
      const { error } = await supabase.from('tasks').update({ is_completed: true }).eq('id', taskId);
      if (error) throw error;
      toast.success('✓ Mission Accomplished');
    } catch (err) {
      console.error('[SQUAD] Error completing task:', err);
      toast.error('Failed to execute mission');
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleSyncTimer = async () => {
    if (!squad?.id) {
      toast.error('Squad not found');
      return;
    }

    setIsSyncing(true);
    try {
      console.log('[SQUAD] Syncing timer via webhook for squad:', squad.id);

      const response = await fetch('http://localhost:5678/webhook-test/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'squad_sync',
          squad_id: squad.id,
          squad_type: squad.squad_type,
        }),
      });

      if (!response.ok) throw new Error(`Webhook error: ${response.status}`);
      toast.success('⏱️ Timer synced for the squad!');

      // Reset local timer
      setSecondsLeft(25 * 60);
      setIsTimerActive(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[SQUAD] Timer sync error:', message);
      toast.error(`Sync failed: ${message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSquadSync = async () => {
    if (!squad?.id) {
      toast.error('No squad found');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('http://localhost:5678/webhook-test/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squad_id: squad.id, squad_type: squad.squad_type, description: squad.description }),
      });

      if (!response.ok) throw new Error('Webhook failed');
      toast.success('◈ Tactical Sprints Generated - Standing By');
    } catch (err) {
      toast.error('◈ Generation Failed - Retrying...');
      console.error('[SQUAD] Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !squad?.id || !sessionUser?.id) return;
    
    const messageText = chatInput;
    setChatInput(''); // Clear input immediately for better UX
    
    try {
      const { error } = await supabase
        .from('squad_messages')
        .insert({
          squad_id: squad.id,
          sender_id: sessionUser.id,
          content: messageText,
        });
      
      if (error) throw error;
      // Message will appear via realtime listener
    } catch (err) {
      console.error('[SQUAD] Error sending message:', err);
      toast.error('Failed to send message');
      setChatInput(messageText); // Restore message on error
    }
  };

  const toggleAudioConnection = async () => {
    if (!squad?.id || !sessionUser?.id) {
      console.warn('[SQUAD] Cannot toggle audio - missing squad or session:', { squadId: squad?.id, sessionUserId: sessionUser?.id });
      toast.error('Please join a squad first');
      return;
    }

    // Find current member
    const currentMember = members.find(m => m.student_id === sessionUser.id);
    console.log('[SQUAD] Toggle audio - current member:', currentMember, 'all members:', members);
    
    if (!currentMember) {
      console.error('[SQUAD] Current user not found in members list');
      toast.error('Member not found');
      return;
    }

    const newStatus = !currentMember.is_on_frequency;
    console.log('[SQUAD] Toggling frequency:', { old: currentMember.is_on_frequency, new: newStatus });
    
    const { error } = await supabase
      .from('squad_members')
      .update({ is_on_frequency: newStatus })
      .eq('squad_id', squad.id)
      .eq('student_id', sessionUser.id);

    if (!error) {
      console.log('[SQUAD] Frequency toggled successfully');
      toast.success(newStatus ? '📡 Frequency synced' : '📡 Disconnected');
      
      // Update local state
      setMembers(prev => 
        prev.map(m => 
          m.student_id === sessionUser.id 
            ? { ...m, is_on_frequency: newStatus } 
            : m
        )
      );

      // Add system message to chat
      const userName = sessionUser?.user_metadata?.full_name || 'Squad Member';
      const systemMessage = {
        id: Date.now(),
        sender: '🔔 System',
        text: newStatus 
          ? `${userName} has joined the frequency 📡` 
          : `${userName} has left the frequency`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        isSystem: true,
      };
      setChatMessages(prev => [...prev, systemMessage]);
    } else {
      console.error('[SQUAD] Audio toggle error:', error);
      toast.error('Failed to update frequency status');
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    if (!squad?.id) {
      toast.error('Please join a squad first');
      return;
    }

    setUploading(true);
    const uploadedFiles = [];

    try {
      for (const file of files) {
        // Validate file type - accept PDFs and images
        const isPDF = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');
        
        if (!isPDF && !isImage) {
          toast.error(`${file.name} is not a PDF or image file`);
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        const fileName = `${squad.id}/${Date.now()}-${file.name}`;

        console.log('[LIBRARY] Uploading to bucket: SQUAD-ASSETS, path:', fileName);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('squad-assets')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error('[LIBRARY] Upload error details:', {
            message: error.message,
            statusCode: error.statusCode,
            name: error.name,
            bucketAttempted: 'SQUAD-ASSETS'
          });
          
          // More user-friendly error messages
          if (error.message.includes('Bucket not found')) {
            toast.error('Storage bucket not found. Please check Supabase configuration.');
          } else if (error.message.includes('permission denied')) {
            toast.error('Permission denied. Check storage policies.');
          } else {
            toast.error(`Failed to upload ${file.name}`);
          }
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('squad-assets')
          .getPublicUrl(fileName);

        // Determine file type
        let fileType = 'link';
        if (isPDF) {
          fileType = 'pdf';
        } else if (isImage) {
          fileType = 'image';
        }

        // Add to archive items
        const newItem = {
          id: Date.now() + uploadedFiles.length,
          name: file.name,
          type: fileType,
          url: urlData.publicUrl,
          uploadedBy: sessionUser?.user_metadata?.full_name || 'You',
          date: 'Just now',
        };

        uploadedFiles.push(newItem);
      }

      if (uploadedFiles.length > 0) {
        setArchiveItems([...uploadedFiles, ...archiveItems]);
        toast.success(`📚 Uploaded ${uploadedFiles.length} file(s) to Library`);
      }
    } catch (err) {
      console.error('[LIBRARY] Upload error:', err);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };

  if (!squad && !loading) {
    const bgColor = isDarkMode ? '#111827' : '#F8FAFC';
    const textColor = isDarkMode ? '#f9fafb' : '#0f172a';
    const accentColor = '#6366F1';
    
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        <div className="absolute inset-0 opacity-20">
          <GridBackground />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center z-10 p-8">
          <p className="text-lg font-semibold mb-6" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
            No active squad detected
          </p>
          <Button
            onClick={() => setIsSquadModalOpen(true)}
            className="font-semibold shadow-sm"
            style={{ backgroundColor: accentColor, color: '#ffffff' }}
          >
            Join or Create Squad
          </Button>
          <CreateJoinSquad isOpen={isSquadModalOpen} onClose={() => setIsSquadModalOpen(false)} />
        </motion.div>
      </div>
    );
  }

  const groupObjectives = sharedTasks.filter((task) => isGroupObjectiveTask(task));
  const alertMessage = sharedTasks.find((t) => t.reroute_reason)?.reroute_reason;
  const totalPossibleXp = sharedTasks.reduce((sum, t) => sum + (t.xp_reward || 0), 0);
  const completedXp = sharedTasks.filter((t) => t.is_completed).reduce((sum, t) => sum + (t.xp_reward || 0), 0);
  const xpPercentage = totalPossibleXp ? Math.min((completedXp / totalPossibleXp) * 100, 100) : 0;

  // Determine squad type color - Soft Indigo Theme
  const squadTypeColor = squad?.squad_type === 'Sage' ? 'indigo' : 'teal';
  const accentColor = squadTypeColor === 'indigo' ? '#6366F1' : '#006D77';
  const accentColorLight = squadTypeColor === 'indigo' ? '#818CF8' : '#0891B2';
  const borderColor = isDarkMode ? '#374151' : '#e2e8f0';
  const textColorClass = squadTypeColor === 'indigo' 
    ? 'text-indigo-400' 
    : 'text-teal-500';
  const bgCardColor = isDarkMode ? '#1f2937' : '#ffffff';
  const bgMainColor = isDarkMode ? '#111827' : '#F8FAFC';

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: bgMainColor, color: isDarkMode ? '#f9fafb' : '#0f172a' }}>
      {/* Subtle Background Grid - Reduced Opacity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <GridBackground />
      </div>

      {/* Main Layout: Asymmetrical Grid */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* TOP HEADER - THE HUD */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 border-b shadow-sm"
          style={{ backgroundColor: bgCardColor, borderColor: borderColor }}
        >
          {/* Squad Name */}
          <div className="flex items-center gap-3">
            <Radio className={`h-4 w-4 ${textColorClass}`} style={{ color: accentColor }} />
            <p className="text-xl font-semibold" style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}>
              {squad?.name || 'Squad'}
            </p>
          </div>

          {/* XP Progress Bar - Horizontal */}
          <div className="flex-1 mx-8 relative">
            <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDarkMode ? '#4b5563' : '#e2e8f0' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>
            <p className="text-[10px] text-right mt-1" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
              {completedXp}/{totalPossibleXp} XP
            </p>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2 mx-4">
            <Clock className="h-4 w-4" style={{ color: accentColor }} />
            <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}>
              {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
            </p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
            <span className="text-xs font-medium" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>Online</span>
          </div>
        </motion.div>

        {/* MAIN CONTENT GRID */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT SIDEBAR - THE ROSTER */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-28 border-r p-4 flex flex-col gap-4 overflow-y-auto"
            style={{ backgroundColor: bgCardColor, borderColor: borderColor }}
          >
            <p className="text-[9px] uppercase tracking-wider font-semibold text-center mb-2" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
              Roster
            </p>
            {members.map((member) => (
              <TacticalMemberAvatar
                key={member.id}
                name={member.full_name?.slice(0, 6) || 'USER'}
                role={member.role}
                status="offline"
                avatar={member.full_name?.slice(0, 2).toUpperCase() || 'U'}
                isSyncing={false}
                isAudioConnected={member.is_on_frequency}
              />
            ))}
            
            {/* Audio Frequency Panel */}
            <div className="mt-6 pt-4 border-t" style={{ borderColor: borderColor }}>
              <p className="text-[9px] uppercase tracking-wider font-semibold text-center mb-3" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
                Frequency
              </p>
              <div className="space-y-2">
                {/* Current User Audio Toggle */}
                {sessionUser?.id && members.length > 0 && (
                  <button
                    onClick={toggleAudioConnection}
                    className="w-full flex items-center justify-between p-2 rounded-lg border transition-all hover:scale-105"
                    style={{
                      backgroundColor: members.find(m => m.student_id === sessionUser?.id)?.is_on_frequency
                        ? (isDarkMode ? '#312e81' : '#eef2ff')
                        : 'transparent',
                      borderColor: members.find(m => m.student_id === sessionUser?.id)?.is_on_frequency
                        ? '#6366F1'
                        : borderColor,
                    }}
                  >
                    <span className="text-[9px] font-semibold truncate" style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>
                      You
                    </span>
                    {members.find(m => m.student_id === sessionUser?.id)?.is_on_frequency && (
                      <Activity className="h-3 w-3 text-indigo-500 animate-pulse" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* CENTER - THE COMBAT LOG (Terminal-Style List) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {/* Commander's Directive Alert */}
            {alertMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: isDarkMode ? '#881337' : '#ffe4e6',
                  borderColor: isDarkMode ? '#be123c' : '#fda4af',
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: isDarkMode ? '#fda4af' : '#be123c' }} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: isDarkMode ? '#fda4af' : '#be123c' }}>
                      Commander's Directive
                    </p>
                    <p className="text-sm font-medium" style={{ color: isDarkMode ? '#fecdd3' : '#881337' }}>{alertMessage}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tactical Sprints Header with Utility Buttons */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
                  Tactical Sprints
                </p>
                <p className="text-xl font-semibold mt-1" style={{ color: isDarkMode ? '#f9fafb' : '#0f172a' }}>
                  {sharedTasks.length} Missions Active
                </p>
              </div>
              
              {/* Utility Button Bar */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSyncTimer}
                  disabled={isSyncing}
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold border"
                  style={{
                    borderColor: borderColor,
                    color: accentColor,
                  }}
                >
                  {isSyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Clock className="h-3 w-3 mr-1" /> Sync Timer</>}
                </Button>
                
                <Button
                  onClick={handleSquadSync}
                  disabled={isSyncing}
                  size="sm"
                  className="text-xs font-semibold"
                  style={{
                    backgroundColor: accentColor,
                    color: '#ffffff',
                  }}
                >
                  {isSyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Generate Sprints'}
                </Button>
                
                <Button
                  onClick={() => setShowArchives(true)}
                  size="sm"
                  className="text-xs font-semibold border"
                  style={{
                    borderColor: accentColor,
                    backgroundColor: 'transparent',
                    color: accentColor,
                  }}
                >
                  <BookOpen className="h-3 w-3 mr-1" /> Access Archives
                </Button>
                
                <Button
                  onClick={() => setIsSquadModalOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold border"
                  style={{
                    borderColor: borderColor,
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Create
                </Button>
              </div>
            </div>

            {/* Mission List */}
            {sharedTasksLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
              </div>
            ) : sharedTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 border rounded-xl"
                style={{ backgroundColor: isDarkMode ? '#1f2937' : '#F8FAFC', borderColor: borderColor }}
              >
                <p className="font-medium mb-6" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
                  No tactical sprints detected
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {sharedTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -2 }}
                    className={`rounded-xl border p-4 shadow-sm ${task.is_completed ? 'opacity-60' : ''}`}
                    style={{ backgroundColor: isDarkMode ? '#111827' : '#F8FAFC', borderColor: borderColor }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Task Info */}
                      <div className="flex-1 flex items-center gap-4">
                        {/* Status Dot */}
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: task.is_completed ? '#10b981' : accentColor,
                          }}
                        />

                        {/* Task Title */}
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: isDarkMode ? '#f3f4f6' : '#0f172a' }}>
                            {task.title}
                          </p>
                          {isGroupObjectiveTask(task) && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full border inline-block mt-1 font-semibold"
                              style={{
                                borderColor: isDarkMode ? '#7c3aed' : '#a78bfa',
                                backgroundColor: isDarkMode ? '#581c87' : '#f3e8ff',
                                color: isDarkMode ? '#e9d5ff' : '#6b21a8',
                              }}
                            >
                              Group Objective
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: XP & Action */}
                      <div className="flex items-center gap-4">
                        {task.xp_reward > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Zap size={14} className="text-[#FFB400]" />
                            <span className="text-sm font-semibold text-[#FFB400]">+{task.xp_reward}</span>
                          </div>
                        )}

                        <Button
                          onClick={() => handleTaskComplete(task.id)}
                          disabled={task.is_completed || completingTaskId === task.id}
                          size="sm"
                          className="text-xs font-semibold"
                          style={{
                            backgroundColor: task.is_completed ? (isDarkMode ? '#14532d' : '#dcfce7') : accentColor,
                            color: task.is_completed ? (isDarkMode ? '#86efac' : '#15803d') : '#ffffff',
                          }}
                        >
                          {completingTaskId === task.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : task.is_completed ? (
                            'Done'
                          ) : (
                            'Execute'
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT SIDEBAR - TACTICAL CHAT / DIAGNOSTICS TOGGLE */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-80 border-l flex flex-col overflow-hidden"
            style={{ backgroundColor: bgCardColor, borderColor: borderColor }}
          >
            {/* Toggle Header */}
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: borderColor }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChat(false)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded transition-all ${!showChat ? 'border' : 'opacity-50'}`}
                  style={{
                    borderColor: !showChat ? accentColor : 'transparent',
                    color: !showChat ? accentColor : (isDarkMode ? '#9ca3af' : '#475569'),
                  }}
                >
                  Diagnostics
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded transition-all ${showChat ? 'border' : 'opacity-50'}`}
                  style={{
                    borderColor: showChat ? accentColor : 'transparent',
                    color: showChat ? accentColor : (isDarkMode ? '#9ca3af' : '#475569'),
                  }}
                >
                  <MessageSquare className="inline h-3 w-3 mr-1" /> Chat
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                {showChat ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Chat Messages */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto font-mono text-xs">
                      {chatMessages.length === 0 ? (
                        <p className="text-center italic" style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}>
                          No messages yet...
                        </p>
                      ) : (
                        chatMessages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={msg.isSystem ? 'text-center py-2' : `p-3 rounded-lg backdrop-blur-sm ${msg.isOwn ? 'ml-4' : 'mr-4'}`}
                            style={{
                              backgroundColor: msg.isSystem
                                ? 'transparent'
                                : (msg.isOwn
                                ? (isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)')
                                : (isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.8)')),
                              borderLeft: msg.isSystem ? 'none' : `2px solid ${msg.isOwn ? '#6366F1' : '#9ca3af'}`,
                            }}
                          >
                            {msg.isSystem ? (
                              <p className="italic text-xs" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                {msg.text}
                              </p>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-[10px]" style={{ color: accentColor }}>{msg.sender}</span>
                                  <span className="text-[9px]" style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}>{msg.timestamp}</span>
                                </div>
                                <p style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>{msg.text}</p>
                              </>
                            )}
                          </motion.div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t" style={{ borderColor: borderColor }}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type message..."
                          className="flex-1 px-3 py-2 rounded-lg border font-mono text-xs focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                            borderColor: borderColor,
                            color: isDarkMode ? '#e5e7eb' : '#111827',
                            focusRingColor: accentColor,
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          size="sm"
                          disabled={!chatInput.trim()}
                          style={{
                            backgroundColor: accentColor,
                            color: '#ffffff',
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="diagnostics"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-5 space-y-6 overflow-y-auto"
                  >
                    {/* Diagnostics Header */}
                    <div>
                      <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>
                        Diagnostics
                      </p>
                      <div className="h-px" style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }} />
                    </div>

                    {/* Group Objective Progress */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider mb-3 font-medium" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>Group Objectives</p>
                      <div className="space-y-2">
                        {groupObjectives.length === 0 ? (
                          <p className="text-xs italic" style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}>No group objectives</p>
                        ) : (
                          groupObjectives.map((obj) => (
                            <div key={obj.id} className="space-y-1">
                              <p className="text-xs truncate font-medium" style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>{obj.title}</p>
                              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: obj.is_completed ? '100%' : '45%' }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: accentColor }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Power Core Gauge */}
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider mb-4 font-medium" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>Power Core</p>
                      <PowerCoreGauge squadXp={completedXp} totalPossibleXp={totalPossibleXp} />
                    </div>

                    {/* Top Performers */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider mb-3 font-medium" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>Top Performers</p>
                      <div className="space-y-2">
                        {members.slice(0, 5).map((member, i) => (
                          <div key={member.id} className="flex items-center justify-between">
                            <span className="text-xs truncate flex-1 font-medium" style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>
                              <span style={{ color: accentColor }}>#{i + 1}</span> {member.full_name || 'Anonymous Student'}
                            </span>
                            <span className="text-xs font-semibold text-[#FFB400]">
                              {(member.current_session_xp || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Consistency Stats */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider mb-3 font-medium" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>Consistency Boost</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[10px]" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>STREAK</span>
                          <span className="text-xs font-semibold" style={{ color: accentColor }}>3 DAYS</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px]" style={{ color: isDarkMode ? '#9ca3af' : '#475569' }}>MULTIPLIER</span>
                          <span className="text-xs font-semibold" style={{ color: accentColor }}>1.5x</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* LIBRARY PANEL - Right-Side Slide-Over with Drag & Drop */}
      <AnimatePresence>
        {showArchives && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setShowArchives(false)}
            />

            {/* Slide-Over Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl shadow-2xl"
              style={{
                backgroundColor: isDarkMode ? 'rgb(15 23 42 / 0.9)' : 'rgb(255 255 255 / 0.9)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-6 border-b"
                style={{
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                  backgroundColor: isDarkMode ? 'rgb(15 23 42)' : '#ffffff',
                }}
              >
                <div>
                  <h2
                    className="text-2xl font-bold flex items-center gap-3"
                    style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
                  >
                    <BookOpen className="h-6 w-6 text-indigo-500" />
                    Library Archives
                  </h2>
                  <p className="text-sm mt-1" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                    Shared resources and study materials
                  </p>
                </div>
                <button
                  onClick={() => setShowArchives(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X className="h-5 w-5" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto h-[calc(100vh-100px)]">
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="mb-6 p-8 border-2 border-dashed rounded-xl transition-all"
                  style={{
                    backgroundColor: isDragging
                      ? (isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)')
                      : (isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)'),
                    borderColor: isDragging ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <div className="text-center">
                    {uploading ? (
                      <>
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-indigo-500" />
                        <p className="text-sm font-medium" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Uploading files...
                        </p>
                      </>
                    ) : (
                      <>
                        <motion.div
                          animate={{ y: isDragging ? -5 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FileText className="h-12 w-12 mx-auto mb-4 text-indigo-500" />
                        </motion.div>
                        <p className="text-lg font-semibold mb-2" style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>
                          {isDragging ? 'Drop your files here' : 'Drag & drop PDFs or images here'}
                        </p>
                        <p className="text-sm mb-4" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          or click to browse (max 10MB per file)
                        </p>
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all hover:shadow-lg"
                          style={{
                            backgroundColor: '#6366f1',
                            color: '#ffffff',
                          }}
                        >
                          <Plus className="h-5 w-5" />
                          Choose Files
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,application/pdf,image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Resources List */}
                <div className="space-y-4">
                  {archiveItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                      className="rounded-xl border-2 overflow-hidden shadow-md transition-all"
                      style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderColor: item.type === 'pdf' 
                          ? '#6366f1' 
                          : item.type === 'image' 
                          ? '#10b981' 
                          : '#06b6d4',
                      }}
                    >
                      <div className="p-5">
                        {/* Icon and Info */}
                        <div className="flex items-start gap-4">
                          {/* Icon Circle */}
                          <div
                            className="p-3 rounded-xl shrink-0"
                            style={{
                              backgroundColor: item.type === 'pdf'
                                ? (isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)')
                                : item.type === 'image'
                                ? (isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)')
                                : (isDarkMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)'),
                            }}
                          >
                            {item.type === 'pdf' ? (
                              <FileText className="h-7 w-7" style={{ color: '#6366f1' }} />
                            ) : item.type === 'image' ? (
                              <Image className="h-7 w-7" style={{ color: '#10b981' }} />
                            ) : (
                              <ExternalLink className="h-7 w-7" style={{ color: '#06b6d4' }} />
                            )}
                          </div>

                          {/* File Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className="font-bold text-base truncate"
                                style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
                              >
                                {item.name}
                              </h3>
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0"
                                style={{
                                  backgroundColor: item.type === 'pdf'
                                    ? (isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)')
                                    : item.type === 'image'
                                    ? (isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)')
                                    : (isDarkMode ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)'),
                                  color: item.type === 'pdf'
                                    ? '#6366f1'
                                    : item.type === 'image'
                                    ? '#10b981'
                                    : '#06b6d4',
                                }}
                              >
                                {item.type}
                              </span>
                            </div>
                            <p className="text-xs mb-3" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                              Uploaded by <span className="font-medium">{item.uploadedBy}</span> • {item.date}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg"
                                style={{
                                  backgroundColor: item.type === 'pdf' 
                                    ? '#6366f1' 
                                    : item.type === 'image' 
                                    ? '#10b981' 
                                    : '#06b6d4',
                                  color: '#ffffff',
                                }}
                                onClick={() => {
                                  if (item.url && item.url !== '#') {
                                    window.open(item.url, '_blank');
                                  }
                                  toast.success(`Opening ${item.name}...`);
                                }}
                              >
                                <Download className="h-4 w-4 text-white" />
                                {item.type === 'pdf' ? 'Download' : item.type === 'image' ? 'View' : 'Open Link'}
                              </button>
                              <button
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border-2"
                                style={{
                                  borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                                  color: isDarkMode ? '#94a3b8' : '#64748b',
                                  backgroundColor: 'transparent',
                                }}
                                onClick={() => toast.info('Copied link to clipboard')}
                              >
                                Share
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Empty State */}
                {archiveItems.length === 0 && !uploading && (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: '#6366f1' }} />
                    <p className="text-lg font-medium mb-2" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      No resources yet
                    </p>
                    <p className="text-sm" style={{ color: isDarkMode ? '#64748b' : '#94a3b8' }}>
                      Upload study materials to share with your squad
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CreateJoinSquad isOpen={isSquadModalOpen} onClose={() => setIsSquadModalOpen(false)} />
    </div>
  );
}
