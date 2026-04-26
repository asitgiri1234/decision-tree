import { motion } from 'framer-motion';

export default function ReflectionNode({ node, onContinue }) {
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center w-full max-w-md"
    >
      <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
        <svg
          className="w-7 h-7 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl px-8 py-8 mb-8">
        <p className="text-lg text-indigo-100 font-light leading-relaxed">
          {node.text}
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
