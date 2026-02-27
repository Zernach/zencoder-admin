import { FilterBar } from '../components/wireframe/FilterBar';
import { DataTable } from '../components/wireframe/DataTable';
import { ChartPlaceholder } from '../components/wireframe/ChartPlaceholder';
import { mockAgents } from '../mocks/data';
import { useNavigate } from 'react-router';

export function Agents() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-tight">
          Agents
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          All deployed agents across your organization
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="border-2 border-gray-300 p-4 bg-gray-50">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Total Agents
          </div>
          <div className="text-3xl font-mono font-bold text-gray-900">
            {mockAgents.length}
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-gray-50">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Avg Success Rate
          </div>
          <div className="text-3xl font-mono font-bold text-gray-900">
            {(mockAgents.reduce((acc, a) => acc + a.success, 0) / mockAgents.length).toFixed(1)}%
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-gray-50">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Total Runs
          </div>
          <div className="text-3xl font-mono font-bold text-gray-900">
            {mockAgents.reduce((acc, a) => acc + a.runs, 0).toLocaleString()}
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-gray-50">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Avg Duration
          </div>
          <div className="text-3xl font-mono font-bold text-gray-900">
            {(mockAgents.reduce((acc, a) => acc + a.avgDuration, 0) / mockAgents.length).toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder 
          title="Agent Performance by Success Rate"
          type="bar"
          height={200}
        />
        <ChartPlaceholder 
          title="Agents by Average Duration"
          type="bar"
          height={200}
        />
      </div>

      {/* Agents Table */}
      <DataTable 
        title="All Agents"
        columns={[
          { header: 'Agent Name', key: 'name', width: '25%' },
          { header: 'Project', key: 'project', width: '25%' },
          { header: 'Total Runs', key: 'runs' },
          { header: 'Success Rate', key: 'successDisplay' },
          { header: 'Avg Duration', key: 'avgDurationDisplay' },
        ]}
        data={mockAgents.map(a => ({
          ...a,
          successDisplay: `${a.success}%`,
          avgDurationDisplay: `${a.avgDuration}s`
        }))}
        onRowClick={(row) => navigate(`/agents/${row.id}`)}
      />
    </div>
  );
}
