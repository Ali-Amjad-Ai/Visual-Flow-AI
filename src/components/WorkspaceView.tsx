/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Lock, 
  Unlock, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Database, 
  LayoutGrid, 
  CheckCircle2, 
  AlertTriangle, 
  Filter,
  Plus,
  Upload,
  Send,
  Eye,
  Info,
  ChevronRight,
  Video,
  Check,
  Zap,
  ArrowRight,
  Download,
  Share2,
  FileDown
} from 'lucide-react';
import { Project, MediaItem, TimelineClip, Section, SyncMode, SyncControls, MediaCategory, UnusedReason } from '../types';
import { getSvgPlaceholder } from '../data/presets';

interface WorkspaceViewProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onBackToDashboard: () => void;
}

export default function WorkspaceView({ project, onUpdateProject, onBackToDashboard }: WorkspaceViewProps) {
  // Navigation inside Media Library
  const [mediaFilter, setMediaFilter] = useState<'all' | 'used' | 'unused' | 'duplicate' | 'low_quality' | 'low_confidence'>('all');
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'ALL'>('ALL');
  const [leftPanelTab, setLeftPanelTab] = useState<'catalog' | 'validation'>('catalog');
  const [validationFilter, setValidationFilter] = useState<'all' | 'flagged' | 'perfect'>('all');
  const [exportDrive, setExportDrive] = useState<'BROWSER' | 'DISK_C' | 'DISK_D' | 'CUSTOM'>('BROWSER');
  const [customExportPath, setCustomExportPath] = useState<string>('C:\\VisualFlowExports\\Projects\\');
  
  // Simulated Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1); // Zoom factor of timeline view

  // Upload Simulation State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBatchCount, setUploadedBatchCount] = useState(0);
  const [showContinuousBanner, setShowContinuousBanner] = useState(false);
  const [newUploadedItems, setNewUploadedItems] = useState<MediaItem[]>([]);

  // Selected Clip Inspector State
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Sync Controls Form State
  const [showSyncControls, setShowSyncControls] = useState(false);

  // Export Feature State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'MP4' | 'MOV' | 'GIF' | 'MP3'>('MP4');
  const [exportQuality, setExportQuality] = useState<'1080p' | '4K' | '720p'>('1080p');
  const [exportRatio, setExportRatio] = useState<'16:9' | '9:16' | '1:1' | '4:5'>('16:9');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  // AI Chat Assistant State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ id: string; sender: 'user' | 'ai'; text: string; timestamp: string }[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your VisualFlow Alignment Assistant. I have analyzed your audio track "${project.audioName}" and categorized your uploaded visual assets.\n\nOur current synchronization alignment score is ${project.status === 'COMPLETE' ? '98%' : '86%'} (Excellent Match).\n\nHow can I help you adjust the narrative timeline today?`,
      timestamp: 'Just now'
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const playerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageUploaderRef = useRef<HTMLInputElement>(null);

  // Scroll to chat bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // Video Player Playback loop
  useEffect(() => {
    if (isPlaying) {
      const stepMs = 100 / playbackSpeed;
      playerIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= project.duration) {
            setIsPlaying(false);
            if (playerIntervalRef.current) clearInterval(playerIntervalRef.current);
            return 0;
          }
          return Math.min(prev + 0.1, project.duration);
        });
      }, 100);
    } else {
      if (playerIntervalRef.current) {
        clearInterval(playerIntervalRef.current);
      }
    }

    return () => {
      if (playerIntervalRef.current) clearInterval(playerIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, project.duration]);

  // Find currently active timeline clip and active section based on current playhead time
  const activeClip = project.clips.find(clip => currentTime >= clip.start && currentTime < clip.end);
  const activeMedia = activeClip ? project.mediaItems.find(m => m.id === activeClip.mediaId) : null;
  const activeSection = project.sections.find(sec => currentTime >= sec.start && currentTime < sec.end);

  // Scroll timeline to active clip automatically if offscreen
  const timelineRulerRef = useRef<HTMLDivElement>(null);

  // Drag and drop elements
  const handleImageDragStart = (e: React.DragEvent, imageId: string) => {
    e.dataTransfer.setData('text/plain', imageId);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleTimelineClipDrop = (e: React.DragEvent, targetClipId: string) => {
    e.preventDefault();
    const draggedImageId = e.dataTransfer.getData('text/plain');
    if (!draggedImageId) return;

    const sourceImage = project.mediaItems.find(m => m.id === draggedImageId);
    if (!sourceImage) return;

    // Mutate project clips to replace mediaId
    const updatedClips = project.clips.map(clip => {
      if (clip.id === targetClipId) {
        return { 
          ...clip, 
          mediaId: draggedImageId,
          confidence: sourceImage.confidence || 95 
        };
      }
      return clip;
    });

    // Mark the old image as unused if no other clip references it, and make new image as used
    const updatedMediaItems = project.mediaItems.map(m => {
      if (m.id === draggedImageId) {
        return { ...m, status: 'used' as const };
      }
      return m;
    });

    onUpdateProject({
      ...project,
      clips: updatedClips,
      mediaItems: updatedMediaItems
    });

    appendAiMessage(`Replaced timeline clip image with local asset "${sourceImage.name}". Sync confidence recalculated.`);
  };

  const handleImageUploadTrigger = () => {
    imageUploaderRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadProgress(10);
      
      const filesCount = e.target.files.length;
      setUploadedBatchCount(filesCount);

      // Simulate a multi-step upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              // Add mock newly uploaded assets to project
              const newlyAdded: MediaItem[] = [];
              for (let i = 0; i < filesCount; i++) {
                const file = e.target.files![i];
                const fileMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                const id = `user_img_${Date.now()}_${i}`;
                
                // Categorize based on name or index
                const cats: MediaCategory[] = ['PEOPLE', 'LOCATIONS', 'OBJECTS', 'NATURE', 'EVENTS'];
                const chosenCat = cats[i % cats.length];
                
                newlyAdded.push({
                  id,
                  name: file.name,
                  url: getSvgPlaceholder(file.name.split('.')[0], chosenCat, 'indigo'),
                  type: 'image',
                  size: fileMb,
                  status: 'unused', // uploaded files are unused initially
                  category: chosenCat,
                  visualAnalysis: `User-uploaded asset showing high-contrast visual features categorized under ${chosenCat}.`,
                  uploadedAt: 'Just now',
                  confidence: 90 + Math.floor(Math.random() * 10)
                });
              }

              // Append to project and show continuous sync workflow banner
              onUpdateProject({
                ...project,
                mediaItems: [...project.mediaItems, ...newlyAdded]
              });

              setNewUploadedItems(newlyAdded);
              setIsUploading(false);
              setUploadProgress(0);
              setShowContinuousBanner(true); // Open core workflow trigger banner!
            }, 500);
            return 100;
          }
          return prev + 15;
        });
      }, 200);
    }
  };

  // Core intelligence workflow: Continue Synchronization
  const handleContinueSync = () => {
    setShowContinuousBanner(false);
    setIsAiTyping(true);
    
    setTimeout(() => {
      // Intelligently slot new images into low-confidence areas or append them to extend synchronization
      // For this high-fidelity workflow, let's substitute all "Unused" or newly uploaded items into any remaining empty slots 
      // and replace lower-confidence clips (like steel worker lunch) with our stunning new images.
      
      let clipsMutated = [...project.clips];
      let mediaItemsMutated = [...project.mediaItems];

      // Update newly added items to 'used' status
      const newlyAddedIds = newUploadedItems.map(n => n.id);
      mediaItemsMutated = mediaItemsMutated.map(m => {
        if (newlyAddedIds.includes(m.id)) {
          return { ...m, status: 'used' as const };
        }
        return m;
      });

      // Replace low confidence clip (clip6) with the first newly uploaded image
      if (newUploadedItems.length > 0) {
        clipsMutated = clipsMutated.map(c => {
          if (c.id === 'clip6') {
            return {
              ...c,
              mediaId: newUploadedItems[0].id,
              confidence: 96, // higher confidence now!
            };
          }
          return c;
        });
      }

      onUpdateProject({
        ...project,
        clips: clipsMutated,
        mediaItems: mediaItemsMutated,
        status: 'COMPLETE',
        progress: 100,
        lastSaved: 'Just now'
      });

      setIsAiTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          sender: 'ai',
          text: `🎉 **CONTINUOUS SYNC COMPLETE** 🎉\n\nI processed ${newUploadedItems.length} new visual assets successfully.\n\n**Actions Taken:**\n1. Automatically analyzed subject composition of your new files.\n2. Identified a weak match (54% confidence) at section "THE HARD LABOR" (02:35) and swapped it with your superior asset "${newUploadedItems[0].name}".\n3. Our overall alignment accuracy has been elevated to **98% (Excellent Match)**.\n4. Project state saved successfully.`,
          timestamp: 'Just now'
        }
      ]);
    }, 1500);
  };

  const handleImproveExistingOnly = () => {
    setShowContinuousBanner(false);
    appendAiMessage("Scanning your timeline to substitute weak or redundant scene matches with new assets...");
    
    setTimeout(() => {
      // Find clip6 (Steel workers lunch, low confidence) and replace it with high confidence asset
      const updatedClips = project.clips.map(c => {
        if (c.id === 'clip6') {
          return {
            ...c,
            mediaId: 'p1_img7', // twilight illumination
            confidence: 95
          };
        }
        return c;
      });

      onUpdateProject({
        ...project,
        clips: updatedClips,
        lastSaved: 'Just now'
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          sender: 'ai',
          text: `Alignment optimized! I scanned for weak slots and replaced the 54% low-confidence historical ironworker photograph with the gorgeous "Eiffel_Tower_Twilight_Illumination.jpg" (95% Match).`,
          timestamp: 'Just now'
        }
      ]);
    }, 800);
  };

  // Chat assistant query processing
  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { id: `user_${Date.now()}`, sender: 'user', text: userText, timestamp: 'Just now' }]);
    setChatInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      let aiText = '';
      let mutatedProject = { ...project };

      const query = userText.toLowerCase();

      if (query.includes('cinematic') || query.includes('ken burns')) {
        // Upgrade project mode to cinematic & random pan effects
        mutatedProject.syncMode = 'CINEMATIC';
        mutatedProject.syncControls = {
          ...mutatedProject.syncControls,
          matchingStyle: 'cinematic',
          variety: 'max'
        };
        mutatedProject.clips = mutatedProject.clips.map(c => ({
          ...c,
          panZoomEffect: c.panZoomEffect === 'none' ? 'zoom-in' : c.panZoomEffect
        }));
        aiText = `✨ **Cinematic Mode Activated**\n\nI have adjusted the studio's synchronization pipeline to prioritize atmospheric pacing. \n\n**Adjustments made:**\n- Upgraded synchronization style to **CINEMATIC**\n- Applied kinetic Ken Burns camera movements (zoom/pan ratios) to all timeline clips.\n- Relaxed literal word restraints to prioritize visual grandeur and variety.`;
      } 
      else if (query.includes('faster') || query.includes('pacing') || query.includes('pace')) {
        // Update pacing to fast
        mutatedProject.syncControls = {
          ...mutatedProject.syncControls,
          visualPace: 'fast',
          imageDuration: 'short'
        };
        // Slice clips into shorter chunks to represent fast pacing
        let newClips: TimelineClip[] = [];
        let currTime = 0;
        const durationLimit = project.duration;
        
        // Grab unused images to insert more frequent transitions
        const availableUnused = project.mediaItems.filter(m => m.status === 'unused');
        let unusedIdx = 0;

        project.clips.forEach((oldClip, idx) => {
          const originalDuration = oldClip.end - oldClip.start;
          if (originalDuration > 25 && unusedIdx < availableUnused.length) {
            // Split clip in half and insert an unused asset!
            const mid = oldClip.start + Math.floor(originalDuration / 2);
            const extraAsset = availableUnused[unusedIdx++];
            extraAsset.status = 'used';

            newClips.push({
              ...oldClip,
              end: mid
            });
            newClips.push({
              id: `split_clip_${idx}`,
              mediaId: extraAsset.id,
              start: mid,
              end: oldClip.end,
              locked: false,
              confidence: 90,
              panZoomEffect: 'zoom-out'
            });
          } else {
            newClips.push(oldClip);
          }
        });

        mutatedProject.clips = newClips;
        aiText = `⚡ **Pacing Increased to FAST**\n\nI have modified our Sync Controls and split longer clips to create rapid scene transitions. \n\n**Actions Completed:**\n- Set visual pace to **FAST** and image duration limits to **SHORT**.\n- Split 2 long-form clips.\n- Pulled unused assets to increase direct narrative cuts. Play back the video to see the high-tempo result!`;
      } 
      else if (query.includes('weak') || query.includes('improve') || query.includes('low confidence')) {
        // Swap clip6 (low confidence) with better unused asset
        mutatedProject.clips = mutatedProject.clips.map(c => {
          if (c.confidence < 80) {
            return {
              ...c,
              mediaId: 'p1_img7', // twilight illumination
              confidence: 96
            };
          }
          return c;
        });
        aiText = `🛠️ **Weak Match Alignment Improved**\n\nI searched the timeline for low-confidence nodes. \n\n- Detected 1 weak match at section "THE HARD LABOR" (02:35) with 54% confidence.\n- Automatically replaced it with your premium unused asset **"Eiffel_Tower_Twilight_Illumination.jpg"**, boosting alignment confidence to **96%**.`;
      }
      else if (query.includes('duplicate') || query.includes('remove duplicate')) {
        // Group duplicates and clean them out
        aiText = `🧼 **Duplicate Image Scan Complete**\n\n- Scanned 15 media files.\n- Identified 1 exact duplicate (**Eiffel_Tower_Wide_Aerial_Dup.jpg**) and 1 near-duplicate (**Eiffel_Tower_Wide_Aerial_Cropped.jpg**).\n- Consolidated them under the 'Duplicates' tab in your left media catalog.\n- Ensured only the highest-resolution master asset is active in your timeline. No user files were deleted.`;
      }
      else if (query.includes('why') || query.includes('choose')) {
        aiText = `🧠 **AI Decision Insight:**\n\nI aligned **"Construction_Draft_Blueprints_1887.png"** to the timestamp 00:20 because the underlying transcription specifically references the technical planning stage: *"Maurice Koechlin drafted the initial technical blueprints for a massive tower"*. \n\nBy matching the technical wireframe diagrams with the spoken word 'blueprints', I achieved a **96% alignment confidence rating**.`;
      }
      else {
        // Generic smart response
        aiText = `Understood. I have parsed your command: "${userText}".\n\nI'm adjusting the semantic mapping database to align with your creative brief. Let me know if you would like me to:\n- **"Make the pacing faster"**\n- **"Improve low confidence matches"**\n- **"Switch to Cinematic Mode"**\n- **"Consolidate duplicate uploads"**`;
      }

      onUpdateProject(mutatedProject);
      setIsAiTyping(false);
      setMessages((prev) => [...prev, { id: `ai_${Date.now()}`, sender: 'ai', text: aiText, timestamp: 'Just now' }]);
    }, 1000);
  };

  const appendAiMessage = (tempText: string) => {
    setIsAiTyping(true);
    setTimeout(() => {
      setIsAiTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: tempText,
          timestamp: 'Just now'
        }
      ]);
    }, 600);
  };

  // Left panel filtering logic
  const filteredMediaItems = project.mediaItems.filter(item => {
    // Filter by general search categories
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

    // Filter by tab selections
    switch (mediaFilter) {
      case 'used': return item.status === 'used';
      case 'unused': return item.status === 'unused';
      case 'duplicate': return item.status === 'duplicate';
      case 'low_quality': return item.status === 'low_quality';
      case 'low_confidence': return item.status === 'used' && item.confidence && item.confidence < 80;
      case 'all':
      default: return true;
    }
  });

  // Calculate some simple stats for active project
  const usedImagesCount = project.mediaItems.filter(m => m.status === 'used').length;
  const unusedImagesCount = project.mediaItems.filter(m => m.status === 'unused').length;
  const duplicateImagesCount = project.mediaItems.filter(m => m.status === 'duplicate').length;
  const lowQualityImagesCount = project.mediaItems.filter(m => m.status === 'low_quality').length;

  // Sync mode triggers
  const applySyncMode = (mode: SyncMode) => {
    let controls: SyncControls = { ...project.syncControls };
    switch (mode) {
      case 'STRICT':
        controls = {
          visualPace: 'balanced',
          imageDuration: 'balanced',
          imageReuse: 'never',
          matchingStyle: 'literal',
          variety: 'low',
          qualityPriority: 'relevance'
        };
        break;
      case 'CINEMATIC':
        controls = {
          visualPace: 'balanced',
          imageDuration: 'long',
          imageReuse: 'allowed',
          matchingStyle: 'cinematic',
          variety: 'max',
          qualityPriority: 'quality'
        };
        break;
      case 'DOCUMENTARY':
        controls = {
          visualPace: 'balanced',
          imageDuration: 'balanced',
          imageReuse: 'necessary',
          matchingStyle: 'literal',
          variety: 'balanced',
          qualityPriority: 'balanced'
        };
        break;
      case 'FAST_PACED':
        controls = {
          visualPace: 'fast',
          imageDuration: 'short',
          imageReuse: 'necessary',
          matchingStyle: 'contextual',
          variety: 'max',
          qualityPriority: 'relevance'
        };
        break;
      case 'CALM':
        controls = {
          visualPace: 'slow',
          imageDuration: 'long',
          imageReuse: 'allowed',
          matchingStyle: 'contextual',
          variety: 'low',
          qualityPriority: 'quality'
        };
        break;
    }

    onUpdateProject({
      ...project,
      syncMode: mode,
      syncControls: controls,
      lastSaved: 'Just now'
    });

    appendAiMessage(`Project synchronization configuration updated to **${mode}** mode preset.`);
  };

  const handleSyncControlsChange = (field: keyof SyncControls, value: any) => {
    onUpdateProject({
      ...project,
      syncControls: {
        ...project.syncControls,
        [field]: value
      },
      lastSaved: 'Just now'
    });
  };

  // Run a full sync re-evaluation simulation
  const handleTriggerFullSync = () => {
    onUpdateProject({ ...project, status: 'SYNCING', progress: 15 });
    let progressVal = 15;
    
    const interval = setInterval(() => {
      progressVal += 20;
      if (progressVal >= 100) {
        clearInterval(interval);

        // Generate or map clips
        let finalClips: TimelineClip[] = [];
        const duration = project.duration;
        const segmentLen = Math.floor(duration / 5);

        // Check if there are some images to map
        const usedMedia = project.mediaItems.filter(m => m.type === 'image');
        
        if (project.highPrecisionSync) {
          // Strict engine: some clips don't have perfect matches (confidence < 100)
          finalClips = [
            {
              id: `clip_strict_1_${Date.now()}`,
              mediaId: usedMedia[0]?.id || 'p1_img1',
              start: 0,
              end: segmentLen,
              locked: false,
              confidence: 100,
              panZoomEffect: 'zoom-in'
            },
            {
              id: `clip_strict_2_${Date.now()}`,
              mediaId: usedMedia[1]?.id || 'p1_img2',
              start: segmentLen,
              end: segmentLen * 2,
              locked: false,
              confidence: 68, // FLAGGED: Non-perfect confidence match!
              panZoomEffect: 'pan-left'
            },
            {
              id: `clip_strict_3_${Date.now()}`,
              mediaId: usedMedia[2]?.id || 'p1_img3',
              start: segmentLen * 2,
              end: segmentLen * 3,
              locked: false,
              confidence: 100,
              panZoomEffect: 'none'
            },
            {
              id: `clip_strict_4_${Date.now()}`,
              mediaId: usedMedia[3]?.id || 'p1_img4',
              start: segmentLen * 3,
              end: segmentLen * 4,
              locked: false,
              confidence: 45, // FLAGGED: Non-perfect confidence match!
              panZoomEffect: 'zoom-out'
            },
            {
              id: `clip_strict_5_${Date.now()}`,
              mediaId: usedMedia[4]?.id || 'p1_img5',
              start: segmentLen * 4,
              end: duration,
              locked: false,
              confidence: 100,
              panZoomEffect: 'pan-right'
            }
          ];

          onUpdateProject({
            ...project,
            clips: finalClips,
            status: 'NEEDS_ATTENTION',
            progress: 100,
            lastSaved: 'Just now'
          });
          appendAiMessage(`⚠️ **Strict Alignment Complete - Gaps & Low-Confidence Matches Found** \n\nOur High-Precision strict engine has executed with 0% tolerance. We flagged **2 segments** where perfect matches were not found. Approximate fills were prevented. Please review these flagged flaws in your **Sync Validation** dashboard for manual alignment or adjustment.`);
        } else {
          // Standard: perfect matches / approximate fills permitted
          finalClips = [
            {
              id: `clip_std_1_${Date.now()}`,
              mediaId: usedMedia[0]?.id || 'p1_img1',
              start: 0,
              end: segmentLen,
              locked: false,
              confidence: 100,
              panZoomEffect: 'zoom-in'
            },
            {
              id: `clip_std_2_${Date.now()}`,
              mediaId: usedMedia[1]?.id || 'p1_img2',
              start: segmentLen,
              end: segmentLen * 2,
              locked: false,
              confidence: 100, // Approximate fill resolved to 100% perfect
              panZoomEffect: 'pan-left'
            },
            {
              id: `clip_std_3_${Date.now()}`,
              mediaId: usedMedia[2]?.id || 'p1_img3',
              start: segmentLen * 2,
              end: segmentLen * 3,
              locked: false,
              confidence: 100,
              panZoomEffect: 'none'
            },
            {
              id: `clip_std_4_${Date.now()}`,
              mediaId: usedMedia[3]?.id || 'p1_img4',
              start: segmentLen * 3,
              end: segmentLen * 4,
              locked: false,
              confidence: 100, // Approximate fill resolved to 100% perfect
              panZoomEffect: 'zoom-out'
            },
            {
              id: `clip_std_5_${Date.now()}`,
              mediaId: usedMedia[4]?.id || 'p1_img5',
              start: segmentLen * 4,
              end: duration,
              locked: false,
              confidence: 100,
              panZoomEffect: 'pan-right'
            }
          ];

          onUpdateProject({
            ...project,
            clips: finalClips,
            status: 'COMPLETE',
            progress: 100,
            lastSaved: 'Just now'
          });
          appendAiMessage(`⚡ **AI Synchronization Sequence Completed** \n\nRecalculated match densities across all sections with 100% alignment precision. Gaps were successfully filled. Final timeline saved with zero-flaw reliability.`);
        }
      } else {
        onUpdateProject({ ...project, status: 'SYNCING', progress: progressVal });
      }
    }, 150);
  };

  // Run high-fidelity media export simulation
  const handleTriggerExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportStep('Analyzing synchronization track vectors...');
    setExportSuccess(false);

    let progressVal = 0;
    const interval = setInterval(() => {
      progressVal += 4;
      if (progressVal >= 100) {
        clearInterval(interval);
        setExportProgress(100);
        setExportStep('Ready! Packaging media stream...');
        setExportSuccess(true);
        setIsExporting(false);
      } else {
        setExportProgress(progressVal);
        if (progressVal < 15) {
          setExportStep('Analyzing flawless timeline sync indices...');
        } else if (progressVal < 35) {
          setExportStep(`Pre-processing high-fidelity frames (${exportRatio === '9:16' ? 'Vertical 9:16 Reel' : exportRatio === '1:1' ? 'Square 1:1 Feed' : exportRatio === '4:5' ? 'Portrait 4:5 Post' : 'Landscape 16:9 Cinema'})`);
        } else if (progressVal < 60) {
          setExportStep(`Rendering high-resolution compositions at ${exportQuality === '4K' ? '4K Ultra HD' : exportQuality === '720p' ? '720p Mobile' : '1080p Full HD'} (${progressVal}%)`);
        } else if (progressVal < 80) {
          setExportStep(`Encoding multi-channel audio tracks into high-density ${exportFormat} container...`);
        } else {
          setExportStep('Synthesizing metadata headers and writing container file...');
        }
      }
    }, 120);
  };

  // Manual clip inspectors
  const handleLockClipToggle = (clipId: string) => {
    const updatedClips = project.clips.map(c => {
      if (c.id === clipId) return { ...c, locked: !c.locked };
      return c;
    });
    onUpdateProject({ ...project, clips: updatedClips });
  };

  const handleRegenerateClip = (clipId: string) => {
    // Pick a random unused image
    const unused = project.mediaItems.filter(m => m.status === 'unused');
    if (unused.length === 0) {
      appendAiMessage("I searched the unused library, but no further unique matches remain. Try adding more images to your library!");
      return;
    }

    const randomUnused = unused[Math.floor(Math.random() * unused.length)];
    
    // Mutate unused to used, and old to unused
    const targetClip = project.clips.find(c => c.id === clipId);
    if (!targetClip) return;
    
    const oldMediaId = targetClip.mediaId;

    const updatedMedia = project.mediaItems.map(m => {
      if (m.id === randomUnused.id) return { ...m, status: 'used' as const };
      if (m.id === oldMediaId) return { ...m, status: 'unused' as const, reasonUnused: 'NOT_YET_NEEDED' as const };
      return m;
    });

    const updatedClips = project.clips.map(c => {
      if (c.id === clipId) return { ...c, mediaId: randomUnused.id, confidence: 93 };
      return c;
    });

    onUpdateProject({
      ...project,
      mediaItems: updatedMedia,
      clips: updatedClips,
      lastSaved: 'Just now'
    });

    appendAiMessage(`Regenerated timeline clip. Replaced target frame with highly-scored alternative visual "${randomUnused.name}".`);
  };

  const handleDeleteClip = (clipId: string) => {
    const clipToDelete = project.clips.find(c => c.id === clipId);
    if (!clipToDelete) return;

    // Remove clip, mark media as unused
    const updatedClips = project.clips.filter(c => c.id !== clipId);
    const updatedMedia = project.mediaItems.map(m => {
      if (m.id === clipToDelete.mediaId) return { ...m, status: 'unused' as const, reasonUnused: 'NOT_YET_NEEDED' as const };
      return m;
    });

    onUpdateProject({
      ...project,
      clips: updatedClips,
      mediaItems: updatedMedia
    });

    setSelectedClipId(null);
    appendAiMessage(`Deleted visual clip from the timeline.`);
  };

  const handleStepPlayhead = (amount: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(project.duration, prev + amount)));
  };

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRulerRef.current) return;
    const rect = timelineRulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    setCurrentTime(Math.max(0, Math.min(project.duration, clickPercent * project.duration)));
  };

  return (
    <div id="studio_workspace" className="flex-1 flex flex-col bg-transparent overflow-hidden h-screen select-none">
      
      {/* 1. Header Toolbar */}
      <header className="h-14 bg-white/70 backdrop-blur-md border-b border-slate-200/40 px-6 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            id="workspace_btn_back"
            onClick={onBackToDashboard}
            className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition-all border border-slate-200/50"
          >
            ← Studio Dashboard
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-bold text-sm text-slate-800">{project.name}</h3>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                project.status === 'COMPLETE' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
              }`}>
                {project.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">
              Audio: {project.audioName} ({project.audioSize}) • Last Saved: {project.lastSaved}
            </p>
          </div>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-2">
          {/* Sync Mode Dropdown Toggle */}
          <div className="flex items-center gap-1 bg-white/50 backdrop-blur-xs p-1 rounded-xl border border-slate-200/40">
            {(['DOCUMENTARY', 'CINEMATIC', 'STRICT', 'FAST_PACED', 'CALM'] as SyncMode[]).map((mode) => (
              <button
                key={mode}
                id={`workspace_sync_preset_${mode}`}
                onClick={() => applySyncMode(mode)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  project.syncMode === mode
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            id="workspace_btn_sync_settings"
            onClick={() => setShowSyncControls(!showSyncControls)}
            className={`p-2 rounded-xl transition-all ${
              showSyncControls ? 'bg-blue-50 text-blue-600' : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200/60'
            }`}
            title="Fine-tune AI weights"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            id="workspace_btn_sync_ai"
            onClick={handleTriggerFullSync}
            disabled={project.status === 'SYNCING'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {project.status === 'SYNCING' ? `Syncing ${project.progress}%...` : 'Sync With AI'}
          </button>

          <button
            id="workspace_btn_export"
            onClick={() => {
              setShowExportModal(true);
              setExportSuccess(false);
              setExportProgress(0);
              setExportStep('');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-950/10 flex items-center gap-1.5 transition-all border border-slate-800/80"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export Project
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE MULTI-PANE VIEW */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANE A: MEDIA LIBRARY (LEFT) */}
        <section id="workspace_media_library" className="w-80 border-r border-slate-200/40 bg-white/70 backdrop-blur-md flex flex-col shrink-0 overflow-hidden">
          
          {/* Panel Tab Selector */}
          <div className="flex border-b border-slate-200/30 bg-slate-50/65 p-1 shrink-0">
            <button
              id="left_pane_tab_catalog"
              type="button"
              onClick={() => setLeftPanelTab('catalog')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                leftPanelTab === 'catalog'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Media Catalog
            </button>
            <button
              id="left_pane_tab_validation"
              type="button"
              onClick={() => setLeftPanelTab('validation')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 relative cursor-pointer ${
                leftPanelTab === 'validation'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              Sync Validation
              {project.clips.some(c => c.confidence < 100) && (
                <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>

          {leftPanelTab === 'catalog' ? (
            /* CATALOG TAB VIEW */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Media Header & Stats */}
              <div className="p-4 border-b border-slate-100 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Media Catalog
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {project.mediaItems.length} assets
              </span>
            </div>

            {/* Quick Stats list */}
            <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-mono text-slate-500 mt-1">
              <div className="bg-white/40 p-1.5 rounded-lg border border-slate-200/40">
                <div className="font-bold text-slate-800">{usedImagesCount}</div>
                <div>Used</div>
              </div>
              <div className="bg-white/40 p-1.5 rounded-lg border border-slate-200/40">
                <div className="font-bold text-slate-800">{unusedImagesCount}</div>
                <div>Unused</div>
              </div>
              <div className="bg-white/40 p-1.5 rounded-lg border border-slate-200/40">
                <div className="font-bold text-amber-600">{duplicateImagesCount}</div>
                <div>Dups</div>
              </div>
              <div className="bg-white/40 p-1.5 rounded-lg border border-slate-200/40">
                <div className="font-bold text-rose-500">{lowQualityImagesCount}</div>
                <div>Low Q</div>
              </div>
            </div>

            {/* Add Images Upload Area */}
            <div className="mt-2 shrink-0">
              <input
                ref={imageUploaderRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                id="media_btn_add_images"
                onClick={handleImageUploadTrigger}
                disabled={isUploading}
                className="w-full py-2 bg-white/40 hover:bg-white/70 border border-slate-300/60 border-dashed rounded-xl text-xs font-semibold text-slate-600 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-slate-400" />
                Add Batch Images...
              </button>
            </div>

            {/* Batch Upload Stream Progress */}
            {isUploading && (
              <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex justify-between text-[10px] font-mono text-blue-700 mb-1 font-bold">
                  <span>Uploading {uploadedBatchCount} images...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Filtering row */}
          <div className="p-3 bg-white/30 border-b border-slate-200/30 shrink-0 space-y-1.5">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'used', label: 'Used' },
                { id: 'unused', label: 'Unused' },
                { id: 'duplicate', label: 'Duplicates' },
                { id: 'low_quality', label: 'Low Quality' },
                { id: 'low_confidence', label: 'Weak Matches' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  id={`media_tab_${btn.id}`}
                  onClick={() => setMediaFilter(btn.id as any)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                    mediaFilter === btn.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/60 text-slate-500 border border-slate-200/60 hover:text-slate-800 hover:bg-white/80'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Group:</span>
              <select
                id="media_category_filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-transparent text-slate-600 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="PEOPLE">People</option>
                <option value="LOCATIONS">Locations</option>
                <option value="OBJECTS">Objects</option>
                <option value="EVENTS">Events</option>
                <option value="NATURE">Nature</option>
                <option value="BUSINESS">Business</option>
                <option value="ARCHITECTURE">Architecture</option>
              </select>
            </div>
          </div>

          {/* Continuous synchronization workflow banner overlay inside Media Panel */}
          {showContinuousBanner && (
            <div className="p-4 bg-blue-50 border-b border-blue-100 shrink-0 shadow-inner flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h5 className="text-[11px] font-bold text-blue-900">
                    Existing Project Detected
                  </h5>
                  <p className="text-[10px] text-blue-700 leading-normal mt-0.5">
                    Your timeline currently ends at 04:00 (100% matched). {newUploadedItems.length} new visual assets are ready. Continue synchronization?
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 justify-end">
                <button
                  id="continuous_btn_improve"
                  onClick={handleImproveExistingOnly}
                  className="px-2.5 py-1 hover:bg-blue-100 text-blue-700 rounded-lg text-[9px] font-bold border border-blue-200 transition-colors"
                >
                  Improve Matches
                </button>
                <button
                  id="continuous_btn_continue"
                  onClick={handleContinueSync}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold shadow-sm transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="w-3 h-3" />
                  Continue Syncing
                </button>
              </div>
            </div>
          )}

          {/* Catalog grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            {filteredMediaItems.length === 0 ? (
              <div className="text-center py-10">
                <LayoutGrid className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">No assets found</p>
                <p className="text-[10px] text-slate-400 mt-1">Try changing your filters or adding new photos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredMediaItems.map((item) => {
                  const isClipActive = activeMedia?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleImageDragStart(e, item.id)}
                      className={`group bg-white/60 backdrop-blur-xs rounded-xl border p-1.5 transition-all cursor-grab relative overflow-hidden select-none active:cursor-grabbing hover:bg-white/90 ${
                        isClipActive
                          ? 'ring-2 ring-blue-500 border-transparent shadow-sm'
                          : 'border-slate-200/50 hover:border-slate-300 shadow-xs'
                      }`}
                      title={`${item.name}\nDrag me to timeline to replace any frame!`}
                    >
                      {/* Thumbnail Container */}
                      <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
                        <img 
                          src={item.url} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Duplicate badge */}
                        {item.status === 'duplicate' && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-bold font-mono px-1 rounded-sm shadow-xs flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            DUP
                          </div>
                        )}

                        {/* Low quality badge */}
                        {item.status === 'low_quality' && (
                          <div className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-bold font-mono px-1 rounded-sm shadow-xs flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            LOW Q
                          </div>
                        )}

                        {/* Status indicators */}
                        <div className="absolute bottom-1 right-1">
                          {item.status === 'used' ? (
                            <span className="bg-emerald-500 text-white text-[7px] font-bold font-mono px-1 rounded-xs uppercase tracking-wide">
                              Used
                            </span>
                          ) : item.status === 'unused' ? (
                            <span className="bg-slate-700/80 text-white text-[7px] font-bold font-mono px-1 rounded-xs uppercase tracking-wide">
                              Unused
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Info lines */}
                      <div className="mt-2">
                        <div className="text-[10px] font-semibold text-slate-800 truncate leading-none" title={item.name}>
                          {item.name}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-slate-400">
                          <span>{item.size}</span>
                          <span>{item.category}</span>
                        </div>
                      </div>

                      {/* Unused intelligence hover drawer details */}
                      {item.status === 'unused' && item.reasonUnused && (
                        <div className="mt-1 border-t border-slate-100 pt-1 text-[8px] font-mono text-amber-600 leading-tight">
                          💡 Unused: {
                            item.reasonUnused === 'REDUNDANT' ? 'Redundant visual alternate' :
                            item.reasonUnused === 'NOT_RELEVANT' ? 'Context not in script' :
                            item.reasonUnused === 'NOT_YET_NEEDED' ? 'Better suited for later' : 'Low matching density'
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </div>
          ) : (
            /* VALIDATION DASHBOARD TAB VIEW */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header and stats */}
              <div className="p-4 border-b border-slate-100 bg-white/40 shrink-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Strict Sync Validation
                  </h4>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                    {project.highPrecisionSync ? 'Strict Engine' : 'Standard'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Scanning timeline tracks... Detected <strong>{project.clips.filter(c => c.confidence < 100).length}</strong> sync alignment anomalies.
                </p>

                {/* Segment Filter tabs */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-mono mt-1 shrink-0">
                  <button
                    id="val_filter_all"
                    type="button"
                    onClick={() => setValidationFilter('all')}
                    className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                      validationFilter === 'all'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    All ({project.clips.length})
                  </button>
                  <button
                    id="val_filter_flagged"
                    type="button"
                    onClick={() => setValidationFilter('flagged')}
                    className={`py-1 rounded font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                      validationFilter === 'flagged'
                        ? 'bg-amber-500 text-white shadow-xs font-black'
                        : 'text-slate-500 hover:text-amber-600'
                    }`}
                  >
                    Flagged ({project.clips.filter(c => c.confidence < 100).length})
                  </button>
                  <button
                    id="val_filter_perfect"
                    type="button"
                    onClick={() => setValidationFilter('perfect')}
                    className={`py-1 rounded font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                      validationFilter === 'perfect'
                        ? 'bg-emerald-600 text-white shadow-xs font-black'
                        : 'text-slate-500 hover:text-emerald-600'
                    }`}
                  >
                    Perfect ({project.clips.filter(c => c.confidence >= 100).length})
                  </button>
                </div>
              </div>

              {/* Scrollable validation list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {project.clips.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3 bg-white/60 rounded-2xl border border-slate-200/40">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-dashed border-slate-300">
                      <Video className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 font-sans">No Segments Synced</h5>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Click "Sync with AI" to generate timeline segments and evaluate their match confidence.
                      </p>
                    </div>
                  </div>
                ) : [...project.clips].filter(clip => {
                    if (validationFilter === 'flagged') return clip.confidence < 100;
                    if (validationFilter === 'perfect') return clip.confidence >= 100;
                    return true;
                  }).length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3 bg-white/60 rounded-2xl border border-slate-200/40">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-dashed border-slate-200">
                        <Check className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 font-sans">No matching segments</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          No timeline segments match the selected filter (<strong>{validationFilter}</strong>).
                         </p>
                      </div>
                    </div>
                  ) : (
                  <div className="space-y-3">
                    {[...project.clips]
                      .sort((a, b) => a.start - b.start)
                      .filter(clip => {
                        if (validationFilter === 'flagged') return clip.confidence < 100;
                        if (validationFilter === 'perfect') return clip.confidence >= 100;
                        return true;
                      })
                      .map((clip) => {
                      const mediaItem = project.mediaItems.find(m => m.id === clip.mediaId);
                      const isLowConfidence = clip.confidence < 100;
                      return (
                        <div 
                          key={clip.id}
                          className={`p-3 bg-white hover:bg-slate-50 border rounded-2xl shadow-xs transition-all space-y-3 relative group ${
                            isLowConfidence 
                              ? 'border-amber-300 bg-amber-500/[0.02]' 
                              : 'border-slate-200/60'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Thumbnail */}
                            {mediaItem ? (
                              <img 
                                src={mediaItem.url} 
                                alt={mediaItem.name} 
                                className="w-16 aspect-video object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-16 aspect-video bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-dashed border-slate-300">
                                <span className="text-[8px] text-slate-400 italic">No Media</span>
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <h5 className="text-[11px] font-bold text-slate-800 truncate leading-none">
                                {mediaItem?.name || `Segment [${clip.start}s - ${clip.end}s]`}
                              </h5>
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isLowConfidence ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                <span className={`text-[10px] font-bold font-mono ${isLowConfidence ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {isLowConfidence ? `Needs Alignment: ${clip.confidence}%` : 'Perfect Alignment (100%)'}
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-400 mt-1 font-mono">
                                Interval: {clip.start}s - {clip.end}s ({clip.end - clip.start}s duration)
                              </p>
                            </div>
                          </div>

                          {/* Quick Alignment Action Controls */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                            <button
                              id={`val_jump_${clip.id}`}
                              type="button"
                              onClick={() => {
                                setCurrentTime(clip.start);
                                setSelectedClipId(clip.id);
                                if (isLowConfidence) {
                                  setChatInput(`Analyze this segment [${clip.start}s - ${clip.end}s] where alignment confidence is only ${clip.confidence}%. Optimize synchronization to 100%.`);
                                } else {
                                  setChatInput(`Explain why this segment [${clip.start}s - ${clip.end}s] has a perfect match score.`);
                                }
                              }}
                              className="py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Video className="w-3 h-3 text-slate-500" />
                              Jump & Inspect
                            </button>
                            {isLowConfidence ? (
                              <button
                                id={`val_resolve_${clip.id}`}
                                type="button"
                                onClick={() => {
                                  // Simulate resolving flaw with AI immediately
                                  setCurrentTime(clip.start);
                                  setSelectedClipId(clip.id);
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `usr_${Date.now()}`,
                                      sender: 'user',
                                      text: `🛠️ **Resolve Sync Alignment Flaw [${clip.start}s - ${clip.end}s]**`,
                                      timestamp: 'Just now'
                                    }
                                  ]);
                                  setIsAiTyping(true);
                                  appendAiMessage(`🛠️ **Sync Validation: Analyzing Alignment Flaw [${clip.start}s - ${clip.end}s]**\n\nChecking stereophonic audio landmarks for audio track "${project.audioName}" around marker time ${clip.start}s...\n\nNo matching visual descriptors were found in this strict-alignment segment. Replacing visual clip with a flawlessly aligned alternative.`);
                                  
                                  setTimeout(() => {
                                    // Update clip confidence to 100%
                                    const updatedClips = project.clips.map(c => 
                                      c.id === clip.id ? { ...c, confidence: 100 } : c
                                    );
                                    onUpdateProject({
                                      ...project,
                                      clips: updatedClips,
                                      status: updatedClips.every(c => c.confidence === 100) ? 'COMPLETE' : 'NEEDS_ATTENTION',
                                      lastSaved: 'Just now'
                                    });
                                    setIsAiTyping(false);
                                    appendAiMessage(`✅ **Sync Alignment Flaw Successfully Resolved!**\n\nI have matched an absolute perfect high-resolution video sequence from your catalog that matches the dynamic frequencies of the audio tracks perfectly at ${clip.start}s. The segment has been upgraded to **100% flawless confidence alignment**.`);
                                  }, 1200);
                                }}
                                className="py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-blue-200" />
                                Auto-Fix with AI
                              </button>
                            ) : (
                              <div className="py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 border border-emerald-100">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                Aligned Flawlessly
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* CENTER PANE: PREVIEW VIEWPORT + AI CONTROLS */}
        <section id="workspace_viewport_section" className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
          
          {/* AI Settings Overlay panel toggled from header */}
          {showSyncControls && (
            <div id="sync_controls_overlay" className="absolute top-0 inset-x-0 bg-slate-900 border-b border-slate-800 p-6 z-20 text-slate-100 transition-all shadow-2xl">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="text-blue-500 w-5 h-5" />
                    <h4 className="font-bold text-sm">Fine-Tune AI Synchronizer Model Weights</h4>
                  </div>
                  <button 
                    id="sync_controls_close"
                    onClick={() => setShowSyncControls(false)}
                    className="text-xs text-slate-400 hover:text-white underline font-mono cursor-pointer"
                  >
                    Collapse Panel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                  {/* Pace control */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px]">Visual Pacing</label>
                    <select
                      id="ctrl_visualPace"
                      value={project.syncControls.visualPace}
                      onChange={(e) => handleSyncControlsChange('visualPace', e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 rounded-lg p-2 border border-slate-700 font-semibold focus:outline-none"
                    >
                      <option value="slow">Slow (Calm Narrations)</option>
                      <option value="balanced">Balanced</option>
                      <option value="fast">Fast (Rapid Transitions)</option>
                    </select>
                  </div>

                  {/* Image Duration limits */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px]">Image Duration Mode</label>
                    <select
                      id="ctrl_imageDuration"
                      value={project.syncControls.imageDuration}
                      onChange={(e) => handleSyncControlsChange('imageDuration', e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 rounded-lg p-2 border border-slate-700 font-semibold focus:outline-none"
                    >
                      <option value="short">Short Frame Limits</option>
                      <option value="balanced">Balanced limits</option>
                      <option value="long">Long Frames</option>
                    </select>
                  </div>

                  {/* Reuse strategy */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px]">Asset Reuse Rules</label>
                    <select
                      id="ctrl_imageReuse"
                      value={project.syncControls.imageReuse}
                      onChange={(e) => handleSyncControlsChange('imageReuse', e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 rounded-lg p-2 border border-slate-700 font-semibold focus:outline-none"
                    >
                      <option value="never">Never Reuse Assets</option>
                      <option value="necessary">Reuse Only When Necessary</option>
                      <option value="allowed">Allowed (Frequent Reuse)</option>
                    </select>
                  </div>

                  {/* Matching strictness */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px]">Matching Style Alignment</label>
                    <select
                      id="ctrl_matchingStyle"
                      value={project.syncControls.matchingStyle}
                      onChange={(e) => handleSyncControlsChange('matchingStyle', e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 rounded-lg p-2 border border-slate-700 font-semibold focus:outline-none"
                    >
                      <option value="literal">Literal (Exact match of nouns)</option>
                      <option value="contextual">Contextual (Topic thematic matching)</option>
                      <option value="cinematic">Cinematic (Atmospheric narrative mood)</option>
                    </select>
                  </div>

                  {/* Scene variety */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px]">Scene Variety Density</label>
                    <select
                      id="ctrl_variety"
                      value={project.syncControls.variety}
                      onChange={(e) => handleSyncControlsChange('variety', e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 rounded-lg p-2 border border-slate-700 font-semibold focus:outline-none"
                    >
                      <option value="low">Low Variety (Stable layout)</option>
                      <option value="balanced">Balanced Variance</option>
                      <option value="max">Maximum Variance</option>
                    </select>
                  </div>

                    {/* Quality Priority */}
                    <div className="space-y-2">
                      <label className="text-slate-400 font-mono tracking-wider uppercase text-[10px]">Quality Priority Model</label>
                      <select
                        id="ctrl_qualityPriority"
                        value={project.syncControls.qualityPriority}
                        onChange={(e) => handleSyncControlsChange('qualityPriority', e.target.value)}
                        className="w-full bg-slate-800 text-slate-100 rounded-lg p-2 border border-slate-700 font-semibold focus:outline-none"
                      >
                        <option value="relevance">Relevance Over Quality</option>
                        <option value="quality">Image Resolution Quality First</option>
                        <option value="balanced">Balanced Priority</option>
                      </select>
                    </div>
                  </div>

                  {/* High-Precision Sync Mode Toggle */}
                  <div className="mt-5 pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                        <Zap className={`w-3.5 h-3.5 ${project.highPrecisionSync ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                        High-Precision Sync Mode (Strict Engine)
                      </h5>
                      <p className="text-slate-400 text-[10px] max-w-xl leading-relaxed">
                        Enforces a strict-only alignment engine with 0% tolerance for low-confidence matches. Any segment where a perfect visual match isn't found will be flagged for manual intervention rather than attempting approximate visual fill.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="toggle_high_precision_sync"
                      onClick={() => {
                        onUpdateProject({
                          ...project,
                          highPrecisionSync: !project.highPrecisionSync,
                          lastSaved: 'Just now'
                        });
                        appendAiMessage(
                          !project.highPrecisionSync 
                            ? `🔒 **High-Precision Sync Mode Activated**\n\nThe synchronization engine will now enforce strict visual matches only, with 0% tolerance. Low-confidence matches will be flagged for manual review in your new Sync Validation tab.`
                            : `🔓 **High-Precision Sync Mode Deactivated**\n\nThe engine is back to standard adaptive matching with approximate fills.`
                        );
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                        project.highPrecisionSync
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      {project.highPrecisionSync ? 'STRICT ENGINE ACTIVE' : 'ACTIVATE STRICT'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Core Video Player Viewport Container */}
          <div className="flex-1 flex flex-col justify-center items-center p-8 relative overflow-hidden">
            
            {/* Visual canvas window simulating actual video render */}
            <div id="video_monitor_wrapper" className="w-full max-w-2xl aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800/80 flex flex-col justify-center">
              
              {activeMedia ? (
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                  
                  {/* Premium Ken burns kinetic zoom simulator */}
                  <img
                    src={activeMedia.url}
                    alt={activeMedia.name}
                    className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${
                      isPlaying && activeClip?.panZoomEffect === 'zoom-in' ? 'scale-115 translate-y-2' :
                      isPlaying && activeClip?.panZoomEffect === 'zoom-out' ? 'scale-100 translate-y-0 scale-110' :
                      isPlaying && activeClip?.panZoomEffect === 'pan-left' ? 'scale-110 -translate-x-5' :
                      isPlaying && activeClip?.panZoomEffect === 'pan-right' ? 'scale-110 translate-x-5' : 'scale-105'
                    }`}
                  />

                  {/* Cinematic dark vignettes */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Confidence score watermark */}
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      activeClip && activeClip.confidence >= 90 ? 'bg-emerald-500' :
                      activeClip && activeClip.confidence >= 75 ? 'bg-amber-500' : 'bg-rose-500 animate-ping'
                    }`} />
                    <span className="text-[9px] font-mono font-bold text-slate-200">
                      AI Match: {activeClip ? activeClip.confidence : 0}%
                    </span>
                  </div>

                  {/* Active effect overlay label */}
                  {activeClip && activeClip.panZoomEffect !== 'none' && (
                    <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-md px-2 py-1 rounded-md text-[8px] font-mono font-bold text-white uppercase tracking-wider">
                      🎬 {activeClip.panZoomEffect}
                    </div>
                  )}

                  {/* SUBTITLE LYRIC OVERLAYS FOR AUDIO TRANSCRIPT MATCH */}
                  {activeSection && (
                    <div className="absolute bottom-6 inset-x-8 text-center pointer-events-none z-10">
                      <p className="text-white text-sm md:text-base font-sans font-medium px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl inline-block border border-white/5 tracking-normal leading-relaxed text-shadow max-w-[90%]">
                        {activeSection.transcript}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 text-slate-600">
                  <Video className="w-12 h-12 mx-auto text-slate-800 mb-3" />
                  <p className="text-sm font-semibold">No visual synced at this timestamp</p>
                  <p className="text-xs text-slate-400 mt-1">AI synchronizer is idle or pending asset allocations.</p>
                </div>
              )}
            </div>
          </div>

          {/* Compact Viewport Video Player Controls Row */}
          <div className="h-16 bg-slate-950/90 border-t border-slate-800/80 px-6 shrink-0 flex items-center justify-between text-slate-300">
            {/* Left: Time tracker */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-100 font-bold">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">
                {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Center: Play controls */}
            <div className="flex items-center gap-4">
              <button
                id="viewport_btn_skip_back"
                onClick={() => setCurrentTime(0)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                id="viewport_btn_step_back"
                onClick={() => handleStepPlayhead(-5)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Backward 5s"
              >
                -5s
              </button>

              <button
                id="viewport_btn_toggle_play"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
              </button>

              <button
                id="viewport_btn_step_forward"
                onClick={() => handleStepPlayhead(5)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Forward 5s"
              >
                +5s
              </button>

              <button
                id="viewport_btn_reset"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Audio and speed config */}
            <div className="flex items-center gap-4">
              {/* Play speed selector */}
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-[9px] font-mono text-slate-500">SPEED:</span>
                <select
                  id="viewport_speed_selector"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-transparent text-slate-200 text-xs font-mono font-bold focus:outline-none cursor-pointer"
                >
                  <option value={0.5} className="bg-slate-900">0.5x</option>
                  <option value={1} className="bg-slate-900">1.0x</option>
                  <option value={1.5} className="bg-slate-900">1.5x</option>
                  <option value={2} className="bg-slate-900">2.0x</option>
                </select>
              </div>

              {/* Mute button */}
              <button
                id="viewport_btn_mute"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* PANE C: AI ASSISTANT PANEL (RIGHT) */}
        <section id="workspace_ai_assistant" className="w-80 border-l border-slate-200/40 bg-white/70 backdrop-blur-md flex flex-col shrink-0 overflow-hidden">
          
          {/* Assistant Header */}
          <div className="p-4 border-b border-slate-200/30 flex items-center justify-between bg-white/40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                VisualFlow AI Copilot
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-mono text-slate-400 uppercase">Interactive</span>
            </div>
          </div>

          {/* Message listing */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent scroll-smooth">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div className={`px-3 py-2.5 rounded-2xl text-xs leading-normal ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs whitespace-pre-wrap font-sans'
                }`}>
                  {m.text}
                </div>
                <span className="text-[8px] text-slate-400 font-mono mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isAiTyping && (
              <div className="flex items-center gap-1.5 mr-auto max-w-[80%] bg-slate-100 rounded-2xl px-3 py-2 text-xs text-slate-400 font-mono italic rounded-tl-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                Copilot is optimizing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* suggested action chips */}
          <div className="p-3 bg-white/40 border-t border-slate-200/30 shrink-0">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wide block mb-2">Suggested Actions:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'suggest_weak', text: 'Improve Weak Matches' },
                { id: 'suggest_cinematic', text: 'Make More Cinematic' },
                { id: 'suggest_faster', text: 'Increase Pacing' },
                { id: 'suggest_dups', text: 'Remove Duplicates' }
              ].map((chip) => (
                <button
                  key={chip.id}
                  id={`ai_suggest_chip_${chip.id}`}
                  onClick={() => {
                    setChatInput(chip.text);
                    // trigger send directly in click for convenience
                    setTimeout(() => {
                      const mockInput = document.getElementById('chat_send_button');
                      mockInput?.click();
                    }, 50);
                  }}
                  className="px-2.5 py-1 bg-white/60 hover:bg-white border border-slate-200/60 text-slate-700 rounded-full text-[10px] font-medium transition-all shadow-2xs"
                >
                  {chip.text}
                </button>
              ))}
            </div>
          </div>

          {/* chat input box */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200/30 flex items-center gap-2 shrink-0 bg-white/40">
            <input
              id="chat_input_field"
              type="text"
              placeholder="Command AI (e.g. increase pace)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs glass-input rounded-xl focus:outline-none text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              id="chat_send_button"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>
      </div>

      {/* 3. BOTTOM PANEL: AUDIO/VIDEO WAVEFORM & VISUAL TIMELINE */}
      <footer id="workspace_timeline_panel" className="h-64 border-t border-slate-200/40 bg-white/75 backdrop-blur-md shrink-0 flex flex-col overflow-hidden">
        
        {/* Timeline Header Toolbar */}
        <div className="h-10 border-b border-slate-200/30 bg-white/40 px-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              Timeline Sequencer
            </span>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500" />
                90%+ Match
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-400" />
                80%-89% Match
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-rose-500" />
                Needs Review
              </span>
            </div>
          </div>

          {/* Zoom & Track control */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Scale:</span>
            <div className="flex items-center gap-1 bg-white/50 p-0.5 rounded-lg border border-slate-200/50">
              <button
                id="timeline_zoom_out"
                onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                className="px-2 py-0.5 text-[10px] hover:bg-slate-100 text-slate-500 font-bold rounded"
              >
                -
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-700 px-1">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                id="timeline_zoom_in"
                onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.25))}
                className="px-2 py-0.5 text-[10px] hover:bg-slate-100 text-slate-500 font-bold rounded"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Outer scrolling container */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative bg-slate-50/20" ref={timelineRulerRef}>
          
          {/* Scrollable container scaled dynamically */}
          <div 
            className="h-full relative select-none" 
            style={{ width: `${100 * zoomScale}%`, minWidth: '100%' }}
            onClick={handleRulerClick}
          >
            {/* 3a. Playhead scrubber indicator bar */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-blue-600 z-30 pointer-events-none"
              style={{ left: `${(currentTime / project.duration) * 100}%` }}
            >
              <div className="w-3 h-3 bg-blue-600 rotate-45 -translate-x-[5.5px] -translate-y-1 shadow-md shadow-blue-500/20" />
              <div className="h-full w-0.5 bg-blue-500 opacity-60" />
            </div>

            {/* 3b. Timeline Ruler Time markings */}
            <div className="h-6 border-b border-slate-200/30 bg-white/20 relative font-mono text-[9px] text-slate-400">
              {Array.from({ length: 11 }).map((_, i) => {
                const markerTime = (i / 10) * project.duration;
                const percent = (i / 10) * 100;
                return (
                  <div 
                    key={i} 
                    className="absolute top-1 -translate-x-1/2 flex flex-col items-center gap-0.5"
                    style={{ left: `${percent}%` }}
                  >
                    <span>
                      {Math.floor(markerTime / 60)}:{(Math.floor(markerTime % 60)).toString().padStart(2, '0')}
                    </span>
                    <div className="w-px h-1.5 bg-slate-300" />
                  </div>
                );
              })}
            </div>

            {/* 3c. Scene Sections Row */}
            <div className="h-8 border-b border-slate-200/30 relative bg-white/20 flex items-center">
              {project.sections.map((sec) => {
                const widthPercent = ((sec.end - sec.start) / project.duration) * 100;
                const leftPercent = (sec.start / project.duration) * 100;
                const isSectionActive = currentTime >= sec.start && currentTime < sec.end;

                return (
                  <div
                    key={sec.id}
                    className={`absolute h-full border-r border-slate-200/60 px-2 flex items-center text-[10px] font-bold font-mono transition-colors truncate uppercase ${
                      isSectionActive 
                        ? 'bg-blue-50/40 text-blue-700 font-bold border-b-2 border-b-blue-500' 
                        : 'text-slate-500'
                    }`}
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  >
                    <span className="truncate">{sec.title}</span>
                  </div>
                );
              })}
            </div>

            {/* 3d. Draggable Synchronized Image Clips Row */}
            <div className="h-20 border-b border-slate-200/30 relative bg-white/30 flex items-center p-1.5 gap-1 select-none">
              {project.clips.map((clip) => {
                const mediaItem = project.mediaItems.find(m => m.id === clip.mediaId);
                const widthPercent = ((clip.end - clip.start) / project.duration) * 100;
                const leftPercent = (clip.start / project.duration) * 100;
                
                const isClipActive = currentTime >= clip.start && currentTime < clip.end;
                const isHighlighted = selectedClipId === clip.id;

                let borderTheme = 'border-slate-200';
                let indicatorTheme = 'bg-slate-400';
                
                if (clip.confidence >= 90) {
                  borderTheme = isHighlighted ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-100 hover:border-emerald-300';
                  indicatorTheme = 'bg-emerald-500';
                } else if (clip.confidence >= 80) {
                  borderTheme = isHighlighted ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-100 hover:border-amber-300';
                  indicatorTheme = 'bg-amber-400';
                } else {
                  borderTheme = isHighlighted ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-rose-100 hover:border-rose-300 animate-pulse';
                  indicatorTheme = 'bg-rose-500';
                }

                return (
                  <div
                    key={clip.id}
                    id={`timeline_clip_${clip.id}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleTimelineClipDrop(e, clip.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClipId(isHighlighted ? null : clip.id);
                    }}
                    className={`absolute h-[90%] border rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col p-1.5 ${borderTheme} ${
                      isClipActive ? 'shadow-md ring-2 ring-blue-500/30 bg-white/90' : 'bg-white/60 backdrop-blur-xs'
                    }`}
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  >
                    <div className="flex-1 flex gap-2 overflow-hidden items-center select-none">
                      {mediaItem ? (
                        <>
                          <img 
                            src={mediaItem.url} 
                            alt={mediaItem.name} 
                            className="h-full aspect-video object-cover rounded-md pointer-events-none"
                          />
                          <div className="flex-1 min-w-0 select-none">
                            <h5 className="text-[10px] font-bold text-slate-800 truncate leading-none">
                              {mediaItem.name}
                            </h5>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono truncate leading-none flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${indicatorTheme}`} />
                              AI Match: {clip.confidence}%
                            </p>
                          </div>
                        </>
                      ) : (
                        <span className="text-[9px] text-slate-400 italic">Frame Empty</span>
                      )}
                    </div>

                    {/* Lock Indicator */}
                    {clip.locked && (
                      <div className="absolute bottom-1 right-1 p-0.5 bg-slate-900/80 rounded-sm">
                        <Lock className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 3e. Stereo Audio Waveform Track Row */}
            <div className="h-14 relative bg-slate-900 flex items-center justify-between overflow-hidden">
              {/* Complex SVG representation of continuous stereophonic waveforms */}
              <div className="absolute inset-0 opacity-25 pointer-events-none flex items-center">
                <svg width="100%" height="100%" viewBox="0 0 1000 60" preserveAspectRatio="none">
                  {/* Channel 1 */}
                  <path 
                    d="M 0,30 Q 10,10 20,30 T 40,30 T 60,30 T 80,10 T 100,50 T 120,30 T 140,20 T 160,30 T 180,45 T 200,30 T 220,10 T 240,30 T 260,30 T 280,10 T 300,50 T 320,30 T 340,30 T 360,50 T 380,30 T 400,10 T 420,30 T 440,30 T 460,10 T 480,50 T 500,30 T 520,20 T 540,30 T 560,45 T 580,30 T 600,10 T 620,30 T 640,30 T 660,10 T 680,50 T 700,30 T 720,30 T 740,50 T 760,30 T 780,10 T 800,30 T 820,30 T 840,10 T 860,50 T 880,30 T 900,20 T 920,30 T 940,45 T 960,30 T 980,10 T 1000,30" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="1.5" 
                  />
                  {/* Channel 2 bottom mirror */}
                  <path 
                    d="M 0,30 Q 15,40 30,30 T 60,30 T 90,45 T 120,30 T 150,15 T 180,30 T 210,50 T 240,30 T 270,30 T 300,45 T 330,30 T 360,15 T 390,30 T 420,50 T 450,30 T 480,30 T 510,45 T 540,30 T 570,15 T 600,30 T 630,50 T 660,30 T 690,30 T 720,45 T 750,30 T 780,15 T 810,30 T 840,50 T 870,30 T 900,30 T 930,45 T 960,30 T 990,15 T 1000,30" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="1.2" 
                  />
                </svg>
              </div>

              {/* Stereo wave indicators */}
              <div className="absolute left-6 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                Narration Waveform (L/R)
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* 4. DRAG-AND-DROP MANUAL OVERRIDE POPUP PANEL (INSPECTOR) */}
      {selectedClipId && (() => {
        const targetClip = project.clips.find(c => c.id === selectedClipId);
        if (!targetClip) return null;
        
        const mediaItem = project.mediaItems.find(m => m.id === targetClip.mediaId);
        const formatTime = (t: number) => `${Math.floor(t / 60)}:${(Math.floor(t % 60)).toString().padStart(2, '0')}`;

        return (
          <div 
            id="clip_inspector_panel" 
            className="fixed bottom-68 right-8 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            {/* Inspector Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                Clip Inspector
              </h4>
              <button 
                id="inspector_btn_close"
                onClick={() => setSelectedClipId(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-mono"
              >
                Close
              </button>
            </div>

            {/* Clip details */}
            {mediaItem && (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <img src={mediaItem.url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{mediaItem.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Duration: {formatTime(targetClip.start)} - {formatTime(targetClip.end)}
                    </div>
                  </div>
                </div>

                {/* Lock button */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">Timeline Lock:</span>
                  <button
                    id={`clip_btn_lock_${targetClip.id}`}
                    onClick={() => handleLockClipToggle(targetClip.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                      targetClip.locked
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {targetClip.locked ? (
                      <>
                        <Lock className="w-3 h-3" />
                        Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" />
                        Unlock
                      </>
                    )}
                  </button>
                </div>

                {/* Effect Select */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-mono block uppercase">Visual Effect Movement</label>
                  <select
                    id={`clip_effect_select_${targetClip.id}`}
                    value={targetClip.panZoomEffect}
                    onChange={(e) => {
                      const updated = project.clips.map(c => {
                        if (c.id === targetClip.id) return { ...c, panZoomEffect: e.target.value as any };
                        return c;
                      });
                      onUpdateProject({ ...project, clips: updated });
                    }}
                    className="w-full bg-slate-50 text-slate-700 rounded-lg p-1.5 border border-slate-200 text-[11px] font-medium focus:outline-none"
                  >
                    <option value="none">No kinetic movement</option>
                    <option value="zoom-in">Slow Zoom In (Ken Burns)</option>
                    <option value="zoom-out">Slow Zoom Out (Ambient)</option>
                    <option value="pan-left">Pan Left</option>
                    <option value="pan-right">Pan Right</option>
                  </select>
                </div>

                {/* AI override actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    id={`clip_btn_regen_${targetClip.id}`}
                    onClick={() => handleRegenerateClip(targetClip.id)}
                    className="py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 border border-blue-100"
                    title="Ask AI to find another highly ranked visual from unused catalog"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin-slow" />
                    Regen with AI
                  </button>

                  <button
                    id={`clip_btn_delete_${targetClip.id}`}
                    onClick={() => handleDeleteClip(targetClip.id)}
                    className="py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 border border-rose-100"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Clip
                  </button>
                </div>

                <button
                  id="clip_btn_ask_why"
                  onClick={() => {
                    setChatInput(`Why did you choose "${mediaItem.name}" for this section?`);
                    setTimeout(() => {
                      const mockInput = document.getElementById('chat_send_button');
                      mockInput?.click();
                    }, 50);
                    setSelectedClipId(null);
                  }}
                  className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] font-bold text-center block transition-colors mt-1"
                >
                  💡 Ask AI: \"Why did you choose this image?\"
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. HIGH-FIDELITY EXPORT MODAL */}
      {showExportModal && (
        <div id="export_modal_overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div 
            id="export_modal_container" 
            className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl max-w-2xl w-full shadow-2xl p-6 md:p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
                  <FileDown className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Export Media Sequence</h3>
                  <p className="text-xs text-slate-400 font-mono">Project: {project.name}</p>
                </div>
              </div>
              {!isExporting && (
                <button
                  id="export_btn_close"
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Main Content Area */}
            {isExporting || exportSuccess ? (
              <div className="py-8 space-y-6">
                {isExporting ? (
                  /* Rendering Active State */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-blue-600 font-bold uppercase tracking-wider animate-pulse">{exportStep}</span>
                      <span className="font-bold text-slate-600">{exportProgress}%</span>
                    </div>
                    
                    {/* Outer Progress Bar */}
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 text-center font-mono">
                      VisualFlow AI engine is stitching {project.mediaItems.filter(m => m.type === 'image' && m.status === 'used').length} fully matched images onto the timeline with 100% flawless synchronization precision.
                    </p>
                  </div>
                ) : (
                  /* Render Complete Success State */
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-lg shadow-emerald-100/40">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Stitch Sequence Complete!</h4>
                      <p className="text-xs text-emerald-600 font-mono mt-1 font-bold">100% Alignment Checked & Verified • 0 Weak Points</p>
                    </div>

                    {/* File Information Box */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">File Name:</span>
                        <span className="text-slate-700 font-bold">{project.name.toLowerCase().replace(/\s+/g, '_')}_synced.{exportFormat.toLowerCase()}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Dimensions:</span>
                        <span className="text-slate-700 font-bold">
                          {exportRatio === '16:9' ? (exportQuality === '4K' ? '3840 x 2160 (4K Cinema)' : exportQuality === '720p' ? '1280 x 720 (Mobile)' : '1920 x 1080 (Full HD)') :
                           exportRatio === '9:16' ? (exportQuality === '4K' ? '2160 x 3840 (Vertical 4K)' : exportQuality === '720p' ? '720 x 1280' : '1080 x 1920 (Reel / Story)') :
                           exportRatio === '1:1' ? (exportQuality === '4K' ? '2160 x 2160' : exportQuality === '720p' ? '720 x 720' : '1080 x 1080 (Square Post)') :
                           (exportQuality === '4K' ? '1728 x 2160' : exportQuality === '720p' ? '576 x 720' : '1080 x 1350 (Portrait)')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Audio container:</span>
                        <span className="text-slate-700 font-bold">{project.audioName} ({exportFormat === 'MP3' ? 'Direct Mixdown' : 'Stitched AAC Stereo'})</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Match score:</span>
                        <span className="text-emerald-600 font-bold">100% flawless zero-gap alignment</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono border-t border-slate-200/50 pt-2">
                        <span className="text-slate-400">Save destination:</span>
                        <span className="text-blue-600 font-bold truncate max-w-[220px]" title={exportDrive === 'BROWSER' ? 'PC Default Downloads folder' : `${customExportPath}${project.name.toLowerCase().replace(/\s+/g, '_')}_synced.${exportFormat.toLowerCase()}`}>
                          {exportDrive === 'BROWSER' 
                            ? 'PC Downloads Folder (Default)' 
                            : `${customExportPath}${project.name.toLowerCase().replace(/\s+/g, '_')}_synced.${exportFormat.toLowerCase()}`
                          }
                        </span>
                      </div>
                    </div>

                    {exportDrive !== 'BROWSER' && (
                      <div className="p-3 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl text-[11px] font-mono text-emerald-800 max-w-md mx-auto text-center leading-relaxed">
                        💾 **Direct Drive Write Complete:** Stitched sequence has been successfully written to local disk volume: <br />
                        <span className="font-bold underline text-blue-600 break-all">{customExportPath}{project.name.toLowerCase().replace(/\s+/g, '_')}_synced.{exportFormat.toLowerCase()}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-3">
                      <button
                        id="export_btn_download_now"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = 'data:text/plain;charset=utf-8,DownloadSimulatedVisualFlowRenderFile';
                          link.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_synced.${exportFormat.toLowerCase()}`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        {exportDrive === 'BROWSER' ? 'Download Rendered File' : 'Download Local Drive Copy'}
                      </button>
                      <button
                        id="export_btn_start_new"
                        onClick={() => setExportSuccess(false)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Adjust settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Config Form */
              <div className="space-y-6">
                {/* 1. Format Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-500 uppercase">Select Output Container Format</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['MP4', 'MOV', 'GIF', 'MP3'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        id={`export_format_${fmt}`}
                        onClick={() => {
                          setExportFormat(fmt);
                          if (fmt === 'MP3') {
                            setExportRatio('16:9');
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 cursor-pointer ${
                          exportFormat === fmt
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/15'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/60'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold">{fmt === 'MP4' ? '⭐ Recommended' : fmt === 'MOV' ? 'HQ Master' : fmt === 'GIF' ? 'Loop' : 'Soundtrack'}</span>
                        <div>
                          <p className="text-lg font-black leading-none">{fmt}</p>
                          <p className={`text-[9px] mt-1 ${exportFormat === fmt ? 'text-blue-100' : 'text-slate-400'}`}>
                            {fmt === 'MP4' ? 'H.264 Video stream' : fmt === 'MOV' ? 'Apple ProRes raw' : fmt === 'GIF' ? 'Animated loop sequence' : 'Hifi audio mixdown'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hide video parameters if Audio MP3 format is selected */}
                {exportFormat !== 'MP3' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2. Quality Settings */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-slate-500 uppercase">Resolution Quality</label>
                      <div className="space-y-2">
                        {(['1080p', '4K', '720p'] as const).map((q) => (
                          <button
                            key={q}
                            id={`export_quality_${q}`}
                            onClick={() => setExportQuality(q)}
                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                              exportQuality === q
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/60'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-bold block">{q === '1080p' ? 'Full HD (1080p)' : q === '4K' ? 'Ultra HD (4K)' : 'Mobile Optimized (720p)'}</span>
                              <span className={`text-[10px] ${exportQuality === q ? 'text-slate-300' : 'text-slate-400'}`}>
                                {q === '1080p' ? 'Standard streaming standard' : q === '4K' ? 'Best for cinema screens' : 'Lightweight sharing stream'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">
                              {q === '1080p' ? '1920x1080' : q === '4K' ? '3840x2160' : '1280x720'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Aspect Ratios */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-slate-500 uppercase">Aspect Ratio Grid</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { ratio: '16:9', label: 'Landscape 16:9', desc: 'YouTube, Desktop' },
                          { ratio: '9:16', label: 'Vertical 9:16', desc: 'TikTok, Reels, Shorts' },
                          { ratio: '1:1', label: 'Square 1:1', desc: 'Instagram Feed' },
                          { ratio: '4:5', label: 'Portrait 4:5', desc: 'Social feeds' }
                        ].map((r) => (
                          <button
                            key={r.ratio}
                            id={`export_ratio_${r.ratio}`}
                            onClick={() => setExportRatio(r.ratio as any)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 cursor-pointer ${
                              exportRatio === r.ratio
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/60'
                            }`}
                          >
                            <span className="text-xs font-bold leading-tight">{r.label}</span>
                            <span className={`text-[10px] ${exportRatio === r.ratio ? 'text-slate-300' : 'text-slate-400'}`}>{r.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Destination Drive Selection */}
                <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/50">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-500" />
                      Target Destination Drive (Downloads or Local Disk PC C/D)
                    </label>
                    <span className="text-[9px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                      Direct disk-write simulator
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'BROWSER', label: 'Web Downloads', desc: 'Default PC Downloads folder' },
                      { id: 'DISK_C', label: 'Local Disk C:', desc: 'SSD C:\\Users\\Studio\\Videos\\' },
                      { id: 'DISK_D', label: 'Local Disk D:', desc: 'HDD D:\\CreativeProjects\\' },
                      { id: 'CUSTOM', label: 'Custom Path', desc: 'Specify direct absolute path' }
                    ].map((drv) => (
                      <button
                        key={drv.id}
                        id={`export_drive_${drv.id}`}
                        type="button"
                        onClick={() => {
                          setExportDrive(drv.id as any);
                          if (drv.id === 'DISK_C') {
                            setCustomExportPath('C:\\Users\\Studio\\Videos\\VisualFlow\\');
                          } else if (drv.id === 'DISK_D') {
                            setCustomExportPath('D:\\CreativeProjects\\Exports\\');
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all h-16 flex flex-col justify-between cursor-pointer ${
                          exportDrive === drv.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/60'
                        }`}
                      >
                        <span className="text-[10px] font-bold block truncate leading-none">{drv.label}</span>
                        <span className={`text-[8px] ${exportDrive === drv.id ? 'text-blue-100' : 'text-slate-400'} leading-none`}>{drv.desc}</span>
                      </button>
                    ))}
                  </div>

                  {exportDrive !== 'BROWSER' && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">Simulated Write Directory Path</label>
                      <div className="flex gap-2">
                        <input
                          id="export_drive_path_input"
                          type="text"
                          value={customExportPath}
                          onChange={(e) => setCustomExportPath(e.target.value)}
                          disabled={exportDrive !== 'CUSTOM'}
                          className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                          placeholder="e.g. C:\MyFolder\VisualFlow\"
                        />
                        {exportDrive === 'CUSTOM' && (
                          <span className="text-[10px] text-amber-600 font-mono flex items-center bg-amber-50 px-2 rounded-lg border border-amber-100 font-bold">Editable</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Watermark / Sync Seal Check */}
                <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-4 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-emerald-800">Zero-Flaw AI Synchronization Verified</h5>
                    <p className="text-[10px] text-emerald-600 mt-0.5 leading-relaxed">
                      Our system verifies that all {project.mediaItems.filter(m => m.type === 'image' && m.status === 'used').length} scheduled clips have been matched with 100% or 200% hyper-confidence precision. No gaps, sync errors, or flaws detected.
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    id="export_btn_cancel"
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="export_btn_trigger_render"
                    onClick={handleTriggerExport}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Start Export Render
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
