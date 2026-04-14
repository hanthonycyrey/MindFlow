import { Framework } from './types';

export const FRAMEWORKS: Framework[] = [
  {
    id: 'ooda-loop',
    name: 'OODA Loop',
    category: 'Decision Making',
    description: 'Observe, Orient, Decide, Act. A four-step cycle for making decisions in high-pressure situations.',
    principles: ['Speed of cycle', 'Implicit guidance', 'Feedback loops']
  },
  {
    id: 'first-principles',
    name: 'First Principles Thinking',
    category: 'Problem Solving',
    description: 'Breaking down complex problems into basic elements and reassembling them from the ground up.',
    principles: ['Deconstruction', 'Analogy avoidance', 'Fundamental truths']
  },
  {
    id: 'pareto-principle',
    name: 'Pareto Principle (80/20 Rule)',
    category: 'Mental Model',
    description: '80% of consequences come from 20% of causes. Focus on the vital few.',
    principles: ['Input-output imbalance', 'Resource optimization', 'Prioritization']
  },
  {
    id: 'systems-thinking',
    name: 'Systems Thinking',
    category: 'Systems Thinking',
    description: 'Understanding how parts of a system interact with each other to produce behavior.',
    principles: ['Interconnectedness', 'Emergence', 'Feedback loops', 'Causality']
  },
  {
    id: 'second-order-thinking',
    name: 'Second-Order Thinking',
    category: 'Decision Making',
    description: 'Thinking about the consequences of consequences.',
    principles: ['Long-term impact', 'Unintended consequences', 'Ripple effects']
  },
  {
    id: 'inversion',
    name: 'Inversion',
    category: 'Problem Solving',
    description: 'Approaching a problem from the opposite end. "Invert, always invert."',
    principles: ['Avoidance of failure', 'Backward reasoning', 'Negative space']
  }
];
