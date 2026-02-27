import { useParams, useNavigate } from 'react-router';
import { mockRunDetail } from '../mocks/data';
import { ArrowLeft, CheckCircle2, XCircle, Clock, DollarSign, Download, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/wireframe/StatusBadge';
import { DataTable } from '../components/wireframe/DataTable';

export function RunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const run = mockRunDetail; // In real app, would fetch by id

  return (
    <div className="space-y-6">
      {/* Header with breadcrumbs and status */}
      <PageHeader 
        title={`Run ${run.id}`}
        description={`${run.agent} • ${run.project}`}
        breadcrumbs={[
          { label: 'Runs', path: '/runs' },
          { label: run.id }
        ]}
        actions={
          <>
            <StatusBadge status={run.status as 'success' | 'failed'} size="md" />
            <button className="flex items-center gap-2 border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium uppercase hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Retry</span>
            </button>
            <button className="flex items-center gap-2 border-2 border-gray-900 bg-gray-900 text-white px-4 py-2 text-sm font-medium uppercase hover:bg-gray-800 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Duration
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-gray-900">
            {run.duration}s
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Cost
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-gray-900">
            ${run.cost}
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Project
          </div>
          <div className="text-lg font-medium text-gray-900">
            {run.project}
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4 bg-white">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Agent
          </div>
          <div className="text-lg font-medium text-gray-900">
            {run.agent}
          </div>
        </div>
      </div>

      {/* Error Details (if failed) */}
      {run.status === 'failed' && (
        <div className="border-2 border-red-600 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <div className="text-sm font-bold text-red-900 uppercase tracking-wide">
              Error Details
            </div>
          </div>
          <div className="text-sm text-red-800 font-mono mb-1">
            {run.error}
          </div>
          <div className="text-xs text-red-700">
            Category: {run.errorCategory}
          </div>
        </div>
      )}

      {/* Execution Timeline */}
      <div className="border-2 border-gray-300 bg-white">
        <div className="border-b-2 border-gray-300 p-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Execution Timeline
          </h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {run.steps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 border-2 flex items-center justify-center ${
                    step.status === 'success' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-red-600 bg-red-50'
                  }`}>
                    {step.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  {idx < run.steps.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-300"></div>
                  )}
                </div>
                {/* Step details */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-900">
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {step.timestamp}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Duration: {step.duration}s
                  </div>
                  {step.error && (
                    <div className="text-sm text-red-600 font-mono bg-red-50 p-2 border border-red-200">
                      {step.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border-2 border-gray-300 bg-white">
          <div className="border-b-2 border-gray-300 p-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Run Metadata
            </h2>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Model:</span>
              <span className="font-mono text-gray-900">{run.metadata.model}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tokens In:</span>
              <span className="font-mono text-gray-900">{run.metadata.tokensIn.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tokens Out:</span>
              <span className="font-mono text-gray-900">{run.metadata.tokensOut.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tool Calls:</span>
              <span className="font-mono text-gray-900">{run.metadata.toolCalls}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Retries:</span>
              <span className="font-mono text-gray-900">{run.metadata.retries}</span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="border-2 border-gray-300 bg-white">
          <div className="border-b-2 border-gray-300 p-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Cost Breakdown
            </h2>
          </div>
          <div className="p-4">
            <div className="border border-gray-200 bg-gray-50 p-4 h-32 flex items-center justify-center">
              <div className="text-center text-gray-400 text-xs">
                Cost breakdown chart placeholder
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}