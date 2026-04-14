export interface Thought {
  id: string;
  content: string;
  timestamp: number;
  tags: string[];
  frameworks: string[];
  isArchived: boolean;
}

export interface AnalysisResult {
  summary: string;
  themes: string[];
  patterns: string[];
  suggestedFrameworks: string[];
  actionableInsights: string[];
  connections: { from: string; to: string; reason: string }[];
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  category: 'Decision Making' | 'Problem Solving' | 'Systems Thinking' | 'Mental Model';
  principles: string[];
}
