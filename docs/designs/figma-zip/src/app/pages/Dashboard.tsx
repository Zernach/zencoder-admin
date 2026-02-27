import { MetricCard } from '../components/wireframe/MetricCard';
import { InteractiveFilterBar } from '../components/wireframe/InteractiveFilterBar';
import { DataTable } from '../components/wireframe/DataTable';
import { RunsOverTimeChart } from '../components/charts/RunsOverTimeChart';
import { SuccessRateChart } from '../components/charts/SuccessRateChart';
import { CostByProjectChart } from '../components/charts/CostByProjectChart';
import { FailuresByCategoryChart } from '../components/charts/FailuresByCategoryChart';
import { mockMetrics, mockProjects, mockChartData } from '../mocks/data';
import { useNavigate } from 'react-router';

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organization-level analytics for cloud agent operations
          </p>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          Last updated: Feb 27, 14:32
        </div>
      </div>

      {/* Filter Bar */}
      <InteractiveFilterBar />

      {/* Adoption & Throughput Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight mb-4">
          Adoption & Throughput
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Active Users"
            value={mockMetrics.adoption.activeUsers.current.toLocaleString()}
            change={mockMetrics.adoption.activeUsers.change}
            subtitle="Daily active"
          />
          <MetricCard 
            title="Active Agents"
            value={mockMetrics.adoption.activeAgents.current}
            change={mockMetrics.adoption.activeAgents.change}
            subtitle="In production"
          />
          <MetricCard 
            title="Runs / Day"
            value={mockMetrics.adoption.runsPerDay.current.toLocaleString()}
            change={mockMetrics.adoption.runsPerDay.change}
            subtitle="Total executions"
          />
          <MetricCard 
            title="Peak Concurrency"
            value={mockMetrics.adoption.peakConcurrency.current}
            change={mockMetrics.adoption.peakConcurrency.change}
            subtitle="Max simultaneous"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RunsOverTimeChart data={mockChartData.runsOverTime} height={250} />
        <SuccessRateChart data={mockChartData.successRateOverTime} height={250} />
      </div>

      {/* Reliability & Quality Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight mb-4">
          Reliability & Quality
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard 
            title="Success Rate"
            value={mockMetrics.reliability.successRate.current}
            unit="%"
            change={mockMetrics.reliability.successRate.change}
          />
          <MetricCard 
            title="Failure Rate"
            value={mockMetrics.reliability.failureRate.current}
            unit="%"
            change={mockMetrics.reliability.failureRate.change}
          />
          <MetricCard 
            title="P50 Duration"
            value={mockMetrics.reliability.p50Duration.current}
            unit="s"
            change={mockMetrics.reliability.p50Duration.change}
          />
          <MetricCard 
            title="P95 Duration"
            value={mockMetrics.reliability.p95Duration.current}
            unit="s"
            change={mockMetrics.reliability.p95Duration.change}
          />
          <MetricCard 
            title="Retry Rate"
            value={mockMetrics.reliability.retryRate.current}
            unit="%"
            change={mockMetrics.reliability.retryRate.change}
          />
        </div>
      </div>

      {/* Cost & Efficiency Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight mb-4">
          Cost & Efficiency
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Cost"
            value={`$${mockMetrics.cost.totalCost.current.toLocaleString()}`}
            change={mockMetrics.cost.totalCost.change}
            subtitle="Last 7 days"
          />
          <MetricCard 
            title="Cost Per Run"
            value={`$${mockMetrics.cost.costPerRun.current}`}
            change={mockMetrics.cost.costPerRun.change}
            subtitle="Average"
          />
          <MetricCard 
            title="Total Tokens"
            value={`${(mockMetrics.cost.totalTokens.current / 1000000).toFixed(1)}M`}
            change={mockMetrics.cost.totalTokens.change}
            subtitle="In + Out"
          />
          <MetricCard 
            title="Cache Hit Rate"
            value={mockMetrics.cost.cacheHitRate.current}
            unit="%"
            change={mockMetrics.cost.cacheHitRate.change}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CostByProjectChart data={mockChartData.costByProject} height={250} />
        <FailuresByCategoryChart data={mockChartData.failuresByCategory} height={250} />
      </div>

      {/* Safety & Governance Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight mb-4">
          Safety & Governance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard 
            title="Policy Blocks"
            value={mockMetrics.governance.policyBlocks.current}
            change={mockMetrics.governance.policyBlocks.change}
            subtitle="Last 7 days"
          />
          <MetricCard 
            title="Secrets Scans"
            value={mockMetrics.governance.secretsScans.current}
            change={mockMetrics.governance.secretsScans.change}
            subtitle="Detected"
          />
          <MetricCard 
            title="Data Egress"
            value={mockMetrics.governance.dataEgress.current}
            unit=" GB"
            change={mockMetrics.governance.dataEgress.change}
          />
        </div>
      </div>

      {/* Top Projects Table */}
      <DataTable 
        title="Top Projects by Activity"
        columns={[
          { header: 'Project Name', key: 'name', width: '30%' },
          { header: 'Runs', key: 'runs' },
          { header: 'Success Rate', key: 'successDisplay' },
          { header: 'Cost', key: 'costDisplay' },
          { header: 'Agents', key: 'agents' },
        ]}
        data={mockProjects.map(p => ({
          ...p,
          successDisplay: `${p.success}%`,
          costDisplay: `$${p.cost.toLocaleString()}`
        }))}
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
      />
    </div>
  );
}