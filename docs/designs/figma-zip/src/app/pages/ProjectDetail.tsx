import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/wireframe/MetricCard';
import { InteractiveFilterBar } from '../components/wireframe/InteractiveFilterBar';
import { RunsOverTimeChart } from '../components/charts/RunsOverTimeChart';
import { SuccessRateChart } from '../components/charts/SuccessRateChart';
import { DataTable } from '../components/wireframe/DataTable';
import { mockProjects, mockAgents, mockRuns, mockChartData } from '../mocks/data';

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // In real app, would fetch by id
  const project = mockProjects[0];
  const projectAgents = mockAgents.filter(a => a.project === project.name);
  const projectRuns = mockRuns.filter(r => r.project === project.name);

  return (
    <div className="space-y-6">
      {/* Header with breadcrumbs and actions */}
      <PageHeader 
        title={project.name}
        description={`Project ID: ${project.id}`}
        breadcrumbs={[
          { label: 'Projects', path: '/projects' },
          { label: project.name }
        ]}
        actions={
          <>
            <button className="flex items-center gap-2 border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium uppercase hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button className="flex items-center gap-2 border-2 border-gray-900 bg-gray-900 text-white px-4 py-2 text-sm font-medium uppercase hover:bg-gray-800 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </>
        }
      />

      {/* Filter Bar */}
      <InteractiveFilterBar />

      {/* Project Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Runs"
          value={project.runs.toLocaleString()}
          subtitle="Last 7 days"
        />
        <MetricCard 
          title="Success Rate"
          value={project.success}
          unit="%"
          subtitle="Overall performance"
        />
        <MetricCard 
          title="Total Cost"
          value={`$${project.cost.toLocaleString()}`}
          subtitle="Last 7 days"
        />
        <MetricCard 
          title="Active Agents"
          value={project.agents}
          subtitle="Deployed"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RunsOverTimeChart data={mockChartData.runsOverTime} height={250} />
        <SuccessRateChart data={mockChartData.successRateOverTime} height={250} />
      </div>

      {/* Performance Breakdown */}
      <div className="border-2 border-gray-300 bg-white">
        <div className="border-b-2 border-gray-300 p-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Performance Breakdown
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-gray-300 p-3 bg-gray-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              P50 Duration
            </div>
            <div className="text-2xl font-mono font-bold text-gray-900">
              2.8s
            </div>
          </div>
          <div className="border border-gray-300 p-3 bg-gray-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              P95 Duration
            </div>
            <div className="text-2xl font-mono font-bold text-gray-900">
              8.4s
            </div>
          </div>
          <div className="border border-gray-300 p-3 bg-gray-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Retry Rate
            </div>
            <div className="text-2xl font-mono font-bold text-gray-900">
              2.3%
            </div>
          </div>
        </div>
      </div>

      {/* Agents in Project */}
      <DataTable 
        title="Agents in this Project"
        columns={[
          { header: 'Agent Name', key: 'name', width: '40%' },
          { header: 'Runs', key: 'runs' },
          { header: 'Success Rate', key: 'successDisplay' },
          { header: 'Avg Duration', key: 'avgDurationDisplay' },
        ]}
        data={projectAgents.map(a => ({
          ...a,
          successDisplay: `${a.success}%`,
          avgDurationDisplay: `${a.avgDuration}s`
        }))}
        onRowClick={(row) => navigate(`/agents/${row.id}`)}
      />

      {/* Recent Runs */}
      <DataTable 
        title="Recent Runs"
        columns={[
          { header: 'Run ID', key: 'id', width: '15%' },
          { header: 'Agent', key: 'agent', width: '30%' },
          { header: 'Status', key: 'statusBadge', width: '15%' },
          { header: 'Duration', key: 'durationDisplay', width: '15%' },
          { header: 'Cost', key: 'costDisplay', width: '15%' },
        ]}
        data={projectRuns.slice(0, 5).map(r => ({
          ...r,
          statusBadge: r.status,
          durationDisplay: `${r.duration}s`,
          costDisplay: `$${r.cost}`
        }))}
        onRowClick={(row) => navigate(`/runs/${row.id}`)}
      />
    </div>
  );
}