/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Music, 
  Video, 
  HelpCircle,
  FileAudio,
  Check
} from 'lucide-react';
import { SyncMode } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectName: string, fileName: string, fileSize: string, mode: SyncMode, customDuration: number, audioUrl?: string) => void;
}

export default function NewProjectModal({ isOpen, onClose, onCreateProject }: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string; fileObject?: File } | null>(null);
  const [syncMode, setSyncMode] = useState<SyncMode>('DOCUMENTARY');
  const [duration, setDuration] = useState<number>(120); // default 2 mins
  const [durationMin, setDurationMin] = useState<number>(2);
  const [durationSec, setDurationSec] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const updateDuration = (min: number, sec: number) => {
    setDurationMin(min);
    setDurationSec(sec);
    setDuration(min * 60 + sec);
  };

  // Preset quick selections for users to instantly try without uploading their own file
  const quickSelectFiles = [
    { name: 'roman_empire_rise_and_fall.mp3', size: '18.4 MB', duration: 180, label: 'Roman History Narration' },
    { name: 'deep_ocean_exploration.wav', size: '42.1 MB', duration: 300, label: 'Oceanography Podcast' },
    { name: 'tech_keynote_presentation_2026.mp4', size: '125.0 MB', duration: 240, label: 'Product Launch Keynote' }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setSelectedFile({
        name: file.name,
        size: sizeMB,
        type: file.type,
        fileObject: file
      });
      if (!projectName) {
        setProjectName(file.name.split('.')[0].replace(/_/g, ' '));
      }

      // Automatically inspect the audio/video file for its exact sub-second duration
      try {
        const objectUrl = URL.createObjectURL(file);
        const audioObj = new Audio(objectUrl);
        audioObj.addEventListener('loadedmetadata', () => {
          const fileDuration = audioObj.duration;
          if (fileDuration && !isNaN(fileDuration)) {
            setDuration(fileDuration);
            setDurationMin(Math.floor(fileDuration / 60));
            setDurationSec(parseFloat((fileDuration % 60).toFixed(4)));
          }
          URL.revokeObjectURL(objectUrl);
        });
      } catch (err) {
        console.warn('Failed to extract audio metadata:', err);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setSelectedFile({
        name: file.name,
        size: sizeMB,
        type: file.type,
        fileObject: file
      });
      if (!projectName) {
        setProjectName(file.name.split('.')[0].replace(/_/g, ' '));
      }

      // Automatically inspect the audio/video file for its exact sub-second duration
      try {
        const objectUrl = URL.createObjectURL(file);
        const audioObj = new Audio(objectUrl);
        audioObj.addEventListener('loadedmetadata', () => {
          const fileDuration = audioObj.duration;
          if (fileDuration && !isNaN(fileDuration)) {
            setDuration(fileDuration);
            setDurationMin(Math.floor(fileDuration / 60));
            setDurationSec(parseFloat((fileDuration % 60).toFixed(4)));
          }
          URL.revokeObjectURL(objectUrl);
        });
      } catch (err) {
        console.warn('Failed to extract audio metadata:', err);
      }
    }
  };

  const handleQuickSelect = (file: typeof quickSelectFiles[0]) => {
    setSelectedFile({
      name: file.name,
      size: file.size,
      type: 'audio/mpeg'
    });
    setDuration(file.duration);
    setDurationMin(Math.floor(file.duration / 60));
    setDurationSec(file.duration % 60);
    setProjectName(file.label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const finalName = projectName.trim() || selectedFile.name.split('.')[0].replace(/_/g, ' ');
    const audioUrl = selectedFile.fileObject ? URL.createObjectURL(selectedFile.fileObject) : '';
    onCreateProject(finalName, selectedFile.name, selectedFile.size, syncMode, duration, audioUrl);
    
    // Reset form
    setProjectName('');
    setSelectedFile(null);
    setSyncMode('DOCUMENTARY');
    setDuration(120);
    setDurationMin(2);
    setDurationSec(0);
    onClose();
  };

  return (
    <div id="new_project_modal_overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="new_project_modal_content" 
        className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Create New Synchronization Project
            </h3>
          </div>
          <button 
            id="modal_btn_close"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* STEP 1: Upload Media Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Step 1: Upload Audio or Video Narrations
            </label>
            
            <div
              id="drop_zone_audio"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : selectedFile 
                  ? 'border-emerald-500 bg-emerald-50/10' 
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    {selectedFile.type.startsWith('video') ? (
                      <Video className="w-6 h-6 animate-pulse" />
                    ) : (
                      <FileAudio className="w-6 h-6 animate-pulse" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 truncate max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Size: {selectedFile.size} • Ready for analysis
                  </p>
                  <span className="mt-3 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold rounded-full">
                    SELECTED SUCCESS
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700">
                    Drag & Drop your narration file here
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm">
                    Supports MP3, WAV, AAC, M4A, MP4, or MOV. Up to 1 hour files. Or browse your computer.
                  </p>
                </>
              )}
            </div>

            {/* Quick Presets Selectors */}
            <div className="space-y-2 mt-2">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
                Or pick a pre-loaded sample file to test immediately:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {quickSelectFiles.map((file) => {
                  const isChosen = selectedFile?.name === file.name;
                  return (
                    <button
                      key={file.name}
                      type="button"
                      id={`quick_select_${file.name.split('.')[0]}`}
                      onClick={() => handleQuickSelect(file)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isChosen
                          ? 'border-blue-500 bg-blue-50/40 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold truncate leading-none">
                          {file.label}
                        </span>
                        {isChosen && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                        {file.size} • {Math.floor(file.duration / 60)}m
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Project settings fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono mb-2">
                Project Name
              </label>
              <input
                id="modal_project_name_input"
                type="text"
                required
                placeholder="e.g. Rome Documentary Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono mb-2">
                Audio / Video Duration
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <input
                    id="modal_duration_min_input"
                    type="number"
                    min="0"
                    max="60"
                    value={durationMin}
                    onChange={(e) => updateDuration(Number(e.target.value), durationSec)}
                    className="w-full text-center text-xs font-bold text-slate-800 focus:outline-none bg-transparent"
                  />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">min</span>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <input
                    id="modal_duration_sec_input"
                    type="number"
                    min="0"
                    max="59.9999"
                    step="any"
                    value={durationSec}
                    onChange={(e) => updateDuration(durationMin, parseFloat(e.target.value) || 0)}
                    className="w-full text-center text-xs font-bold text-slate-800 focus:outline-none bg-transparent"
                  />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">sec</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Total calculated duration: {duration.toFixed(4)} seconds. (E.g., if your audio is 7:53.42, set to 7 min and 53.42 sec).
              </p>
            </div>
          </div>

          {/* Sync Mode presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Step 2: Choose Initial Sync Mode Preset
              </label>
              <span className="text-[10px] text-slate-400 font-mono hover:text-slate-600 cursor-help flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                What are sync modes?
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['DOCUMENTARY', 'CINEMATIC', 'STRICT', 'FAST_PACED', 'CALM'] as SyncMode[]).map((mode) => {
                const desc = {
                  DOCUMENTARY: 'Historical focus',
                  CINEMATIC: 'Atmospheric variety',
                  STRICT: 'Literal alignment',
                  FAST_PACED: 'YouTube / Reels pace',
                  CALM: 'Slower, ambient feel'
                }[mode];

                const isChosen = syncMode === mode;

                return (
                  <button
                    key={mode}
                    type="button"
                    id={`modal_sync_mode_${mode}`}
                    onClick={() => setSyncMode(mode)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isChosen
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[10px] font-bold tracking-wider uppercase font-mono">
                      {mode.replace('_', ' ')}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              id="modal_btn_cancel"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="modal_btn_submit"
              disabled={!selectedFile}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFile 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Initialize Project Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
