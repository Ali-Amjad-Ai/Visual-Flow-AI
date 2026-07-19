/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectStatus =
  | 'UPLOADING'
  | 'ANALYZING'
  | 'SYNCING'
  | 'READY_FOR_REVIEW'
  | 'NEEDS_ATTENTION'
  | 'COMPLETE';

export type SyncMode =
  | 'STRICT'
  | 'CINEMATIC'
  | 'DOCUMENTARY'
  | 'FAST_PACED'
  | 'CALM';

export interface SyncControls {
  visualPace: 'slow' | 'balanced' | 'fast';
  imageDuration: 'short' | 'balanced' | 'long';
  imageReuse: 'never' | 'necessary' | 'allowed';
  matchingStyle: 'literal' | 'contextual' | 'cinematic';
  variety: 'low' | 'balanced' | 'max';
  qualityPriority: 'relevance' | 'quality' | 'balanced';
}

export type MediaCategory =
  | 'PEOPLE'
  | 'LOCATIONS'
  | 'OBJECTS'
  | 'EVENTS'
  | 'NATURE'
  | 'BUSINESS'
  | 'ARCHITECTURE'
  | 'GENERAL';

export type UnusedReason =
  | 'NOT_RELEVANT'
  | 'DUPLICATE'
  | 'LOW_QUALITY'
  | 'REDUNDANT'
  | 'NOT_YET_NEEDED';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'audio' | 'video';
  size: string;
  duration?: number; // for audio/video in seconds
  status: 'used' | 'unused' | 'duplicate' | 'low_quality';
  confidence?: number; // confidence score of visual analysis
  category: MediaCategory;
  reasonUnused?: UnusedReason;
  duplicateOf?: string; // ID of the master item if this is a duplicate
  visualAnalysis: string; // Detail description of visual contents
  uploadedAt: string;
}

export interface TimelineClip {
  id: string;
  mediaId: string;
  start: number; // seconds
  end: number; // seconds
  locked: boolean;
  confidence: number; // 0-100
  panZoomEffect: 'none' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';
}

export interface Section {
  id: string;
  title: string;
  start: number; // seconds
  end: number; // seconds
  transcript: string;
  locked: boolean;
}

export interface Project {
  id: string;
  name: string;
  duration: number; // total duration in seconds
  audioName: string;
  audioSize: string;
  audioUrl?: string;
  status: ProjectStatus;
  progress: number; // overall AI workflow progress %
  lastSaved: string;
  syncMode: SyncMode;
  syncControls: SyncControls;
  mediaItems: MediaItem[];
  clips: TimelineClip[];
  sections: Section[];
  highPrecisionSync?: boolean; // strict-only alignment engine with 0% tolerance
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionsPerformed?: string[]; // list of actions the AI took in the UI
}
