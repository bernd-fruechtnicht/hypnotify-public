import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  // Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { logger } from '../utils/logger';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import {
  storageService,
  backgroundMusicService,
  ttsService,
} from '../services';
import { DEFAULT_APP_SETTINGS } from '../types/AppSettings';
import { BackgroundMusicSetup } from '../components/BackgroundMusicSetup';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const scrollViewRef = useRef<ScrollView>(null);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      stopAllAudio().catch(error => {
        logger.warn('OnboardingScreen: Error in cleanup:', error);
      });
    };
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.description'),
      icon: '🧘‍♀️',
      color: '#4CAF50',
    },
    {
      id: 'features',
      title: t('onboarding.features.title'),
      description: t('onboarding.features.description'),
      icon: '✨',
      color: '#2196F3',
    },
    {
      id: 'personalization',
      title: t('onboarding.personalization.title'),
      description: t('onboarding.personalization.description'),
      icon: '🎯',
      color: '#FF9800',
    },
    {
      id: 'language',
      title: t('onboarding.language.title'),
      description: t('onboarding.language.description'),
      icon: '🌍',
      color: '#9C27B0',
    },
    {
      id: 'backgroundMusic',
      title: t('onboarding.backgroundMusic.title'),
      description: t('onboarding.backgroundMusic.description'),
      icon: '🎵',
      color: '#E91E63',
    },
    {
      id: 'ready',
      title: t('onboarding.ready.title'),
      description: t('onboarding.ready.description'),
      icon: '🚀',
      color: '#F44336',
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Stop audio when navigating away from background music step
      if (steps[currentStep].id === 'backgroundMusic') {
        await stopAllAudio();
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 0) {
      // Stop audio when navigating away from background music step
      if (steps[currentStep].id === 'backgroundMusic') {
        await stopAllAudio();
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const stopAllAudio = async () => {
    try {
      // Stop background music
      await backgroundMusicService.stop();
      logger.debug('OnboardingScreen: Stopped background music');

      // Stop any ongoing TTS
      await ttsService.stop();
      logger.debug('OnboardingScreen: Stopped TTS');
    } catch (error) {
      logger.warn('OnboardingScreen: Error stopping audio:', error);
    }
  };

  const handleSkip = async () => {
    await stopAllAudio();
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      // Stop all audio before completing
      await stopAllAudio();

      // Load existing settings first to preserve any changes made during onboarding
      const existingSettings = await storageService.loadSettings();

      // Save onboarding completion, ONLY updating the language and preserving all other settings
      // Use default settings as fallback to ensure all required fields are present
      await storageService.saveSettings({
        ...DEFAULT_APP_SETTINGS,
        ...existingSettings,
        language: selectedLanguage,
        updatedAt: new Date(),
      });

      // Mark onboarding as completed - settings already saved above

      onComplete();
    } catch (error) {
      logger.error('Failed to complete onboarding:', error);
      // Still complete onboarding even if saving fails
      onComplete();
    }
  };

  const _handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                backgroundColor: currentStepData.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} / {steps.length}
        </Text>
      </View>

      {/* Skip Button */}
      {!isLastStep && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepContainer}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: currentStepData.color },
            ]}
          >
            <Text style={styles.icon}>{currentStepData.icon}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{currentStepData.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{currentStepData.description}</Text>

          {/* Safety notice on welcome page */}
          {currentStepData.id === 'welcome' && (
            <View style={styles.safetyNotice}>
              <Text style={styles.safetyNoticeText}>
                {t('onboarding.welcome.safetyNotice')}
              </Text>
            </View>
          )}

          {/* Step-specific content */}
          {currentStepData.id === 'features' && (
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎵</Text>
                <Text style={styles.featureText}>
                  {t('onboarding.features.tts')}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📚</Text>
                <Text style={styles.featureText}>
                  {t('onboarding.features.library')}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎧</Text>
                <Text style={styles.featureText}>
                  {t('onboarding.features.audio')}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔧</Text>
                <Text style={styles.featureText}>
                  {t('onboarding.features.customization')}
                </Text>
              </View>
            </View>
          )}

          {currentStepData.id === 'personalization' && (
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📝</Text>
                <Text style={styles.featureText}>
                  {t('onboarding.personalization.modifyStatements')}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔄</Text>
                <Text style={styles.featureText}>
                  {t('onboarding.personalization.determineOrder')}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎧</Text>
                <Text style={styles.featureText}>
                  {t('onboarding.personalization.stereoStatements')}
                </Text>
              </View>
            </View>
          )}

          {currentStepData.id === 'language' && (
            <View style={styles.languageContainer}>
              <LanguageSelector
                visible={true}
                embedded={true}
                onClose={() => {
                  // Language selector is always visible in onboarding, no need to close
                }}
              />
            </View>
          )}

          {currentStepData.id === 'backgroundMusic' && (
            <View style={styles.backgroundMusicContainer}>
              <BackgroundMusicSetup scrollViewRef={scrollViewRef} />
            </View>
          )}

          {currentStepData.id === 'ready' && (
            <View style={styles.readyContainer}>
              <View style={styles.readyItem}>
                <Text style={styles.readyIcon}>✅</Text>
                <Text style={styles.readyText}>
                  {t('onboarding.ready.setupComplete')}
                </Text>
              </View>
              <View style={styles.readyItem}>
                <Text style={styles.readyIcon}>🎯</Text>
                <Text style={styles.readyText}>
                  {t('onboarding.ready.startMeditating')}
                </Text>
              </View>
              <View style={styles.readyItem}>
                <Text style={styles.readyIcon}>🌱</Text>
                <Text style={styles.readyText}>
                  {t('onboarding.ready.beginJourney')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <View style={styles.navigationButtons}>
          {!isFirstStep && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>
                {t('common.previous')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: currentStepData.color },
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? t('onboarding.getStarted') : t('common.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const { width: _width, height: _height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  skipButton: {
    position: 'absolute',
    top: 80,
    right: 20,
    padding: 8,
    zIndex: 1,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresList: {
    width: '100%',
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  languageContainer: {
    width: '100%',
    marginTop: -10,
  },
  backgroundMusicContainer: {
    width: '100%',
    marginTop: 20,
  },
  readyContainer: {
    width: '100%',
    marginTop: 20,
  },
  readyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    marginBottom: 12,
  },
  readyIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  readyText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  navigation: {
    padding: 20,
    paddingBottom: 40,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  previousButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  nextButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  safetyNotice: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    width: '100%',
  },
  safetyNoticeText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
