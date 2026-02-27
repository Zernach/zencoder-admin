import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  time: string;
  runs: number;
}

interface RunsOverTimeChartProps {
  data: DataPoint[];
  height?: number;
}

export function RunsOverTimeChart({ data, height = 250 }: RunsOverTimeChartProps) {
  return (
    <div className="border-2 border-gray-300 p-4 bg-white">
      <div className="text-sm font-medium text-gray-700 mb-4">
        Runs Over Time (24h)
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f2937" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#1f2937" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <Tooltip 
            contentStyle={{ 
              border: '2px solid #1f2937', 
              borderRadius: 0,
              backgroundColor: '#fff',
              fontFamily: 'monospace'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="runs" 
            stroke="#1f2937" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRuns)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
