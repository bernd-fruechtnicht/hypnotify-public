import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  BackHandler,
  Modal,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import './src/services/i18n'; // Initialize i18n first
// Trigger Vercel deployment
import { useTranslation } from 'react-i18next';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { LanguageFlagSelector } from './src/components/LanguageFlagSelector';
import { ServiceTester } from './src/components/ServiceTester';
import { SessionManager } from './src/components/SessionManager';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SessionEditScreen } from './src/screens/SessionEditScreen';
import { StereoSessionScreen } from './src/screens/StereoSessionScreen';
import { initializeServices, getServiceHealth } from './src/services';
import { MeditationSession } from './src/types';
import { logger } from './src/utils/logger';

type AppScreen =
  | 'home'
  | 'library'
  | 'player'
  | 'settings'
  | 'onboarding'
  | 'mySessions'
  | 'stereo'
  | 'stereoSession';

const AppContent: React.FC = () => {
  const { t, ready } = useTranslation();
  // const { } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [showServiceTester, setShowServiceTester] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [showSessionEdit, setShowSessionEdit] = useState(false);
  const [editingSession, setEditingSession] =
    useState<MeditationSession | null>(null);
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<{
    tts: boolean;
    audio: boolean;
    storage: boolean;
  } | null>(null);
  const [currentSession, setCurrentSession] =
    useState<MeditationSession | null>(null);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'home') {
        // If on home screen, let the system handle it (close app)
        return false;
      } else {
        // Navigate back to home screen
        setCurrentScreen('home');
        return true; // Prevent default behavior
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen]);

  const handleSessionSelect = (session: MeditationSession) => {
    setCurrentSession(session);
    setCurrentScreen('player');
  };

  const handleSessionEdit = (session: MeditationSession) => {
    logger.debug('handleSessionEdit called with session:', session.name);
    setEditingSession(session);
    setShowSessionManager(false);
    setShowSessionEdit(true);
  };

  const handleSessionSave = async (session: MeditationSession) => {
    try {
      const { storageService } = await import('./src/services');
      await storageService.saveSession(session);
      setEditingSession(null);
      setShowSessionEdit(false);
      setShowSessionManager(true); // Return to Session Manager
    } catch (error) {
      logger.error('Failed to save session:', error);
    }
  };

  const handleSessionEditCancel = () => {
    setEditingSession(null);
    setShowSessionEdit(false);
    setShowSessionManager(true); // Return to Session Manager
  };

  // Initialize services
  useEffect(() => {
    const initServices = async () => {
      try {
        await initializeServices();
        setServicesInitialized(true);

        // Get service health status
        const health = await getServiceHealth();
        setServiceHealth(health);
      } catch (error) {
        logger.error('Failed to initialize services:', error);
        setServicesInitialized(true); // Still show the app even if services fail
      }
    };

    initServices();
  }, []);

  // Wait for i18n and services to be ready
  if (!ready || !servicesInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.title}>Loading...</Text>
          <Text style={styles.loadingText}>
            {!ready ? 'Initializing translations...' : 'Setting up services...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render different screens based on currentScreen state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'library':
        return (
          <View style={styles.screenContainer}>
            <LibraryScreen
              onStatementSelect={statement => {
                logger.debug('Selected statement:', statement);
              }}
              onStatementEdit={statement => {
                logger.debug('Edit statement:', statement);
              }}
              onStatementDelete={statement => {
                logger.debug('Delete statement:', statement);
              }}
              onBack={() => setCurrentScreen('home')}
            />
          </View>
        );
      case 'player':
        return currentSession ? (
          <View style={styles.screenContainer}>
            <PlayerScreen
              session={currentSession}
              onSessionComplete={() => {
                logger.debug('Session completed');
                // Player will stay open and rewind automatically
              }}
              onSessionPause={() => logger.debug('Session paused')}
              onSessionResume={() => logger.debug('Session resumed')}
              onSessionStop={() => {
                setCurrentSession(null);
                setCurrentScreen('home');
              }}
              onBack={() => setCurrentScreen('home')}
            />
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No session to play</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.screenContainer}>
            <SettingsScreen
              onBack={() => setCurrentScreen('home')}
              onSettingsChange={settings => {
                logger.debug('Settings changed:', settings);
              }}
            />
          </View>
        );
      case 'stereo':
        return (
          <View style={styles.screenContainer}>
            <StereoSessionScreen
              onBack={() => setCurrentScreen('home')}
              onSessionComplete={session => {
                logger.debug('Stereo session completed:', session);
                setCurrentScreen('home');
              }}
            />
          </View>
        );
      case 'mySessions':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>⭐</Text>
              <Text style={styles.placeholderTitle}>
                {t('mySessions.title')}
              </Text>
              <Text style={styles.placeholderSubtitle}>
                {t('mySessions.subtitle')}
              </Text>
              <Text style={styles.placeholderText}>
                {t('mySessions.noFavorites')}
              </Text>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentScreen('home')}
              >
                <Text style={styles.backButtonText}>← {t('common.back')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'stereoSession':
        return (
          <StereoSessionScreen
            onBack={() => setCurrentScreen('home')}
            onSessionComplete={session => {
              logger.debug('Stereo session completed:', session.name);
              setCurrentScreen('home');
            }}
          />
        );
      case 'onboarding':
        return <OnboardingScreen onComplete={() => setCurrentScreen('home')} />;
      default:
        return (
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <LanguageFlagSelector />
            </View>
            <Text style={styles.title}>{t('app.name')}</Text>
            <Text style={styles.tagline}>{t('app.tagline')}</Text>

            <ScrollView
              style={styles.menuContainer}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setCurrentScreen('onboarding')}
              >
                <Text style={styles.menuButtonIcon}>🚀</Text>
                <Text style={styles.menuButtonText}>
                  {t('onboarding.title')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowSessionManager(true)}
              >
                <Text style={styles.menuButtonIcon}>🔧</Text>
                <Text style={styles.menuButtonText}>
                  {t('sessionManager.title')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setCurrentScreen('stereoSession')}
              >
                <Text style={styles.menuButtonIcon}>🎧</Text>
                <Text style={styles.menuButtonText}>
                  {t('stereo.title', 'Stereo Meditation')}
                </Text>
              </TouchableOpacity>

              {/* My Sessions menu item hidden for demo */}
              {/* <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setCurrentScreen('mySessions')}
              >
                <Text style={styles.menuButtonIcon}>⭐</Text>
                <Text style={styles.menuButtonText}>
                  {t('mySessions.title')}
                </Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setCurrentScreen('library')}
              >
                <Text style={styles.menuButtonIcon}>📚</Text>
                <Text style={styles.menuButtonText}>{t('library.title')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setCurrentScreen('settings')}
              >
                <Text style={styles.menuButtonIcon}>⚙️</Text>
                <Text style={styles.menuButtonText}>{t('settings.title')}</Text>
              </TouchableOpacity>

              {/* Test Services menu item hidden for demo */}
              {/* <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowServiceTester(true)}
              >
                <Text style={styles.menuButtonIcon}>🧪</Text>
                <Text style={styles.menuButtonText}>
                  {t('welcome.testServices')}
                </Text>
              </TouchableOpacity> */}
            </ScrollView>

            <Text style={styles.welcomeText}>{t('welcome.message')}</Text>

            {serviceHealth && (
              <View style={styles.serviceStatus}>
                <Text style={styles.serviceStatusTitle}>Service Status:</Text>
                <Text
                  style={[
                    styles.serviceStatusItem,
                    serviceHealth.tts && styles.serviceStatusOk,
                  ]}
                >
                  TTS: {serviceHealth.tts ? '✓' : '✗'}
                </Text>
                <Text
                  style={[
                    styles.serviceStatusItem,
                    serviceHealth.audio && styles.serviceStatusOk,
                  ]}
                >
                  Audio: {serviceHealth.audio ? '✓' : '✗'}
                </Text>
                <Text
                  style={[
                    styles.serviceStatusItem,
                    serviceHealth.storage && styles.serviceStatusOk,
                  ]}
                >
                  Storage: {serviceHealth.storage ? '✓' : '✗'}
                </Text>
              </View>
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderScreen()}

      <ServiceTester
        visible={showServiceTester}
        onClose={() => setShowServiceTester(false)}
      />

      <SessionManager
        visible={showSessionManager}
        onClose={() => setShowSessionManager(false)}
        onSessionSelect={handleSessionSelect}
        onSessionDelete={sessionId => {
          logger.debug('Session deleted:', sessionId);
          // Optionally refresh the session list or update UI
        }}
        onSessionEdit={handleSessionEdit}
      />

      <Modal
        visible={showSessionEdit}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SessionEditScreen
          session={editingSession}
          onSave={handleSessionSave}
          onCancel={handleSessionEditCancel}
        />
      </Modal>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    position: 'absolute',
    top: 12,
    right: 20,
    zIndex: 1000,
  },
  screenContainer: {
    flex: 1,
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  languageInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  languageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  languageValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196f3',
  },
  menuContainer: {
    width: '100%',
    maxHeight: 400,
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  menuButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  languageButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  serviceStatus: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  serviceStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  serviceStatusItem: {
    fontSize: 12,
    color: '#f44336',
    marginVertical: 2,
  },
  serviceStatusOk: {
    color: '#4caf50',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
});
