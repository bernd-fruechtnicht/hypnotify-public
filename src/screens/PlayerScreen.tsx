import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { logger } from '../utils/logger';
import { useLanguage } from '../contexts/LanguageContext';
import { StandardHeader } from '../components/StandardHeader';
import { AudioPlayer, AudioPlayerRef } from '../components/AudioPlayer';
import { StatementCard } from '../components/StatementCard';
import { storageService, backgroundMusicService } from '../services';
import {
  MeditationSession,
  MeditationStatement,
  getSessionName,
  getSessionDescription,
} from '../types';

interface PlayerScreenProps {
  session: MeditationSession;
  onSessionComplete?: (session: MeditationSession) => void;
  onSessionPause?: (session: MeditationSession) => void;
  onSessionResume?: (session: MeditationSession) => void;
  onSessionStop?: (session: MeditationSession) => void;
  onBack?: () => void;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({
  session,
  onSessionComplete,
  onSessionPause,
  onSessionResume,
  onSessionStop,
  onBack,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [statements, setStatements] = useState<MeditationStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatementsList, setShowStatementsList] = useState(false);
  const [_currentStatementIndex, _setCurrentStatementIndex] = useState(0);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    loadSessionStatements();
  }, [session]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Cleanup effect to stop background music when component unmounts
  useEffect(() => {
    return () => {
      // Stop background music when component unmounts
      backgroundMusicService.stop().catch(error => {
        logger.debug('Failed to stop background music on unmount:', error);
      });
    };
  }, []);

  const loadSessionStatements = async () => {
    try {
      setIsLoading(true);
      const allStatements = await storageService.loadStatements();

      // Filter statements based on session's statementIds
      const sessionStatements = session.statementIds
        .map(id => allStatements.find(statement => statement.id === id))
        .filter(
          (statement): statement is MeditationStatement =>
            statement !== undefined
        );

      setStatements(sessionStatements);
    } catch (error) {
      logger.error('Failed to load session statements:', error);
      Alert.alert(t('common.error'), t('player.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionComplete = () => {
    onSessionComplete?.(session);

    // Show completion toast
    Toast.show({
      type: 'success',
      text1: t('player.sessionComplete'),
      text2: t('player.sessionCompleteMessage'),
      visibilityTime: 3000,
      text1Style: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      text2Style: {
        fontSize: 16,
      },
    });

    // Rewind the player (like stop button function)
    audioPlayerRef.current?.stop();
  };

  const handleSessionPause = () => {
    onSessionPause?.(session);
  };

  const handleSessionResume = () => {
    onSessionResume?.(session);
  };

  const handleSessionStop = () => {
    logger.debug('PlayerScreen: handleSessionStop called');

    // Prevent multiple simultaneous stop operations
    if (isStoppingRef.current) {
      logger.debug('PlayerScreen: Stop already in progress, ignoring');
      return;
    }

    isStoppingRef.current = true;

    // For web/electron, we might want to skip the alert and stop directly
    // or use a different confirmation method
    const stopSession = async () => {
      try {
        // Stop the audio player first
        logger.debug('PlayerScreen: Stopping audio player...');
        await audioPlayerRef.current?.stop();
        logger.debug('PlayerScreen: Audio player stopped successfully');
      } catch (error) {
        logger.error('PlayerScreen: Error stopping audio player:', error);
      } finally {
        // Reset the stopping flag
        isStoppingRef.current = false;
      }
      // Call onSessionStop to properly close the session
      onSessionStop?.(session);
      onBack?.();
    };

    // Use platform-specific confirmation
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      // Web/Electron
      const confirmed = window.confirm(
        `${t('player.stopSession')}\n\n${t('player.stopConfirm')}`
      );
      if (confirmed) {
        stopSession();
      } else {
        // User cancelled, reset the flag
        isStoppingRef.current = false;
      }
    } else {
      // Mobile - use Alert
      Alert.alert(t('player.stopSession'), t('player.stopConfirm'), [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => {
            isStoppingRef.current = false;
          },
        },
        { text: t('common.stop'), style: 'destructive', onPress: stopSession },
      ]);
    }
  };

  const endSession = async () => {
    // Prevent multiple simultaneous stop operations
    if (isStoppingRef.current) {
      return;
    }

    isStoppingRef.current = true;

    try {
      // Stop the audio player first
      await audioPlayerRef.current?.stop();
    } catch (error) {
      logger.error('PlayerScreen: Error stopping audio player:', error);
    } finally {
      // Reset the stopping flag
      isStoppingRef.current = false;
    }

    // Call onSessionStop to properly close the session
    onSessionStop?.(session);
    onBack?.();
  };

  const handleBack = () => {
    // Back button (including Android back) should end session without confirmation
    endSession();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (statements.length === 0) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['bottom']}>
        <Text style={styles.errorText}>{t('player.noStatements')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StandardHeader
        title={getSessionName(session, currentLanguage)}
        onBack={handleBack}
        subtitle={`${statements.length} ${t('common.statements')}`}
        rightElement={
          <TouchableOpacity
            style={styles.statementsToggle}
            onPress={() => setShowStatementsList(!showStatementsList)}
          >
            <Text style={styles.statementsToggleText}>
              {showStatementsList ? '👁️' : '📋'}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Session Description */}
      {getSessionDescription(session, currentLanguage) && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {getSessionDescription(session, currentLanguage)}
          </Text>
        </View>
      )}

      {/* Audio Player */}
      <View style={styles.playerContainer}>
        <AudioPlayer
          ref={audioPlayerRef}
          statements={statements}
          onSessionComplete={handleSessionComplete}
          onSessionPause={handleSessionPause}
          onSessionResume={handleSessionResume}
          onSessionStop={handleSessionStop}
          autoPlay={true}
        />
      </View>

      {/* Statements List */}
      {showStatementsList && (
        <View style={styles.statementsListContainer}>
          <View style={styles.statementsListHeader}>
            <Text style={styles.statementsListTitle}>
              {t('player.statementsList')}
            </Text>
            <TouchableOpacity
              style={styles.closeStatementsButton}
              onPress={() => setShowStatementsList(false)}
            >
              <Text style={styles.closeStatementsButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.statementsList}
            showsVerticalScrollIndicator={false}
          >
            {statements.map((statement, index) => (
              <View key={statement.id} style={styles.statementItem}>
                <View style={styles.statementNumber}>
                  <Text style={styles.statementNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.statementContent}>
                  <StatementCard
                    statement={statement}
                    compact={true}
                    showPrimaryTag={true}
                    showAdditionalTags={true}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Session Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.stopButton]}
          onPress={handleSessionStop}
        >
          <Text style={styles.actionButtonText}>⏹ {t('common.stop')}</Text>
        </TouchableOpacity>
      </View>

      {/* Toast notifications */}
      <Toast />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  statementsToggle: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  statementsToggleText: {
    fontSize: 16,
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  playerContainer: {
    flex: 1,
  },
  statementsListContainer: {
    position: 'absolute',
    top: 120, // Start below the header and description
    left: 0,
    right: 0,
    bottom: 80, // Leave space for actions at bottom
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statementsListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: width * 0.9,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  statementsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeStatementsButton: {
    padding: 8,
  },
  closeStatementsButtonText: {
    fontSize: 16,
    color: '#F44336',
  },
  statementsList: {
    backgroundColor: '#FFFFFF',
    width: width * 0.9,
    maxHeight: '70%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingBottom: 20,
  },
  statementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statementNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statementNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statementContent: {
    flex: 1,
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
