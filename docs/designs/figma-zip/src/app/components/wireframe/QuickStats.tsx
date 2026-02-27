import { LucideIcon } from 'lucide-react';

interface QuickStatsProps {
  stats: {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color?: 'gray' | 'green' | 'red' | 'blue' | 'orange';
  }[];
}

const colorConfig = {
  gray: 'border-gray-300 bg-gray-50 text-gray-900',
  green: 'border-green-600 bg-green-50 text-green-900',
  red: 'border-red-600 bg-red-50 text-red-900',
  blue: 'border-blue-600 bg-blue-50 text-blue-900',
  orange: 'border-orange-600 bg-orange-50 text-orange-900',
};

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const colorClass = colorConfig[stat.color || 'gray'];
        
        return (
          <div key={idx} className={`border-2 p-4 ${colorClass}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 opacity-60" />
              <div className="text-xs uppercase tracking-wide opacity-80">
                {stat.label}
              </div>
            </div>
            <div className="text-3xl font-mono font-bold">
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
