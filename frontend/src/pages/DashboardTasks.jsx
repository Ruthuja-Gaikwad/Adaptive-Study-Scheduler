import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabaseClient';
import { useDarkMode } from '../contexts/DarkModeContext';
import { CreateTaskModal } from '../components/CreateTaskModal';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ChevronDown,
  Search,
  BookOpen,
  BarChart3,
  Zap,
  X,
  Moon,
  Sun,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/Dropdown-Menu';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const VALID_STATUSES = ['pending', 'todo', 'in-progress', 'completed', 'overdue'];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

export function DashboardTasks() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentView, setCurrentView] = useState('tasks');
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_name: '',
    priority: 'Medium',
    scheduled_at: '',
    estimated_time_mins: '',
    status: 'pending',
  });

  // Fetch tasks from Supabase
  useEffect(() => {
    let channel = null;

    const fetchTasksFromSupabase = async () => {
      try {
        setIsLoadingTasks(true);
        const { data: userData, error: authError } = await supabase.auth.getUser();
        const user = userData?.user;

        if (authError || !user) {
          console.log('[TASKS] Not authenticated, loading from localStorage');
          // Fallback to localStorage if not authenticated
          const savedTasks = localStorage.getItem('adaptive_study_tasks');
          if (savedTasks) {
            try {
              setTasks(JSON.parse(savedTasks));
            } catch (err) {
              console.error('[TASKS] Error loading tasks:', err);
            }
          }
          setIsLoadingTasks(false);
          return;
        }

        console.log('[TASKS] Fetching tasks for user:', user.id);

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[TASKS] Error fetching from Supabase:', error);
          // Fallback to localStorage on error
          const savedTasks = localStorage.getItem('adaptive_study_tasks');
          if (savedTasks) {
            try {
              setTasks(JSON.parse(savedTasks));
            } catch (err) {
              console.error('[TASKS] Error loading tasks:', err);
            }
          }
          setIsLoadingTasks(false);
          return;
        }

        console.log('[TASKS] ✅ Fetched', data?.length, 'tasks from Supabase');
        setTasks(data || []);
        setIsLoadingTasks(false);

        // Set up real-time subscription after successful fetch
        if (!channel) {
          channel = supabase
            .channel(`tasks-dashboard-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'tasks',
                filter: `student_id=eq.${user.id}`,
              },
              (payload) => {
                console.log('[TASKS] Real-time update received:', payload.eventType);
                fetchTasksFromSupabase();
              }
            )
            .subscribe();
        }
      } catch (err) {
        console.error('[TASKS] Error in fetchTasksFromSupabase:', err);
        setIsLoadingTasks(false);
      }
    };

    fetchTasksFromSupabase();

    // Cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Save tasks to localStorage as backup
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('adaptive_study_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Fetch subjects from user's profile
  useEffect(() => {
    const fetchUserSubjects = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        if (!user) {
          // Fallback to default subjects if no user
          setSubjects([
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Literature',
            'Programming',
            'Languages',
            'Arts',
            'Music',
          ]);
          return;
        }

        // Fetch user's profile with interests
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('interests')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Fallback to default subjects
          setSubjects([
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Literature',
            'Programming',
            'Languages',
            'Arts',
            'Music',
          ]);
          return;
        }

        // Use interests from profile if available, otherwise use defaults
        if (profile?.interests && Array.isArray(profile.interests) && profile.interests.length > 0) {
          setSubjects(profile.interests);
        } else {
          setSubjects([
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Literature',
            'Programming',
            'Languages',
            'Arts',
            'Music',
          ]);
        }
      } catch (err) {
        console.error('Error loading user subjects:', err);
        // Fallback to default subjects on any error
        setSubjects([
          'Mathematics',
          'Physics',
          'Chemistry',
          'Biology',
          'History',
          'Literature',
          'Programming',
          'Languages',
          'Arts',
          'Music',
        ]);
      }
    };

    fetchUserSubjects();
  }, []);

  const handleAddTask = (taskData) => {
    if (editingId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingId
            ? { ...taskData, id: editingId, createdAt: task.createdAt, updatedAt: new Date().toISOString() }
            : task
        )
      );
      setEditingId(null);
    } else {
      const newTask = {
        ...taskData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);

      // Optionally save to Supabase if user is authenticated
      saveTaskToSupabase(newTask);
    }

    setFormData({
      title: '',
      description: '',
      subject_name: '',
      priority: 'Medium',
      scheduled_at: '',
      estimated_time_mins: '',
      status: 'pending',
    });
  };

  // Save task to Supabase for persistent storage
  const saveTaskToSupabase = async (task) => {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      const user = userData?.user;

      if (authError || !user) {
        console.log('Not authenticated, task saved locally only');
        return;
      }

      // Validate required fields
      if (!task?.title || !task?.subject_name) {
        console.error('Task missing required fields:', { title: task?.title, subject_name: task?.subject_name });
        return;
      }

      // Validate status - only allow specific values
      const safeStatus = task?.status?.toLowerCase?.();
      const finalStatus = VALID_STATUSES.includes(safeStatus) ? safeStatus : 'pending';

      const taskPayload = {
        user_id: user.id,
        student_id: user.id,
        title: task?.title?.trim() || '',
        description: task?.description?.trim() || '',
        subject_name: task?.subject_name?.trim() || '',
        priority: task?.priority || 'Medium',
        scheduled_at: task?.scheduled_at ? new Date(task.scheduled_at).toISOString() : null,
        estimated_time_mins: task?.estimated_time_mins || null,
        status: finalStatus,
        xp_reward: task?.xp_reward || 0,
        show_on_quest_board: task?.show_on_quest_board || false,
        created_at: new Date(),
      };

      const { error } = await supabase.from('tasks').insert([taskPayload]);

      if (error) {
        console.error('Error saving task to database:', error);
        // Don't crash if Supabase fails, task is already saved locally
      } else {
        console.log('Task saved to Supabase successfully');
      }
    } catch (err) {
      console.error('Error saving task:', err);
      // Task is still saved locally, no need to throw
    }
  };

  const handleEditTask = (task) => {
    // Validate status
    const safeStatus = task?.status?.toLowerCase?.();
    const validStatus = VALID_STATUSES.includes(safeStatus) ? safeStatus : 'pending';
    
    setFormData({
      title: task?.title || '',
      description: task?.description || '',
      subject_name: task?.subject_name || '',
      priority: task?.priority || 'Medium',
      scheduled_at: task?.scheduled_at || '',
      estimated_time_mins: task?.estimated_time_mins || '',
      status: validStatus,
    });
    setEditingId(task?.id);
    setIsOpen(true);
  };

  const handleDeleteTask = async (id) => {
    try {
      // Optimistically update UI
      setTasks((prev) => prev.filter((task) => task.id !== id));

      // Delete from Supabase
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('student_id', userData.user.id);

        if (error) {
          console.error('[TASKS] Error deleting task from Supabase:', error);
          // Task is already removed from UI, but you could revert here if needed
        } else {
          console.log('[TASKS] Task deleted from Supabase successfully');
        }
      }
    } catch (err) {
      console.error('[TASKS] Error in handleDeleteTask:', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Validate status
      const safeStatus = newStatus?.toLowerCase?.();
      const finalStatus = VALID_STATUSES.includes(safeStatus) ? safeStatus : 'pending';
      
      // Get the task being updated to access its properties
      const taskBeingUpdated = tasks.find((task) => task.id === id);
      
      // Optimistically update UI
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, status: finalStatus } : task
        )
      );

      // Update in Supabase
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { error } = await supabase
          .from('tasks')
          .update({ status: finalStatus })
          .eq('id', id)
          .eq('student_id', userData.user.id);

        if (error) {
          console.error('[TASKS] Error updating task status in Supabase:', error);
        } else {
          console.log('[TASKS] Task status updated in Supabase successfully');
          
          // If task is marked as completed, send data to n8n webhook
          if (finalStatus === 'completed' && taskBeingUpdated) {
            try {
              console.log('[TASKS] Sending task completion data to n8n webhook');
              const webhookPayload = {
                user_id: userData.user.id,
                subject_name: taskBeingUpdated.subject_name,
                difficulty_level: taskBeingUpdated.priority,
                cognitive_load_score: taskBeingUpdated.xp_reward || 0,
                task_id: taskBeingUpdated.id,
                task_title: taskBeingUpdated.title,
                completed_at: new Date().toISOString(),
              };

              await fetch('http://localhost:5678/webhook-test/subject-fatigue-update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookPayload),
              });

              console.log('[TASKS] ✅ Task completion data sent to n8n webhook');
            } catch (webhookErr) {
              console.error('[TASKS] Error sending data to n8n webhook:', webhookErr);
              // Don't throw - the task is already updated in Supabase
            }
          }
        }
      }
    } catch (err) {
      console.error('[TASKS] Error in handleStatusChange:', err);
    }
  };

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    return tasks?.filter((task) => {
      // Safe null checking with optional chaining
      const title = task?.title || '';
      const description = task?.description || '';
      const subjectName = task?.subject_name || '';
      const priority = task?.priority || '';
      const status = task?.status || '';

      const matchSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subjectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSubject = filterSubject === 'all' || subjectName === filterSubject;
      const matchPriority = filterPriority === 'all' || priority === filterPriority;
      const matchStatus = filterStatus === 'all' || status === filterStatus;

      return matchSearch && matchSubject && matchPriority && matchStatus;
    });
  }, [tasks, searchTerm, filterSubject, filterPriority, filterStatus]);

  // Stats calculations
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const overdue = tasks.filter((t) => t.status === 'overdue').length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  // Group tasks by subject
  const tasksBySubject = useMemo(() => {
    const grouped = {};
    tasks?.forEach((task) => {
      const subject = task?.subject_name || 'Uncategorized';
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push(task);
    });
    return grouped;
  }, [tasks]);

  // Group tasks by priority
  const tasksByPriority = useMemo(() => {
    const grouped = {
      Urgent: [],
      High: [],
      Medium: [],
      Low: [],
      Other: [],
    };
    tasks?.forEach((task) => {
      const priority = task?.priority || 'Other';
      if (grouped[priority]) {
        grouped[priority].push(task);
      } else {
        grouped['Other'].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const getPriorityColor = (priority) => {
    const colors = {
      Low: { light: '#f1f5f9', lightText: '#334155', dark: '#3f4654', darkText: '#e2e8f0' },
      Medium: { light: '#dbeafe', lightText: '#0c4a6e', dark: '#1e3a8a', darkText: '#bfdbfe' },
      High: { light: '#fed7aa', lightText: '#7c2d12', dark: '#7c2d12', darkText: '#ffedd5' },
      Urgent: { light: '#fecaca', lightText: '#7f1d1d', dark: '#7f1d1d', darkText: '#fecaca' },
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusIcon = (status) => {
    const icons = {
      todo: <Circle className="w-4 h-4" />,
      'in-progress': <Zap className="w-4 h-4" />,
      completed: <CheckCircle2 className="w-4 h-4" />,
      overdue: <Circle className="w-4 h-4" />,
    };
    return icons[status];
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'text-slate-500',
      'in-progress': 'text-blue-500',
      completed: 'text-green-500',
      overdue: 'text-red-500',
    };
    return colors[status];
  };

  const TaskCard = React.forwardRef(({ task }, ref) => (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
      style={{
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderColor: isDarkMode ? '#475569' : '#e2e8f0',
        color: isDarkMode ? '#f1f5f9' : '#0f172a'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          <button
            onClick={() =>
              handleStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')
            }
            className={`mt-1 ${getStatusColor(task.status)}`}
          >
            {getStatusIcon(task.status)}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate text-slate-900 dark:text-slate-50" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>
              {task.title}
            </h3>
            {task?.description && (
              <p className="mt-1 text-sm line-clamp-2 text-slate-600 dark:text-slate-400" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>
                {task.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">{task?.subject_name || 'Uncategorized'}</Badge>
              <Badge style={{
                backgroundColor: isDarkMode ? getPriorityColor(task?.priority).dark : getPriorityColor(task?.priority).light,
                color: isDarkMode ? getPriorityColor(task?.priority).darkText : getPriorityColor(task?.priority).lightText,
                border: 'none'
              }}>{task?.priority || 'Medium'}</Badge>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditTask(task)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {task.status !== 'completed' && (
              <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'completed')}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400" style={{ color: isDarkMode ? '#94a3b8' : '#475569' }}>
        {task.scheduled_at && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(task.scheduled_at), 'MMM dd HH:mm')}
          </div>
        )}
        {task.estimated_time_mins && (
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            ~{task.estimated_time_mins} mins
          </div>
        )}
      </div>
    </motion.div>
  ));

  TaskCard.displayName = "TaskCard";

  return (
    <div 
      key={`dashboard-theme-${isDarkMode}`} 
      className="min-h-screen"
      style={{
        backgroundColor: isDarkMode ? '#030712' : '#f8fafc',
        transition: 'background-color 0.3s ease'
      }}
    >
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>Task Generator</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400" style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
              Plan and organize your study sessions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="icon"
              className="rounded-lg"
              style={{
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                color: isDarkMode ? '#94a3b8' : '#475569'
              }}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5" style={{ color: '#64748b' }} />
              )}
            </Button>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  title: '',
                  description: '',
                  subject_name: '',
                  priority: 'Medium',
                  scheduled_at: '',
                  estimated_time_mins: '',
                  status: 'pending',
                });
                setIsOpen(true);
              }}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:text-white"
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff'
              }}
            >
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              subject_name: '',
              priority: 'Medium',
              scheduled_at: '',
              estimated_time_mins: '',
              status: 'pending',
            });
          }}
          onSubmit={handleAddTask}
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          subjects={subjects}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            borderColor: isDarkMode ? '#475569' : '#e2e8f0',
            border: '1px solid'
          }}>
            <CardHeader className="pb-2">
              <CardTitle style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: isDarkMode ? '#94a3b8' : '#475569'
              }}>
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: isDarkMode ? '#f1f5f9' : '#1e293b'
              }}>
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            borderColor: isDarkMode ? '#475569' : '#e2e8f0',
            border: '1px solid'
          }}>
            <CardHeader className="pb-2">
              <CardTitle style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: isDarkMode ? '#94a3b8' : '#475569'
              }}>
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            borderColor: isDarkMode ? '#475569' : '#e2e8f0',
            border: '1px solid'
          }}>
            <CardHeader className="pb-2">
              <CardTitle style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: isDarkMode ? '#94a3b8' : '#475569'
              }}>
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            borderColor: isDarkMode ? '#475569' : '#e2e8f0',
            border: '1px solid'
          }}>
            <CardHeader className="pb-2">
              <CardTitle style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: isDarkMode ? '#94a3b8' : '#475569'
              }}>
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          borderColor: isDarkMode ? '#475569' : '#e2e8f0'
        }} className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-slate-900 dark:text-slate-50"
                style={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                  color: isDarkMode ? '#f1f5f9' : '#1e293b'
                }}
              />
            </div>

            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full md:w-40 text-slate-900 dark:text-slate-50" style={{
                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                color: isDarkMode ? '#f1f5f9' : '#1e293b'
              }}>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#f1f5f9' : '#1e293b'
              }}>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-40 text-slate-900 dark:text-slate-50" style={{
                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                color: isDarkMode ? '#f1f5f9' : '#1e293b'
              }}>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#f1f5f9' : '#1e293b'
              }}>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40 text-slate-900 dark:text-slate-50" style={{
                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                color: isDarkMode ? '#f1f5f9' : '#1e293b'
              }}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#f1f5f9' : '#1e293b'
              }}>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs for views */}
        <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
          <TabsList style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9'
          }} className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks" className="text-slate-600 dark:text-slate-400">All Tasks</TabsTrigger>
            <TabsTrigger value="subjects" className="text-slate-600 dark:text-slate-400">By Subject</TabsTrigger>
            <TabsTrigger value="priority" className="text-slate-600 dark:text-slate-400">By Priority</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {isLoadingTasks ? (
              <div className="rounded-lg border-2 border-dashed py-12 text-center" style={{
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'
              }}>
                <Loader2 className="mx-auto h-12 w-12 animate-spin" style={{ color: isDarkMode ? '#64748b' : '#94a3b8' }} />
                <p className="mt-2" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Loading tasks...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
                ) : (
                  <div className="rounded-lg border-2 border-dashed py-12 text-center" style={{
                    borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'
                  }}>
                    <BookOpen className="mx-auto h-12 w-12" style={{ color: isDarkMode ? '#64748b' : '#94a3b8' }} />
                    <p className="mt-2" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>No tasks found</p>
                  </div>
                )}
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            {Object.keys(tasksBySubject).length > 0 ? (
              Object.entries(tasksBySubject).map(([subject, subjectTasks]) => (
                <div key={subject}>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>
                    <BookOpen className="w-5 h-5" />
                    {subject} ({subjectTasks.length})
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {subjectTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border-2 border-dashed py-12 text-center" style={{
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'
              }}>
                <BookOpen className="mx-auto h-12 w-12" style={{ color: isDarkMode ? '#64748b' : '#94a3b8' }} />
                <p className="mt-2" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>No tasks found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="priority" className="space-y-6">
            {Object.entries(tasksByPriority).map(([priority, priorityTasks]) =>
              priorityTasks.length > 0 ? (
                <div key={priority}>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50" style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>
                    <Zap className="w-5 h-5" />
                    {priority} Priority ({priorityTasks.length})
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {priorityTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ) : null
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DashboardTasks;
