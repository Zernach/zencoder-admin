import { Calendar, Filter, Search } from 'lucide-react';

interface FilterBarProps {
  showSearch?: boolean;
  showDateRange?: boolean;
  showFilters?: boolean;
}

export function FilterBar({ showSearch = true, showDateRange = true, showFilters = true }: FilterBarProps) {
  return (
    <div className="border-2 border-gray-300 p-4 bg-white flex flex-col sm:flex-row gap-3">
      {showSearch && (
        <div className="flex-1 flex items-center gap-2 border border-gray-300 px-3 py-2 bg-gray-50">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="flex-1 bg-transparent text-sm outline-none text-gray-700"
          />
        </div>
      )}
      {showDateRange && (
        <div className="flex items-center gap-2 border border-gray-300 px-3 py-2 bg-gray-50 cursor-pointer">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Last 7 days</span>
        </div>
      )}
      {showFilters && (
        <div className="flex items-center gap-2 border border-gray-300 px-3 py-2 bg-gray-50 cursor-pointer">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Filters</span>
        </div>
      )}
    </div>
  );
}
