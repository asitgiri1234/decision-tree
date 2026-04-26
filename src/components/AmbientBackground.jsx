import { motion } from 'framer-motion';

const axisGradients = {
  start: 'from-slate-200 via-slate-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900',
  axis1: 'from-teal-100/40 via-slate-100 to-white dark:from-teal-900/20 dark:via-slate-950 dark:to-slate-900',
  axis2: 'from-indigo-100/40 via-slate-100 to-white dark:from-indigo-900/20 dark:via-slate-950 dark:to-slate-900',
  axis3: 'from-emerald-100/40 via-slate-100 to-white dark:from-emerald-900/20 dark:via-slate-950 dark:to-slate-900',
  end: 'from-slate-200 via-slate-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900',
};

function getGradientKey(nodeId, nodeType) {
  if (nodeType === 'start') return 'start';
  if (nodeType === 'end') return 'end';
  if (nodeId.startsWith('A1_') || nodeId === 'BRIDGE_1_2') return 'axis1';
  if (nodeId.startsWith('A2_') || nodeId === 'BRIDGE_2_3') return 'axis2';
  if (nodeId.startsWith('A3_') || nodeId === 'SUMMARY') return 'axis3';
  return 'start';
}

export default function AmbientBackground({ nodeId, nodeType }) {
  const key = getGradientKey(nodeId, nodeType);
  const gradient = axisGradients[key];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
      />
      {/* Subtle orb */}
      <motion.div
        key={`${key}-orb`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.4,
          scale: [1, 1.1, 1],
          x: [0, 20, -10, 0],
          y: [0, -15, 10, 0],
        }}
        transition={{
          opacity: { duration: 1.5 },
          scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          x: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full blur-3xl ${
          key === 'axis1'
            ? 'bg-teal-300/20 dark:bg-teal-500/10'
            : key === 'axis2'
            ? 'bg-indigo-300/20 dark:bg-indigo-500/10'
            : key === 'axis3'
            ? 'bg-emerald-300/20 dark:bg-emerald-500/10'
            : 'bg-slate-300/20 dark:bg-slate-500/10'
        }`}
      />
      <motion.div
        key={`${key}-orb2`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.3,
          scale: [1, 1.15, 1],
          x: [0, -15, 20, 0],
          y: [0, 10, -15, 0],
        }}
        transition={{
          opacity: { duration: 1.5 },
          scale: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
          x: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full blur-3xl ${
          key === 'axis1'
            ? 'bg-teal-300/15 dark:bg-teal-500/10'
            : key === 'axis2'
            ? 'bg-indigo-300/15 dark:bg-indigo-500/10'
            : key === 'axis3'
            ? 'bg-emerald-300/15 dark:bg-emerald-500/10'
            : 'bg-slate-300/15 dark:bg-slate-500/10'
        }`}
      />
    </div>
  );
}
