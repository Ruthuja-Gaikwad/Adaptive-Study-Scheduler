import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useCognitiveCheckin } from '../contexts/CognitiveCheckinContext';
import { Button } from './ui/button';

export function MorningCheckinModal({ isOpen, onClose, userId }) {
  const { isDarkMode } = useDarkMode();
  const { setCheckinData } = useCognitiveCheckin();
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSleepHours(7);
      setSleepQuality(3);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error: upsertError } = await supabase
        .from('sleep_logs')
        .upsert(
          {
            user_id: userId,
            sleep_date: today,
            sleep_hours: sleepHours,
            sleep_quality: sleepQuality,
          },
          { onConflict: 'user_id,sleep_date' }
        );

      if (upsertError) {
        throw upsertError;
      }

      const webhookUrl = 'http://localhost:5678/webhook-test/csi-calculate';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate CSI');
      }

      const responseData = await response.json();
      console.log('[MORNING CHECK-IN] Webhook response:', responseData);

      // Handle array response format: [{ csi, mode, rerouteStrategy, taskReduction, burnoutScore }]
      const payload = Array.isArray(responseData) ? responseData[0] : responseData;
      
      if (!payload) {
        throw new Error('Invalid response from CSI webhook');
      }

      console.log('[MORNING CHECK-IN] Extracted payload:', payload);

      // Update global state with ALL returned data
      setCheckinData({
        csi: payload.csi,
        mode: payload.mode,
        burnoutScore: payload.burnoutScore,
        rerouteStrategy: payload.rerouteStrategy,
        taskReduction: payload.taskReduction,
      });

      onClose();
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err?.message || 'Failed to submit check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const mutedText = isDarkMode ? '#94a3b8' : '#64748b';
  const panelBg = isDarkMode ? '#111827' : '#ffffff';
  const inputBg = isDarkMode ? '#0f172a' : '#f8fafc';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-md rounded-2xl shadow-2xl border"
              style={{ backgroundColor: panelBg, borderColor: isDarkMode ? '#1f2937' : '#e2e8f0' }}
            >
              <div className="px-6 py-6 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold" style={{ color: textColor }}>
                    Morning Cognitive Check-in
                  </h2>
                  <p className="text-sm" style={{ color: mutedText }}>
                    Quick check-in to personalize your day.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: textColor }}>
                    Sleep hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(event) => setSleepHours(Number(event.target.value))}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      color: textColor,
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: textColor }}>
                    Sleep quality
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSleepQuality(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= sleepQuality
                              ? 'fill-amber-400 text-amber-400'
                              : isDarkMode
                              ? 'text-slate-600'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div
                    className="rounded-xl border px-3 py-2 text-xs"
                    style={{
                      borderColor: isDarkMode ? '#7f1d1d' : '#fecaca',
                      color: isDarkMode ? '#fecaca' : '#991b1b',
                      backgroundColor: isDarkMode ? '#450a0a' : '#fee2e2',
                    }}
                  >
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full rounded-xl"
                  style={{
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}