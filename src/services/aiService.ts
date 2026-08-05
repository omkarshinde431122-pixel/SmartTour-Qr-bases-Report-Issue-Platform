// ============================================================================
// SmartTour — AI Categorization Service
// ============================================================================
// Uses keyword-based analysis to suggest complaint category and priority.
// No external API required for this implementation.
// ============================================================================

import type { ReportCategory, ReportPriority } from '../types';

interface AISuggestion {
  category: ReportCategory;
  priority: ReportPriority;
  confidence: number; // 0-1
}

// Keyword maps for category detection
const CATEGORY_KEYWORDS: Record<ReportCategory, string[]> = {
  garbage: ['garbage', 'waste', 'trash', 'litter', 'plastic', 'dustbin', 'rubbish', 'dump', 'pollution', 'dirty', 'filth', 'overflowing bin', 'food waste', 'packaging'],
  road: ['road', 'pothole', 'path', 'highway', 'route', 'approach road', 'pavement', 'surface', 'crack', 'asphalt', 'tar', 'broken road'],
  trek: ['trek', 'trekking', 'trail', 'hike', 'hiking', 'climb', 'climbing', 'path difficult', 'trail marker', 'fork', 'route unclear', 'lost way', 'steep'],
  network: ['network', 'signal', 'mobile', 'phone', 'internet', 'wifi', 'coverage', 'tower', 'connectivity', 'cellular', 'data', 'call', '4g', '5g'],
  water: ['water', 'drinking', 'tap', 'contaminated', 'supply', 'well', 'spring', 'dehydration', 'thirst', 'dirty water', 'no water'],
  toilet: ['toilet', 'sanitation', 'restroom', 'bathroom', 'washroom', 'lavatory', 'urinal', 'hygiene', 'cleaning'],
  lighting: ['light', 'lighting', 'dark', 'lamp', 'street light', 'bulb', 'visibility', 'night', 'sunset', 'illuminate'],
  signboard: ['sign', 'signboard', 'board', 'direction', 'marking', 'label', 'indicator', 'arrow', 'information board', 'missing sign', 'damaged sign'],
  parking: ['parking', 'park', 'vehicle', 'car', 'bike', 'two-wheeler', 'space', 'lot', 'overflow'],
  infrastructure: ['infrastructure', 'railing', 'bench', 'bridge', 'steps', 'stairs', 'fence', 'gate', 'structure', 'building', 'facility', 'shelter', 'roof'],
  safety: ['safety', 'danger', 'dangerous', 'risk', 'accident', 'fall', 'cliff', 'slip', 'slippery', 'emergency', 'injury', 'hazard', 'warning', 'railing', 'barrier'],
  other: [],
};

// Priority keyword indicators
const PRIORITY_KEYWORDS: Record<ReportPriority, string[]> = {
  critical: ['danger', 'dangerous', 'emergency', 'life', 'death', 'fatal', 'collapse', 'urgent', 'immediate', 'critical', 'accident', 'fall', 'cliff', 'injury'],
  high: ['important', 'serious', 'severe', 'major', 'hazard', 'broken', 'damaged', 'destroyed', 'contaminated', 'blocked', 'unsafe'],
  medium: ['problem', 'issue', 'concern', 'difficult', 'poor', 'needs', 'attention', 'moderate', 'missing', 'insufficient'],
  low: ['minor', 'small', 'slight', 'cosmetic', 'suggestion', 'improvement', 'would be nice', 'consider'],
};

/**
 * Analyze complaint text and suggest category and priority
 */
export function analyzeComplaint(title: string, description: string): AISuggestion {
  const text = `${title} ${description}`.toLowerCase();

  // Score each category
  const categoryScores: Record<string, number> = {};
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += keyword.split(' ').length; // Multi-word matches score higher
      }
    }
    categoryScores[category] = score;
  }

  // Find best category
  let bestCategory: ReportCategory = 'other';
  let bestScore = 0;
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as ReportCategory;
    }
  }

  // Score priority
  let priority: ReportPriority = 'medium';
  let priorityScore = 0;
  for (const [level, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) score++;
    }
    if (score > priorityScore) {
      priorityScore = score;
      priority = level as ReportPriority;
    }
  }

  // Calculate confidence (0-1)
  const maxPossibleScore = Math.max(...Object.values(CATEGORY_KEYWORDS).map((k) => k.length));
  const confidence = Math.min(bestScore / Math.max(maxPossibleScore * 0.3, 1), 1);

  return {
    category: bestCategory,
    priority,
    confidence: Math.round(confidence * 100) / 100,
  };
}
