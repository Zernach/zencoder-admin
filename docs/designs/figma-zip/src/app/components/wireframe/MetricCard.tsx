import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  unit?: string;
  subtitle?: string;
}

export function MetricCard({ title, value, change, unit = '', subtitle }: MetricCardProps) {
  return (
    <div className="border-2 border-gray-300 p-4 bg-gray-50">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <div className="text-3xl font-mono font-bold text-gray-900">
          {value}{unit}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="ml-1">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}
