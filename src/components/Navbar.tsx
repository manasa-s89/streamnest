import React from 'react';
import { Search, Bell, Database } from 'lucide-react';
import { Customer } from '../types/user.ts';
import { StreamNestLogo } from './StreamNestLogo.tsx';

interface NavbarProps {
  currentTab: 'home' | 'movies' | 'series' | 'mylist' | 'plans';
  onChangeTab: (tab: 'home' | 'movies' | 'series' | 'mylist' | 'plans') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenCrm: () => void;
  customer: Customer | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onChangeTab,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  onToggleSearch,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenAuth,
  onOpenCrm,
  customer,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Authentic StreamNest Logo with switched colors */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              onChangeTab('home');
            }}
            className="flex items-center group cursor-pointer"
            aria-label="StreamNest Home"
          >
            <StreamNestLogo size="md" showTextLabel={true} className="group-hover:scale-105 transition-transform" />
          </a>
        </div>

        {/* Zone 2: 4-5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onChangeTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'home'
                ? 'text-slate-950 font-bold underline underline-offset-8 decoration-emerald-500 decoration-2'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onChangeTab('movies')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'movies'
                ? 'text-slate-950 font-bold underline underline-offset-8 decoration-emerald-500 decoration-2'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => onChangeTab('series')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'series'
                ? 'text-slate-950 font-bold underline underline-offset-8 decoration-emerald-500 decoration-2'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            TV Series
          </button>
          <button
            onClick={() => onChangeTab('mylist')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'mylist'
                ? 'text-slate-950 font-bold underline underline-offset-8 decoration-emerald-500 decoration-2'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            My List
          </button>
          <button
            onClick={() => onChangeTab('plans')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'plans'
                ? 'text-slate-950 font-bold underline underline-offset-8 decoration-emerald-500 decoration-2'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Plans
          </button>
        </nav>

        {/* Zone 3: Search, Telemetry Bridge, Notifications & Profile Action */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Search Trigger / Input */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-slate-100 border border-slate-300 rounded-full px-3 py-1.5 transition-all w-48 sm:w-64 focus-within:border-emerald-500 focus-within:bg-white shadow-inner">
                <Search className="w-4 h-4 text-emerald-600 shrink-0 mr-2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search titles, actors, languages..."
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  className="bg-transparent text-xs text-slate-900 placeholder-slate-500 focus:outline-none w-full"
                />
                <button
                  onClick={onToggleSearch}
                  className="text-slate-400 hover:text-slate-700 text-xs font-mono ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={onToggleSearch}
                className="p-2 rounded-full text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Search titles"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* CRM Antigravity Telemetry Button */}
          <button
            onClick={onOpenCrm}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-medium transition-colors cursor-pointer shadow-xs"
            title="Inspect CRM Antigravity Backend Connection"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono">CRM Telemetry</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="In-app notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>

          {/* Customer Profile / Sign In */}
          {customer ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500 transition-all cursor-pointer"
              title={`${customer.name} (${customer.subscription.tier})`}
            >
              <img
                src={customer.avatar}
                alt={customer.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-lg hover:brightness-105 transition-all whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 bg-white text-xs">
        <button
          onClick={() => onChangeTab('home')}
          className={`py-1 ${currentTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Home
        </button>
        <button
          onClick={() => onChangeTab('movies')}
          className={`py-1 ${currentTab === 'movies' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Movies
        </button>
        <button
          onClick={() => onChangeTab('series')}
          className={`py-1 ${currentTab === 'series' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Series
        </button>
        <button
          onClick={() => onChangeTab('mylist')}
          className={`py-1 ${currentTab === 'mylist' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          My List
        </button>
        <button
          onClick={() => onChangeTab('plans')}
          className={`py-1 ${currentTab === 'plans' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Plans
        </button>
      </div>
    </header>
  );
};
