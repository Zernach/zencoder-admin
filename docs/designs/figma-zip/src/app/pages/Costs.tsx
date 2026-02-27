import { FilterBar } from '../components/wireframe/FilterBar';
import { MetricCard } from '../components/wireframe/MetricCard';
import { ChartPlaceholder } from '../components/wireframe/ChartPlaceholder';
import { DataTable } from '../components/wireframe/DataTable';
import { mockMetrics, mockProjects } from '../mocks/data';

export function Costs() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-tight">
          Costs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Cost analysis and optimization insights
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Top Metrics */}
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
          subtitle="Saved cost"
        />
      </div>

      {/* Cost Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder 
          title="Daily Cost Trend"
          type="area"
          height={250}
        />
        <ChartPlaceholder 
          title="Cost by Model Type"
          type="pie"
          height={250}
        />
      </div>

      {/* Cost Efficiency Metrics */}
      <div className="border-2 border-gray-300 bg-white">
        <div className="border-b-2 border-gray-300 p-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Cost Efficiency Metrics
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-gray-300 p-3 bg-gray-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Avg Token Cost
            </div>
            <div className="text-xl font-mono font-bold text-gray-900">
              $0.0234
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Per 1K tokens
            </div>
          </div>
          <div className="border border-gray-300 p-3 bg-gray-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Cache Savings
            </div>
            <div className="text-xl font-mono font-bold text-green-600">
              $12,847
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Last 7 days
            </div>
          </div>
          <div className="border border-gray-300 p-3 bg-gray-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Tool Call Cost
            </div>
            <div className="text-xl font-mono font-bold text-gray-900">
              $8,234
            </div>
            <div className="text-xs text-gray-500 mt-1">
              17% of total
            </div>
          </div>
        </div>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder 
          title="Token Usage by Agent"
          type="bar"
          height={250}
        />
        <ChartPlaceholder 
          title="Cost per Project Over Time"
          type="line"
          height={250}
        />
      </div>

      {/* Cost by Project Table */}
      <DataTable 
        title="Cost Breakdown by Project"
        columns={[
          { header: 'Project', key: 'name', width: '30%' },
          { header: 'Total Cost', key: 'costDisplay' },
          { header: 'Runs', key: 'runs' },
          { header: 'Cost/Run', key: 'costPerRunDisplay' },
          { header: '% of Total', key: 'percentDisplay' },
        ]}
        data={mockProjects.map(p => {
          const totalCost = mockMetrics.cost.totalCost.current;
          return {
            ...p,
            costDisplay: `$${p.cost.toLocaleString()}`,
            costPerRunDisplay: `$${(p.cost / p.runs).toFixed(2)}`,
            percentDisplay: `${((p.cost / totalCost) * 100).toFixed(1)}%`
          };
        })}
      />

      {/* Optimization Recommendations */}
      <div className="border-2 border-blue-600 bg-blue-50 p-4">
        <div className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-3">
          💡 Cost Optimization Recommendations
        </div>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-mono">•</span>
            <span>Increase cache hit rate by 10% to save approximately $1,847/week</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-mono">•</span>
            <span>Consider switching ETL Orchestrator to a smaller model for 23% cost reduction</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-mono">•</span>
            <span>Optimize token usage in Response Generator (currently 15% above average)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
