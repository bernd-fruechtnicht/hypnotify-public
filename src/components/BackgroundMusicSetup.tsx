import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { storageService, backgroundMusicService } from '../services';
import { AppSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BackgroundMusicSetupProps {
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export const BackgroundMusicSetup: React.FC<BackgroundMusicSetupProps> = ({ scrollViewRef }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMusicAvailable, setIsMusicAvailable] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    loadSettings();
    checkMusicAvailability();

    // Add cleanup for web platforms when page is about to unload
    const handleBeforeUnload = () => {
      if (isTestMode) {
        backgroundMusicService.stop().catch(error => {
          console.warn(
            'BackgroundMusicSetup: Failed to stop music on page unload:',
            error
          );
        });
      }
    };

    // Only add event listener on web platforms
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isTestMode]);

  // Separate effect for cleanup
  useEffect(() => {
    return () => {
      // Always try to stop music when component unmounts
      backgroundMusicService.stop().catch(error => {
        console.warn(
          'BackgroundMusicSetup: Failed to stop music on unmount:',
          error
        );
      });
    };
  }, []);

  // Cleanup when test mode changes
  useEffect(() => {
    return () => {
      if (isTestMode) {
        backgroundMusicService.stop().catch(error => {
          console.warn(
            'BackgroundMusicSetup: Failed to stop music on test mode change:',
            error
          );
        });
      }
    };
  }, [isTestMode]);

  const checkMusicAvailability = async () => {
    try {
      const available =
        await backgroundMusicService.isBackgroundMusicAvailableAsync();
      setIsMusicAvailable(available);
    } catch (error) {
      console.error('Failed to check music availability:', error);
      setIsMusicAvailable(false);
    }
  };

  const loadSettings = async () => {
    try {
      const loadedSettings = await storageService.loadSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundMusicToggle = async (enabled: boolean) => {
    if (!settings) return;

    try {
      const newSettings = {
        ...settings,
        audio: {
          ...settings.audio,
          backgroundMusic: {
            ...settings.audio.backgroundMusic,
            enabled,
            volume: settings.audio.backgroundMusic?.volume || 0.3,
          },
        },
      };

      await storageService.saveSettings(newSettings);
      setSettings(newSettings);
      console.log(
        'BackgroundMusicSetup: Updated background music setting:',
        enabled
      );

      // Auto-scroll to show the newly visible elements
      if (enabled && scrollViewRef) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to save background music setting:', error);
    }
  };

  const startTestMode = async () => {
    try {
      if (await backgroundMusicService.isBackgroundMusicAvailableAsync()) {
        await backgroundMusicService.setVolume(
          settings?.audio?.backgroundMusic?.volume || 0.3
        );
        await backgroundMusicService.play();
        setIsTestMode(true);
        console.log(
          'BackgroundMusicSetup: Test mode started - music playing continuously'
        );

        // Auto-scroll to show the test mode elements
        if (scrollViewRef) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        console.warn(
          'Background music not available - audio file may be missing'
        );
      }
    } catch (error) {
      console.error('Failed to start test mode:', error);
    }
  };

  const stopTestMode = async () => {
    try {
      await backgroundMusicService.stop();
      setIsTestMode(false);
      console.log('BackgroundMusicSetup: Test mode stopped - music stopped');
    } catch (error) {
      console.error('Failed to stop test mode:', error);
    }
  };

  const testSpeech = async () => {
    if (!isTestMode) {
      console.warn(
        'BackgroundMusicSetup: Cannot test speech - test mode not active'
      );
      return;
    }

    try {
      const { ttsService } = await import('../services');
      const testText = t('onboarding.backgroundMusic.testSpeechText');
      console.log(
        'BackgroundMusicSetup: Playing test speech with background music:',
        testText,
        'language:',
        currentLanguage
      );
      await ttsService.speak(testText, { language: currentLanguage });
      console.log('BackgroundMusicSetup: Test speech completed');
    } catch (error) {
      console.error('Failed to test speech:', error);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    console.log('BackgroundMusicSetup: Volume change, newVolume:', newVolume);

    // Update the volume setting
    if (!settings) return;

    try {
      const newSettings = {
        ...settings,
        audio: {
          ...settings.audio,
          backgroundMusic: {
            ...settings.audio.backgroundMusic,
            enabled: true,
            volume: newVolume,
          },
        },
      };

      await storageService.saveSettings(newSettings);
      setSettings(newSettings);
      console.log(
        'BackgroundMusicSetup: Updated background music volume:',
        newVolume
      );

      // If in test mode, update the music volume in real-time
      if (isTestMode) {
        await backgroundMusicService.setVolume(newVolume);
        console.log(
          'BackgroundMusicSetup: Updated live music volume to:',
          newVolume
        );
      }
    } catch (error) {
      console.error('Failed to save background music volume:', error);
    }
  };

  if (isLoading || !settings) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const isEnabled = settings.audio?.backgroundMusic?.enabled || false;
  const volume = settings.audio?.backgroundMusic?.volume ?? 0.3;

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>
            {t('settings.backgroundMusic')}
          </Text>
          <Text style={styles.settingDescription}>
            {t('onboarding.backgroundMusic.helpText')}
          </Text>
        </View>
        <Switch value={isEnabled} onValueChange={handleBackgroundMusicToggle} />
      </View>

      {isEnabled && (
        <View style={styles.volumeContainer}>
          <Text style={styles.volumeLabel}>
            {t('settings.backgroundMusicVolume')}: {Math.round(volume * 100)}%
          </Text>
          <View style={styles.volumeButtons}>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => handleVolumeChange(Math.max(0.0, volume - 0.1))}
            >
              <Text style={styles.volumeButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => handleVolumeChange(Math.min(1.0, volume + 0.1))}
            >
              <Text style={styles.volumeButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isEnabled && isMusicAvailable && (
        <View style={styles.testContainer}>
          {!isTestMode ? (
            <TouchableOpacity
              style={styles.startTestButton}
              onPress={startTestMode}
            >
              <Text style={styles.startTestButtonText}>
                🎵 {t('onboarding.backgroundMusic.startTestButton')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.testModeContainer}>
              <Text style={styles.testModeText}>
                🎵 {t('onboarding.backgroundMusic.testModeText')}
              </Text>
              <View style={styles.testButtonsContainer}>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={testSpeech}
                >
                  <Text style={styles.testButtonText}>
                    🗣️ {t('onboarding.backgroundMusic.testSpeechButton')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopTestMode}
                >
                  <Text style={styles.stopButtonText}>
                    ⏹️ {t('onboarding.backgroundMusic.stopButton')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {!isMusicAvailable && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ {t('onboarding.backgroundMusic.fileMissing')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  volumeContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  volumeLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  volumeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  volumeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  testContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  startTestButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  startTestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  testModeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  testModeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  testButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  testButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
  },
  stopButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
});
