import treeData from '../data/reflection-tree.json';

const nodesMap = new Map(treeData.nodes.map((n) => [n.id, n]));

export function getNode(id) {
  return nodesMap.get(id) || null;
}

export function getStartNode() {
  return getNode('START');
}

// Evaluate a decision node based on the previous answer
export function evaluateDecision(decisionNode, previousAnswer) {
  if (!decisionNode || decisionNode.type !== 'decision') return null;
  for (const rule of decisionNode.rules) {
    if (rule.if.includes(previousAnswer)) {
      return rule.goTo;
    }
  }
  return null;
}

// Parse a signal string like "axis1:internal" into { axis: 'axis1', value: 'internal' }
export function parseSignal(signalStr) {
  const [axis, value] = signalStr.split(':');
  return { axis, value };
}

// Create empty signals state
export function createEmptySignals() {
  return {
    axis1: { internal: 0, external: 0 },
    axis2: { contribution: 0, entitlement: 0, neutral: 0 },
    axis3: { self: 0, team: 0, other: 0, wide: 0 },
  };
}

// Apply a signal to the signals state
export function applySignal(signals, signalStr) {
  const { axis, value } = parseSignal(signalStr);
  if (signals[axis] && signals[axis][value] !== undefined) {
    signals[axis][value] += 1;
  }
  return signals;
}

// Compute dominant value for a given axis
export function computeDominant(signals, axis) {
  const counts = signals[axis];
  const entries = Object.entries(counts);
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

// Determine which reflection node to show based on axis signals
function getAxis1ReflectionId(signals) {
  const { internal, external } = signals.axis1;
  return internal >= external ? 'A1_REF_INT' : 'A1_REF_EXT';
}

function getAxis2ReflectionId(signals) {
  const { contribution, entitlement } = signals.axis2;
  return contribution > entitlement ? 'A2_REF_CON' : 'A2_REF_ENT';
}

function getAxis3ReflectionId(signals) {
  const { self, team, other, wide } = signals.axis3;
  const beyondSelf = team + other + wide;
  return self > beyondSelf ? 'A3_REF_SELF' : 'A3_REF_WIDE';
}

// Simple linear flow mapping for non-decision, non-reflection routing
const linearFlow = {
  START: 'A1_Q1',
  A1_Q1: 'A1_D1',
  A1_Q2_HIGH: 'A1_Q3',
  A1_Q2_LOW: 'A1_Q3',
  A1_REF_INT: 'BRIDGE_1_2',
  A1_REF_EXT: 'BRIDGE_1_2',
  BRIDGE_1_2: 'A2_Q1',
  A2_Q1: 'A2_Q2',
  A2_Q2: 'A2_Q3',
  A2_REF_CON: 'BRIDGE_2_3',
  A2_REF_ENT: 'BRIDGE_2_3',
  BRIDGE_2_3: 'A3_Q1',
  A3_Q1: 'A3_Q2',
  A3_Q2: 'A3_Q3',
  A3_REF_SELF: 'SUMMARY',
  A3_REF_WIDE: 'SUMMARY',
  SUMMARY: 'END',
};

// Determine the next node ID given the current node, the user's answer, and accumulated state
export function getNextNodeId(currentNodeId, answer, signals) {
  const currentNode = getNode(currentNodeId);
  if (!currentNode) return null;

  // Decision node: route based on previous answer
  if (currentNode.type === 'decision') {
    return evaluateDecision(currentNode, answer);
  }

  // After A1_Q3, route to axis 1 reflection
  if (currentNodeId === 'A1_Q3') {
    return getAxis1ReflectionId(signals);
  }

  // After A2_Q3, route to axis 2 reflection
  if (currentNodeId === 'A2_Q3') {
    return getAxis2ReflectionId(signals);
  }

  // After A3_Q3, route to axis 3 reflection
  if (currentNodeId === 'A3_Q3') {
    return getAxis3ReflectionId(signals);
  }

  // Linear flow
  return linearFlow[currentNodeId] || null;
}

// Build summary text with computed dominant values
export function buildSummaryText(template, signals) {
  const axis1Dom = computeDominant(signals, 'axis1');
  const axis2Dom = computeDominant(signals, 'axis2');
  const axis3Dom = computeDominant(signals, 'axis3');

  return template
    .replace('{axis1.dominant}', axis1Dom)
    .replace('{axis2.dominant}', axis2Dom)
    .replace('{axis3.dominant}', axis3Dom);
}

// Get current axis group for progress tracking
export function getCurrentAxis(nodeId) {
  if (nodeId.startsWith('A1_') || nodeId === 'START' || nodeId === 'BRIDGE_1_2') return 1;
  if (nodeId.startsWith('A2_') || nodeId === 'BRIDGE_2_3') return 2;
  if (nodeId.startsWith('A3_') || nodeId === 'SUMMARY') return 3;
  return 3;
}
