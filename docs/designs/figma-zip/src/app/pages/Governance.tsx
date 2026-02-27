import { FilterBar } from '../components/wireframe/FilterBar';
import { MetricCard } from '../components/wireframe/MetricCard';
import { ChartPlaceholder } from '../components/wireframe/ChartPlaceholder';
import { DataTable } from '../components/wireframe/DataTable';
import { mockMetrics } from '../mocks/data';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

const mockPolicyBlocks = [
  { id: 'pb1', timestamp: '2026-02-27T14:23:45Z', agent: 'Response Generator', reason: 'PII Detection', severity: 'high' },
  { id: 'pb2', timestamp: '2026-02-27T14:18:12Z', agent: 'Lead Scorer', reason: 'Rate Limit Exceeded', severity: 'medium' },
  { id: 'pb3', timestamp: '2026-02-27T13:45:23Z', agent: 'Data Validator', reason: 'Unauthorized API Access', severity: 'high' },
  { id: 'pb4', timestamp: '2026-02-27T12:32:11Z', agent: 'Ticket Classifier', reason: 'Content Policy Violation', severity: 'low' },
];

const mockSecurityEvents = [
  { id: 'se1', type: 'Secret Detected', description: 'API key found in prompt', timestamp: '2026-02-27T14:12:34Z' },
  { id: 'se2', type: 'Data Egress Alert', description: 'Large file download: 124 MB', timestamp: '2026-02-27T13:45:12Z' },
  { id: 'se3', type: 'Anomalous Behavior', description: 'Unusual token usage pattern', timestamp: '2026-02-27T12:23:45Z' },
];

export function Governance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-tight">
          Governance
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Security, compliance, and policy enforcement
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard 
          title="Policy Blocks"
          value={mockMetrics.governance.policyBlocks.current}
          change={mockMetrics.governance.policyBlocks.change}
          subtitle="Last 7 days"
        />
        <MetricCard 
          title="Secrets Detected"
          value={mockMetrics.governance.secretsScans.current}
          change={mockMetrics.governance.secretsScans.change}
          subtitle="Scanned & blocked"
        />
        <MetricCard 
          title="Data Egress"
          value={mockMetrics.governance.dataEgress.current}
          unit=" GB"
          change={mockMetrics.governance.dataEgress.change}
          subtitle="Total transfer"
        />
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-2 border-green-600 bg-green-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <div className="text-xs text-green-700 uppercase tracking-wide">
              Compliance Score
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-green-900">
            94.2%
          </div>
          <div className="text-xs text-green-700 mt-1">
            Above threshold
          </div>
        </div>
        <div className="border-2 border-orange-600 bg-orange-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div className="text-xs text-orange-700 uppercase tracking-wide">
              Active Alerts
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-orange-900">
            7
          </div>
          <div className="text-xs text-orange-700 mt-1">
            Requires attention
          </div>
        </div>
        <div className="border-2 border-blue-600 bg-blue-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <div className="text-xs text-blue-700 uppercase tracking-wide">
              Audit Events
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-blue-900">
            1,247
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Last 7 days
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder 
          title="Policy Blocks Over Time"
          type="line"
          height={250}
        />
        <ChartPlaceholder 
          title="Blocks by Policy Type"
          type="pie"
          height={250}
        />
      </div>

      {/* Policy Blocks Table */}
      <DataTable 
        title="Recent Policy Blocks"
        columns={[
          { header: 'Timestamp', key: 'timeDisplay', width: '20%' },
          { header: 'Agent', key: 'agent', width: '25%' },
          { header: 'Reason', key: 'reason', width: '30%' },
          { header: 'Severity', key: 'severityDisplay', width: '15%' },
        ]}
        data={mockPolicyBlocks.map(pb => ({
          ...pb,
          timeDisplay: new Date(pb.timestamp).toLocaleTimeString(),
          severityDisplay: pb.severity.toUpperCase()
        }))}
      />

      {/* Security Events */}
      <DataTable 
        title="Security Events"
        columns={[
          { header: 'Type', key: 'type', width: '20%' },
          { header: 'Description', key: 'description', width: '50%' },
          { header: 'Timestamp', key: 'timeDisplay', width: '30%' },
        ]}
        data={mockSecurityEvents.map(se => ({
          ...se,
          timeDisplay: new Date(se.timestamp).toLocaleTimeString()
        }))}
      />

      {/* Compliance Summary */}
      <div className="border-2 border-gray-300 bg-white">
        <div className="border-b-2 border-gray-300 p-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Compliance Status
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Data Retention Policy</span>
                <span className="text-sm font-bold text-green-600">✓ Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Access Controls</span>
                <span className="text-sm font-bold text-green-600">✓ Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Audit Logging</span>
                <span className="text-sm font-bold text-green-600">✓ Compliant</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Encryption at Rest</span>
                <span className="text-sm font-bold text-green-600">✓ Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">PII Protection</span>
                <span className="text-sm font-bold text-orange-600">⚠ Warning</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Rate Limiting</span>
                <span className="text-sm font-bold text-green-600">✓ Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="border-2 border-orange-600 bg-orange-50 p-4">
        <div className="text-sm font-bold text-orange-900 uppercase tracking-wide mb-3">
          ⚠️ Governance Recommendations
        </div>
        <ul className="space-y-2 text-sm text-orange-800">
          <li className="flex items-start gap-2">
            <span className="font-mono">•</span>
            <span>Review and update PII detection rules for Response Generator agent</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-mono">•</span>
            <span>Implement additional rate limiting for Lead Scorer to prevent policy violations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-mono">•</span>
            <span>Schedule quarterly access review for all agents with elevated permissions</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
