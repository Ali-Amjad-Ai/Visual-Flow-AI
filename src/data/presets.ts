/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, MediaItem, TimelineClip, Section } from '../types';

// Helper to generate beautifully styled, professional, abstract SVG placeholders
export function getSvgPlaceholder(
  title: string,
  category: string,
  bgType: 'blue' | 'indigo' | 'slate' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan'
): string {
  let primaryColor = '#1e293b'; // slate-800
  let accentColor = '#3b82f6';  // blue-500
  let pattern = '';

  switch (bgType) {
    case 'blue':
      primaryColor = '#0f172a'; // slate-900
      accentColor = '#2563eb';  // blue-600
      pattern = '<circle cx="200" cy="150" r="120" fill="#3b82f6" opacity="0.15" /><path d="M0,150 Q200,50 400,150 T800,150" fill="none" stroke="#60a5fa" stroke-width="2" opacity="0.25" />';
      break;
    case 'indigo':
      primaryColor = '#1e1b4b'; // indigo-950
      accentColor = '#4f46e5';  // indigo-600
      pattern = '<rect x="50" y="50" width="300" height="200" rx="20" fill="#6366f1" opacity="0.1" /><line x1="0" y1="0" x2="400" y2="300" stroke="#818cf8" stroke-width="1.5" opacity="0.2" />';
      break;
    case 'slate':
      primaryColor = '#0f172a'; // slate-900
      accentColor = '#64748b';  // slate-500
      pattern = '<circle cx="300" cy="100" r="80" fill="#94a3b8" opacity="0.1" /><path d="M50,220 L150,120 L250,220 L350,150" fill="none" stroke="#cbd5e1" stroke-width="3" opacity="0.2" />';
      break;
    case 'emerald':
      primaryColor = '#062f4f'; // deep forest blue-green
      accentColor = '#059669';  // emerald-600
      pattern = '<circle cx="200" cy="220" r="140" fill="#10b981" opacity="0.15" /><path d="M50,250 L200,50 L350,250 Z" fill="none" stroke="#34d399" stroke-width="2" opacity="0.25" />';
      break;
    case 'amber':
      primaryColor = '#451a03'; // amber-950
      accentColor = '#d97706';  // amber-600
      pattern = '<circle cx="100" cy="100" r="60" fill="#f59e0b" opacity="0.2" /><circle cx="300" cy="200" r="100" fill="#fbbf24" opacity="0.1" />';
      break;
    case 'rose':
      primaryColor = '#4c0519'; // rose-950
      accentColor = '#e11d48';  // rose-600
      pattern = '<path d="M100,200 C100,100 300,100 300,200 Z" fill="#f43f5e" opacity="0.1" /><circle cx="200" cy="150" r="90" fill="#fda4af" opacity="0.1" />';
      break;
    case 'violet':
      primaryColor = '#2e1065'; // violet-950
      accentColor = '#7c3aed';  // violet-600
      pattern = '<polygon points="200,50 350,250 50,250" fill="#8b5cf6" opacity="0.1" /><line x1="200" y1="50" x2="200" y2="250" stroke="#a78bfa" stroke-dasharray="5,5" stroke-width="2" opacity="0.3" />';
      break;
    case 'cyan':
      primaryColor = '#083344'; // cyan-950
      accentColor = '#0891b2';  // cyan-600
      pattern = '<rect x="80" y="80" width="240" height="140" rx="8" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.2" /><circle cx="200" cy="150" r="40" fill="#22d3ee" opacity="0.15" />';
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <!-- Background -->
    <rect width="400" height="300" fill="${primaryColor}" />
    
    <!-- Abstract Design Patterns -->
    ${pattern}
    
    <!-- Editorial Grid Elements -->
    <line x1="20" y1="20" x2="380" y2="20" stroke="#ffffff" opacity="0.1" />
    <line x1="20" y1="280" x2="380" y2="280" stroke="#ffffff" opacity="0.1" />
    <circle cx="20" cy="20" r="2" fill="#ffffff" opacity="0.4" />
    <circle cx="380" cy="20" r="2" fill="#ffffff" opacity="0.4" />
    <circle cx="20" cy="280" r="2" fill="#ffffff" opacity="0.4" />
    <circle cx="380" cy="280" r="2" fill="#ffffff" opacity="0.4" />

    <!-- Meta Information Overlay -->
    <text x="24" y="44" font-family="'JetBrains Mono', monospace" font-size="10" fill="#ffffff" letter-spacing="1" opacity="0.4">VISUALFLOW STUDIO // CATEGORY: ${category.toUpperCase()}</text>
    <text x="24" y="240" font-family="'Inter', sans-serif" font-weight="700" font-size="18" fill="#ffffff" letter-spacing="-0.5">${title}</text>
    
    <!-- Color Bar Accent -->
    <rect x="24" y="254" width="30" height="3" fill="${accentColor}" rx="1.5" />
    <text x="64" y="258" font-family="'JetBrains Mono', monospace" font-size="9" fill="#ffffff" opacity="0.3">AI SYNCHRONIZED CLOUD ASSET</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Preset 1: Eiffel Tower Documentary
const p1MediaItems: MediaItem[] = [
  {
    id: 'p1_img1',
    name: 'Eiffel_Tower_Wide_Aerial.jpg',
    url: getSvgPlaceholder('Eiffel Tower Wide Aerial', 'Locations', 'blue'),
    type: 'image',
    size: '4.2 MB',
    status: 'used',
    category: 'LOCATIONS',
    visualAnalysis: 'Aerial high-angle wide capture of the Eiffel Tower, surrounded by Paris streets and Seine river under clear blue sky.',
    uploadedAt: '2 hours ago',
    confidence: 98
  },
  {
    id: 'p1_img2',
    name: 'Gustave_Eiffel_Portrait_1880.jpg',
    url: getSvgPlaceholder('Gustave Eiffel Portrait', 'People', 'indigo'),
    type: 'image',
    size: '1.8 MB',
    status: 'used',
    category: 'PEOPLE',
    visualAnalysis: 'Black and white vintage portrait photograph of Gustave Eiffel looking into the camera, retro style.',
    uploadedAt: '2 hours ago',
    confidence: 94
  },
  {
    id: 'p1_img3',
    name: 'Construction_Draft_Blueprints_1887.png',
    url: getSvgPlaceholder('Construction Draft Blueprint', 'Architecture', 'slate'),
    type: 'image',
    size: '6.5 MB',
    status: 'used',
    category: 'ARCHITECTURE',
    visualAnalysis: 'Detailed architectural technical blueprint draft of the Eiffel Tower foundation and iron beams, vintage white ink on blue layout.',
    uploadedAt: '2 hours ago',
    confidence: 96
  },
  {
    id: 'p1_img4',
    name: 'Foundations_Excavation_Champ_de_Mars.jpg',
    url: getSvgPlaceholder('Excavation Champ de Mars', 'Events', 'amber'),
    type: 'image',
    size: '3.1 MB',
    status: 'used',
    category: 'EVENTS',
    visualAnalysis: 'Historical photo simulation of deep dirt excavations and initial masonry supports on the Champ de Mars.',
    uploadedAt: '2 hours ago',
    confidence: 89
  },
  {
    id: 'p1_img5',
    name: 'Iron_Beams_Puddle_Iron_Detail.jpg',
    url: getSvgPlaceholder('Puddle Iron Beams Detail', 'Objects', 'slate'),
    type: 'image',
    size: '2.4 MB',
    status: 'used',
    category: 'OBJECTS',
    visualAnalysis: 'Close-up texture of weathered dark puddle iron beams joined by metallic circular rivets, structural details.',
    uploadedAt: '2 hours ago',
    confidence: 91
  },
  {
    id: 'p1_img6',
    name: 'Paris_Universal_Exposition_1889.jpg',
    url: getSvgPlaceholder('Universal Exposition 1889', 'Events', 'violet'),
    type: 'image',
    size: '5.2 MB',
    status: 'used',
    category: 'EVENTS',
    visualAnalysis: 'Vintage crowded grounds of the Paris Universal Exposition with the completed Eiffel Tower looming majestically in the background.',
    uploadedAt: '2 hours ago',
    confidence: 95
  },
  {
    id: 'p1_img7',
    name: 'Eiffel_Tower_Twilight_Illumination.jpg',
    url: getSvgPlaceholder('Twilight Illumination', 'Locations', 'blue'),
    type: 'image',
    size: '3.9 MB',
    status: 'used',
    category: 'LOCATIONS',
    visualAnalysis: 'Beautiful warm glowing yellow lights illuminated on the Eiffel Tower structure against a dramatic purple twilight dusk sky.',
    uploadedAt: '2 hours ago',
    confidence: 85
  },
  {
    id: 'p1_img8',
    name: 'Eiffel_Tower_Wide_Aerial_Dup.jpg', // Exact Duplicate
    url: getSvgPlaceholder('Eiffel Tower Wide Aerial', 'Locations', 'blue'),
    type: 'image',
    size: '4.2 MB',
    status: 'duplicate',
    category: 'LOCATIONS',
    visualAnalysis: 'Identical pixel match with Eiffel_Tower_Wide_Aerial.jpg. Detected as exact duplicate.',
    uploadedAt: '2 hours ago',
    duplicateOf: 'p1_img1'
  },
  {
    id: 'p1_img9',
    name: 'Eiffel_Tower_Wide_Aerial_Cropped.jpg', // Near Duplicate
    url: getSvgPlaceholder('Eiffel Tower Wide Aerial (Cropped)', 'Locations', 'blue'),
    type: 'image',
    size: '3.1 MB',
    status: 'duplicate',
    category: 'LOCATIONS',
    visualAnalysis: '97% match to Eiffel_Tower_Wide_Aerial.jpg. Same visual captured, slightly cropped and downscaled.',
    uploadedAt: '2 hours ago',
    duplicateOf: 'p1_img1'
  },
  {
    id: 'p1_img10',
    name: 'Blurry_Paris_Tourist_Snap.jpg', // Low quality
    url: getSvgPlaceholder('Blurry Paris Tourist Snap', 'General', 'rose'),
    type: 'image',
    size: '1.2 MB',
    status: 'low_quality',
    category: 'GENERAL',
    visualAnalysis: 'Extremely blurred, out of focus image of a street corner. High compression noise, shaky camera lens.',
    uploadedAt: '2 hours ago',
    reasonUnused: 'LOW_QUALITY'
  },
  {
    id: 'p1_img11',
    name: 'Modern_Coffee_Shop_Paris.jpg', // Redundant / Unused
    url: getSvgPlaceholder('Modern Coffee Shop Paris', 'Business', 'amber'),
    type: 'image',
    size: '2.8 MB',
    status: 'unused',
    category: 'BUSINESS',
    visualAnalysis: 'Interior of a cozy modern Parisian café with espresso machine and small tables. Not matching historical documentary theme.',
    uploadedAt: '2 hours ago',
    reasonUnused: 'NOT_RELEVANT'
  },
  {
    id: 'p1_img12',
    name: 'Gustave_Eiffel_Portrait_Backup.jpg', // Redundant Duplicate
    url: getSvgPlaceholder('Gustave Eiffel Portrait', 'People', 'indigo'),
    type: 'image',
    size: '1.8 MB',
    status: 'duplicate',
    category: 'PEOPLE',
    visualAnalysis: 'Identical copy of Gustave Eiffel Portrait. Redundant file.',
    uploadedAt: '2 hours ago',
    duplicateOf: 'p1_img2'
  },
  {
    id: 'p1_img13',
    name: 'Construction_Steel_Workers_Lunch.jpg', // Used with perfect confidence
    url: getSvgPlaceholder('Steel Workers Lunch', 'People', 'indigo'),
    type: 'image',
    size: '2.9 MB',
    status: 'used',
    category: 'PEOPLE',
    visualAnalysis: 'Group of historical iron workers sitting on a narrow beam eating lunch, suspended high above ground.',
    uploadedAt: '2 hours ago',
    confidence: 100 // Perfect confidence
  },
  {
    id: 'p1_img14',
    name: 'Arc_de_Triomphe_Wide.jpg', // Unused (Redundant but relevant)
    url: getSvgPlaceholder('Arc de Triomphe Wide', 'Locations', 'slate'),
    type: 'image',
    size: '4.1 MB',
    status: 'unused',
    category: 'LOCATIONS',
    visualAnalysis: 'Wide angle capture of the Arc de Triomphe. Relevant to Paris, but redundant as the timeline already has perfect Eiffel matches.',
    uploadedAt: '2 hours ago',
    reasonUnused: 'REDUNDANT'
  },
  {
    id: 'p1_img15',
    name: 'Crowded_Metro_Station_Paris.jpg', // Unused (Not relevant yet)
    url: getSvgPlaceholder('Crowded Metro Station Paris', 'General', 'rose'),
    type: 'image',
    size: '3.2 MB',
    status: 'unused',
    category: 'GENERAL',
    visualAnalysis: 'Crowded entrance of Paris Metro station. Modern crowd, irrelevant to historical construction period.',
    uploadedAt: '2 hours ago',
    reasonUnused: 'NOT_RELEVANT'
  }
];

const p1Sections: Section[] = [
  {
    id: 'p1_sec1',
    title: 'INTRODUCTION',
    start: 0,
    end: 45,
    transcript: 'The Eiffel Tower, towering majestically over the Champ de Mars in Paris, stands today as an global emblem of architectural genius and artistic defiance.',
    locked: false
  },
  {
    id: 'p1_sec2',
    title: 'EARLY PLANNING & CONCEPTION',
    start: 45,
    end: 120,
    transcript: 'In early 1887, construction began under the guidance of lead contractor Gustave Eiffel. Ingenious structural engineers Emile Nouguier and Maurice Koechlin drafted the initial technical blueprints for a massive tower.',
    locked: false
  },
  {
    id: 'p1_sec3',
    title: 'THE HARD LABOR AND ASSEMBLING',
    start: 120,
    end: 190,
    transcript: 'More than 300 skilled metal workers assembled over 18,000 puddle iron elements. The pieces were held together by a mind-boggling 2.5 million glowing hot rivets, requiring heroic manual labor suspended high in the skies.',
    locked: false
  },
  {
    id: 'p1_sec4',
    title: 'THE WORLDWIDE LEGACY',
    start: 190,
    end: 240,
    transcript: 'Opened at the Universal Exposition of 1889, it initially drew fierce criticism from famous Paris writers. Soon, it captured the global imagination, glowing bright as dusk fell over the Seine.',
    locked: false
  }
];

const p1Clips: TimelineClip[] = [
  {
    id: 'clip1',
    mediaId: 'p1_img1',
    start: 0,
    end: 20,
    locked: false,
    confidence: 98,
    panZoomEffect: 'zoom-in'
  },
  {
    id: 'clip2',
    mediaId: 'p1_img3',
    start: 20,
    end: 45,
    locked: false,
    confidence: 96,
    panZoomEffect: 'none'
  },
  {
    id: 'clip3',
    mediaId: 'p1_img2',
    start: 45,
    end: 85,
    locked: false,
    confidence: 94,
    panZoomEffect: 'pan-left'
  },
  {
    id: 'clip4',
    mediaId: 'p1_img4',
    start: 85,
    end: 120,
    locked: false,
    confidence: 89,
    panZoomEffect: 'zoom-out'
  },
  {
    id: 'clip5',
    mediaId: 'p1_img5',
    start: 120,
    end: 155,
    locked: false,
    confidence: 91,
    panZoomEffect: 'none'
  },
  {
    id: 'clip6',
    mediaId: 'p1_img13',
    start: 155,
    end: 190,
    locked: false,
    confidence: 100,
    panZoomEffect: 'pan-right'
  },
  {
    id: 'clip7',
    mediaId: 'p1_img6',
    start: 190,
    end: 215,
    locked: false,
    confidence: 95,
    panZoomEffect: 'zoom-in'
  },
  {
    id: 'clip8',
    mediaId: 'p1_img7',
    start: 215,
    end: 240,
    locked: false,
    confidence: 85,
    panZoomEffect: 'zoom-out'
  }
];

// Preset 2: Odyssey: The Journey to Mars
const p2MediaItems: MediaItem[] = [
  {
    id: 'p2_img1',
    name: 'Falcon_Odyssey_Rocket_Liftoff.jpg',
    url: getSvgPlaceholder('Falcon Odyssey Liftoff', 'Events', 'amber'),
    type: 'image',
    size: '5.4 MB',
    status: 'used',
    category: 'EVENTS',
    visualAnalysis: 'Giant deep orange and white combustion flames erupting from rocket engines during spacecraft liftoff in daylight.',
    uploadedAt: '1 day ago',
    confidence: 99
  },
  {
    id: 'p2_img2',
    name: 'Astronaut_Cockpit_Controls.jpg',
    url: getSvgPlaceholder('Cockpit Controls Detail', 'Objects', 'cyan'),
    type: 'image',
    size: '3.6 MB',
    status: 'used',
    category: 'OBJECTS',
    visualAnalysis: 'Interior perspective of a high-tech spaceship cockpit with glowing neon cyan touchscreens, dials, and telemetry gauges.',
    uploadedAt: '1 day ago',
    confidence: 93
  },
  {
    id: 'p2_img3',
    name: 'Silent_Deep_Space_Transit.jpg',
    url: getSvgPlaceholder('Deep Space Transit', 'Locations', 'violet'),
    type: 'image',
    size: '4.8 MB',
    status: 'used',
    category: 'LOCATIONS',
    visualAnalysis: 'Wide view of the spherical spacecraft gliding through black interstellar space with billions of glowing distant stars and a gas nebula.',
    uploadedAt: '1 day ago',
    confidence: 96
  },
  {
    id: 'p2_img4',
    name: 'Heatshield_Glowing_Atmosphere_Descent.png',
    url: getSvgPlaceholder('Atmosphere Descent Fire', 'Events', 'rose'),
    type: 'image',
    size: '7.1 MB',
    status: 'used',
    category: 'EVENTS',
    visualAnalysis: 'Conceptual painting of a landing module surrounded by brilliant red and orange ionized plasma during heavy atmospheric descent.',
    uploadedAt: '1 day ago',
    confidence: 91
  },
  {
    id: 'p2_img5',
    name: 'Mars_Gale_Crater_Desert_Surface.jpg',
    url: getSvgPlaceholder('Mars Gale Crater Surface', 'Locations', 'amber'),
    type: 'image',
    size: '3.2 MB',
    status: 'used',
    category: 'LOCATIONS',
    visualAnalysis: 'Stretching reddish-brown sand desert landscape on Mars with craggy dark hills under a thin hazy yellowish atmosphere.',
    uploadedAt: '1 day ago',
    confidence: 97
  },
  {
    id: 'p2_img6',
    name: 'Astronaut_Pioneer_Selfie_Mars.jpg',
    url: getSvgPlaceholder('Martian Pioneer Selfie', 'People', 'indigo'),
    type: 'image',
    size: '4.5 MB',
    status: 'used',
    category: 'PEOPLE',
    visualAnalysis: 'Close-up camera angle of an astronaut in a full white EVA spacesuit, with Mars red desert and habitat module reflected in the golden visor.',
    uploadedAt: '1 day ago',
    confidence: 94
  },
  {
    id: 'p2_img7',
    name: 'Mars_Rover_Tire_Tracks.jpg', // Unused (redundant, Gale crater image is superior)
    url: getSvgPlaceholder('Rover Tire Tracks', 'Objects', 'slate'),
    type: 'image',
    size: '2.1 MB',
    status: 'unused',
    category: 'OBJECTS',
    visualAnalysis: 'Parallel tire tread tracks pressed into fine red Martian dust, close up perspective.',
    uploadedAt: '1 day ago',
    reasonUnused: 'REDUNDANT'
  },
  {
    id: 'p2_img8',
    name: 'Blurry_Rocket_Launch_Fan_Cam.jpg', // Low quality
    url: getSvgPlaceholder('Blurry Rocket Fan Cam', 'General', 'rose'),
    type: 'image',
    size: '0.9 MB',
    status: 'low_quality',
    category: 'GENERAL',
    visualAnalysis: 'Very dark, blurry photograph of a tiny distant light with massive camera shake, completely unfocused.',
    uploadedAt: '1 day ago',
    reasonUnused: 'LOW_QUALITY'
  }
];

const p2Sections: Section[] = [
  {
    id: 'p2_sec1',
    title: 'THE ROCKET LIFTOFF',
    start: 0,
    end: 45,
    transcript: 'We have ignition. Liquid propulsion boosters are running at 100%. Five, four, three, two, one... lift-off! The Odyssey rocket cuts through the morning atmosphere, embarking on humanity\'s historic expedition to Mars.',
    locked: false
  },
  {
    id: 'p2_sec2',
    title: 'DEEP SPACE TRANSIT',
    start: 45,
    end: 110,
    transcript: 'In the silent deep space void, the crew monitors critical life support systems and navigates through a cosmic sea of stars. Inside the cockpit, glowing cyan touchscreens provide a high-tech cocoon of safety.',
    locked: false
  },
  {
    id: 'p2_sec3',
    title: 'ATMOSPHERE DESCENT',
    start: 110,
    end: 145,
    transcript: 'Entering the Martian atmospheric envelope. The thermal heatshield glows an intense fiery red as friction converts kinetic velocity into plasma energy, threatening the hull with immense temperatures.',
    locked: false
  },
  {
    id: 'p2_sec4',
    title: 'TOUCHDOWN & PIONEERING',
    start: 145,
    end: 180,
    transcript: 'Touchdown confirmed. As dust settles in Gale Crater, pioneers peer through visors to witness the raw red Martian desert. Humanity has officially arrived on a brand new world.',
    locked: false
  }
];

const p2Clips: TimelineClip[] = [
  {
    id: 'p2_clip1',
    mediaId: 'p2_img1',
    start: 0,
    end: 45,
    locked: false,
    confidence: 99,
    panZoomEffect: 'zoom-in'
  },
  {
    id: 'p2_clip2',
    mediaId: 'p2_img3',
    start: 45,
    end: 80,
    locked: false,
    confidence: 96,
    panZoomEffect: 'pan-left'
  },
  {
    id: 'p2_clip3',
    mediaId: 'p2_img2',
    start: 80,
    end: 110,
    locked: false,
    confidence: 93,
    panZoomEffect: 'none'
  },
  {
    id: 'p2_clip4',
    mediaId: 'p2_img4',
    start: 110,
    end: 145,
    locked: false,
    confidence: 91,
    panZoomEffect: 'zoom-out'
  },
  {
    id: 'p2_clip5',
    mediaId: 'p2_img5',
    start: 145,
    end: 165,
    locked: false,
    confidence: 97,
    panZoomEffect: 'pan-right'
  },
  {
    id: 'p2_clip6',
    mediaId: 'p2_img6',
    start: 165,
    end: 180,
    locked: false,
    confidence: 94,
    panZoomEffect: 'zoom-in'
  }
];

// Preset 3: Acoustic Forest Meditation (Calm style)
const p3MediaItems: MediaItem[] = [
  {
    id: 'p3_img1',
    name: 'Serene_Pine_Forest_Sunbeams.jpg',
    url: getSvgPlaceholder('Serene Forest Sunbeams', 'Nature', 'emerald'),
    type: 'image',
    size: '3.8 MB',
    status: 'used',
    category: 'NATURE',
    visualAnalysis: 'Golden morning light filtering through tall green redwood pine trees, soft atmosphere.',
    uploadedAt: '3 days ago',
    confidence: 97
  },
  {
    id: 'p3_img2',
    name: 'Crystal_Clear_Lake_Reflection.jpg',
    url: getSvgPlaceholder('Still Lake Reflection', 'Nature', 'cyan'),
    type: 'image',
    size: '4.5 MB',
    status: 'used',
    category: 'NATURE',
    visualAnalysis: 'Stunning crystal clear mountain lake reflecting a perfectly still blue sky and white puffy clouds, peaceful.',
    uploadedAt: '3 days ago',
    confidence: 96
  },
  {
    id: 'p3_img3',
    name: 'Flowing_Forest_Creek_Stones.jpg',
    url: getSvgPlaceholder('Forest Creek Stones', 'Nature', 'emerald'),
    type: 'image',
    size: '2.9 MB',
    status: 'used',
    category: 'NATURE',
    visualAnalysis: 'Slow shutter speed capture of water rushing over smooth moss-covered river stones, crisp sound visualization.',
    uploadedAt: '3 days ago',
    confidence: 91
  },
  {
    id: 'p3_img4',
    name: 'Soft_Green_Moss_Macro.png',
    url: getSvgPlaceholder('Moss Macro Dew', 'Nature', 'emerald'),
    type: 'image',
    size: '5.1 MB',
    status: 'used',
    category: 'NATURE',
    visualAnalysis: 'Extreme macro photographic detail of soft bright green moss covered with sparkling miniature dew drops.',
    uploadedAt: '3 days ago',
    confidence: 88
  },
  {
    id: 'p3_img5',
    name: 'Sun_Dappled_Foliage_CloseUp.jpg', // Unused (redundant, pine forest sunbeams is superior)
    url: getSvgPlaceholder('Sun Dappled Leaves', 'Nature', 'emerald'),
    type: 'image',
    size: '2.2 MB',
    status: 'unused',
    category: 'NATURE',
    visualAnalysis: 'Close-up of bright green maple leaves shimmering under direct morning sunlight.',
    uploadedAt: '3 days ago',
    reasonUnused: 'REDUNDANT'
  }
];

const p3Sections: Section[] = [
  {
    id: 'p3_sec1',
    title: 'BREATH FOCUS',
    start: 0,
    end: 90,
    transcript: 'Let us begin. Close your eyes. Drop your shoulders. Inhale deeply through your nostrils, feeling your chest expand, and let the air escape slowly through your mouth, releasing all tension.',
    locked: false
  },
  {
    id: 'p3_sec2',
    title: 'LISTENING TO NATURE',
    start: 90,
    end: 180,
    transcript: 'Bring your awareness to the soft sounds around you. Visualize the golden morning sunbeams filtering through tall redwoods. Listen to a crisp creek flowing over smooth river stones.',
    locked: false
  },
  {
    id: 'p3_sec3',
    title: 'DEEP STILLNESS',
    start: 180,
    end: 300,
    transcript: 'Your mind becomes like a silent alpine lake. The surface is perfectly still, glassy and reflecting the infinite pure sky. Relax into this deep stillness, feeling secure, clear, and fully present.',
    locked: false
  }
];

const p3Clips: TimelineClip[] = [
  {
    id: 'p3_clip1',
    mediaId: 'p3_img1',
    start: 0,
    end: 90,
    locked: false,
    confidence: 97,
    panZoomEffect: 'zoom-in'
  },
  {
    id: 'p3_clip2',
    mediaId: 'p3_img3',
    start: 90,
    end: 140,
    locked: false,
    confidence: 91,
    panZoomEffect: 'pan-left'
  },
  {
    id: 'p3_clip3',
    mediaId: 'p3_img4',
    start: 140,
    end: 180,
    locked: false,
    confidence: 88,
    panZoomEffect: 'none'
  },
  {
    id: 'p3_clip4',
    mediaId: 'p3_img2',
    start: 180,
    end: 300,
    locked: false,
    confidence: 96,
    panZoomEffect: 'zoom-out'
  }
];

export const PRESET_PROJECTS: Project[] = [
  {
    id: 'project_1',
    name: 'Eiffel Tower Documentary',
    duration: 240,
    audioName: 'eiffel_tower_history_narration.mp3',
    audioSize: '24.5 MB',
    status: 'READY_FOR_REVIEW',
    progress: 100,
    lastSaved: '2 hours ago',
    syncMode: 'DOCUMENTARY',
    syncControls: {
      visualPace: 'balanced',
      imageDuration: 'balanced',
      imageReuse: 'necessary',
      matchingStyle: 'literal',
      variety: 'balanced',
      qualityPriority: 'balanced'
    },
    mediaItems: p1MediaItems,
    clips: p1Clips,
    sections: p1Sections
  },
  {
    id: 'project_2',
    name: 'Odyssey: The Journey to Mars',
    duration: 180,
    audioName: 'mars_odyssey_audiobook_ch1.wav',
    audioSize: '31.2 MB',
    status: 'COMPLETE',
    progress: 100,
    lastSaved: 'Yesterday',
    syncMode: 'CINEMATIC',
    syncControls: {
      visualPace: 'balanced',
      imageDuration: 'balanced',
      imageReuse: 'never',
      matchingStyle: 'cinematic',
      variety: 'max',
      qualityPriority: 'relevance'
    },
    mediaItems: p2MediaItems,
    clips: p2Clips,
    sections: p2Sections
  },
  {
    id: 'project_3',
    name: 'Acoustic Forest Meditation',
    duration: 300,
    audioName: 'forest_calm_ambient_music.wav',
    audioSize: '55.0 MB',
    status: 'READY_FOR_REVIEW',
    progress: 100,
    lastSaved: '3 days ago',
    syncMode: 'CALM',
    syncControls: {
      visualPace: 'slow',
      imageDuration: 'long',
      imageReuse: 'allowed',
      matchingStyle: 'contextual',
      variety: 'low',
      qualityPriority: 'quality'
    },
    mediaItems: p3MediaItems,
    clips: p3Clips,
    sections: p3Sections
  }
];
