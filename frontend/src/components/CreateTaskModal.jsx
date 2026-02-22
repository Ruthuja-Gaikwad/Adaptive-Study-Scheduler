import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

/**
 * Helper function to convert estimated duration string to minutes
 * Examples: "45 mins" -> 45, "2 hours" -> 120, "1.5 hours" -> 90
 */
const convertDurationToMinutes = (durationString) => {
  if (!durationString || typeof durationString !== 'string') return null;

  const trimmed = durationString.toLowerCase().trim();

  // Check for minutes
  const minuteMatch = trimmed.match(/(\d+\.?\d*)\s*mins?/);
  if (minuteMatch) {
    return Math.round(parseFloat(minuteMatch[1]));
  }

  // Check for hours
  const hourMatch = trimmed.match(/(\d+\.?\d*)\s*hours?/);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60);
  }

  // Check for combined (e.g., "1h 30m")
  const combinedMatch = trimmed.match(/(\d+\.?\d*)\s*h[rs]*\s*(\d+\.?\d*)\s*m/);
  if (combinedMatch) {
    return Math.round(parseFloat(combinedMatch[1]) * 60 + parseFloat(combinedMatch[2]));
  }

  // Try to parse as just a number (assume minutes)
  const numberMatch = trimmed.match(/^(\d+\.?\d*)$/);
  if (numberMatch) {
    return Math.round(parseFloat(numberMatch[1]));
  }

  return null;
};

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  formData,
  setFormData,
  subjects,
}) {
  const { isDarkMode } = useDarkMode();
  const [userSubjects, setUserSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Fetch user's selected subjects from profile
  useEffect(() => {
    const fetchUserSubjects = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        if (!user) {
          setUserSubjects(subjects || []);
          setIsLoadingSubjects(false);
          return;
        }

        // Fetch user's profile with selected subjects
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('interests')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setUserSubjects(subjects || []);
          setIsLoadingSubjects(false);
          return;
        }

        // Use interests from profile if available
        if (profile?.interests && Array.isArray(profile.interests) && profile.interests.length > 0) {
          setUserSubjects(profile.interests);
        } else {
          setUserSubjects(subjects || []);
        }

        setIsLoadingSubjects(false);
      } catch (err) {
        console.error('Error loading user subjects:', err);
        setUserSubjects(subjects || []);
        setIsLoadingSubjects(false);
      }
    };

    if (isOpen) {
      fetchUserSubjects();
    }
  }, [isOpen, subjects]);

  const handleDurationChange = (e) => {
    const value = e.target.value;
    // Convert to minutes if it's a string description, otherwise keep as-is for display
    setFormData({ ...formData, estimated_time_mins: value });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData?.title?.trim() || !formData?.subject_name?.trim()) {
      alert('Please fill in title and subject');
      return;
    }

    // Prepare task data with enhancements
    const taskData = {
      ...formData,
    };

    // Convert estimated duration to minutes if provided
    if (formData.estimated_time_mins) {
      const durationMinutes = convertDurationToMinutes(formData.estimated_time_mins);
      if (durationMinutes !== null) {
        taskData.estimated_time_mins = durationMinutes;
      }
    }

    // Handle High priority - set XP reward and mark for quest board
    if (formData.priority === 'High') {
      taskData.xp_reward = 1000;
      taskData.show_on_quest_board = true;
    } else if (formData.priority === 'Urgent') {
      // For Urgent, even higher reward
      taskData.xp_reward = 1500;
      taskData.show_on_quest_board = true;
    } else {
      // Lower priorities get no quest board visibility
      taskData.show_on_quest_board = false;
      taskData.xp_reward = formData.priority === 'Medium' ? 500 : 250;
    }

    onSubmit(taskData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-lg rounded-xl shadow-2xl"
              style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between border-b px-6 py-4"
                style={{
                  borderColor: isDarkMode ? '#475569' : '#e2e8f0',
                }}
              >
                <h2
                  className="text-xl font-bold text-slate-900 dark:text-slate-50"
                  style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                >
                  {editingId ? '✏️ Edit Task' : '➕ Create New Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 dark:text-slate-500 hover:opacity-75"
                  style={{ color: isDarkMode ? '#94a3b8' : '#94a3b8' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
                      style={{ color: isDarkMode ? '#cbd5e1' : '#3f46e6' }}
                    >
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter task title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{
                        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                        color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      }}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
                      style={{ color: isDarkMode ? '#cbd5e1' : '#3f46e6' }}
                    >
                      Description
                    </label>
                    <Textarea
                      placeholder="Enter task description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      style={{
                        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                        color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      }}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  {/* Subject and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
                        style={{ color: isDarkMode ? '#cbd5e1' : '#3f46e6' }}
                      >
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.subject_name}
                        onValueChange={(value) =>
                          setFormData({ ...formData, subject_name: value })
                        }
                      >
                        <SelectTrigger
                          className="w-full rounded-lg border"
                          style={{
                            borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                            backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                            color: isDarkMode ? '#f1f5f9' : '#1e293b',
                          }}
                        >
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            color: isDarkMode ? '#f1f5f9' : '#1e293b',
                          }}
                        >
                          {isLoadingSubjects ? (
                            <div className="p-2 text-sm text-slate-500">Loading subjects...</div>
                          ) : userSubjects.length > 0 ? (
                            userSubjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-slate-500">No subjects available</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
                        style={{ color: isDarkMode ? '#cbd5e1' : '#3f46e6' }}
                      >
                        Priority
                      </label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger
                          className="w-full rounded-lg border"
                          style={{
                            borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                            backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                            color: isDarkMode ? '#f1f5f9' : '#1e293b',
                          }}
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            color: isDarkMode ? '#f1f5f9' : '#1e293b',
                          }}
                        >
                          {PRIORITIES.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Scheduled Date and Time */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
                      style={{ color: isDarkMode ? '#cbd5e1' : '#3f46e6' }}
                    >
                      Scheduled Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduled_at: e.target.value })
                      }
                      style={{
                        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                        color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      }}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
                      style={{ color: isDarkMode ? '#cbd5e1' : '#3f46e6' }}
                    >
                      Estimated Duration
                    </label>
                    <Input
                      placeholder="e.g., 45 mins, 2 hours, 1h 30m"
                      value={formData.estimated_time_mins}
                      onChange={handleDurationChange}
                      style={{
                        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                        color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      }}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                    <p
                      className="text-xs mt-1"
                      style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}
                    >
                      Supported formats: 45 mins, 2 hours, 1h 30m
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
                      style={{ color: isDarkMode ? '#cbd5e1' : '#3f46e6' }}
                    >
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger
                        className="w-full rounded-lg border"
                        style={{
                          borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                          backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                          color: isDarkMode ? '#f1f5f9' : '#1e293b',
                        }}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          color: isDarkMode ? '#f1f5f9' : '#1e293b',
                        }}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Info */}
                  {(formData.priority === 'High' || formData.priority === 'Urgent') && (
                    <div
                      className="p-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: isDarkMode ? '#7c2d12' : '#fed7aa',
                        color: isDarkMode ? '#ffedd5' : '#7c2d12',
                      }}
                    >
                      ⭐ This task will appear on the Quest Board with{' '}
                      {formData.priority === 'Urgent' ? '1500' : '1000'} XP reward
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex gap-3 border-t px-6 py-4"
                style={{
                  borderColor: isDarkMode ? '#475569' : '#e2e8f0',
                }}
              >
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingId ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreateTaskModal;
