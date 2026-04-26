import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  getNode,
  getNextNodeId,
  evaluateDecision,
  createEmptySignals,
  applySignal,
  buildSummaryText,
  getCurrentAxis,
} from './engine/treeEngine';

import ProgressBar from './components/ProgressBar';
import StartNode from './components/StartNode';
import QuestionNode from './components/QuestionNode';
import ReflectionNode from './components/ReflectionNode';
import BridgeNode from './components/BridgeNode';
import SummaryNode from './components/SummaryNode';
import EndNode from './components/EndNode';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const [currentNodeId, setCurrentNodeId] = useState('START');
  const [answers, setAnswers] = useState({});
  const [signals, setSignals] = useState(() => createEmptySignals());
  const [summaryText, setSummaryText] = useState('');
  const [isDark, setIsDark] = useState(true);

  const currentNode = getNode(currentNodeId);
  const currentAxis = getCurrentAxis(currentNodeId);

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

    // Decision nodes: auto-route based on the triggering answer
    if (currentNode.type === 'decision') {
      const triggeringNodeId = Object.keys(answers).pop();
      const triggeringAnswer = answers[triggeringNodeId];
      const nextId = evaluateDecision(currentNode, triggeringAnswer);
      if (nextId) {
        setCurrentNodeId(nextId);
      }
      return;
    }

    // Bridge nodes: auto-transition after a delay
    if (currentNode.type === 'bridge') {
      const timer = setTimeout(() => {
        const nextId = getNextNodeId(currentNodeId, null, signals);
        if (nextId) {
          setCurrentNodeId(nextId);
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [currentNodeId, currentNode, answers, signals]);

  const handleBegin = useCallback(() => {
    const nextId = getNextNodeId(currentNodeId, null, signals);
    if (nextId) {
      setCurrentNodeId(nextId);
    }
  }, [currentNodeId, signals]);

  const handleAnswer = useCallback(
    (optionIndex) => {
      const node = currentNode;
      if (!node || node.type !== 'question') return;

      const selectedOption = node.options[optionIndex];

      // Record answer
      setAnswers((prev) => ({ ...prev, [node.id]: selectedOption }));

      // Apply signal if present
      let updatedSignals = signals;
      if (node.signal && node.signal[optionIndex]) {
        updatedSignals = applySignal({ ...signals }, node.signal[optionIndex]);
        setSignals(updatedSignals);
      }

      // Compute next node
      const nextId = getNextNodeId(node.id, selectedOption, updatedSignals);
      if (nextId) {
        setCurrentNodeId(nextId);
      }
    },
    [currentNode, signals]
  );

  const handleContinue = useCallback(() => {
    // For summary node, the next is END. For reflection nodes, the next is computed.
    const nextId = getNextNodeId(currentNodeId, null, signals);
    if (nextId) {
      setCurrentNodeId(nextId);
    }
  }, [currentNodeId, signals]);

  const handleRestart = useCallback(() => {
    setCurrentNodeId('START');
    setAnswers({});
    setSignals(createEmptySignals());
    setSummaryText('');
  }, []);

  // Compute summary text when reaching SUMMARY node
  useEffect(() => {
    if (currentNodeId === 'SUMMARY' && currentNode) {
      const text = buildSummaryText(currentNode.text, signals);
      setSummaryText(text);
    }
  }, [currentNodeId, currentNode, signals]);

  if (!currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
        Something went wrong. Node not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />

      <div className="w-full max-w-2xl">
        {currentNode.type !== 'start' && currentNode.type !== 'end' && (
          <ProgressBar currentAxis={currentAxis} />
        )}

        <div className="min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentNode.type === 'start' && (
              <StartNode key="START" node={currentNode} onBegin={handleBegin} />
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
