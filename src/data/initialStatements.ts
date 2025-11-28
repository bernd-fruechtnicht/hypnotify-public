/**
 * Initial Meditation Statements Library
 * Predefined statements for the meditation app in multiple languages
 */

import {
  MeditationStatement,
  StatementCategory,
  CreateMeditationStatementInput,
} from '../types';

/**
 * Generate a deterministic ID for statements
 */
const generateId = (index: number): string => {
  return `stmt_${index.toString().padStart(3, '0')}`;
};

/**
 * Create a statement from input data
 */
const createStatement = (
  input: CreateMeditationStatementInput,
  index: number
): MeditationStatement => {
  const now = new Date();

  return {
    id: generateId(index),
    text: input.text || input.multiLanguageContent.en?.text || '',
    language: input.language || 'en',
    multiLanguageContent: input.multiLanguageContent,
    primaryTag: input.primaryTag,
    isUserCreated: false,
    tags: input.tags || [input.primaryTag],
    isActive: true,
    ttsSettings: input.ttsSettings,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Multilingual meditation statements (120 statements - complete)
 */
const multilingualStatements: CreateMeditationStatementInput[] = [
  // Breathing exercises (20)
  {
    multiLanguageContent: {
      en: {
        text: 'Take a deep breath in through your nose, filling your lungs completely.',
      },
      de: {
        text: 'Atme tief durch die Nase ein und fülle deine Lungen vollständig.',
      },
      zh: { text: '通过鼻子深呼吸，完全填满你的肺部。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Hold your breath for a moment, feeling the stillness within.',
      },
      de: {
        text: 'Halte den Atem für einen Moment an und spüre die Stille in dir.',
      },
      zh: { text: '屏住呼吸片刻，感受内心的宁静。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Slowly exhale through your mouth, releasing all tension.' },
      de: {
        text: 'Atme langsam durch den Mund aus und lasse alle Anspannung los.',
      },
      zh: { text: '慢慢通过嘴巴呼气，释放所有紧张。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Breathe naturally and observe the rhythm of your breath.' },
      de: { text: 'Atme natürlich und beobachte den Rhythmus deines Atems.' },
      zh: { text: '自然呼吸，观察你的呼吸节奏。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Breathe in for four counts, hold for four, exhale for six.',
      },
      de: { text: 'Atme vier Zählzeiten ein, halte vier, atme sechs aus.' },
      zh: { text: '吸气四拍，屏气四拍，呼气六拍。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Take a deep breath and feel your chest expand.' },
      de: { text: 'Atme tief ein und spüre, wie sich deine Brust ausdehnt.' },
      zh: { text: '深呼吸，感受你的胸部扩张。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Breathe into your belly, letting it rise and fall naturally.',
      },
      de: {
        text: 'Atme in deinen Bauch und lasse ihn natürlich steigen und fallen.',
      },
      zh: { text: '呼吸到腹部，让它自然起伏。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Inhale peace, exhale tension with each breath.' },
      de: { text: 'Atme Frieden ein, atme Anspannung mit jedem Atemzug aus.' },
      zh: { text: '吸气时吸入平静，呼气时释放紧张。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Count your breaths from one to ten, then start again.' },
      de: {
        text: 'Zähle deine Atemzüge von eins bis zehn, dann beginne von vorne.',
      },
      zh: { text: '从一到十数你的呼吸，然后重新开始。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Breathe as if you are filling a balloon in your belly.' },
      de: {
        text: 'Atme, als würdest du einen Ballon in deinem Bauch aufblasen.',
      },
      zh: { text: '呼吸时想象你在腹部充气球。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Take three deep breaths to center yourself.' },
      de: { text: 'Atme dreimal tief ein, um dich zu zentrieren.' },
      zh: { text: '深呼吸三次来集中自己。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Breathe in calm, breathe out any restlessness.' },
      de: { text: 'Atme Ruhe ein, atme jede Unruhe aus.' },
      zh: { text: '吸气时吸入平静，呼气时释放不安。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your breath becoming slower and deeper.' },
      de: { text: 'Spüre, wie dein Atem langsamer und tiefer wird.' },
      zh: { text: '感受你的呼吸变得缓慢而深沉。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Breathe with awareness of the air entering and leaving your body.',
      },
      de: {
        text: 'Atme mit dem Bewusstsein der Luft, die in deinen Körper ein- und austritt.',
      },
      zh: { text: '有意识地呼吸，感受空气进出你的身体。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your breath flow like gentle waves on the shore.' },
      de: { text: 'Lasse deinen Atem wie sanfte Wellen am Ufer fließen.' },
      zh: { text: '让你的呼吸像岸边的轻柔波浪一样流动。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Breathe in energy, breathe out fatigue.' },
      de: { text: 'Atme Energie ein, atme Müdigkeit aus.' },
      zh: { text: '吸气时吸入能量，呼气时释放疲劳。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Take a cleansing breath, releasing all that no longer serves you.',
      },
      de: {
        text: 'Atme reinigend ein und lasse alles los, was dir nicht mehr dient.',
      },
      zh: { text: '深呼吸净化，释放所有不再为你服务的东西。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Breathe in gratitude, breathe out any negativity.' },
      de: { text: 'Atme Dankbarkeit ein, atme jede Negativität aus.' },
      zh: { text: '吸气时吸入感恩，呼气时释放消极情绪。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your breath connecting you to the present moment.' },
      de: {
        text: 'Spüre, wie dein Atem dich mit dem gegenwärtigen Moment verbindet.',
      },
      zh: { text: '感受你的呼吸将你与当下连接。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Breathe as if you are breathing for the first time.' },
      de: { text: 'Atme, als würdest du zum ersten Mal atmen.' },
      zh: { text: '呼吸时想象你是第一次呼吸。' },
    },
    primaryTag: 'breathing',
    tags: ['breathing'],
  },

  // Relaxation statements (20)
  {
    multiLanguageContent: {
      en: {
        text: 'Feel your body becoming heavier and more relaxed with each breath.',
      },
      de: {
        text: 'Spüre, wie dein Körper mit jedem Atemzug schwerer und entspannter wird.',
      },
      zh: { text: '感受你的身体随着每次呼吸变得更加沉重和放松。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Imagine a warm, golden light surrounding your entire body.',
      },
      de: {
        text: 'Stelle dir ein warmes, goldenes Licht vor, das deinen ganzen Körper umhüllt.',
      },
      zh: { text: '想象一道温暖的金色光芒包围着你的整个身体。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Let go of all thoughts and simply be present in this moment.',
      },
      de: {
        text: 'Lasse alle Gedanken los und sei einfach in diesem Moment präsent.',
      },
      zh: { text: '放下所有想法，简单地存在于这个时刻。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel the tension melting away from your muscles.' },
      de: { text: 'Spüre, wie die Anspannung aus deinen Muskeln schmilzt.' },
      zh: { text: '感受紧张从你的肌肉中融化。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your shoulders dropping and releasing tension.' },
      de: {
        text: 'Spüre, wie deine Schultern sinken und Anspannung loslassen.',
      },
      zh: { text: '感受你的肩膀下沉并释放紧张。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Imagine yourself floating on a calm, peaceful lake.' },
      de: {
        text: 'Stelle dir vor, du schwebst auf einem ruhigen, friedlichen See.',
      },
      zh: { text: '想象自己漂浮在平静祥和的湖面上。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your jaw relaxing and your mouth opening slightly.' },
      de: {
        text: 'Spüre, wie dein Kiefer entspannt und dein Mund sich leicht öffnet.',
      },
      zh: { text: '感受你的下巴放松，嘴巴微微张开。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your body sink deeper into relaxation.' },
      de: { text: 'Lasse deinen Körper tiefer in die Entspannung sinken.' },
      zh: { text: '让你的身体更深地沉入放松状态。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel warmth spreading through your entire body.' },
      de: {
        text: 'Spüre, wie sich Wärme durch deinen ganzen Körper ausbreitet.',
      },
      zh: { text: '感受温暖传遍你的整个身体。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Imagine a gentle breeze cooling your skin.' },
      de: { text: 'Stelle dir eine sanfte Brise vor, die deine Haut kühlt.' },
      zh: { text: '想象轻柔的微风轻抚你的皮肤。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your spine lengthening and straightening.' },
      de: {
        text: 'Spüre, wie sich deine Wirbelsäule verlängert und aufrichtet.',
      },
      zh: { text: '感受你的脊柱拉长和挺直。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your mind become as still as a calm pond.' },
      de: { text: 'Lasse deinen Geist so still werden wie ein ruhiger Teich.' },
      zh: { text: '让你的心灵像平静的池塘一样宁静。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your hands becoming heavy and relaxed.' },
      de: { text: 'Spüre, wie deine Hände schwer und entspannt werden.' },
      zh: { text: '感受你的双手变得沉重和放松。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Imagine yourself in a beautiful, peaceful garden.' },
      de: {
        text: 'Stelle dir vor, du bist in einem wunderschönen, friedlichen Garten.',
      },
      zh: { text: '想象自己在一个美丽祥和的花园里。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your neck and throat relaxing completely.' },
      de: {
        text: 'Spüre, wie dein Nacken und Hals sich vollständig entspannen.',
      },
      zh: { text: '感受你的颈部和喉咙完全放松。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your body feel weightless and free.' },
      de: { text: 'Lasse deinen Körper schwerelos und frei fühlen.' },
      zh: { text: '让你的身体感觉失重和自由。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your forehead smoothing and relaxing.' },
      de: { text: 'Spüre, wie sich deine Stirn glättet und entspannt.' },
      zh: { text: '感受你的前额变得平滑和放松。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Imagine yourself wrapped in a soft, warm blanket.' },
      de: {
        text: 'Stelle dir vor, du bist in eine weiche, warme Decke gehüllt.',
      },
      zh: { text: '想象自己被柔软的温暖毯子包裹着。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your entire body becoming one with relaxation.' },
      de: {
        text: 'Spüre, wie dein ganzer Körper eins mit der Entspannung wird.',
      },
      zh: { text: '感受你的整个身体与放松融为一体。' },
    },
    primaryTag: 'relaxation',
    tags: ['breathing', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your breathing become effortless and natural.' },
      de: { text: 'Lasse dein Atmen mühelos und natürlich werden.' },
      zh: { text: '让你的呼吸变得轻松自然。' },
    },
    primaryTag: 'relaxation',
    tags: ['relaxation', 'breathing'],
  },

  // Mindfulness statements (20)
  {
    multiLanguageContent: {
      en: { text: 'Notice the sensations in your body without judgment.' },
      de: { text: 'Nimm die Empfindungen in deinem Körper ohne Urteil wahr.' },
      zh: { text: '不带评判地觉察你身体的感觉。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Observe your thoughts like clouds passing in the sky.' },
      de: {
        text: 'Beobachte deine Gedanken wie Wolken, die am Himmel vorbeiziehen.',
      },
      zh: { text: '像观察天空中的云朵一样观察你的想法。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Bring your attention to the present moment.' },
      de: { text: 'Richte deine Aufmerksamkeit auf den gegenwärtigen Moment.' },
      zh: { text: '将你的注意力带到当下。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Accept whatever arises in your awareness with kindness.' },
      de: {
        text: 'Nimm alles, was in deinem Bewusstsein entsteht, mit Freundlichkeit an.',
      },
      zh: { text: '以善意接受你觉知中出现的任何事物。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice the space between your thoughts.' },
      de: { text: 'Nimm den Raum zwischen deinen Gedanken wahr.' },
      zh: { text: '觉察你想法之间的空间。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel the sensation of your body sitting or lying down.' },
      de: {
        text: 'Spüre die Empfindung deines Körpers im Sitzen oder Liegen.',
      },
      zh: { text: '感受你坐着或躺着的身体感觉。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Listen to the sounds around you without judgment.' },
      de: { text: 'Höre den Geräuschen um dich herum ohne Urteil zu.' },
      zh: { text: '不带评判地聆听你周围的声音。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice any emotions that arise and let them be.' },
      de: {
        text: 'Nimm alle Emotionen wahr, die entstehen, und lasse sie sein.',
      },
      zh: { text: '觉察出现的任何情绪，让它们存在。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Feel the weight of your body against the surface beneath you.',
      },
      de: {
        text: 'Spüre das Gewicht deines Körpers gegen die Oberfläche unter dir.',
      },
      zh: { text: '感受你身体压在下方表面的重量。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice the quality of your attention in this moment.' },
      de: {
        text: 'Nimm die Qualität deiner Aufmerksamkeit in diesem Moment wahr.',
      },
      zh: { text: '觉察你此刻注意力的品质。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel the air touching your skin.' },
      de: { text: 'Spüre die Luft, die deine Haut berührt.' },
      zh: { text: '感受空气轻抚你的皮肤。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice any tension in your body and breathe into it.' },
      de: {
        text: 'Nimm jede Anspannung in deinem Körper wahr und atme hinein.',
      },
      zh: { text: '觉察你身体中的任何紧张，并向它呼吸。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel the rhythm of your heartbeat.' },
      de: { text: 'Spüre den Rhythmus deines Herzschlags.' },
      zh: { text: '感受你心跳的节奏。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice the quality of light around you.' },
      de: { text: 'Nimm die Qualität des Lichts um dich herum wahr.' },
      zh: { text: '觉察你周围光线的品质。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel the connection between your mind and body.' },
      de: { text: 'Spüre die Verbindung zwischen deinem Geist und Körper.' },
      zh: { text: '感受你心灵和身体之间的连接。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice the stillness within the movement of your breath.' },
      de: { text: 'Nimm die Stille innerhalb der Bewegung deines Atems wahr.' },
      zh: { text: '觉察你呼吸运动中的宁静。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your awareness expanding beyond your body.' },
      de: {
        text: 'Spüre, wie sich dein Bewusstsein über deinen Körper hinaus ausdehnt.',
      },
      zh: { text: '感受你的觉知扩展到身体之外。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice the impermanence of each moment.' },
      de: { text: 'Nimm die Vergänglichkeit jedes Moments wahr.' },
      zh: { text: '觉察每个时刻的无常。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel the spaciousness of your mind.' },
      de: { text: 'Spüre die Weite deines Geistes.' },
      zh: { text: '感受你心灵的广阔。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice the difference between thinking and awareness.' },
      de: {
        text: 'Nimm den Unterschied zwischen Denken und Bewusstsein wahr.',
      },
      zh: { text: '觉察思考和觉知之间的区别。' },
    },
    primaryTag: 'mindfulness',
    tags: ['breathing', 'mindfulness'],
  },

  // Sleep statements (20)
  {
    multiLanguageContent: {
      en: { text: 'Your eyelids are becoming heavy and relaxed.' },
      de: { text: 'Deine Augenlider werden schwer und entspannt.' },
      zh: { text: '你的眼皮变得沉重和放松。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel yourself drifting into a peaceful, restful state.' },
      de: {
        text: 'Spüre, wie du in einen friedlichen, erholsamen Zustand gleitest.',
      },
      zh: { text: '感受自己进入一个平静、安详的状态。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Imagine yourself in a safe, comfortable place.' },
      de: {
        text: 'Stelle dir vor, du bist an einem sicheren, gemütlichen Ort.',
      },
      zh: { text: '想象自己在一个安全、舒适的地方。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your body becoming heavier and more relaxed.' },
      de: { text: 'Spüre, wie dein Körper schwerer und entspannter wird.' },
      zh: { text: '感受你的身体变得更加沉重和放松。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Imagine yourself sinking into a soft, comfortable bed.' },
      de: { text: 'Stelle dir vor, du sinkst in ein weiches, bequemes Bett.' },
      zh: { text: '想象自己沉入一张柔软舒适的床。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your thoughts drift away like leaves on a stream.' },
      de: {
        text: 'Lasse deine Gedanken wie Blätter auf einem Bach davontreiben.',
      },
      zh: { text: '让你的想法像溪流上的叶子一样飘走。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your mind becoming quiet and peaceful.' },
      de: { text: 'Spüre, wie dein Geist ruhig und friedlich wird.' },
      zh: { text: '感受你的心灵变得安静祥和。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Imagine yourself walking down a peaceful path to sleep.' },
      de: {
        text: 'Stelle dir vor, du gehst einen friedlichen Pfad zum Schlaf entlang.',
      },
      zh: { text: '想象自己沿着一条宁静的小径走向睡眠。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your breathing becoming slower and deeper.' },
      de: { text: 'Spüre, wie dein Atem langsamer und tiefer wird.' },
      zh: { text: '感受你的呼吸变得缓慢而深沉。' },
    },
    primaryTag: 'sleep',
    tags: ['sleep', 'breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your body feel completely supported and comfortable.' },
      de: {
        text: 'Lasse deinen Körper sich vollständig gestützt und bequem fühlen.',
      },
      zh: { text: '让你的身体感觉完全被支撑和舒适。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Imagine yourself floating on a cloud of sleep.' },
      de: { text: 'Stelle dir vor, du schwebst auf einer Wolke des Schlafs.' },
      zh: { text: '想象自己漂浮在睡眠的云朵上。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your consciousness gently fading into sleep.' },
      de: { text: 'Spüre, wie dein Bewusstsein sanft in den Schlaf gleitet.' },
      zh: { text: '感受你的意识轻柔地进入睡眠。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Let your mind rest in the darkness behind your closed eyes.',
      },
      de: {
        text: 'Lasse deinen Geist in der Dunkelheit hinter deinen geschlossenen Augen ruhen.',
      },
      zh: { text: '让你的心灵在闭眼后的黑暗中休息。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel yourself being gently rocked to sleep.' },
      de: { text: 'Spüre, wie du sanft in den Schlaf gewiegt wirst.' },
      zh: { text: '感受自己被轻柔地摇入睡眠。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Imagine yourself in a cozy, warm cabin in the woods.' },
      de: {
        text: 'Stelle dir vor, du bist in einer gemütlichen, warmen Hütte im Wald.',
      },
      zh: { text: '想象自己在森林中一间舒适温暖的小屋里。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your body releasing all the tension of the day.' },
      de: {
        text: 'Spüre, wie dein Körper alle Anspannung des Tages loslässt.',
      },
      zh: { text: '感受你的身体释放一天的所有紧张。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your mind become as still as a calm lake at night.' },
      de: {
        text: 'Lasse deinen Geist so still werden wie ein ruhiger See in der Nacht.',
      },
      zh: { text: '让你的心灵像夜晚平静的湖泊一样宁静。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel yourself drifting deeper into peaceful sleep.' },
      de: { text: 'Spüre, wie du tiefer in friedlichen Schlaf gleitest.' },
      zh: { text: '感受自己更深地沉入平静的睡眠。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your mind become quiet and still.' },
      de: { text: 'Lasse deinen Geist ruhig und still werden.' },
      zh: { text: '让你的心灵变得安静宁静。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel yourself sinking deeper into peaceful rest.' },
      de: { text: 'Spüre, wie du tiefer in friedliche Ruhe sinkst.' },
      zh: { text: '感受自己更深地沉入平静的休息。' },
    },
    primaryTag: 'sleep',
    tags: ['breathing', 'sleep'],
  },

  // Anxiety statements (20)
  {
    multiLanguageContent: {
      en: { text: 'You are safe and secure in this moment.' },
      de: { text: 'Du bist in diesem Moment sicher und geborgen.' },
      zh: { text: '你在此刻是安全和有保障的。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your anxiety dissolving with each breath.' },
      de: { text: 'Spüre, wie deine Angst mit jedem Atemzug verschwindet.' },
      zh: { text: '感受你的焦虑随着每次呼吸消散。' },
    },
    primaryTag: 'anxiety',
    tags: ['anxiety', 'breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'This feeling will pass, just like all feelings do.' },
      de: { text: 'Dieses Gefühl wird vergehen, genau wie alle Gefühle.' },
      zh: { text: '这种感觉会过去，就像所有感觉一样。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'You have the strength to handle whatever comes your way.' },
      de: {
        text: 'Du hast die Stärke, mit allem umzugehen, was auf dich zukommt.',
      },
      zh: { text: '你有力量处理任何来到你面前的事情。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your feet grounded and connected to the earth.' },
      de: {
        text: 'Spüre, wie deine Füße geerdet und mit der Erde verbunden sind.',
      },
      zh: { text: '感受你的双脚扎根并与大地连接。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice that you are safe in this moment.' },
      de: { text: 'Nimm wahr, dass du in diesem Moment sicher bist.' },
      zh: { text: '觉察你在此刻是安全的。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let your worries float away like clouds in the sky.' },
      de: { text: 'Lasse deine Sorgen wie Wolken am Himmel davonschweben.' },
      zh: { text: '让你的担忧像天空中的云朵一样飘走。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your heart rate slowing down with each breath.' },
      de: {
        text: 'Spüre, wie deine Herzfrequenz mit jedem Atemzug langsamer wird.',
      },
      zh: { text: '感受你的心率随着每次呼吸减慢。' },
    },
    primaryTag: 'anxiety',
    tags: ['anxiety', 'breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'You are stronger than your anxiety.' },
      de: { text: 'Du bist stärker als deine Angst.' },
      zh: { text: '你比你的焦虑更强大。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel the support of the ground beneath you.' },
      de: { text: 'Spüre die Unterstützung des Bodens unter dir.' },
      zh: { text: '感受你下方地面的支撑。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'This moment of anxiety will pass, just like all moments do.',
      },
      de: {
        text: 'Dieser Moment der Angst wird vergehen, genau wie alle Momente.',
      },
      zh: { text: '这个焦虑的时刻会过去，就像所有时刻一样。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Breathe in courage, breathe out fear.' },
      de: { text: 'Atme Mut ein, atme Angst aus.' },
      zh: { text: '吸气时吸入勇气，呼气时释放恐惧。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your body relaxing and releasing tension.' },
      de: { text: 'Spüre, wie dein Körper entspannt und Anspannung loslässt.' },
      zh: { text: '感受你的身体放松并释放紧张。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety', 'relaxation'],
  },
  {
    multiLanguageContent: {
      en: { text: 'You have survived every difficult moment in your life.' },
      de: {
        text: 'Du hast jeden schwierigen Moment in deinem Leben überlebt.',
      },
      zh: { text: '你已经度过了生命中的每一个困难时刻。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel the warmth of your own presence.' },
      de: { text: 'Spüre die Wärme deiner eigenen Gegenwart.' },
      zh: { text: '感受你自己存在的温暖。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Let go of trying to control everything.' },
      de: { text: 'Lasse los, alles kontrollieren zu wollen.' },
      zh: { text: '放下试图控制一切的念头。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your breath as a steady anchor in the storm.' },
      de: { text: 'Spüre deinen Atem als stetigen Anker im Sturm.' },
      zh: { text: '感受你的呼吸是风暴中稳定的锚。' },
    },
    primaryTag: 'anxiety',
    tags: ['anxiety', 'breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'You are exactly where you need to be right now.' },
      de: { text: 'Du bist genau dort, wo du jetzt sein musst.' },
      zh: { text: '你此刻就在你需要的地方。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel your breath as a steady rhythm that grounds you.' },
      de: { text: 'Spüre deinen Atem als stetigen Rhythmus, der dich erdet.' },
      zh: { text: '感受你的呼吸是让你扎根的稳定节奏。' },
    },
    primaryTag: 'anxiety',
    tags: ['anxiety', 'breathing'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'You have overcome challenges before, and you will overcome this one too.',
      },
      de: {
        text: 'Du hast schon Herausforderungen überwunden, und du wirst auch diese überwinden.',
      },
      zh: { text: '你以前克服过挑战，这次你也会克服的。' },
    },
    primaryTag: 'anxiety',
    tags: ['breathing', 'anxiety'],
  },

  // Gratitude statements (20)
  {
    multiLanguageContent: {
      en: { text: 'Think of three things you are grateful for today.' },
      de: { text: 'Denke an drei Dinge, für die du heute dankbar bist.' },
      zh: { text: '想想今天你感激的三件事。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel appreciation for the simple joys in your life.' },
      de: {
        text: 'Spüre Wertschätzung für die einfachen Freuden in deinem Leben.',
      },
      zh: { text: '感受对你生活中简单快乐的感激。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Send gratitude to someone who has helped you.' },
      de: { text: 'Sende Dankbarkeit an jemanden, der dir geholfen hat.' },
      zh: { text: '向帮助过你的人发送感激之情。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Appreciate your body for all it does for you.' },
      de: { text: 'Schätze deinen Körper für alles, was er für dich tut.' },
      zh: { text: '感激你的身体为你所做的一切。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Feel grateful for the challenges that have made you stronger.',
      },
      de: {
        text: 'Sei dankbar für die Herausforderungen, die dich stärker gemacht haben.',
      },
      zh: { text: '感激那些让你变得更强大的挑战。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Express gratitude for the present moment.' },
      de: { text: 'Drücke Dankbarkeit für den gegenwärtigen Moment aus.' },
      zh: { text: '对当下表达感激之情。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Send loving-kindness to yourself and others.' },
      de: { text: 'Sende liebevolle Güte an dich selbst und andere.' },
      zh: { text: '向自己和他人发送慈爱。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel thankful for the lessons learned today.' },
      de: { text: 'Sei dankbar für die Lektionen, die du heute gelernt hast.' },
      zh: { text: '感激今天学到的教训。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Appreciate the beauty that surrounds you.' },
      de: { text: 'Schätze die Schönheit, die dich umgibt.' },
      zh: { text: '感激围绕你的美丽。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude', 'mindfulness'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel grateful for your breath and the gift of life.' },
      de: { text: 'Sei dankbar für deinen Atem und das Geschenk des Lebens.' },
      zh: { text: '感激你的呼吸和生命的礼物。' },
    },
    primaryTag: 'gratitude',
    tags: ['gratitude', 'breathing'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice the abundance in your life right now.' },
      de: { text: 'Nimm den Überfluss in deinem Leben jetzt wahr.' },
      zh: { text: '觉察你生活中此刻的丰盛。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel appreciation for the people who love you.' },
      de: { text: 'Spüre Wertschätzung für die Menschen, die dich lieben.' },
      zh: { text: '感激那些爱你的人。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Be grateful for your ability to experience joy.' },
      de: { text: 'Sei dankbar für deine Fähigkeit, Freude zu empfinden.' },
      zh: { text: '感激你体验快乐的能力。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel thankful for the wisdom you have gained.' },
      de: { text: 'Sei dankbar für die Weisheit, die du gewonnen hast.' },
      zh: { text: '感激你获得的智慧。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Appreciate the gift of being alive in this moment.' },
      de: { text: 'Schätze das Geschenk, in diesem Moment lebendig zu sein.' },
      zh: { text: '感激在此刻活着的礼物。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: {
        text: 'Feel grateful for the peace you can create within yourself.',
      },
      de: {
        text: 'Sei dankbar für den Frieden, den du in dir selbst schaffen kannst.',
      },
      zh: { text: '感激你可以在内心创造的平静。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Notice all the small blessings in your day.' },
      de: { text: 'Nimm alle kleinen Segnungen in deinem Tag wahr.' },
      zh: { text: '觉察你一天中所有的小祝福。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Feel appreciation for your capacity to grow and change.' },
      de: {
        text: 'Spüre Wertschätzung für deine Fähigkeit zu wachsen und dich zu verändern.',
      },
      zh: { text: '感激你成长和改变的能力。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Be grateful for the love that flows through your heart.' },
      de: { text: 'Sei dankbar für die Liebe, die durch dein Herz fließt.' },
      zh: { text: '感激流经你心灵的爱。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude'],
  },
  {
    multiLanguageContent: {
      en: { text: 'Appreciate the simple moments that bring you joy.' },
      de: { text: 'Schätze die einfachen Momente, die dir Freude bereiten.' },
      zh: { text: '感激那些给你带来快乐的简单时刻。' },
    },
    primaryTag: 'gratitude',
    tags: ['breathing', 'gratitude', 'mindfulness'],
  },
];

/**
 * Get all initial statements
 */
export const getInitialStatements = (): MeditationStatement[] => {
  return multilingualStatements.map((statement, index) =>
    createStatement(statement, index)
  );
};

/**
 * Get statements by category
 */
export const getStatementsByCategory = (
  category: StatementCategory
): MeditationStatement[] => {
  const allStatements = getInitialStatements();
  return allStatements.filter(s => s.primaryTag === category);
};
