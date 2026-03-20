// components/ui/empty-state.tsx
// Displayed when a list/table loads successfully but has no data.

import Link from 'next/link';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-text-02/5 flex items-center justify-center mb-4">
        <Icon size={24} className="text-brand-text-02/40" />
      </div>
      <h3 className="text-lg font-semibold text-brand-text-01 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-brand-text-02 max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
