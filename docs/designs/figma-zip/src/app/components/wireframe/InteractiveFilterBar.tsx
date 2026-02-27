import { Calendar, Filter, Search, X } from 'lucide-react';
import { useState } from 'react';

interface InteractiveFilterBarProps {
  showSearch?: boolean;
  showDateRange?: boolean;
  showFilters?: boolean;
  onSearchChange?: (value: string) => void;
  onDateRangeChange?: (range: string) => void;
}

export function InteractiveFilterBar({ 
  showSearch = true, 
  showDateRange = true, 
  showFilters = true,
  onSearchChange,
  onDateRangeChange
}: InteractiveFilterBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedRange, setSelectedRange] = useState('7d');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    onDateRangeChange?.(range);
  };

  const dateRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  return (
    <div className="space-y-3">
      <div className="border-2 border-gray-300 p-4 bg-white flex flex-col sm:flex-row gap-3">
        {showSearch && (
          <div className="flex-1 flex items-center gap-2 border border-gray-300 px-3 py-2 bg-gray-50 focus-within:border-gray-900 transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search agents, projects, runs..." 
              className="flex-1 bg-transparent text-sm outline-none text-gray-700"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchValue && (
              <button 
                onClick={() => handleSearchChange('')}
                className="p-1 hover:bg-gray-200 transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>
        )}
        {showDateRange && (
          <div className="relative">
            <select
              value={selectedRange}
              onChange={(e) => handleRangeChange(e.target.value)}
              className="flex items-center gap-2 border border-gray-300 px-3 py-2 bg-gray-50 cursor-pointer text-sm text-gray-700 pr-8 appearance-none hover:border-gray-900 transition-colors"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
        {showFilters && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 border px-4 py-2 cursor-pointer text-sm transition-colors ${
              showFilterPanel 
                ? 'border-gray-900 bg-gray-900 text-white' 
                : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-900'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="border-2 border-gray-900 p-4 bg-gray-50 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Advanced Filters
            </div>
            <button 
              onClick={() => setShowFilterPanel(false)}
              className="p-1 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-600 uppercase tracking-wide mb-2">
                Status
              </label>
              <select className="w-full border border-gray-300 px-2 py-1.5 text-sm bg-white">
                <option>All Statuses</option>
                <option>Success</option>
                <option>Failed</option>
                <option>Running</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 uppercase tracking-wide mb-2">
                Project
              </label>
              <select className="w-full border border-gray-300 px-2 py-1.5 text-sm bg-white">
                <option>All Projects</option>
                <option>Customer Support AI</option>
                <option>Data Pipeline</option>
                <option>Code Review</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 uppercase tracking-wide mb-2">
                Agent Type
              </label>
              <select className="w-full border border-gray-300 px-2 py-1.5 text-sm bg-white">
                <option>All Types</option>
                <option>Classifier</option>
                <option>Generator</option>
                <option>Orchestrator</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 uppercase tracking-wide mb-2">
                Cost Range
              </label>
              <select className="w-full border border-gray-300 px-2 py-1.5 text-sm bg-white">
                <option>Any Cost</option>
                <option>&lt; $1</option>
                <option>$1 - $5</option>
                <option>&gt; $5</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
            <button className="text-xs text-gray-600 uppercase tracking-wide hover:text-gray-900">
              Reset All
            </button>
            <button className="border-2 border-gray-900 bg-gray-900 text-white px-4 py-2 text-xs font-medium uppercase hover:bg-gray-800">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
