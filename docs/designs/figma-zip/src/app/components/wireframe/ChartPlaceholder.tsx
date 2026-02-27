interface ChartPlaceholderProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
}

export function ChartPlaceholder({ title, type, height = 200 }: ChartPlaceholderProps) {
  return (
    <div className="border-2 border-gray-300 p-4 bg-white">
      <div className="text-sm font-medium text-gray-700 mb-4">
        {title}
      </div>
      <div 
        className="border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center text-gray-400">
          <div className="text-xs uppercase tracking-wide mb-1">{type} Chart</div>
          <div className="text-xs">Visualization Placeholder</div>
        </div>
      </div>
    </div>
  );
}
