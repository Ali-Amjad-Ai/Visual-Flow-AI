/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  FolderOpen, 
  FileVideo, 
  Settings, 
  HelpCircle,
  Database,
  History
} from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  activeView: 'dashboard' | 'workspace' | 'media-library' | 'settings' | 'help';
  setActiveView: (view: 'dashboard' | 'workspace' | 'media-library' | 'settings' | 'help') => void;
  activeProjectName: string | null;
  projects?: Project[];
}

export default function Sidebar({ activeView, setActiveView, activeProjectName, projects = [] }: SidebarProps) {
  // Calculate dynamic storage size
  const totalMB = projects.reduce((acc, p) => {
    let pSum = 0;
    // Parse audio size (e.g. "12.4 MB")
    if (p.audioSize) {
      const match = p.audioSize.match(/([\d.]+)\s*MB/i);
      if (match) pSum += parseFloat(match[1]);
    }
    // Parse media items size (e.g. "2.5 MB" or "400 KB")
    (p.mediaItems || []).forEach(m => {
      if (m.size) {
        const match = m.size.match(/([\d.]+)\s*MB/i);
        if (match) pSum += parseFloat(match[1]);
        else {
          const kbMatch = m.size.match(/([\d.]+)\s*KB/i);
          if (kbMatch) pSum += parseFloat(kbMatch[1]) / 1024;
        }
      }
    });
    return acc + pSum;
  }, 0);

  const formattedStorage = totalMB > 1024 
    ? `${(totalMB / 1024).toFixed(2)} GB` 
    : `${totalMB.toFixed(1)} MB`;

  const percentUsed = Math.min(100, (totalMB / 10240) * 100); // Out of 10 GB (10240 MB)
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, disabled: false },
    { id: 'workspace', name: 'Workspace', icon: FileVideo, disabled: !activeProjectName },
    { id: 'media-library', name: 'Media Library', icon: Database, disabled: false },
    { id: 'settings', name: 'Studio Settings', icon: Settings, disabled: false },
    { id: 'help', name: 'Documentation', icon: HelpCircle, disabled: false }
  ] as const;

  return (
    <aside id="studio_sidebar" className="w-64 glass-panel-light text-slate-700 flex flex-col border-r border-slate-200/40 shrink-0 select-none">
      {/* Brand Logo & Name */}
      <div className="p-6 border-b border-slate-200/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-base tracking-tight text-slate-900 leading-none">
            VisualFlow <span className="text-blue-600 text-xs font-mono px-1 py-0.5 bg-blue-500/10 rounded ml-1">AI</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-1 uppercase">
            Sync Studio v1.2
          </p>
        </div>
      </div>

      {/* Primary Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <div className="px-3 mb-2 text-[10px] text-slate-400 font-mono tracking-widest uppercase">
          Studio Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isBlocked = item.disabled;

          return (
            <button
              key={item.id}
              id={`nav_btn_${item.id}`}
              disabled={isBlocked}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : isBlocked
                  ? 'text-slate-300 cursor-not-allowed opacity-45'
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
              {item.id === 'workspace' && activeProjectName && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Project Status Card in Sidebar */}
      {activeProjectName ? (
        <div className="p-4 m-4 rounded-xl bg-white/40 border border-slate-200/50 shadow-xs">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Session
          </div>
          <h3 className="text-xs font-semibold text-slate-800 truncate mt-1.5">
            {activeProjectName}
          </h3>
          <button
            id="sidebar_btn_resume"
            onClick={() => setActiveView('workspace')}
            className="w-full mt-3 py-1.5 px-3 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 rounded-lg text-xs font-medium border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            Resume Workspace
          </button>
        </div>
      ) : (
        <div className="p-4 m-4 rounded-xl bg-white/20 border border-slate-200/30 text-center">
          <p className="text-[11px] text-slate-400 italic">
            Select or create a project to begin synchronization
          </p>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200/50 text-slate-400 text-[11px] font-mono flex flex-col gap-1 select-none">
        <div className="flex items-center justify-between">
          <span>Storage</span>
          <span className="text-slate-600 font-bold">{formattedStorage} / 10 GB</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${percentUsed}%` }} />
        </div>
      </div>
    </aside>
  );
}
