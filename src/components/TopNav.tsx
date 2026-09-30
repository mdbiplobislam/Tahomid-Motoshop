import React from 'react';
import { ShoppingCart, Settings } from 'lucide-react';

export type NavTab =
  | 'pos'
  | 'inventory'
  | 'workshop'
  | 'baki'
  | 'cashbook'
  | 'directory';

interface TopNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  onQuickNewSale: () => void;
  lowStockCount: number;
  pendingJobsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onQuickNewSale,
  lowStockCount,
  pendingJobsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 text-neutral-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center shrink-0">
          <span 
            onClick={() => onSelectTab('pos')}
            className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors cursor-pointer select-none font-sans"
          >
            Tahomid Motoshop
          </span>
        </div>

        {/* Zone 2: 4–6 clean text navigation links (single line, 1-2 words) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectTab('pos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-amber-400 text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
            }`}
          >
            POS Billing
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('inventory')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-amber-400 text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <span>Inventory</span>
            {lowStockCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeTab === 'inventory' ? 'bg-neutral-900 text-amber-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('workshop')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'workshop'
                ? 'bg-amber-400 text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <span>Workshop</span>
            {pendingJobsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeTab === 'workshop' ? 'bg-neutral-900 text-amber-400' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {pendingJobsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('baki')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'baki'
                ? 'bg-amber-400 text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
            }`}
          >
            Baki Khata
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('cashbook')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'cashbook'
                ? 'bg-amber-400 text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
            }`}
          >
            Cashbook
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('directory')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-amber-400 text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
            }`}
          >
            Directory
          </button>
        </nav>

        {/* Zone 3: 1–2 primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onQuickNewSale}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-all shadow-xs active:scale-98 whitespace-nowrap cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>+ New Sale</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Shop Settings & Data Backup"
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-md transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
