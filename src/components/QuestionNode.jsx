import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function QuestionNode({ node, onAnswer }) {
  return (
    <motion.div
      key={node.id}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="flex flex-col items-center text-center w-full max-w-md"
    >
      <motion.h2
        variants={itemVariants}
        className="text-xl font-medium text-slate-100 mb-8 leading-relaxed"
      >
        {node.text}
      </motion.h2>

      <div className="w-full space-y-3">
        {node.options.map((option, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(45, 55, 72, 1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(index)}
            className="w-full px-5 py-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-left text-slate-200 transition-colors"
          >
            <span className="inline-block w-6 h-6 rounded-full bg-slate-700 text-xs text-slate-400 font-medium text-center leading-6 mr-3">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
