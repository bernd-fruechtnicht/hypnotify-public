/**
 * Voice filtering utilities
 * Shared logic for filtering voices by language across all TTS services
 */

/**
 * Filter voices by language using simple prefix matching
 * Handles language codes like: en, en-US, en_GB, zh-CN, de-DE, etc.
 */
export function filterVoicesByLanguage(voices: any[], language: string): any[] {
  if (!language) {
    return voices;
  }

  const targetLang = language.toLowerCase();

  return voices.filter(voice => {
    const voiceLang = voice.lang.toLowerCase();

    logger.debug(
      `VoiceUtils: Checking voice: ${voice.name} (${voice.lang}) for language: ${targetLang}`
    );

    // Simple and effective filtering: check if voice language starts with target language
    // This handles cases like: en, en-US, en_GB, en-GB, etc.
    const langMatch =
      voiceLang.startsWith(targetLang + '-') ||
      voiceLang.startsWith(targetLang + '_') ||
      voiceLang === targetLang;

    logger.debug(
      `VoiceUtils: Voice ${voice.name} (${voice.lang}) - starts with ${targetLang}: ${langMatch}`
    );

    return langMatch;
  });
}
