import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BookOpen,
  Sparkles,
  Target,
  ArrowRight,
  ArrowLeft,
  Calculator,
  FlaskConical,
  Globe2,
  BookText,
  Languages,
  Atom,
  Dna,
  Cpu,
  Coins,
  Briefcase,
  Palette,
  Brain,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

const SUBJECT_MAP = {
  lower: ['Environmental Studies', 'Mathematics', 'English', 'Arts'],
  middle: ['Mathematics', 'Science (Phy/Chem/Bio)', 'Social Science', 'English', 'Language 2'],
  senior: {
    Science: ['Physics', 'Chemistry', 'Math', 'Biology', 'Computer Science'],
    Commerce: ['Accountancy', 'Business Studies', 'Economics'],
    Arts: [
      'English',
      'History',
      'Political Science',
      'Psychology',
      'Sociology',
      'Fine Arts',
      'Geography',
      'Home Science',
    ],
  },
};

const SUBJECT_ICONS = {
  'Environmental Studies': BookOpen,
  Mathematics: Calculator,
  English: BookText,
  Arts: Palette,
  'Science (Phy/Chem/Bio)': FlaskConical,
  'Social Science': Globe2,
  'Language 2': Languages,
  Physics: Atom,
  Chemistry: FlaskConical,
  Math: Calculator,
  Biology: Dna,
  'Computer Science': Cpu,
  Accountancy: Calculator,
  'Business Studies': Briefcase,
  Economics: Coins,
  History: Globe2,
  'Political Science': Globe2,
  Psychology: Brain,
  Sociology: Globe2,
  'Fine Arts': Palette,
  Geography: Globe2,
  'Home Science': BookOpen,
};

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MIN_HOURS = 1;
const MAX_HOURS = 6;

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef(null);
  const [formData, setFormData] = useState({
    full_name: '',
    grade: '',
    stream: '',
    subjects: [],
    daily_goal: 3,
    notifications: true,
  });

  const handleSubjectToggle = (subject) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((item) => item !== subject)
        : [...prev.subjects, subject],
    }));
  };

  useEffect(() => {
    setFormData((prev) => {
      const resetStream = prev.grade >= 11 ? prev.stream : '';
      return {
        ...prev,
        stream: resetStream,
        subjects: [],
      };
    });
  }, [formData.grade]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      subjects: [],
    }));
  }, [formData.stream]);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const handleNext = async () => {
    if (step < 3) {
      setDirection(1);
      setStep((prev) => prev + 1);
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    const startedAt = Date.now();

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) throw new Error('No user found');

      const payload = {
        id: user.id,
        full_name: (formData.full_name || '').trim(),
        grade_level: formData.grade ? Number(formData.grade) : 10,
        interests: formData.subjects || [],
        stream: formData.stream || null,
        preferences: {
          notificationsEnabled: !!formData.notifications,
          studyGoal: `${formData.daily_goal || 2} hours`,
        },
        onboarding_completed: true,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 2000 - elapsed);
      submitTimeoutRef.current = setTimeout(() => {
        navigate('/dashboard');
      }, remaining);
    } catch (err) {
      setIsSubmitting(false);
      toast.error('Failed to save your setup. Please try again.');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.full_name.trim().length > 0 && formData.grade !== '';
    }
    if (step === 2) {
      if (requiresStream && !formData.stream) return false;
      return formData.subjects.length > 0;
    }
    if (step === 3) return formData.daily_goal >= MIN_HOURS;
    return false;
  };

  const requiresStream = Number(formData.grade) >= 11;
  const availableSubjects = (() => {
    const grade = Number(formData.grade);
    if (!grade) return [];
    if (grade <= 5) return SUBJECT_MAP.lower;
    if (grade <= 10) return SUBJECT_MAP.middle;
    if (!formData.stream) return [];
    return SUBJECT_MAP.senior[formData.stream] || [];
  })();

  const cardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#F8FAFC] via-[#F0FDFA] to-[#E0F2FE] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors">
      <div className="w-full px-6 py-12">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {step} of 3
            </span>
            <span className="text-sm font-medium text-[#006D77] dark:text-[#06D6A0]">
              {Math.round((step / 3) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#006D77] to-[#06D6A0]"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10 transition-colors">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#006D77] to-[#06D6A0] rounded-2xl mb-4">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      The Persona
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Tell us who is stepping into the schedule.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        htmlFor="full-name"
                      >
                        Full name
                      </label>
                      <input
                        id="full-name"
                        type="text"
                        value={formData.full_name}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            full_name: event.target.value,
                          }))
                        }
                        placeholder="e.g., Alex Johnson"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D77]"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        htmlFor="grade"
                      >
                        Grade
                      </label>
                      <select
                        id="grade"
                        value={formData.grade}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            grade: Number(event.target.value),
                          }))
                        }
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D77]"
                      >
                        <option value="" disabled>
                          Select class
                        </option>
                        {GRADES.map((grade) => (
                          <option key={grade} value={grade}>
                            Class {grade}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10 transition-colors">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#006D77] to-[#06D6A0] rounded-2xl mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      The Curriculum
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose every subject you want the plan to include.
                    </p>
                  </div>

                  {requiresStream && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Select your stream
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {['Science', 'Commerce', 'Arts'].map((stream) => (
                          <button
                            key={stream}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                stream,
                              }))
                            }
                            className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D77] ${
                              formData.stream === stream
                                ? 'border-[#006D77] bg-[#006D77]/10 text-[#006D77]'
                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#006D77]'
                            }`}
                          >
                            {stream}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableSubjects.length > 0 ? (
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {availableSubjects.map((subject) => {
                        const selected = formData.subjects.includes(subject);
                        const Icon = SUBJECT_ICONS[subject] || BookOpen;
                        return (
                          <motion.button
                            key={subject}
                            layout
                            type="button"
                            onClick={() => handleSubjectToggle(subject)}
                            animate={{ scale: selected ? 1.05 : 1 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                            className={`rounded-2xl border-2 px-4 py-5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D77] ${
                              selected
                                ? 'border-[#006D77] bg-[#006D77]/10 text-[#006D77] shadow-[0_0_12px_rgba(0,109,119,0.25)]'
                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#006D77]'
                            }`}
                            whileTap={{ scale: 0.92 }}
                          >
                            <div className="mb-2 flex justify-center">
                              <Icon className="h-6 w-6" />
                            </div>
                            {subject}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      {requiresStream
                        ? 'Pick a stream to see subjects.'
                        : 'Select a grade to see subjects.'}
                    </div>
                  )}

                  {formData.subjects.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 rounded-xl bg-[#006D77]/10 px-4 py-3 text-center"
                    >
                      <span className="text-sm font-medium text-[#006D77]">
                        {formData.subjects.length} selected
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10 transition-colors">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#006D77] to-[#06D6A0] rounded-2xl mb-4">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      The Commitment
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Set your daily study goal and reminders.
                    </p>
                  </div>

                  {isSubmitting ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <motion.div
                        className="h-12 w-12 rounded-full border-4 border-[#006D77]/30 border-t-[#006D77]"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      />
                      <p className="mt-4 text-sm font-medium text-[#006D77]">
                        Generating your personalized schedule...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Daily Study Goal
                          </span>
                          <span className="text-sm font-semibold text-[#006D77]">
                            {formData.daily_goal} hour{formData.daily_goal === 1 ? '' : 's'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={MIN_HOURS}
                          max={MAX_HOURS}
                          step={1}
                          value={formData.daily_goal}
                          onChange={(event) =>
                            setFormData((prev) => ({
                              ...prev,
                              daily_goal: Number(event.target.value),
                            }))
                          }
                          className="w-full accent-[#006D77]"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span>{MIN_HOURS} hr</span>
                          <span>{MAX_HOURS} hrs</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Notification Reminders
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Keep me accountable with daily nudges.
                          </p>
                        </div>
                        <motion.button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              notifications: !prev.notifications,
                            }))
                          }
                          className={`relative h-7 w-12 rounded-full transition-colors ${
                            formData.notifications ? 'bg-[#006D77]' : 'bg-gray-300'
                          }`}
                          aria-pressed={formData.notifications}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.span
                            layout
                            className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow"
                            animate={{
                              x: formData.notifications ? 20 : 0,
                            }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 max-w-3xl mx-auto">
            <motion.button
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border-2 border-gray-200 dark:border-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D77] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
              whileHover={step > 1 && !isSubmitting ? { scale: 1.05 } : {}}
              whileTap={step > 1 && !isSubmitting ? { scale: 0.95 } : {}}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <motion.button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-[#006D77] dark:bg-[#06D6A0] text-white dark:text-gray-900 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#005a63] dark:hover:bg-[#05c295] transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D77] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
              whileHover={canProceed() && !isSubmitting ? { scale: 1.05 } : {}}
              whileTap={canProceed() && !isSubmitting ? { scale: 0.95 } : {}}
            >
              {step === 3 ? 'Complete Setup' : 'Continue'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
