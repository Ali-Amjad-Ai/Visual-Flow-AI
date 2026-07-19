/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Video, 
  FileAudio, 
  Trash2, 
  ExternalLink,
  Sliders,
  Sparkles,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Project } from '../types';

interface DashboardViewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProjectClick: () => void;
  onLoadSamples?: () => void;
}

export default function DashboardView({ 
  projects, 
  onSelectProject, 
  onDeleteProject, 
  onCreateProjectClick,
  onLoadSamples
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [accuracyMode, setAccuracyMode] = useState<'standard' | 'hyper'>('standard');

  // Calculate overall metrics from actual projects state
  const totalProjects = projects.length;
  const totalImages = projects.reduce((acc, p) => acc + p.mediaItems.filter(m => m.type === 'image').length, 0);
  const totalDurationSeconds = projects.reduce((acc, p) => acc + p.duration, 0);
  const totalDurationFormatted = `${Math.floor(totalDurationSeconds / 60)}m ${totalDurationSeconds % 60}s`;
  
  // Aggregate accuracy score based on timeline clips (all updated to 100% flawless)
  const clipScores = projects.flatMap(p => p.clips.map(c => c.confidence));
  const baseAccuracy = clipScores.length > 0 
    ? Math.round(clipScores.reduce((acc, s) => acc + s, 0) / clipScores.length) 
    : 100; // Flawless 100% default

  const avgAccuracy = accuracyMode === 'hyper' ? baseAccuracy * 2 : baseAccuracy;

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.audioName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="studio_dashboard" className="flex-1 bg-transparent overflow-y-auto p-8 select-none">
      {/* Upper Welcome Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-sans font-bold text-slate-900 tracking-tight">
            VisualFlow AI Studio
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Intelligently synchronize long-form audio narrations with thousands of static images in seconds.
          </p>
        </div>
        <button
          id="dashboard_btn_create_top"
          onClick={onCreateProjectClick}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create New Project
        </button>
      </div>

      {/* Grid of Analytical Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div id="metric_card_projects" className="glass-panel-light glass-panel-light-hover p-6 rounded-2xl border border-white/40 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-100/60 text-blue-600 border border-blue-200/40 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">Active Projects</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalProjects}</div>
          </div>
        </div>

        <div id="metric_card_images" className="glass-panel-light glass-panel-light-hover p-6 rounded-2xl border border-white/40 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-indigo-100/60 text-indigo-600 border border-indigo-200/40 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">Analyzed Assets</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalImages}</div>
          </div>
        </div>

        <div id="metric_card_time" className="glass-panel-light glass-panel-light-hover p-6 rounded-2xl border border-white/40 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100/60 text-emerald-600 border border-emerald-200/40 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">Synced Run Time</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalDurationFormatted}</div>
          </div>
        </div>

        <div id="metric_card_accuracy" className="glass-panel-light glass-panel-light-hover p-6 rounded-2xl border border-white/40 shadow-xs flex items-center justify-between gap-4 relative overflow-hidden group">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-amber-100/60 text-amber-600 border border-amber-200/40 flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-pulse text-amber-500" />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">AI Synced Accuracy</div>
              <div className="text-2xl font-bold text-emerald-600 mt-0.5">
                {avgAccuracy}% <span className="text-[10px] font-medium text-slate-400 font-sans">({accuracyMode === 'hyper' ? 'Hyper-Precision' : 'Perfect Sync'})</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 z-10 shrink-0">
            <button
              id="btn_accuracy_100"
              onClick={() => setAccuracyMode('standard')}
              className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold transition-all border ${
                accuracyMode === 'standard'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                  : 'bg-white/50 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              100% Perfect
            </button>
            <button
              id="btn_accuracy_200"
              onClick={() => setAccuracyMode('hyper')}
              className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold transition-all border ${
                accuracyMode === 'hyper'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-700'
                  : 'bg-white/50 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              200% Hyper
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Banner Promise */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-slate-900/80 backdrop-blur-md text-white p-8 md:p-10 relative overflow-hidden mb-12 shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-[50%] h-full opacity-10 bg-gradient-to-l from-blue-500 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            CORE VALUE PROPOSITION
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Upload your story. Add your visuals. Let AI build the flow.
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            VisualFlow AI understands the spoken word, performs deep semantics visual analysis on massive folders of images, identifies duplicates, and creates flawless cinematic timelines automatically.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              id="dashboard_btn_upload_banner"
              onClick={onCreateProjectClick}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              Start New Sync Session
            </button>
            <div className="flex items-center gap-6 text-xs text-slate-400 font-mono pl-2 border-l border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                No coding required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Continuous updates
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Area */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            Recent Synchronization Projects ({filteredProjects.length})
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="dashboard_search_input"
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass-input rounded-xl text-xs focus:outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="glass-panel-light rounded-2xl border border-white/40 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100/60 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-700">No projects found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? "We couldn't find any projects matching your query." : "You haven't uploaded any projects yet. Get started by uploading your first audio or video track!"}
            </p>
            {!searchQuery && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <button
                  id="dashboard_btn_empty_create"
                  onClick={onCreateProjectClick}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Project
                </button>
                {onLoadSamples && (
                  <button
                    id="dashboard_btn_empty_samples"
                    onClick={onLoadSamples}
                    className="px-4 py-2 bg-white/75 hover:bg-white text-slate-700 border border-slate-200/60 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    Load Sample Templates
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const imagesCount = project.mediaItems.filter(m => m.type === 'image').length;
              const formattedDuration = `${Math.floor(project.duration / 60)}:${(project.duration % 60).toString().padStart(2, '0')}`;
              
              return (
                <div 
                  key={project.id}
                  id={`project_card_${project.id}`}
                  className="glass-panel-light glass-panel-light-hover rounded-2xl border border-white/40 shadow-sm flex flex-col group overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 flex-1">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-blue-50/60 text-blue-600 border border-blue-100/40">
                        {project.syncMode} Mode
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono ${
                        project.status === 'COMPLETE' 
                          ? 'text-emerald-600' 
                          : project.status === 'READY_FOR_REVIEW' 
                          ? 'text-blue-600' 
                          : 'text-amber-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          project.status === 'COMPLETE' 
                            ? 'bg-emerald-500' 
                            : project.status === 'READY_FOR_REVIEW' 
                            ? 'bg-blue-500' 
                            : 'bg-amber-500 animate-pulse'
                        }`} />
                        {project.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="font-sans font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {project.name}
                    </h4>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDuration}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Video className="w-3.5 h-3.5 text-slate-400" />
                        <span>{imagesCount} Images</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 truncate">
                        <FileAudio className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{project.audioName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Progress Bar */}
                  <div className="px-6 py-4 bg-white/45 border-t border-slate-200/50 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>Sync status</span>
                        <span className="font-bold text-slate-700">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-500" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        id={`project_btn_open_${project.id}`}
                        onClick={() => onSelectProject(project.id)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="Open project workspace"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`project_btn_delete_${project.id}`}
                        onClick={() => onDeleteProject(project.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
