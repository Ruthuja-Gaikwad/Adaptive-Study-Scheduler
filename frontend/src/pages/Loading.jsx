import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles } from 'lucide-react';

const LOADING_STEPS = [
  { text: 'Analyzing Syllabus...', duration: 2000 },
  { text: 'Calculating Optimal Path...', duration: 2000 },
  { text: 'Predicting Burnout Points...', duration: 2000 },
  { text: 'Initializing Your World...', duration: 1500 },
];

export function Loading() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepTimer;
    let progressInterval;

    const totalDuration = LOADING_STEPS.reduce((sum, step) => sum + step.duration, 0);
    const progressIncrement = 100 / (totalDuration / 50);

    // Progress bar animation
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + progressIncrement;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 50);

    // Step transitions
    const runSteps = async () => {
      for (let i = 0; i < LOADING_STEPS.length; i++) {
        setCurrentStep(i);
        await new Promise((resolve) => {
          stepTimer = setTimeout(resolve, LOADING_STEPS[i].duration);
        });
      }
      // Navigate to dashboard after all steps
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    };

    runSteps();

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#006D77] via-[#005a63] to-[#004a52] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Logo/Icon */}
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl mb-8"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Generating Your World
          </h1>
          <p className="text-white/80 text-lg mb-12">
            Our AI is crafting your personalized learning journey...
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FFB400] via-[#06D6A0] to-[#FFB400] rounded-full"
                style={{ width: `${progress}%` }}
                initial={{ width: '0%' }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="mt-2 text-white/60 text-sm font-medium">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Loading Steps */}
          <div className="space-y-4">
            {LOADING_STEPS.map((step, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-lg backdrop-blur-sm transition-all ${
                  index === currentStep
                    ? 'bg-white/20'
                    : index < currentStep
                    ? 'bg-white/10'
                    : 'bg-white/5'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: index <= currentStep ? 1 : 0.5,
                  x: 0,
                }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    index < currentStep
                      ? 'bg-[#06D6A0]'
                      : index === currentStep
                      ? 'bg-[#FFB400]'
                      : 'bg-white/20'
                  }`}
                >
                  {index < currentStep ? (
                    <span className="text-white font-bold">✓</span>
                  ) : index === currentStep ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <span className="text-white/40 font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Text */}
                <span
                  className={`flex-1 text-left font-medium transition-all ${
                    index === currentStep
                      ? 'text-white'
                      : index < currentStep
                      ? 'text-white/70'
                      : 'text-white/40'
                  }`}
                >
                  {step.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Fun Tip */}
          <motion.div
            className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="text-[#FFB400] font-semibold mb-2 flex items-center justify-center gap-2">
              <span>💡</span> Pro Tip
            </div>
            <p className="text-white/80 text-sm">
              The Academic Navigator adapts to your progress in real-time. If you miss a task, 
              we'll automatically reschedule it to keep you on track!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
