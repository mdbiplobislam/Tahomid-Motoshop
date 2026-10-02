import React, { useState } from 'react';
import { ShoppingCart, Settings, LogOut, User, ShieldCheck, ChevronDown } from 'lucide-react';
import { UserAccount } from '../types';

export type NavTab =
  | 'pos'
  | 'inventory'
  | 'workshop'
  | 'baki'
  | 'cashbook'
  | 'directory';

interface TopNavProps {
  activeTab: NavTab;
  currentUser: UserAccount | null;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  onQuickNewSale: () => void;
  onLogout: () => void;
  onSwitchUser: () => void;
  lowStockCount: number;
  pendingJobsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  currentUser,
  onSelectTab,
  onOpenSettings,
  onQuickNewSale,
  onLogout,
  onSwitchUser,
  lowStockCount,
  pendingJobsCount,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const role = currentUser?.role || 'super_admin';
  const isSuper = role === 'super_admin';
  const isAdmin = role === 'admin';
  const isSalesman = role === 'salesman';
  const isCustomer = role === 'customer';

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

        {/* Zone 2: Navigation Links (filtered by role) */}
        {!isCustomer ? (
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

            {/* Baki Khata, Cashbook, Directory only for Super Admin & Admin */}
            {(isSuper || isAdmin) && (
              <>
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
              </>
            )}
          </nav>
        ) : (
          <div className="flex items-center text-xs text-neutral-300 font-medium">
            <span>Rider Self-Service Portal</span>
          </div>
        )}

        {/* Zone 3: Primary actions & User Account Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {!isCustomer && (
            <button
              type="button"
              onClick={onQuickNewSale}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-all shadow-xs active:scale-98 whitespace-nowrap cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>+ New Sale</span>
            </button>
          )}

          {(isSuper || isAdmin) && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="Shop Settings, Users & Data Backup"
              className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-md transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* User Profile Lockup & Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden sm:block max-w-[120px] truncate">
                <span className="font-semibold text-neutral-200 block truncate leading-tight">
                  {currentUser?.name || 'User'}
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono capitalize block leading-tight">
                  {role.replace('_', ' ')}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <div className="px-3 py-2 border-b border-neutral-800">
                  <div className="font-bold text-neutral-100">{currentUser?.name}</div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    @{currentUser?.username} · {role}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onSwitchUser();
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer border-t border-neutral-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
