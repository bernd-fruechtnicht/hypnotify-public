// Unified tagging system for statements
export const AVAILABLE_TAGS = [
  'breathing',
  'relaxation',
  'mindfulness',
  'sleep',
  'anxiety',
  'gratitude',
  'stress',
  'focus',
  'body',
  'visualization',
  'thoughts',
  'present',
  'acceptance',
  'safety',
  'confidence',
  'morning',
  'quick',
  'calm',
  'affirmation',
  'body_scan',
  'loving_kindness',
] as const;

export type Tag = (typeof AVAILABLE_TAGS)[number];

// Predefined colors for each tag
export const TAG_COLORS: Record<Tag, string> = {
  breathing: '#4CAF50',
  relaxation: '#2196F3',
  mindfulness: '#FF9800',
  sleep: '#9C27B0',
  anxiety: '#FF5722',
  stress: '#F44336',
  focus: '#00BCD4',
  body: '#795548',
  visualization: '#E91E63',
  thoughts: '#607D8B',
  present: '#4CAF50',
  acceptance: '#8BC34A',
  safety: '#FFC107',
  confidence: '#FF5722',
  gratitude: '#3F51B5',
  morning: '#FF9800',
  quick: '#9E9E9E',
  calm: '#00BCD4',
  affirmation: '#E91E63',
  body_scan: '#795548',
  loving_kindness: '#E91E63',
};

// Helper functions
export const getTagColor = (tag: Tag): string => {
  return TAG_COLORS[tag] || '#757575';
};

export const isValidTag = (tag: string): tag is Tag => {
  return AVAILABLE_TAGS.includes(tag as Tag);
};

export const getTranslatedTag = (
  tag: Tag,
  t: (key: string) => string
): string => {
  return t(`categories.${tag}`);
};
