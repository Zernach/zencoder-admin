import { FilterBar } from '../components/wireframe/FilterBar';
import { DataTable } from '../components/wireframe/DataTable';
import { ChartPlaceholder } from '../components/wireframe/ChartPlaceholder';
import { mockProjects } from '../mocks/data';
import { useNavigate } from 'react-router';
import { ExternalLink } from 'lucide-react';

export function Projects() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-tight">
          Projects
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          All active projects in your organization
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-2 border-gray-300 p-4 bg-gray-50">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Total Projects
          </div>
          <div className="text-3xl font-mono font-bold text-gray-900">
            {mockProjects.length}
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-gray-50">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Total Runs
          </div>
          <div className="text-3xl font-mono font-bold text-gray-900">
            {mockProjects.reduce((acc, p) => acc + p.runs, 0).toLocaleString()}
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-gray-50">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Total Agents
          </div>
          <div className="text-3xl font-mono font-bold text-gray-900">
            {mockProjects.reduce((acc, p) => acc + p.agents, 0)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder 
          title="Projects by Run Volume"
          type="bar"
          height={200}
        />
        <ChartPlaceholder 
          title="Success Rate Distribution"
          type="line"
          height={200}
        />
      </div>

      {/* Projects Table */}
      <DataTable 
        title="All Projects"
        columns={[
          { header: 'Project Name', key: 'name', width: '30%' },
          { header: 'Total Runs', key: 'runs' },
          { header: 'Success Rate', key: 'successDisplay' },
          { header: 'Total Cost', key: 'costDisplay' },
          { header: 'Agents', key: 'agents' },
        ]}
        data={mockProjects.map(p => ({
          ...p,
          successDisplay: `${p.success}%`,
          costDisplay: `$${p.cost.toLocaleString()}`
        }))}
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
        actions={(row) => (
          <button 
            className="p-1 hover:bg-gray-100 border border-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${row.id}`);
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
}
