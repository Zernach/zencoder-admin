import { ReactNode } from 'react';
import { StatusBadge } from './StatusBadge';

interface Column {
  header: string;
  key: string;
  width?: string;
}

interface DataTableProps {
  title?: string;
  columns: Column[];
  data: Record<string, any>[];
  onRowClick?: (row: Record<string, any>) => void;
  actions?: (row: Record<string, any>) => ReactNode;
}

export function DataTable({ title, columns, data, onRowClick, actions }: DataTableProps) {
  const renderCell = (value: any, key: string) => {
    // Handle status badge rendering
    if (key === 'statusBadge' && (value === 'success' || value === 'failed' || value === 'running' || value === 'warning')) {
      return <StatusBadge status={value} />;
    }
    return value;
  };

  return (
    <div className="border-2 border-gray-300 bg-white">
      {title && (
        <div className="border-b-2 border-gray-300 p-4">
          <div className="text-sm font-medium text-gray-700">
            {title}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              {columns.map((col) => (
                <th 
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr 
                key={idx}
                className={`border-b border-gray-200 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-700 font-mono">
                    {renderCell(row[col.key], col.key)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}