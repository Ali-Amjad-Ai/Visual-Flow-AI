/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import WorkspaceView from './components/WorkspaceView';
import NewProjectModal from './components/NewProjectModal';
import { PRESET_PROJECTS } from './data/presets';
import { Project, SyncMode, MediaItem } from './types';
import { getSvgPlaceholder } from './data/presets';
import { 
  Sparkles, 
  Sliders, 
  HelpCircle, 
  BookOpen, 
  CheckCircle, 
  SlidersHorizontal,
  ChevronRight,
  Play,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'workspace' | 'media-library' | 'settings' | 'help'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Load and seed projects from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('visualflow_projects');
    if (stored) {
      try {
        const loaded = JSON.parse(stored);
        // Filter out preset projects (p1, p2, p3) to ensure a completely clean start as requested
        const filtered = loaded.filter((p: Project) => p.id !== 'p1' && p.id !== 'p2' && p.id !== 'p3');
        setProjects(filtered);
        localStorage.setItem('visualflow_projects', JSON.stringify(filtered));
      } catch (e) {
        setProjects([]);
      }
    } else {
      setProjects([]);
      localStorage.setItem('visualflow_projects', JSON.stringify([]));
    }
  }, []);

  // Save projects on any state mutation
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('visualflow_projects', JSON.stringify(updatedProjects));
  };

  const activeProject = projects.find(p => p.id === selectedProjectId) || null;

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveView('workspace');
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this synchronization project?')) {
      const remaining = projects.filter(p => p.id !== projectId);
      saveProjects(remaining);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setActiveView('dashboard');
      }
    }
  };

  const handleUpdateProject = (updatedProject: Project) => {
    const nextProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    saveProjects(nextProjects);
  };

  const handleCreateProject = (
    projectName: string, 
    fileName: string, 
    fileSize: string, 
    mode: SyncMode, 
    customDuration: number,
    audioUrl?: string
  ) => {
    // Generate some initial random image assets for this new project to let user play with immediately!
    const categories = ['LOCATIONS', 'PEOPLE', 'OBJECTS', 'EVENTS', 'NATURE', 'BUSINESS', 'ARCHITECTURE'];
    const mockImages: MediaItem[] = Array.from({ length: 12 }).map((_, i) => {
      const id = `new_img_${Date.now()}_${i}`;
      const name = `visual_asset_${(i + 1).toString().padStart(2, '0')}.jpg`;
      const category = categories[i % categories.length] as any;
      const bgTypes = ['blue', 'indigo', 'slate', 'emerald', 'amber', 'rose', 'violet', 'cyan'] as const;
      const bg = bgTypes[i % bgTypes.length];

      return {
        id,
        name,
        url: getSvgPlaceholder(name.split('.')[0].replace(/_/g, ' '), category, bg),
        type: 'image',
        size: (1.5 + Math.random() * 4).toFixed(1) + ' MB',
        status: 'unused', // uploaded assets are unused at start before sync
        category,
        visualAnalysis: `Automatically indexed AI visual depicting composite elements matching category ${category}.`,
        uploadedAt: 'Just now',
        confidence: 85 + Math.floor(Math.random() * 14)
      };
    });

    // Create a mock section timeline based on duration
    const sectionDuration = Math.floor(customDuration / 3);
    const mockSections = [
      {
        id: `sec_1_${Date.now()}`,
        title: 'SCENE SEGMENT 1',
        start: 0,
        end: sectionDuration,
        transcript: 'Welcome to this custom synchronized AI sequence. Our speech recognition transcription matches the primary audio layers.',
        locked: false
      },
      {
        id: `sec_2_${Date.now()}`,
        title: 'SCENE SEGMENT 2',
        start: sectionDuration,
        end: sectionDuration * 2,
        transcript: 'Deep learning semantic classifiers are analyzing key visual attributes, identifying coordinates, objects, and textures.',
        locked: false
      },
      {
        id: `sec_3_${Date.now()}`,
        title: 'SCENE SEGMENT 3',
        start: sectionDuration * 2,
        end: customDuration,
        transcript: 'Click Sync With AI in the top right to analyze the visual catalog and automatically build a fully populated synchronized narrative timeline!',
        locked: false
      }
    ];

    // Initialize with empty clips so the user has the satisfaction of clicking "Sync with AI" and seeing the timeline magically build!
    const newProject: Project = {
      id: `project_${Date.now()}`,
      name: projectName,
      duration: customDuration,
      audioName: fileName,
      audioSize: fileSize,
      audioUrl,
      status: 'NEEDS_ATTENTION',
      progress: 0,
      lastSaved: 'Just now',
      syncMode: mode,
      syncControls: {
        visualPace: 'balanced',
        imageDuration: 'balanced',
        imageReuse: 'necessary',
        matchingStyle: mode === 'CINEMATIC' ? 'cinematic' : mode === 'CALM' ? 'contextual' : 'literal',
        variety: mode === 'FAST_PACED' ? 'max' : 'balanced',
        qualityPriority: 'balanced'
      },
      mediaItems: mockImages,
      clips: [], // starts empty for high-fidelity "Sync with AI" trigger!
      sections: mockSections
    };

    const nextProjects = [newProject, ...projects];
    saveProjects(nextProjects);
    setSelectedProjectId(newProject.id);
    setActiveView('workspace');
  };

  const handleResetAppDefaults = () => {
    if (window.confirm('Are you sure you want to reset all projects back to studio defaults? All custom edits will be lost.')) {
      setProjects(PRESET_PROJECTS);
      localStorage.setItem('visualflow_projects', JSON.stringify(PRESET_PROJECTS));
      setSelectedProjectId(null);
      setActiveView('dashboard');
    }
  };

  return (
    <div className="flex h-screen w-screen frosted-bg-mesh font-sans text-slate-800 overflow-hidden">
      
      {/* Universal Left Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        activeProjectName={activeProject ? activeProject.name : null}
        projects={projects}
      />

      {/* Main Multi-route content area */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        
        {activeView === 'dashboard' && (
          <DashboardView 
            projects={projects}
            onSelectProject={handleSelectProject}
            onDeleteProject={handleDeleteProject}
            onCreateProjectClick={() => setIsNewProjectModalOpen(true)}
            onLoadSamples={() => {
              saveProjects(PRESET_PROJECTS);
            }}
          />
        )}

        {activeView === 'workspace' && activeProject && (
          <WorkspaceView 
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {/* Studio Settings View */}
        {activeView === 'settings' && (
          <div id="studio_settings_view" className="flex-1 overflow-y-auto p-8 select-none max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-800">Studio Settings</h2>
            </div>
            <p className="text-slate-500 text-xs mb-8">
              Adjust global machine learning thresholds, speech recognition precision factors, and UI defaults.
            </p>

            <div className="space-y-6">
              {/* Card 1: AI Thresholds */}
              <div className="glass-panel-light p-6 rounded-2xl border border-white/40 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wider">AI Computer Vision Thresholds</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-500 uppercase flex justify-between">
                      <span>Exact Duplicate Hash Margin</span>
                      <span className="text-blue-600">99.8%</span>
                    </label>
                    <input type="range" min="95" max="100" defaultValue="99" className="w-full accent-blue-600 cursor-pointer" />
                    <p className="text-[10px] text-slate-400">Higher values reduce false-positive duplicate clusters.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-500 uppercase flex justify-between">
                      <span>Near-Duplicate Similarity Margin</span>
                      <span className="text-blue-600">92.0%</span>
                    </label>
                    <input type="range" min="80" max="98" defaultValue="92" className="w-full accent-blue-600 cursor-pointer" />
                    <p className="text-[10px] text-slate-400">Controls tolerance for minor crops, resolutions, or color tweaks.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-500 uppercase flex justify-between">
                      <span>Speech To Text Precision Filter</span>
                      <span className="text-blue-600">95.0%</span>
                    </label>
                    <input type="range" min="80" max="100" defaultValue="95" className="w-full accent-blue-600 cursor-pointer" />
                    <p className="text-[10px] text-slate-400">Improves transcription layout segmentations in noisy tracks.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-500 uppercase flex justify-between">
                      <span>Visual Composition Confidence Floor</span>
                      <span className="text-blue-600">80.0%</span>
                    </label>
                    <input type="range" min="50" max="95" defaultValue="80" className="w-full accent-blue-600 cursor-pointer" />
                    <p className="text-[10px] text-slate-400">Clips matching below this score trigger a Needs Review warning.</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Export Specs */}
              <div className="glass-panel-light p-6 rounded-2xl border border-white/40 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wider">Default Media Rendering Specifications</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                  <div className="p-3 bg-white/40 rounded-xl border border-slate-200/40 flex items-center justify-between">
                    <span>Export Quality</span>
                    <span className="font-bold text-blue-600">ProRes 422 HQ (4K)</span>
                  </div>
                  <div className="p-3 bg-white/40 rounded-xl border border-slate-200/40 flex items-center justify-between">
                    <span>Framerate target</span>
                    <span className="font-bold text-blue-600">60 fps Cinematic</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Danger Zone */}
              <div className="glass-panel-light p-6 rounded-2xl border border-rose-200/50 bg-rose-50/10 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-rose-800 font-mono uppercase tracking-wider">Studio Maintenance Zone</h4>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Restore Studio Demo Presets</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Wipe custom experiments and reload original high-fidelity Paris and Mars sync showcases.</p>
                  </div>
                  <button
                    id="settings_btn_reset"
                    onClick={handleResetAppDefaults}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset App States
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Documentation / Help View */}
        {activeView === 'help' && (
          <div id="studio_help_view" className="flex-1 overflow-y-auto p-8 select-none max-w-4xl mx-auto w-full space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-800">Studio Help & Documentation</h2>
              </div>
              <p className="text-slate-500 text-xs">
                Learn how VisualFlow AI bridges spoken words, semantic imagery, and flawless narrative timelines.
              </p>
            </div>

            {/* Core workflow visualization block */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 text-white rounded-3xl p-6 relative overflow-hidden">
              <h3 className="text-base font-bold mb-4 flex items-center gap-1.5">
                <Sparkles className="text-blue-500 w-4 h-4" />
                The Core Creative Lifecycle
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs relative z-10">
                <div className="space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-mono font-bold">1</div>
                  <h4 className="font-semibold text-slate-200">Upload Your Story</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Upload long-form podcasts, narrations, voiceovers, or documentary audio files in MP3, WAV, or AAC format.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-mono font-bold">2</div>
                  <h4 className="font-semibold text-slate-200">Add Your Visuals</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Batch-upload hundreds of raw visual photographs. Let our computer vision tag, organize, and detect duplicate files automatically.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center font-mono font-bold">3</div>
                  <h4 className="font-semibold text-slate-200">Let AI Build The Flow</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Click "Sync with AI". The deep model cross-references transcripts with visual vectors, structuring a perfect, ready-to-review timeline!
                  </p>
                </div>
              </div>
            </div>

            {/* In depth guide sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-panel-light p-6 rounded-2xl border border-white/40 shadow-xs space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Understanding Sync Modes</h4>
                <ul className="space-y-3.5 text-xs text-slate-600 leading-normal">
                  <li>
                    <strong className="text-slate-800">Strict Match:</strong> Prioritizes exact, literal noun mapping. Forces highly realistic, contextual alignments perfect for educational tutorials.
                  </li>
                  <li>
                    <strong className="text-slate-800">Cinematic Mode:</strong> Relaxes literal translation constraints, prioritizing visual mood, rich scenic variety, and fluid kinetic camera motions (Ken Burns).
                  </li>
                  <li>
                    <strong className="text-slate-800">Fast Paced Mode:</strong> Clips average 10-15 seconds. Designed to capture social media momentum on platforms like YouTube Shorts and Reels.
                  </li>
                  <li>
                    <strong className="text-slate-800">Calm Mode:</strong> Slow visual rhythm with clips lasting up to a full minute. Great for audiobooks, guided meditations, and slow podcasts.
                  </li>
                </ul>
              </div>

              <div className="glass-panel-light p-6 rounded-2xl border border-white/40 shadow-xs space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Continuous Upload Workflow</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  With VisualFlow AI, you don't need to have all your visual assets ready on day one.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload a batch of images to synchronize. As you source or design more graphics, simply drag and drop them into the catalog. The engine detects the delta automatically and offers to:
                </p>
                <div className="p-3 bg-blue-50/55 rounded-xl border border-blue-100 text-[11px] font-mono text-blue-800 space-y-1">
                  <div>• Continue syncing from the end of the current timeline boundaries</div>
                  <div>• Replace weak, low-confidence matches in the existing timeline</div>
                  <div>• Supplement redundant visual layers</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Creation Modal */}
      <NewProjectModal 
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

    </div>
  );
}
