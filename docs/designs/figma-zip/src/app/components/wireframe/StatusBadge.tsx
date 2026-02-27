import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

type Status = 'success' | 'failed' | 'running' | 'warning';

interface StatusBadgeProps {
  status: Status;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-600',
    label: 'Success'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-600',
    label: 'Failed'
  },
  running: {
    icon: Clock,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-600',
    label: 'Running'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-600',
    label: 'Warning'
  }
};

const sizeConfig = {
  sm: {
    iconSize: 'w-3 h-3',
    padding: 'px-2 py-1',
    text: 'text-xs'
  },
  md: {
    iconSize: 'w-4 h-4',
    padding: 'px-3 py-1.5',
    text: 'text-sm'
  },
  lg: {
    iconSize: 'w-5 h-5',
    padding: 'px-4 py-2',
    text: 'text-base'
  }
};

export function StatusBadge({ status, text, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;
  const displayText = text || config.label;

  return (
    <div className={`inline-flex items-center gap-1.5 border-2 ${config.border} ${config.bg} ${config.color} ${sizeStyles.padding} font-medium uppercase tracking-wide ${sizeStyles.text}`}>
      <Icon className={sizeStyles.iconSize} />
      <span>{displayText}</span>
    </div>
  );
}
