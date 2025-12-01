'use client'

import { Trash2, ToggleLeft, FolderTree, X, Download } from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
}

export function BulkActionsToolbar({ selectedCount, onClear, actions }: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-themed-card backdrop-blur-md rounded-xl shadow-2xl border-themed p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#F4A024] rounded-lg">
            <span className="font-semibold text-gray-900">{selectedCount}</span>
            <span className="text-sm text-gray-900">selected</span>
          </div>

          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${action.variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300'
                    : 'bg-themed-secondary hover:bg-themed-hover text-themed disabled:opacity-50'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onClear}
            className="p-2 hover:bg-themed-hover rounded-lg transition-colors"
            title="Clear selection"
          >
            <X className="w-5 h-5 text-themed" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function createBulkActions({
  onDelete,
  onStatusChange,
  onCategoryChange,
  onExport,
  disableDelete = false,
  disableStatusChange = false,
  disableCategoryChange = false,
  disableExport = false,
}: {
  onDelete?: () => void;
  onStatusChange?: () => void;
  onCategoryChange?: () => void;
  onExport?: () => void;
  disableDelete?: boolean;
  disableStatusChange?: boolean;
  disableCategoryChange?: boolean;
  disableExport?: boolean;
}): BulkAction[] {
  const actions: BulkAction[] = [];

  if (onStatusChange) {
    actions.push({
      id: 'status',
      label: 'Change Status',
      icon: <ToggleLeft className="w-4 h-4" />,
      onClick: onStatusChange,
      disabled: disableStatusChange,
    });
  }

  if (onCategoryChange) {
    actions.push({
      id: 'category',
      label: 'Change Category',
      icon: <FolderTree className="w-4 h-4" />,
      onClick: onCategoryChange,
      disabled: disableCategoryChange,
    });
  }

  if (onExport) {
    actions.push({
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      onClick: onExport,
      disabled: disableExport,
    });
  }

  if (onDelete) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'danger',
      disabled: disableDelete,
    });
  }

  return actions;
}
