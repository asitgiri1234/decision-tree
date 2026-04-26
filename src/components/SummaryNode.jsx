import { motion } from 'framer-motion';

export default function SummaryNode({ node, onContinue }) {
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center w-full max-w-lg"
    >
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
        <svg
          className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-lg font-medium text-emerald-800 dark:text-emerald-100 mb-2">
        Your Reflection Summary
      </h2>

      <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl px-8 py-8 mb-8 mt-4">
        <p className="text-lg text-emerald-900 dark:text-emerald-50 font-light leading-relaxed">
          {node.text}
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-semibold rounded-lg transition-colors"
      >
        Finish
      </motion.button>
    </motion.div>
  );
}
