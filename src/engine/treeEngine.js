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

// Reverse a signal (for back navigation)
export function reverseSignal(signals, signalStr) {
  const { axis, value } = parseSignal(signalStr);
  if (signals[axis] && signals[axis][value] !== undefined && signals[axis][value] > 0) {
    signals[axis][value] -= 1;
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

// Factory: create a tree engine bound to a specific tree dataset
export function createTreeEngine(treeData) {
  const nodesMap = new Map(treeData.nodes.map((n) => [n.id, n]));

  function getNode(id) {
    return nodesMap.get(id) || null;
  }

  function getStartNode() {
    return getNode('START');
  }

  function evaluateDecision(decisionNode, previousAnswer) {
    if (!decisionNode || decisionNode.type !== 'decision') return null;
    for (const rule of decisionNode.rules) {
      if (rule.if.includes(previousAnswer)) {
        return rule.goTo;
      }
    }
    return null;
  }

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

  // Build linear flow from the tree itself (all nodes that have a single deterministic next)
  const linearFlow = {};
  const nodeIds = treeData.nodes.map((n) => n.id);

  for (let i = 0; i < treeData.nodes.length; i++) {
    const node = treeData.nodes[i];
    if (node.type === 'start') {
      linearFlow[node.id] = nodeIds[i + 1];
    } else if (node.type === 'question' || node.type === 'reflection' || node.type === 'bridge' || node.type === 'summary') {
      const nextNode = treeData.nodes[i + 1];
      if (nextNode && nextNode.type !== 'decision') {
        linearFlow[node.id] = nextNode.id;
      } else if (nextNode) {
        // Next is a decision node — route through it to its first outcome
        linearFlow[node.id] = nextNode.id;
      }
    }
  }

  // Override known reflection-to-bridge mappings
  for (const node of treeData.nodes) {
    if (node.type === 'reflection' && node.id.startsWith('A1_REF')) {
      const bridge = treeData.nodes.find((n) => n.id === 'BRIDGE_1_2');
      if (bridge) linearFlow[node.id] = bridge.id;
    }
    if (node.type === 'reflection' && node.id.startsWith('A2_REF')) {
      const bridge = treeData.nodes.find((n) => n.id === 'BRIDGE_2_3');
      if (bridge) linearFlow[node.id] = bridge.id;
    }
    if (node.type === 'reflection' && node.id.startsWith('A3_REF')) {
      const summary = treeData.nodes.find((n) => n.type === 'summary');
      if (summary) linearFlow[node.id] = summary.id;
    }
  }

  function getNextNodeId(currentNodeId, answer, signals) {
    const currentNode = getNode(currentNodeId);
    if (!currentNode) return null;

    // Decision node: route based on previous answer
    if (currentNode.type === 'decision') {
      return evaluateDecision(currentNode, answer);
    }

    // After axis question 3, route to reflection
    if (currentNodeId === 'A1_Q3') {
      return getAxis1ReflectionId(signals);
    }
    if (currentNodeId === 'A2_Q3') {
      return getAxis2ReflectionId(signals);
    }
    if (currentNodeId === 'A3_Q3') {
      return getAxis3ReflectionId(signals);
    }

    // Linear flow
    return linearFlow[currentNodeId] || null;
  }

  function getCurrentAxis(nodeId) {
    if (nodeId.startsWith('A1_') || nodeId === 'START' || nodeId === 'BRIDGE_1_2') return 1;
    if (nodeId.startsWith('A2_') || nodeId === 'BRIDGE_2_3') return 2;
    if (nodeId.startsWith('A3_') || nodeId === 'SUMMARY') return 3;
    return 3;
  }

  return {
    treeName: treeData.name || 'Daily',
    getNode,
    getStartNode,
    evaluateDecision,
    getNextNodeId,
    getCurrentAxis,
  };
}
