// Mock data for the dashboard

export const mockMetrics = {
  adoption: {
    activeUsers: { current: 1247, change: 12.3 },
    activeAgents: { current: 342, change: 8.5 },
    runsPerDay: { current: 15623, change: -3.2 },
    peakConcurrency: { current: 89, change: 5.7 }
  },
  reliability: {
    successRate: { current: 94.2, change: 2.1 },
    failureRate: { current: 5.8, change: -2.1 },
    p50Duration: { current: 2.3, change: -8.4 },
    p95Duration: { current: 12.7, change: -5.2 },
    retryRate: { current: 3.1, change: 0.5 }
  },
  cost: {
    totalCost: { current: 47823, change: 15.2 },
    costPerRun: { current: 3.06, change: -2.3 },
    totalTokens: { current: 2847392, change: 18.5 },
    cacheHitRate: { current: 67.4, change: 5.2 }
  },
  governance: {
    policyBlocks: { current: 147, change: -12.4 },
    secretsScans: { current: 23, change: 8.7 },
    dataEgress: { current: 847, change: 22.1 }
  }
};

export const mockProjects = [
  { id: 'p1', name: 'Customer Support AI', runs: 5847, success: 96.2, cost: 18234, agents: 12 },
  { id: 'p2', name: 'Data Pipeline Automation', runs: 4293, success: 91.5, cost: 12847, agents: 8 },
  { id: 'p3', name: 'Code Review Assistant', runs: 2847, success: 98.1, cost: 9234, agents: 5 },
  { id: 'p4', name: 'Sales Intelligence', runs: 1923, success: 89.7, cost: 5123, agents: 7 },
  { id: 'p5', name: 'Content Generator', runs: 1547, success: 93.4, cost: 3847, agents: 4 },
];

export const mockAgents = [
  { id: 'a1', name: 'Ticket Classifier', project: 'Customer Support AI', runs: 2341, success: 97.8, avgDuration: 1.2 },
  { id: 'a2', name: 'Response Generator', project: 'Customer Support AI', runs: 2103, success: 95.4, avgDuration: 3.4 },
  { id: 'a3', name: 'ETL Orchestrator', project: 'Data Pipeline Automation', runs: 1847, success: 92.1, avgDuration: 8.7 },
  { id: 'a4', name: 'Data Validator', project: 'Data Pipeline Automation', runs: 1523, success: 90.3, avgDuration: 2.1 },
  { id: 'a5', name: 'PR Reviewer', project: 'Code Review Assistant', runs: 1847, success: 98.9, avgDuration: 5.2 },
  { id: 'a6', name: 'Lead Scorer', project: 'Sales Intelligence', runs: 923, success: 88.4, avgDuration: 1.8 },
];

export const mockRuns = [
  { id: 'r1', agent: 'Ticket Classifier', status: 'success', duration: 1.2, cost: 0.34, timestamp: '2026-02-27T14:23:45Z', project: 'Customer Support AI' },
  { id: 'r2', agent: 'Response Generator', status: 'success', duration: 3.8, cost: 1.23, timestamp: '2026-02-27T14:21:12Z', project: 'Customer Support AI' },
  { id: 'r3', agent: 'ETL Orchestrator', status: 'failed', duration: 12.4, cost: 2.45, timestamp: '2026-02-27T14:18:34Z', project: 'Data Pipeline Automation', error: 'Timeout' },
  { id: 'r4', agent: 'PR Reviewer', status: 'success', duration: 4.7, cost: 1.89, timestamp: '2026-02-27T14:15:23Z', project: 'Code Review Assistant' },
  { id: 'r5', agent: 'Data Validator', status: 'success', duration: 1.9, cost: 0.67, timestamp: '2026-02-27T14:12:56Z', project: 'Data Pipeline Automation' },
  { id: 'r6', agent: 'Lead Scorer', status: 'failed', duration: 8.3, cost: 1.12, timestamp: '2026-02-27T14:09:18Z', project: 'Sales Intelligence', error: 'Model Error' },
  { id: 'r7', agent: 'Ticket Classifier', status: 'success', duration: 0.9, cost: 0.28, timestamp: '2026-02-27T14:05:42Z', project: 'Customer Support AI' },
  { id: 'r8', agent: 'Response Generator', status: 'success', duration: 4.2, cost: 1.45, timestamp: '2026-02-27T14:02:11Z', project: 'Customer Support AI' },
];

export const mockRunDetail = {
  id: 'r3',
  agent: 'ETL Orchestrator',
  project: 'Data Pipeline Automation',
  status: 'failed',
  duration: 12.4,
  cost: 2.45,
  timestamp: '2026-02-27T14:18:34Z',
  error: 'Timeout',
  errorCategory: 'Infrastructure',
  steps: [
    { id: 's1', name: 'Initialize', status: 'success', duration: 0.3, timestamp: '14:18:34' },
    { id: 's2', name: 'Fetch Data', status: 'success', duration: 2.1, timestamp: '14:18:35' },
    { id: 's3', name: 'Transform', status: 'success', duration: 4.8, timestamp: '14:18:37' },
    { id: 's4', name: 'Load to DB', status: 'failed', duration: 5.2, timestamp: '14:18:42', error: 'Connection timeout after 5s' },
  ],
  metadata: {
    model: 'gpt-4',
    tokensIn: 2847,
    tokensOut: 1234,
    toolCalls: 7,
    retries: 2,
  }
};

export const mockChartData = {
  runsOverTime: [
    { time: '00:00', runs: 423 },
    { time: '04:00', runs: 234 },
    { time: '08:00', runs: 1247 },
    { time: '12:00', runs: 1856 },
    { time: '16:00', runs: 1432 },
    { time: '20:00', runs: 892 },
  ],
  successRateOverTime: [
    { time: '00:00', rate: 93.2 },
    { time: '04:00', rate: 95.1 },
    { time: '08:00', rate: 94.8 },
    { time: '12:00', rate: 93.5 },
    { time: '16:00', rate: 94.9 },
    { time: '20:00', rate: 95.3 },
  ],
  costByProject: [
    { name: 'Customer Support', value: 18234 },
    { name: 'Data Pipeline', value: 12847 },
    { name: 'Code Review', value: 9234 },
    { name: 'Sales Intel', value: 5123 },
    { name: 'Content Gen', value: 3847 },
  ],
  failuresByCategory: [
    { category: 'Timeout', count: 42 },
    { category: 'Model Error', count: 28 },
    { category: 'Tool Error', count: 18 },
    { category: 'Policy Block', count: 12 },
    { category: 'Infrastructure', count: 8 },
  ]
};
