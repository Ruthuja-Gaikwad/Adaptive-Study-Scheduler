import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, Calendar, Target, ArrowRight, ArrowLeft } from 'lucide-react';

const SUBJECTS = [
  { id: 'math', name: 'Mathematics', icon: '📐', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: 'physics', name: 'Physics', icon: '⚡', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { id: 'biology', name: 'Biology', icon: '🧬', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
  { id: 'cs', name: 'Computer Science', icon: '💻', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
  { id: 'english', name: 'English', icon: '📚', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  { id: 'history', name: 'History', icon: '🏛️', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { id: 'language', name: 'Foreign Language', icon: '🌍', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    subjects: [],
    availability: Array(7).fill(null).map(() => Array(3).fill(false)),
    difficulty: null,
  });

  const handleSubjectToggle = (subjectId) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(s => s !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  const handleAvailabilityToggle = (dayIndex, slotIndex) => {
    setData(prev => {
      const newAvailability = prev.availability.map(row => [...row]);
      newAvailability[dayIndex][slotIndex] = !newAvailability[dayIndex][slotIndex];
      return { ...prev, availability: newAvailability };
    });
  };

  const handleDifficultySelect = (difficulty) => {
    setData(prev => ({ ...prev, difficulty }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/loading');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (step === 1) return data.subjects.length > 0;
    if (step === 2) return data.availability.some(day => day.some(slot => slot));
    if (step === 3) return data.difficulty !== null;
    return false;
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-white via-[#F0FDFA] to-[#E0F2FE] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors">
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
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#006D77] to-[#06D6A0] rounded-2xl mb-4">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      The Loadout
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      What subjects are we conquering together?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SUBJECTS.map((subject) => (
                      <motion.button
                        key={subject.id}
                        onClick={() => handleSubjectToggle(subject.id)}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          data.subjects.includes(subject.id)
                            ? 'border-[#006D77] dark:border-[#06D6A0] bg-[#006D77]/5 dark:bg-[#06D6A0]/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-[#006D77] dark:hover:border-[#06D6A0]'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-4xl mb-2">{subject.icon}</div>
                        <div className={`text-sm font-semibold ${
                          data.subjects.includes(subject.id)
                            ? 'text-[#006D77] dark:text-[#06D6A0]'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {subject.name}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {data.subjects.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-[#06D6A0]/10 dark:bg-[#06D6A0]/20 rounded-lg text-center"
                    >
                      <span className="text-sm text-[#006D77] dark:text-[#06D6A0] font-medium">
                        {data.subjects.length} subject{data.subjects.length !== 1 ? 's' : ''} selected
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#006D77] to-[#06D6A0] rounded-2xl mb-4">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      The Chronotype
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      When is your power hour? Mark your available study times.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                          {DAYS.map((day) => (
                            <th key={day} className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {TIME_SLOTS.map((slot, slotIndex) => (
                          <tr key={slot}>
                            <td className="p-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                              {slot}
                            </td>
                            {DAYS.map((day, dayIndex) => (
                              <td key={`${day}-${slot}`} className="p-2">
                                <motion.button
                                  onClick={() => handleAvailabilityToggle(dayIndex, slotIndex)}
                                  className={`w-full aspect-square rounded-lg transition-all ${
                                    data.availability[dayIndex][slotIndex]
                                      ? 'bg-[#006D77] dark:bg-[#06D6A0]'
                                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                  }`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {data.availability[dayIndex][slotIndex] && (
                                    <span className="text-white dark:text-gray-900">✓</span>
                                  )}
                                </motion.button>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#006D77] to-[#06D6A0] rounded-2xl mb-4">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      The Difficulty Setting
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      How hard do you want to play?
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <motion.button
                      onClick={() => handleDifficultySelect('casual')}
                      className={`p-8 rounded-2xl border-2 transition-all ${
                        data.difficulty === 'casual'
                          ? 'border-[#006D77] dark:border-[#06D6A0] bg-[#006D77]/5 dark:bg-[#06D6A0]/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-[#006D77] dark:hover:border-[#06D6A0]'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-6xl mb-4">🌱</div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Casual</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        Perfect for balanced learning
                      </p>
                      <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">
                          <span className="text-[#06D6A0]">✓</span> More breaks
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#06D6A0]">✓</span> Slower pace
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#06D6A0]">✓</span> Flexible deadlines
                        </li>
                      </ul>
                    </motion.button>

                    <motion.button
                      onClick={() => handleDifficultySelect('hardcore')}
                      className={`p-8 rounded-2xl border-2 transition-all ${
                        data.difficulty === 'hardcore'
                          ? 'border-[#006D77] dark:border-[#06D6A0] bg-[#006D77]/5 dark:bg-[#06D6A0]/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-[#006D77] dark:hover:border-[#06D6A0]'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-6xl mb-4">🔥</div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hardcore</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        For serious achievers
                      </p>
                      <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">
                          <span className="text-[#FFB400]">✓</span> Intense sessions
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#FFB400]">✓</span> High XP rewards
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#FFB400]">✓</span> Challenging goals
                        </li>
                      </ul>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 max-w-4xl mx-auto">
            <motion.button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border-2 border-gray-200 dark:border-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              whileHover={step > 1 ? { scale: 1.05 } : {}}
              whileTap={step > 1 ? { scale: 0.95 } : {}}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <motion.button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3 bg-[#006D77] dark:bg-[#06D6A0] text-white dark:text-gray-900 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#005a63] dark:hover:bg-[#05c295] transition-all shadow-lg"
              whileHover={canProceed() ? { scale: 1.05 } : {}}
              whileTap={canProceed() ? { scale: 0.95 } : {}}
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
