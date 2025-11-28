/**
 * Stereo Meditation Statements
 *
 * These are paired statements designed for bilateral stimulation:
 * - Rational statements (left ear) - logical, analytical content
 * - Emotional statements (right ear) - emotional, subconscious content
 *
 * The goal is to create cognitive dissonance that bypasses conscious processing.
 */

// Define StereoStatement type locally since StereoTTSService was removed
export interface StereoStatement {
  id: string;
  rational: string;
  emotional: string;
  language: string;
  duration: number;
}

export const STEREO_STATEMENTS: StereoStatement[] = [
  {
    id: 'stereo_001',
    rational: 'You are completely safe and secure in this moment.',
    emotional: 'Feel the warmth of complete acceptance flowing through you.',
    language: 'en',
    duration: 8000,
  },
  {
    id: 'stereo_002',
    rational: 'Your mind is naturally calm and peaceful.',
    emotional:
      'Let go of all tension and feel yourself melting into relaxation.',
    language: 'en',
    duration: 9000,
  },
  {
    id: 'stereo_003',
    rational: 'You have the power to create positive change in your life.',
    emotional: 'Feel the strength and confidence growing within you.',
    language: 'en',
    duration: 8500,
  },
  {
    id: 'stereo_004',
    rational: 'Every breath you take brings you deeper into relaxation.',
    emotional: 'With each exhale, release all stress and worry.',
    language: 'en',
    duration: 7500,
  },
  {
    id: 'stereo_005',
    rational: 'You are worthy of love, happiness, and success.',
    emotional: 'Feel the love and acceptance surrounding you completely.',
    language: 'en',
    duration: 8000,
  },
  {
    id: 'stereo_006',
    rational: 'Your body knows how to heal and restore itself naturally.',
    emotional: 'Feel every cell in your body relaxing and renewing.',
    language: 'en',
    duration: 9000,
  },
  {
    id: 'stereo_007',
    rational:
      'You have overcome challenges before and you will overcome them again.',
    emotional:
      'Feel the resilience and inner strength that has always been there.',
    language: 'en',
    duration: 8500,
  },
  {
    id: 'stereo_008',
    rational: 'This moment is perfect exactly as it is.',
    emotional: 'Embrace the peace and contentment of the present moment.',
    language: 'en',
    duration: 7000,
  },
  {
    id: 'stereo_009',
    rational: 'You are in complete control of your thoughts and emotions.',
    emotional: 'Feel the power of your mind creating positive change.',
    language: 'en',
    duration: 8000,
  },
  {
    id: 'stereo_010',
    rational: 'Every day brings new opportunities for growth and happiness.',
    emotional: 'Feel the excitement and joy of new possibilities opening up.',
    language: 'en',
    duration: 8500,
  },
  // German statements
  {
    id: 'stereo_011',
    rational: 'Du bist in diesem Moment völlig sicher und geborgen.',
    emotional:
      'Spüre die Wärme vollständiger Akzeptanz, die durch dich fließt.',
    language: 'de',
    duration: 8000,
  },
  {
    id: 'stereo_012',
    rational: 'Dein Geist ist natürlich ruhig und friedlich.',
    emotional:
      'Lass alle Anspannung los und spüre, wie du in die Entspannung hineinschmilzt.',
    language: 'de',
    duration: 9000,
  },
  {
    id: 'stereo_013',
    rational:
      'Du hast die Kraft, positive Veränderungen in deinem Leben zu schaffen.',
    emotional: 'Spüre die Stärke und das Selbstvertrauen, die in dir wachsen.',
    language: 'de',
    duration: 8500,
  },
  {
    id: 'stereo_014',
    rational: 'Jeder Atemzug führt dich tiefer in die Entspannung.',
    emotional: 'Mit jedem Ausatmen lass alle Anspannung und Sorgen los.',
    language: 'de',
    duration: 7500,
  },
  {
    id: 'stereo_015',
    rational:
      'Du bist es wert, geliebt zu werden, glücklich und erfolgreich zu sein.',
    emotional: 'Spüre die Liebe und Akzeptanz, die dich vollständig umgeben.',
    language: 'de',
    duration: 8000,
  },
  // Chinese statements
  {
    id: 'stereo_016',
    rational: '在这一刻，你完全安全且受到保护。',
    emotional: '感受完全接纳的温暖在你体内流动。',
    language: 'zh',
    duration: 8000,
  },
  {
    id: 'stereo_017',
    rational: '你的心灵天然平静祥和。',
    emotional: '释放所有紧张，感受自己融入放松之中。',
    language: 'zh',
    duration: 9000,
  },
  {
    id: 'stereo_018',
    rational: '你有能力在生活中创造积极的改变。',
    emotional: '感受内在不断增长的强大力量和自信。',
    language: 'zh',
    duration: 8500,
  },
  {
    id: 'stereo_019',
    rational: '每一次呼吸都让你更深地进入放松状态。',
    emotional: '随着每一次呼气，释放所有的压力和担忧。',
    language: 'zh',
    duration: 7500,
  },
  {
    id: 'stereo_020',
    rational: '你值得被爱，值得拥有幸福和成功。',
    emotional: '感受完全包围着你的爱和接纳。',
    language: 'zh',
    duration: 8000,
  },
];

/**
 * Get stereo statements by language
 */
export function getStereoStatementsByLanguage(
  language: string
): StereoStatement[] {
  return STEREO_STATEMENTS.filter(statement => statement.language === language);
}

/**
 * Get all available languages for stereo statements
 */
export function getStereoStatementLanguages(): string[] {
  const languages = new Set(
    STEREO_STATEMENTS.map(statement => statement.language)
  );
  return Array.from(languages);
}

/**
 * Get a random stereo statement for a given language
 */
export function getRandomStereoStatement(
  language: string
): StereoStatement | undefined {
  const statements = getStereoStatementsByLanguage(language);
  if (statements.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * statements.length);
  return statements[randomIndex];
}
