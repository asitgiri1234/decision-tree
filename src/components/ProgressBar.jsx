import { motion } from 'framer-motion';

const axisLabels = [
  { num: 1, label: 'Control' },
  { num: 2, label: 'Contribution' },
  { num: 3, label: 'Perspective' },
];

export default function ProgressBar({ currentAxis }) {
  const progress = (currentAxis / 3) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between mb-2">
        {axisLabels.map(({ num, label }) => (
          <div key={num} className="flex flex-col items-center">
            <span
              className={`text-xs font-medium uppercase tracking-wider ${
                num <= currentAxis ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
