import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {crumb.path ? (
                <Link 
                  to={crumb.path}
                  className="text-gray-500 hover:text-gray-900 uppercase tracking-wide transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium uppercase tracking-wide">
                  {crumb.label}
                </span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
