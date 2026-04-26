import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  createTreeEngine,
  createEmptySignals,
  applySignal,
  reverseSignal,
  buildSummaryText,
} from './engine/treeEngine';
import { getTimeAwareGreeting } from './engine/greeting';
import { playSelect, playTransition, playChime, playBack } from './engine/soundEngine';

import dailyTreeData from './data/reflection-tree.json';
import relationshipsTreeData from './data/trees/relationships.json';

import ProgressBar from './components/ProgressBar';
import StartNode from './components/StartNode';
import QuestionNode from './components/QuestionNode';
import ReflectionNode from './components/ReflectionNode';
import BridgeNode from './components/BridgeNode';
import SummaryNode from './components/SummaryNode';
import EndNode from './components/EndNode';
import ThemeToggle from './components/ThemeToggle';
import AmbientBackground from './components/AmbientBackground';
import TreeSelector from './components/TreeSelector';

const TREES = [
  { key: 'daily', label: 'Daily', data: dailyTreeData },
  { key: 'relationships', label: 'Relationships', data: relationshipsTreeData },
];

const treeEngines = {};
TREES.forEach((t) => {
  treeEngines[t.key] = createTreeEngine(t.data);
});

export default function App() {
  const [activeTreeKey, setActiveTreeKey] = useState('daily');
  const [currentNodeId, setCurrentNodeId] = useState('START');
  const [answers, setAnswers] = useState({});
  const [signals, setSignals] = useState(() => createEmptySignals());
  const [summaryText, setSummaryText] = useState('');
  const [history, setHistory] = useState([]);
  const [isDark, setIsDark] = useState(true);

  const engine = treeEngines[activeTreeKey];
  const currentNode = engine.getNode(currentNodeId);
  const currentAxis = engine.getCurrentAxis(currentNodeId);

  const timeGreeting = useMemo(() => getTimeAwareGreeting(), []);

  // Theme toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Auto-evaluate decision nodes and auto-advance from bridge nodes
  useEffect(() => {
    if (!currentNode) return;

    if (currentNode.type === 'decision') {
      const triggeringNodeId = Object.keys(answers).pop();
      const triggeringAnswer = answers[triggeringNodeId];
      const nextId = engine.evaluateDecision(currentNode, triggeringAnswer);
      if (nextId) {
        setCurrentNodeId(nextId);
      }
      return;
    }

    if (currentNode.type === 'bridge') {
      playTransition();
      const timer = setTimeout(() => {
        const nextId = engine.getNextNodeId(currentNodeId, null, signals);
        if (nextId) {
          setCurrentNodeId(nextId);
        }
      }, 1800);
      return () => clearTimeout(timer);
    }

    if (currentNode.type === 'end') {
      playChime();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: isDark
          ? ['#14b8a6', '#6366f1', '#10b981', '#f8fafc']
          : ['#0d9488', '#4f46e5', '#059669', '#1e293b'],
      });
    }
  }, [currentNodeId, currentNode, answers, signals, engine, isDark]);

  // Compute summary text when reaching SUMMARY node
  useEffect(() => {
    if (currentNodeId === 'SUMMARY' && currentNode) {
      const text = buildSummaryText(currentNode.text, signals);
      setSummaryText(text);
    }
  }, [currentNodeId, currentNode, signals]);

  const resetSession = useCallback(
    (treeKey = activeTreeKey, nodeId = 'START') => {
      setActiveTreeKey(treeKey);
      setCurrentNodeId(nodeId);
      setAnswers({});
      setSignals(createEmptySignals());
      setSummaryText('');
      setHistory([]);
    },
    [activeTreeKey]
  );

  const handleTreeSelect = useCallback(
    (treeKey) => {
      if (treeKey === activeTreeKey) return;
      resetSession(treeKey, 'START');
    },
    [activeTreeKey, resetSession]
  );

  const handleBegin = useCallback(() => {
    playTransition();
    const nextId = engine.getNextNodeId(currentNodeId, null, signals);
    if (nextId) {
      setHistory([{ nodeId: currentNodeId }]);
      setCurrentNodeId(nextId);
    }
  }, [currentNodeId, signals, engine]);

  const handleAnswer = useCallback(
    (optionIndex) => {
      const node = currentNode;
      if (!node || node.type !== 'question') return;

      playSelect();
      const selectedOption = node.options[optionIndex];

      // Record answer
      setAnswers((prev) => ({ ...prev, [node.id]: selectedOption }));

      // Apply signal if present
      let updatedSignals = signals;
      const signalStr = node.signal?.[optionIndex];
      if (signalStr) {
        updatedSignals = applySignal({ ...signals }, signalStr);
        setSignals(updatedSignals);
      }

      // Compute next node
      const nextId = engine.getNextNodeId(node.id, selectedOption, updatedSignals);
      if (nextId) {
        setHistory((prev) => [...prev, { nodeId: node.id, answer: selectedOption, signal: signalStr }]);
        setCurrentNodeId(nextId);
      }
    },
    [currentNode, signals, engine]
  );

  const handleContinue = useCallback(() => {
    playTransition();
    const nextId = engine.getNextNodeId(currentNodeId, null, signals);
    if (nextId) {
      setHistory((prev) => [...prev, { nodeId: currentNodeId }]);
      setCurrentNodeId(nextId);
    }
  }, [currentNodeId, signals, engine]);

  const handleBack = useCallback(() => {
    if (history.length === 0) return;

    playBack();
    const newHistory = [...history];
    const lastStep = newHistory.pop();

    // Reverse signal if an answer was recorded
    if (lastStep?.signal) {
      setSignals((prev) => reverseSignal({ ...prev }, lastStep.signal));
    }

    // Remove answer if present
    if (lastStep?.answer && lastStep.nodeId) {
      setAnswers((prev) => {
        const copy = { ...prev };
        delete copy[lastStep.nodeId];
        return copy;
      });
    }

    // Go to previous node
    const previousStep = newHistory[newHistory.length - 1];
    const targetNodeId = previousStep ? previousStep.nodeId : 'START';

    setHistory(newHistory);
    setCurrentNodeId(targetNodeId);
  }, [history]);

  const handleRestart = useCallback(() => {
    resetSession(activeTreeKey, 'START');
  }, [activeTreeKey, resetSession]);

  const canGoBack = history.length > 0 && currentNode?.type !== 'start' && currentNode?.type !== 'end';

  if (!currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
        Something went wrong. Node not found.
      </div>
    );
  }

  const startNodeText = currentNode.type === 'start'
    ? `${timeGreeting}. Let's reflect on your day.`
    : currentNode.text;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientBackground nodeId={currentNodeId} nodeType={currentNode.type} />
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />

      <div className="w-full max-w-2xl relative z-10">
        {currentNode.type !== 'start' && currentNode.type !== 'end' && (
          <ProgressBar currentAxis={currentAxis} />
        )}

        {/* Back button */}
        {canGoBack && (
          <div className="flex justify-start mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        )}

        <div className="min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentNode.type === 'start' && (
              <StartNode
                key={`${activeTreeKey}-START`}
                node={{ ...currentNode, text: startNodeText }}
                onBegin={handleBegin}
              >
                <TreeSelector
                  trees={TREES}
                  activeTree={activeTreeKey}
                  onSelect={handleTreeSelect}
                />
              </StartNode>
            )}

            {currentNode.type === 'question' && (
              <QuestionNode
                key={currentNode.id}
                node={currentNode}
                onAnswer={handleAnswer}
              />
            )}

            {currentNode.type === 'reflection' && (
              <ReflectionNode
                key={currentNode.id}
                node={currentNode}
                onContinue={handleContinue}
              />
            )}

            {currentNode.type === 'bridge' && (
              <BridgeNode key={currentNode.id} node={currentNode} />
            )}

            {currentNode.type === 'summary' && (
              <SummaryNode
                key="SUMMARY"
                node={{ ...currentNode, text: summaryText || currentNode.text }}
                onContinue={handleContinue}
              />
            )}

            {currentNode.type === 'end' && (
              <EndNode
                key="END"
                node={currentNode}
                onRestart={handleRestart}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
