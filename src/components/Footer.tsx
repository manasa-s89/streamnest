import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import { StreamNestLogo } from './StreamNestLogo.tsx';

interface FooterProps {
  onOpenCrm: () => void;
  onOpenPlans: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCrm, onOpenPlans }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 mt-20 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <StreamNestLogo size="sm" showTextLabel={true} />
            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
              OTT Platform
            </span>
          </div>
          <p className="max-w-md text-slate-500 leading-relaxed text-[11px]">
            StreamNest delivers cinematic movies, award-winning series, Pan-India blockbusters, and synchronized Watch Parties in 4K Ultra HD and Dolby Atmos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <button
            onClick={onOpenPlans}
            className="text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer font-medium"
          >
            Subscription Plans
          </button>
          <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors">
            Privacy Policy
          </a>
          <button
            onClick={onOpenCrm}
            className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-mono transition-colors cursor-pointer font-medium"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>CRM & Antigravity Link</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026 StreamNest OTT Entertainment Inc. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Unified Customer Telemetry Protocol Active</span>
        </div>
      </div>
    </footer>
  );
};
