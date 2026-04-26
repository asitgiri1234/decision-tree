import { motion } from 'framer-motion';

export default function EndNode({ node, onRestart }) {
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-teal-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-light text-slate-100">{node.text}</h1>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRestart}
        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-lg transition-colors"
      >
        Reflect Again
      </motion.button>
    </motion.div>
  );
}
