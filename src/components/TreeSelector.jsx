import { motion } from 'framer-motion';

export default function TreeSelector({ trees, activeTree, onSelect }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {trees.map((tree) => (
        <motion.button
          key={tree.key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(tree.key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTree === tree.key
              ? 'bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {tree.label}
        </motion.button>
      ))}
    </div>
  );
}
