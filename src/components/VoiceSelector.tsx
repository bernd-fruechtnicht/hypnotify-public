/**
 * Voice Selector Component
 * Allows users to select TTS voices per language with sample playback
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ttsService } from '../services';

interface Voice {
  identifier: string; // Expo-speech identifier for TTS calls
  name: string; // Friendly display name for UI
  lang: string; // Language code
}

interface VoiceSelectorProps {
  language: string;
  selectedVoice?: string;
  onVoiceSelect: (voice: Voice) => void;
  onClose: () => void;
  visible: boolean;
  currentSettings?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  };
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  language,
  selectedVoice,
  onVoiceSelect,
  onClose,
  visible,
  currentSettings,
}) => {
  const { t } = useTranslation();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadVoices();
    }
  }, [visible, language]);

  const loadVoices = async () => {
    setLoading(true);
    try {
      const availableVoices = await ttsService.getAvailableVoices(language);
      setVoices(availableVoices);
    } catch (error) {
      console.error('VoiceSelector: Failed to load voices:', error);
      Alert.alert(
        t('voiceSelector.error'),
        t('voiceSelector.loadError', 'Failed to load voices. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const playSample = async (voice: Voice) => {
    if (playingVoice === voice.identifier) {
      await ttsService.stop();
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voice.identifier);
    try {
      await ttsService.stop();

      const sampleText = getSampleText(language);
      await ttsService.speak(sampleText, {
        voice: voice.identifier,
        language: voice.lang || language,
        rate: currentSettings?.rate ?? 1.0,
        pitch: currentSettings?.pitch ?? 1.0,
        volume: currentSettings?.volume ?? 0.8,
      });
    } catch (error) {
      console.error('VoiceSelector: Failed to play sample:', error);
      Alert.alert(
        t('voiceSelector.error'),
        t('voiceSelector.playError', 'Failed to play voice sample.')
      );
    } finally {
      setPlayingVoice(null);
    }
  };

  const getSampleText = (lang: string): string => {
    const samples: Record<string, string> = {
      en: 'Hello, this is a sample of the English voice.',
      de: 'Hallo, das ist eine Probe der deutschen Stimme.',
      zh: '你好，这是中文语音的示例。',
    };
    return samples[lang] || samples['en'];
  };

  const handleVoiceSelect = (voice: Voice) => {
    onVoiceSelect(voice);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('voiceSelector.title', 'Select Voice')} -{' '}
              {language.toUpperCase()}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196f3" />
              <Text style={styles.loadingText}>
                {t('voiceSelector.loading', 'Loading voices...')}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.voiceList}>
              {voices.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {t(
                      'voiceSelector.noVoices',
                      'No voices available for this language.'
                    )}
                  </Text>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={loadVoices}
                  >
                    <Text style={styles.refreshButtonText}>
                      {t('voiceSelector.refresh', 'Refresh')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                voices.map((voice, index) => (
                  <View key={index} style={styles.voiceItem}>
                    <View style={styles.voiceInfo}>
                      <Text style={styles.voiceName}>{voice.name}</Text>
                      <Text style={styles.voiceDetails}>{voice.lang}</Text>
                    </View>

                    <View style={styles.voiceActions}>
                      <TouchableOpacity
                        style={[
                          styles.playButton,
                          playingVoice === voice.identifier &&
                            styles.playingButton,
                        ]}
                        onPress={() => playSample(voice)}
                      >
                        <Text style={styles.playButtonText}>
                          {playingVoice === voice.identifier ? '⏹' : '▶️'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          selectedVoice === voice.identifier &&
                            styles.selectedButton,
                        ]}
                        onPress={() => handleVoiceSelect(voice)}
                      >
                        <Text
                          style={[
                            styles.selectButtonText,
                            selectedVoice === voice.identifier &&
                              styles.selectedButtonText,
                          ]}
                        >
                          {selectedVoice === voice.identifier
                            ? '✓'
                            : t('voiceSelector.select', 'Select')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  voiceList: {
    maxHeight: 400,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  voiceDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  voiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  playingButton: {
    backgroundColor: '#ff5722',
  },
  playButtonText: {
    fontSize: 16,
  },
  selectButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedButton: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedButtonText: {
    color: 'white',
  },
});
