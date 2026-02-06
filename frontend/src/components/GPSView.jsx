import { motion } from 'motion/react';
import { CheckCircle2, Circle, XCircle, Navigation } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

export function GPSView() {
  const { isDarkMode } = useDarkMode();
  const timelineNodes = [
    { id: '1', title: 'Math Chapter 1', date: 'Feb 1', time: '9:00 AM', status: 'completed', subject: 'Math', xp: 100 },
    { id: '2', title: 'Physics Lab Report', date: 'Feb 1', time: '2:00 PM', status: 'completed', subject: 'Physics', xp: 150 },
    { id: '3', title: 'Chemistry Quiz Prep', date: 'Feb 2', time: '10:00 AM', status: 'completed', subject: 'Chemistry', xp: 75 },
    { id: '4', title: 'Biology Reading', date: 'Feb 2', time: '4:00 PM', status: 'missed', subject: 'Biology', xp: 50 },
    { id: '5', title: 'Math Problem Set', date: 'Feb 3', time: '11:00 AM', status: 'active', subject: 'Math', xp: 100 },
    { id: '6', title: 'Biology Reading (Rescheduled)', date: 'Feb 3', time: '3:00 PM', status: 'rescheduled', subject: 'Biology', xp: 50 },
    { id: '7', title: 'Physics Chapter 4', date: 'Feb 3', time: '7:00 PM', status: 'upcoming', subject: 'Physics', xp: 150 },
    { id: '8', title: 'Chemistry Lab', date: 'Feb 4', time: '9:00 AM', status: 'upcoming', subject: 'Chemistry', xp: 200 },
  ];

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div 
        className="border-b px-8 py-6 transition-colors"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb'
        }}
      >
        <div className="flex items-center gap-3">
          <Navigation 
            className="w-8 h-8"
            style={{ color: isDarkMode ? '#06D6A0' : '#006D77' }}
          />
          <div>
            <h2 
              className="text-3xl font-bold"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              Your Learning Path
            </h2>
            <p 
              className="mt-1"
              style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
            >
              Adaptive scheduling with intelligent rerouting
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div 
        className="p-8"
        style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff' }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Legend */}
          <div 
            className="rounded-xl shadow-md p-6 mb-8 transition-colors"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
            }}
          >
            <h3 
              className="font-semibold mb-4"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              Legend
            </h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#06D6A0]" />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-5 h-5 rounded-full border-4 animate-pulse"
                  style={{
                    borderColor: isDarkMode ? '#06D6A0' : '#006D77',
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                  }}
                />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Active Now</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle 
                  className="w-5 h-5" 
                  style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
                />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[#EF476F]" />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Missed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 border-t-2 border-dashed border-[#FFB400]" />
                <span className="text-sm" style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Auto-Rerouted</span>
              </div>
            </div>
          </div>

          {/* The WOW Factor - Reroute Explanation */}
          <motion.div
            className="border-l-4 border-[#FFB400] rounded-lg p-6 mb-8"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(to right, rgba(255, 180, 0, 0.2), rgba(255, 180, 0, 0.1))'
                : 'linear-gradient(to right, rgba(255, 180, 0, 0.1), rgba(255, 180, 0, 0.05))'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 
              className="font-semibold text-lg mb-2 flex items-center gap-2"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              <span className="text-2xl">✨</span>
              Adaptive Rerouting Activated!
            </h3>
            <p 
              style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
            >
              We detected you missed "Biology Reading" yesterday. No worries! We've automatically rescheduled 
              it to today at 3:00 PM, fitting perfectly into your free slot. Stay on track without the stress!
            </p>
          </motion.div>

          {/* Metro-style Timeline */}
          <div 
            className="rounded-xl shadow-md p-8 transition-colors"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
            }}
          >
            <div className="relative">
              {timelineNodes.map((node, index) => {
                const nextNode = timelineNodes[index + 1];
                const isReroute = node.status === 'rescheduled';
                const prevNodeMissed = index > 0 && timelineNodes[index - 1].status === 'missed';

                return (
                  <div key={node.id} className="relative">
                    <TimelineNodeComponent 
                      node={node} 
                      isReroute={isReroute}
                      prevNodeMissed={prevNodeMissed}
                      isDarkMode={isDarkMode}
                    />
                    
                    {/* Connection Line */}
                    {nextNode && (
                      <div className="relative ml-12 h-12">
                        {isReroute ? (
                          // Dashed amber reroute line
                          <svg 
                            className="absolute left-0 top-0 w-full h-full" 
                            style={{ overflow: 'visible' }}
                          >
                            <path
                              d="M 0 0 Q 20 24, 0 48"
                              stroke="#FFB400"
                              strokeWidth="3"
                              strokeDasharray="8 4"
                              fill="none"
                            />
                          </svg>
                        ) : node.status === 'missed' ? (
                          // Gray line for missed
                          <div className="absolute left-0 top-0 w-1 h-full bg-gray-300" />
                        ) : (
                          // Normal line
                          <div className={`absolute left-0 top-0 w-1 h-full ${
                            node.status === 'completed' ? 'bg-[#06D6A0]' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineNodeComponent({ 
  node, 
  isReroute,
  prevNodeMissed,
  isDarkMode
}) {
  return (
    <motion.div
      className="flex items-start gap-4 pb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Node Icon */}
      <div className="relative flex-shrink-0">
        {node.status === 'completed' && (
          <CheckCircle2 className="w-10 h-10 text-[#06D6A0] fill-[#06D6A0]" />
        )}
        {node.status === 'active' && (
          <motion.div
            className="w-10 h-10 rounded-full border-4 border-[#006D77] bg-white"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {node.status === 'upcoming' && (
          <Circle 
            className="w-10 h-10" 
            strokeWidth={2}
            style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}
          />
        )}
        {node.status === 'missed' && (
          <XCircle className="w-10 h-10 text-[#EF476F]" />
        )}
        {node.status === 'rescheduled' && (
          <div className="w-10 h-10 rounded-full border-4 border-[#FFB400] bg-white flex items-center justify-center">
            <span className="text-lg">🔄</span>
          </div>
        )}
      </div>

      {/* Node Content */}
      <div 
        className="flex-1 rounded-lg p-4 relative transition-colors"
        style={{
          backgroundColor: isReroute 
            ? (isDarkMode ? 'rgba(120, 53, 15, 0.2)' : '#FFF8E1')
            : (isDarkMode ? '#374151' : '#f3f4f6')
        }}
      >
        {isReroute && (
          <div 
            className="absolute -top-8 left-0 text-xs px-3 py-1 rounded-full shadow-md"
            style={{
              backgroundColor: '#FFB400',
              color: isDarkMode ? '#1f2937' : '#ffffff'
            }}
          >
            Auto-adjusted to fit your free slot
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 
              className="font-semibold text-lg"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              {node.title}
            </h4>
            <div className="flex items-center gap-3 mt-2">
              <span 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                {node.date}
              </span>
              <span 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                •
              </span>
              <span 
                className="text-sm"
                style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
              >
                {node.time}
              </span>
              {node.subject && (
                <>
                  <span 
                    className="text-sm"
                    style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  >
                    •
                  </span>
                  {(() => {
                    const style = getSubjectColor(node.subject, isDarkMode);
                    return (
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: style.bg, color: style.color }}
                      >
                        {node.subject}
                      </span>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
          
          {node.xp && (
            <div 
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: isDarkMode ? 'rgba(120, 53, 15, 0.3)' : '#FFF8E1',
                color: '#FFB400'
              }}
            >
              +{node.xp} XP
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getSubjectColor(subject, isDarkMode) {
  const colors = {
    Math: { bg: isDarkMode ? '#1e3a8a' : '#dbeafe', color: isDarkMode ? '#7dd3fc' : '#1e40af' },
    Physics: { bg: isDarkMode ? '#4c1d95' : '#e9d5ff', color: isDarkMode ? '#d8b4fe' : '#6b21a8' },
    Chemistry: { bg: isDarkMode ? '#15803d' : '#dcfce7', color: isDarkMode ? '#86efac' : '#15803d' },
    Biology: { bg: isDarkMode ? '#831843' : '#fbcfe8', color: isDarkMode ? '#f472b6' : '#9d174d' },
  };
  const style = colors[subject] || { bg: isDarkMode ? '#4b5563' : '#f3f4f6', color: isDarkMode ? '#d1d5db' : '#374151' };
  return style;
}
