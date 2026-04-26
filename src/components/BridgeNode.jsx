import { motion } from 'framer-motion';

export default function BridgeNode({ node }) {
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center w-full max-w-md"
    >
      <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mb-6">
        <svg
          className="w-6 h-6 text-teal-600 dark:text-teal-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      </div>

      <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200">{node.text}</h2>
    </motion.div>
  );
}
