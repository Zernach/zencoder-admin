import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface CostByProjectChartProps {
  data: DataPoint[];
  height?: number;
}

const COLORS = ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'];

export function CostByProjectChart({ data, height = 250 }: CostByProjectChartProps) {
  return (
    <div className="border-2 border-gray-300 p-4 bg-white">
      <div className="text-sm font-medium text-gray-700 mb-4">
        Cost by Project
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            stroke="#9ca3af"
            angle={-45}
            textAnchor="end"
            height={80}
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
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
          />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
