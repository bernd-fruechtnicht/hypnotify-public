import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  // TextInput,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { VoiceSelector } from '../components/VoiceSelector';
import { StandardHeader } from '../components/StandardHeader';
import {
  storageService,
  ttsService,
  backgroundMusicService,
  dataSeedingService,
} from '../services';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../types';
import { logger } from '../utils/logger';

interface SettingsScreenProps {
  onBack?: () => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onSettingsChange,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [_isBackgroundMusicAvailable, setIsBackgroundMusicAvailable] =
    useState(false);

  useEffect(() => {
    loadSettings();
    loadAvailableVoices();
    checkBackgroundMusicAvailability();
  }, [currentLanguage]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      logger.debug('SettingsScreen: Platform.OS:', Platform.OS);
      const loadedSettings = await storageService.loadSettings();
      logger.debug('SettingsScreen: Loaded settings:', loadedSettings);
      if (loadedSettings) {
        // Ensure volume is set correctly for Android (fixed at 1.0)
        if (
          Platform.OS === 'android' &&
          loadedSettings.tts.defaultVolume !== 1.0
        ) {
          loadedSettings.tts.defaultVolume = 1.0;
          await storageService.saveSettings(loadedSettings);
          logger.debug('SettingsScreen: Set volume to 1.0 for Android');
        }
        setSettings(loadedSettings);
        logger.debug(
          'SettingsScreen: Current voicesPerLanguage:',
          loadedSettings.tts?.voicesPerLanguage
        );
        logger.debug('SettingsScreen: Current language:', currentLanguage);
        logger.debug(
          'SettingsScreen: Voice for current language:',
          loadedSettings.tts?.voicesPerLanguage?.[currentLanguage]
        );
      } else {
        logger.debug('SettingsScreen: No settings loaded, using defaults');
        const defaultSettings = { ...DEFAULT_APP_SETTINGS };
        // Set volume for Android (fixed at 1.0)
        if (Platform.OS === 'android') {
          defaultSettings.tts.defaultVolume = 1.0;
        }
        setSettings(defaultSettings);
      }
    } catch (error) {
      logger.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableVoices = async () => {
    try {
      const voices = await ttsService.getAvailableVoices(currentLanguage);
      setAvailableVoices(voices);
      logger.debug(
        'SettingsScreen: Loaded voices for',
        currentLanguage,
        ':',
        voices.length
      );
    } catch (error) {
      logger.error('Failed to load voices:', error);
      setAvailableVoices([]);
    }
  };

  const checkBackgroundMusicAvailability = async () => {
    try {
      const isAvailable = backgroundMusicService.isBackgroundMusicAvailable();
      setIsBackgroundMusicAvailable(isAvailable);
      logger.debug('SettingsScreen: Background music available:', isAvailable);
    } catch (error) {
      logger.error('Failed to check background music availability:', error);
      setIsBackgroundMusicAvailable(false);
    }
  };

  const getSelectedVoiceName = (): string => {
    const selectedVoiceId =
      settings.tts.voicesPerLanguage?.[currentLanguage] ||
      settings.tts.defaultVoice;

    if (!selectedVoiceId || selectedVoiceId === 'default') {
      return t('settings.defaultVoice', 'Default');
    }

    // Find the voice in available voices to get the friendly name
    const selectedVoice = availableVoices.find(
      voice =>
        voice.identifier === selectedVoiceId ||
        voice.originalName === selectedVoiceId ||
        voice.name === selectedVoiceId
    );

    if (selectedVoice) {
      return selectedVoice.name; // This is the friendly name
    }

    // Fallback to the identifier if not found
    return selectedVoiceId;
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await storageService.saveSettings(newSettings);
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
    } catch (error) {
      logger.error('Failed to save settings:', error);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    }
  };

  const handleVoiceSelect = (voice: any) => {
    const voiceIdentifier = voice.identifier;

    const newSettings = {
      ...settings,
      tts: {
        ...settings.tts,
        voicesPerLanguage: {
          ...settings.tts.voicesPerLanguage,
          [currentLanguage]: voiceIdentifier,
        },
        // Clear defaultVoice since we're now using voicesPerLanguage
        defaultVoice: 'default',
      },
    };

    logger.debug('SettingsScreen: New settings with voice:', {
      voicesPerLanguage: newSettings.tts.voicesPerLanguage,
      currentLanguage,
      voiceIdentifier,
    });

    saveSettings(newSettings);
  };

  const openVoiceSelector = () => {
    setShowVoiceSelector(true);
  };

  const handleTTSChange = (ttsConfig: Partial<AppSettings['tts']>) => {
    const newSettings = {
      ...settings,
      tts: { ...settings.tts, ...ttsConfig },
    };
    saveSettings(newSettings);
  };

  const handleAudioChange = (audioConfig: Partial<AppSettings['audio']>) => {
    const newSettings = {
      ...settings,
      audio: { ...settings.audio, ...audioConfig },
    };
    saveSettings(newSettings);
  };

  const handleResetSettings = () => {
    Alert.alert(t('settings.resetSettings'), t('settings.resetConfirm'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.reset'),
        style: 'destructive',
        onPress: () => {
          const defaultSettings: AppSettings = DEFAULT_APP_SETTINGS;
          saveSettings(defaultSettings);
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(t('settings.clearData'), t('settings.clearDataConfirm'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.clear'),
        style: 'destructive',
        onPress: async () => {
          try {
            await storageService.clearAllData();
            Alert.alert(t('common.success'), t('settings.dataCleared'));
          } catch (error) {
            logger.error('Failed to clear data:', error);
            Alert.alert(t('common.error'), t('settings.clearDataFailed'));
          }
        },
      },
    ]);
  };

  const handleReseedData = () => {
    logger.debug('handleReseedData called');

    const confirmMessage =
      'This will reset all data and create new multi-language sessions. Continue?';
    const successMessage =
      'Data re-seeded successfully with new multi-language sessions!';
    const errorMessage = 'Failed to re-seed data. Please try again.';

    const performReseed = () => {
      logger.debug('Re-seed button pressed, starting reseed...');
      dataSeedingService
        .reseedData()
        .then(() => {
          logger.debug('Re-seed completed successfully');
          if (Platform.OS === 'web') {
            alert(successMessage);
          } else {
            Alert.alert('Success', successMessage);
          }
        })
        .catch(error => {
          logger.error('Failed to re-seed data:', error);
          if (Platform.OS === 'web') {
            alert(errorMessage);
          } else {
            Alert.alert('Error', errorMessage);
          }
        });
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        performReseed();
      }
    } else {
      Alert.alert('Re-seed Data', confirmMessage, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: performReseed },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <StandardHeader
        title={t('settings.title')}
        onBack={onBack}
        showLanguageSelector={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* TTS Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.tts')}</Text>

          {/* Voice Selection */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              {t('settings.voice', 'Voice')}
            </Text>
            <View style={styles.voiceSelectionContainer}>
              <Text
                style={styles.voiceDisplayText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getSelectedVoiceName()}
              </Text>
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={openVoiceSelector}
              >
                <Text style={styles.voiceButtonText}>
                  🎤 {t('settings.selectVoice', 'Select')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TTS Rate Slider */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.ttsRate')}</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {settings.tts.defaultRate.toFixed(1)}x
              </Text>
              <View style={styles.sliderWrapper}>
                <View style={styles.sliderTrack}>
                  <View
                    style={[
                      styles.sliderFill,
                      {
                        width: `${((settings.tts.defaultRate - 0.1) / 1.9) * 100}%`,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderThumb,
                      {
                        left: `${((settings.tts.defaultRate - 0.1) / 1.9) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => {
                    const newRate = Math.max(
                      0.1,
                      settings.tts.defaultRate - 0.1
                    );
                    handleTTSChange({ defaultRate: newRate });
                  }}
                >
                  <Text style={styles.sliderButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => {
                    const newRate = Math.min(
                      2.0,
                      settings.tts.defaultRate + 0.1
                    );
                    handleTTSChange({ defaultRate: newRate });
                  }}
                >
                  <Text style={styles.sliderButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* TTS Pitch Slider */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.ttsPitch')}</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {settings.tts.defaultPitch.toFixed(1)}
              </Text>
              <View style={styles.sliderWrapper}>
                <View style={styles.sliderTrack}>
                  <View
                    style={[
                      styles.sliderFill,
                      { width: `${(settings.tts.defaultPitch / 2.0) * 100}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderThumb,
                      { left: `${(settings.tts.defaultPitch / 2.0) * 100}%` },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => {
                    const newPitch = Math.max(
                      0.0,
                      settings.tts.defaultPitch - 0.1
                    );
                    handleTTSChange({ defaultPitch: newPitch });
                  }}
                >
                  <Text style={styles.sliderButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => {
                    const newPitch = Math.min(
                      2.0,
                      settings.tts.defaultPitch + 0.1
                    );
                    handleTTSChange({ defaultPitch: newPitch });
                  }}
                >
                  <Text style={styles.sliderButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* TTS Volume Slider */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>{t('settings.ttsVolume')}</Text>
              {Platform.OS === 'android' && (
                <Text style={styles.settingLabelNote}>
                  ({t('settings.volumeFixed', { platform: 'Android' })})
                </Text>
              )}
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {Math.round(settings.tts.defaultVolume * 100)}%
              </Text>
              {Platform.OS === 'android' ? (
                <View style={styles.disabledSliderWrapper}>
                  <View style={styles.sliderTrack}>
                    <View style={[styles.sliderFill, { width: '100%' }]} />
                  </View>
                </View>
              ) : (
                <View style={styles.sliderWrapper}>
                  <View style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderFill,
                        { width: `${settings.tts.defaultVolume * 100}%` },
                      ]}
                    />
                    <View
                      style={[
                        styles.sliderThumb,
                        { left: `${settings.tts.defaultVolume * 100}%` },
                      ]}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.sliderButton}
                    onPress={() => {
                      const newVolume = Math.max(
                        0.0,
                        settings.tts.defaultVolume - 0.1
                      );
                      handleTTSChange({ defaultVolume: newVolume });
                    }}
                  >
                    <Text style={styles.sliderButtonText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sliderButton}
                    onPress={() => {
                      const newVolume = Math.min(
                        1.0,
                        settings.tts.defaultVolume + 0.1
                      );
                      handleTTSChange({ defaultVolume: newVolume });
                    }}
                  >
                    <Text style={styles.sliderButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Statement Delay Slider */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              {t('settings.statementDelay', 'Statement Delay')}
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {settings.tts.defaultPauseBetweenStatements.toFixed(1)}s
              </Text>
              <View style={styles.sliderWrapper}>
                <View style={styles.sliderTrack}>
                  <View
                    style={[
                      styles.sliderFill,
                      {
                        width: `${(settings.tts.defaultPauseBetweenStatements / 10.0) * 100}%`,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderThumb,
                      {
                        left: `${(settings.tts.defaultPauseBetweenStatements / 10.0) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => {
                    const newDelay = Math.max(
                      0.0,
                      settings.tts.defaultPauseBetweenStatements - 0.5
                    );
                    handleTTSChange({
                      defaultPauseBetweenStatements: newDelay,
                    });
                  }}
                >
                  <Text style={styles.sliderButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => {
                    const newDelay = Math.min(
                      10.0,
                      settings.tts.defaultPauseBetweenStatements + 0.5
                    );
                    handleTTSChange({
                      defaultPauseBetweenStatements: newDelay,
                    });
                  }}
                >
                  <Text style={styles.sliderButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.audio')}</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              {t('settings.audioQuality')}
            </Text>
            <Text style={styles.settingValue}>
              {t(`settings.${settings.audio.audioQuality}`)}
            </Text>
          </View>

          {/* Background Music Settings */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>
                {t('settings.backgroundMusic')}
              </Text>
            </View>
            <Switch
              value={settings.audio.backgroundMusic?.enabled || false}
              onValueChange={enabled =>
                handleAudioChange({
                  backgroundMusic: {
                    ...settings.audio.backgroundMusic,
                    enabled,
                    volume: settings.audio.backgroundMusic?.volume || 0.3,
                  },
                })
              }
            />
          </View>

          {settings.audio.backgroundMusic?.enabled && (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <Text style={styles.settingLabel}>
                    {t('settings.backgroundMusicVolume')}
                  </Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>
                    {Math.round(
                      (settings.audio.backgroundMusic?.volume || 0.3) * 100
                    )}
                    %
                  </Text>
                  <View style={styles.sliderWrapper}>
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          {
                            width: `${(settings.audio.backgroundMusic?.volume || 0.3) * 100}%`,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.sliderThumb,
                          {
                            left: `${(settings.audio.backgroundMusic?.volume || 0.3) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() => {
                        const currentVolume =
                          settings.audio.backgroundMusic?.volume || 0.3;
                        const newVolume = Math.max(0.0, currentVolume - 0.1);
                        handleAudioChange({
                          backgroundMusic: {
                            ...settings.audio.backgroundMusic,
                            enabled: true,
                            volume: newVolume,
                          },
                        });
                      }}
                    >
                      <Text style={styles.sliderButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() => {
                        const currentVolume =
                          settings.audio.backgroundMusic?.volume || 0.3;
                        const newVolume = Math.min(1.0, currentVolume + 0.1);
                        handleAudioChange({
                          backgroundMusic: {
                            ...settings.audio.backgroundMusic,
                            enabled: true,
                            volume: newVolume,
                          },
                        });
                      }}
                    >
                      <Text style={styles.sliderButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Background Music Attribution */}
              <View style={styles.attributionContainer}>
                <Text style={styles.attributionTitle}>🎵 Background Music</Text>
                <Text style={styles.attributionText}>
                  "Breath of Life_5 minutes" by grand_project
                </Text>
                <Text style={styles.attributionText}>
                  Licensed under Pixabay License
                </Text>
                <Text style={styles.attributionLink}>
                  Source:
                  https://pixabay.com/de/music/meditation-spirituell-breath-of-life-5-minutes-320858/
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.actions')}</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleResetSettings}
          >
            <Text style={styles.actionButtonText}>
              {t('settings.resetSettings')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.warningButton]}
            onPress={handleReseedData}
          >
            <Text style={[styles.actionButtonText, styles.warningButtonText]}>
              Re-seed Data (Multi-language)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearData}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              {t('settings.clearData')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Voice Selector Modal */}
      <VoiceSelector
        visible={showVoiceSelector}
        language={currentLanguage}
        selectedVoice={
          settings.tts.voicesPerLanguage?.[currentLanguage] ||
          settings.tts.defaultVoice
        }
        onVoiceSelect={handleVoiceSelect}
        onClose={() => setShowVoiceSelector(false)}
        currentSettings={{
          rate: settings.tts.defaultRate,
          pitch: settings.tts.defaultPitch,
          volume: settings.tts.defaultVolume,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    marginLeft: 16,
  },
  actionButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  warningButton: {
    backgroundColor: '#FFF3E0',
  },
  warningButtonText: {
    color: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  dangerButtonText: {
    color: '#F44336',
  },
  sliderContainer: {
    flex: 1,
    marginLeft: 16,
  },
  sliderValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 8,
    fontWeight: '600',
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    position: 'relative',
    marginHorizontal: 8,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: '#4CAF50',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -9,
  },
  sliderButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sliderButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  voiceSelectionContainer: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  voiceDisplayText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
    alignSelf: 'flex-end',
  },
  voiceButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledSliderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  disabledSliderText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabelNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  attributionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  attributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  attributionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    lineHeight: 16,
  },
  attributionLink: {
    fontSize: 11,
    color: '#2196F3',
    marginTop: 4,
    lineHeight: 14,
  },
});
