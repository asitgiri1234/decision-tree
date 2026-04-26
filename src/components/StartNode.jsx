import { motion } from 'framer-motion';

export default function StartNode({ node, onBegin, children }) {
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center space-y-6"
    >
      <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-teal-600 dark:text-teal-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-light text-slate-800 dark:text-slate-100 leading-snug max-w-sm">
        {node.text}
      </h1>

      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
        A short reflection to help you process your day and prepare for tomorrow.
      </p>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onBegin}
        className="px-8 py-3 bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-semibold rounded-lg transition-colors"
      >
        Begin Reflection
      </motion.button>

      {children}
    </motion.div>
  );
}
