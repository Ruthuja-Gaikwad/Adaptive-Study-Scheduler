import { motion } from 'motion/react';
import { AlertTriangle, Shield, AlertCircle } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const BURNOUT_CONFIG = {
  LOW: {
    icon: Shield,
    label: 'Low Risk',
    color: { bg: '#dcfce7', border: '#10b981', text: '#166534', accent: '#10b981' },
    description: 'You are in a healthy state. Keep up the momentum!',
  },
  MODERATE: {
    icon: AlertCircle,
    label: 'Moderate Risk',
    color: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', accent: '#f59e0b' },
    description: 'Consider taking some well-deserved breaks.',
  },
  HIGH: {
    icon: AlertTriangle,
    label: 'High Risk',
    color: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', accent: '#ef4444' },
    description: 'You need rest. Rerouting to lighter tasks.',
  },
};

export function BurnoutRiskIndicator({ riskLevel = 'LOW' }) {
  const { isDarkMode } = useDarkMode();
  const config = BURNOUT_CONFIG[riskLevel] || BURNOUT_CONFIG.LOW;
  const Icon = config.icon;

  return (
    <motion.div
      className="rounded-2xl p-6 shadow-sm border-2"
      style={{
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : config.color.bg,
        borderColor: config.color.border,
        borderWidth: '2px',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={riskLevel === 'HIGH' ? { scale: [1, 1.1, 1] } : {}}
          transition={riskLevel === 'HIGH' ? { duration: 2, repeat: Infinity } : {}}
        >
          <Icon
            className="w-12 h-12"
            style={{ color: config.color.accent }}
          />
        </motion.div>

        <div className="flex-1">
          <h3
            className="text-lg font-semibold"
            style={{ color: config.color.text }}
          >
            🧠 Burnout Risk: {config.label}
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: config.color.text, opacity: 0.85 }}
          >
            {config.description}
          </p>
        </div>
      </div>

      {riskLevel === 'HIGH' && (
        <div
          className="mt-4 p-3 rounded-lg text-sm"
          style={{
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.15)',
            color: config.color.text,
            borderLeft: `4px solid ${config.color.accent}`,
          }}
        >
          ⚠️ <strong>Intervention Triggered:</strong> Your tasks have been automatically rerouted to lighter topics. Focus on high-success-rate subjects.
        </div>
      )}
    </motion.div>
  );
}
