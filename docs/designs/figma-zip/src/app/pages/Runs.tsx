import { InteractiveFilterBar } from '../components/wireframe/InteractiveFilterBar';
import { DataTable } from '../components/wireframe/DataTable';
import { QuickStats } from '../components/wireframe/QuickStats';
import { StatusBadge } from '../components/wireframe/StatusBadge';
import { RunsOverTimeChart } from '../components/charts/RunsOverTimeChart';
import { mockRuns, mockChartData } from '../mocks/data';
import { useNavigate } from 'react-router';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function Runs() {
  const navigate = useNavigate();

  const successfulRuns = mockRuns.filter(r => r.status === 'success').length;
  const failedRuns = mockRuns.filter(r => r.status === 'failed').length;
  const avgDuration = mockRuns.reduce((acc, r) => acc + r.duration, 0) / mockRuns.length;
  const totalCost = mockRuns.reduce((acc, r) => acc + r.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-tight">
          Runs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time view of all agent executions
        </p>
      </div>

      {/* Filter Bar */}
      <InteractiveFilterBar />

      {/* Stats Grid */}
      <QuickStats 
        stats={[
          { icon: Activity, label: 'Total Runs', value: mockRuns.length, color: 'gray' },
          { icon: CheckCircle2, label: 'Successful', value: successfulRuns, color: 'green' },
          { icon: XCircle, label: 'Failed', value: failedRuns, color: 'red' },
          { icon: Clock, label: 'Avg Duration', value: `${avgDuration.toFixed(1)}s`, color: 'blue' },
        ]}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RunsOverTimeChart 
          data={mockChartData.runsOverTime}
          height={200}
        />
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="text-sm font-medium text-gray-700 mb-4">
            Duration Distribution
          </div>
          <div className="border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center" style={{ height: '200px' }}>
            <div className="text-center text-gray-400">
              <div className="text-xs uppercase tracking-wide mb-1">Bar Chart</div>
              <div className="text-xs">Histogram Placeholder</div>
            </div>
          </div>
        </div>
      </div>

      {/* Runs Table */}
      <DataTable 
        title="Recent Runs"
        columns={[
          { header: 'Run ID', key: 'id', width: '10%' },
          { header: 'Agent', key: 'agent', width: '20%' },
          { header: 'Project', key: 'project', width: '20%' },
          { header: 'Status', key: 'statusBadge', width: '10%' },
          { header: 'Duration', key: 'durationDisplay', width: '10%' },
          { header: 'Cost', key: 'costDisplay', width: '10%' },
          { header: 'Time', key: 'timeDisplay', width: '20%' },
        ]}
        data={mockRuns.map(r => ({
          ...r,
          statusBadge: r.status,
          durationDisplay: `${r.duration}s`,
          costDisplay: `$${r.cost}`,
          timeDisplay: new Date(r.timestamp).toLocaleTimeString()
        }))}
        onRowClick={(row) => navigate(`/runs/${row.id}`)}
      />
    </div>
  );
}