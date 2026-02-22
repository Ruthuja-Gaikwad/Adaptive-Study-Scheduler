import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export function QuestBadge({ isDarkMode = false, animated = true }) {
  return (
    <motion.div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)'
          : 'linear-gradient(135deg, #d946ef 0%, #f472b6 100%)',
        color: '#ffffff',
        boxShadow: isDarkMode 
          ? '0 0 12px rgba(147, 51, 234, 0.4)'
          : '0 0 12px rgba(217, 70, 239, 0.4)',
      }}
      animate={animated ? { scale: [1, 1.05, 1], opacity: [1, 0.9, 1] } : undefined}
      transition={animated ? { duration: 2, repeat: Infinity } : undefined}
    >
      <Trophy className="w-4 h-4" />
      <span>QUEST</span>
    </motion.div>
  );
}
