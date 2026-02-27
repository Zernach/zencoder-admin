import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  time: string;
  rate: number;
}

interface SuccessRateChartProps {
  data: DataPoint[];
  height?: number;
}

export function SuccessRateChart({ data, height = 250 }: SuccessRateChartProps) {
  return (
    <div className="border-2 border-gray-300 p-4 bg-white">
      <div className="text-sm font-medium text-gray-700 mb-4">
        Success Rate Trend
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <YAxis 
            domain={[85, 100]}
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
            formatter={(value: number) => [`${value}%`, 'Success Rate']}
          />
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke="#16a34a" 
            strokeWidth={2}
            dot={{ fill: '#16a34a', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
