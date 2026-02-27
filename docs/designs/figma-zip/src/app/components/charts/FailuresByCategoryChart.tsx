import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  category: string;
  count: number;
}

interface FailuresByCategoryChartProps {
  data: DataPoint[];
  height?: number;
}

const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#16a34a'];

export function FailuresByCategoryChart({ data, height = 250 }: FailuresByCategoryChartProps) {
  return (
    <div className="border-2 border-gray-300 p-4 bg-white">
      <div className="text-sm font-medium text-gray-700 mb-4">
        Failures by Category
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              border: '2px solid #1f2937', 
              borderRadius: 0,
              backgroundColor: '#fff',
              fontFamily: 'monospace'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
