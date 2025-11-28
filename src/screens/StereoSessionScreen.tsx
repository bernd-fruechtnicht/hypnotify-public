/**
 * Stereo Session Screen
 *
 * Combined editor and player for stereo meditation sessions
 * Following the established screen patterns in the codebase
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator,
  Dimensions,
  // Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { StandardHeader } from '../components/StandardHeader';
// import { StatementCard } from '../components/StatementCard';
import { SessionEditScreen } from './SessionEditScreen';
import {
  StereoSession,
  StereoSessionCategory,
  StereoSessionPlaybackState,
  StereoPlaybackStatus,
  getStereoSessionName,
  getStereoSessionDescription,
} from '../types/StereoSession';
import {
  MeditationStatement,
  getStatementText,
} from '../types/MeditationStatement';
import { stereoSessionService } from '../services/StereoSessionService';
import { stereoPlayerService } from '../services/StereoPlayerService';
import { storageService } from '../services';

interface StereoSessionScreenProps {
  session?: StereoSession;
  onBack?: () => void;
  onSessionComplete?: (session: StereoSession) => void;
}

// Component to render statements list content
const StatementsListContent: React.FC<{ session: StereoSession }> = ({
  session,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [leftStatements, setLeftStatements] = useState<MeditationStatement[]>(
    []
  );
  const [rightStatements, setRightStatements] = useState<MeditationStatement[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(
      'StatementsListContent: Loading statements for language:',
      currentLanguage
    );
    loadStatements();
  }, [session, currentLanguage]);

  const loadStatements = async () => {
    try {
      setIsLoading(true);
      console.log(
        'StatementsListContent: Loading statements for session:',
        session.id
      );
      console.log('StatementsListContent: Current language:', currentLanguage);
      const [left, right] = await Promise.all([
        stereoSessionService.getChannelStatements(session, 'left'),
        stereoSessionService.getChannelStatements(session, 'right'),
      ]);
      console.log(
        'StatementsListContent: Loaded left statements:',
        left.length
      );
      console.log(
        'StatementsListContent: Loaded right statements:',
        right.length
      );
      console.log(
        'StatementsListContent: Left statement IDs:',
        left.map(s => s.id)
      );
      console.log(
        'StatementsListContent: Right statement IDs:',
        right.map(s => s.id)
      );
      setLeftStatements(left);
      setRightStatements(right);
    } catch (error) {
      console.error('Failed to load statements:', error);
    } finally {
      setIsLoading(false);
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
    <>
      {/* Left Channel Statements */}
      <View style={styles.channelSection}>
        <Text style={styles.channelSectionTitle}>
          {t('stereo.leftChannel', 'Left Channel (Rational)')} (
          {leftStatements.length})
        </Text>
        {leftStatements.length > 0 ? (
          leftStatements.map((statement, index) => (
            <View key={statement.id} style={styles.statementItem}>
              <View style={styles.statementNumber}>
                <Text style={styles.statementNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.statementContent}>
                <Text style={styles.statementText}>
                  {getStatementText(statement, currentLanguage)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No statements added yet</Text>
          </View>
        )}
      </View>

      {/* Right Channel Statements */}
      <View style={styles.channelSection}>
        <Text style={styles.channelSectionTitle}>
          {t('stereo.rightChannel', 'Right Channel (Emotional)')} (
          {rightStatements.length})
        </Text>
        {rightStatements.length > 0 ? (
          rightStatements.map((statement, index) => (
            <View key={statement.id} style={styles.statementItem}>
              <View style={styles.statementNumber}>
                <Text style={styles.statementNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.statementContent}>
                <Text style={styles.statementText}>
                  {getStatementText(statement, currentLanguage)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No statements added yet</Text>
          </View>
        )}
      </View>
    </>
  );
};

export const StereoSessionScreen: React.FC<StereoSessionScreenProps> = ({
  session: initialSession,
  onBack,
  onSessionComplete,
}) => {
  console.log('StereoSessionScreen: Component loaded');
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  console.log(
    'StereoSessionScreen: Current language from context:',
    currentLanguage
  );

  // State management
  const [session, setSession] = useState<StereoSession | null>(
    initialSession || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showEditLeft, setShowEditLeft] = useState(false);
  const [showEditRight, setShowEditRight] = useState(false);
  const [playbackState, setPlaybackState] =
    useState<StereoSessionPlaybackState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showStatementsList, setShowStatementsList] = useState(false);

  // Refs
  const isStoppingRef = useRef(false);

  // Custom back handler that stops playback on all platforms
  const handleBack = () => {
    // Stop stereo playback if active
    if (
      playbackState &&
      (playbackState.status === 'playing' || playbackState.status === 'paused')
    ) {
      stereoPlayerService.stopPlayback();
    }

    if (onBack) {
      onBack();
    }
  };

  // Track language changes and update player service
  useEffect(() => {
    // Update the player service with the new language if playback is active
    if (playbackState && playbackState.status === 'playing') {
      stereoPlayerService.updateLanguage(currentLanguage);
    }
  }, [currentLanguage, playbackState]);

  // Initialize services and load session
  useEffect(() => {
    initializeScreen();

    // Handle Android back button
    const backAction = () => {
      if (showEditLeft || showEditRight) {
        setShowEditLeft(false);
        setShowEditRight(false);
        return true;
      }

      // Use the custom back handler that stops playback
      handleBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [showEditLeft, showEditRight, onBack, playbackState]);

  // Set up player state listener
  useEffect(() => {
    const handlePlayerStateChange = (state: any) => {
      setPlaybackState(state.playbackState);

      if (state.playbackState?.status === StereoPlaybackStatus.COMPLETED) {
        // Rewind the session instead of closing the window
        handleRewind();
      }
    };

    stereoPlayerService.addStateChangeListener(handlePlayerStateChange);

    return () => {
      stereoPlayerService.removeStateChangeListener(handlePlayerStateChange);
    };
  }, [session, onSessionComplete]);

  const initializeScreen = async () => {
    try {
      setIsLoading(true);

      // Initialize services
      await stereoSessionService.initialize();
      await stereoPlayerService.initialize();

      // Load session if not provided
      if (!session) {
        const sessions = await stereoSessionService.getSessions();
        if (sessions.length > 0) {
          setSession(sessions[0]);
        } else {
          // Create a default session
          const defaultSession = await createDefaultSession();
          if (defaultSession) {
            setSession(defaultSession);
          } else {
            console.warn(
              'StereoSessionScreen: Could not create default session'
            );
          }
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('StereoSessionScreen: Failed to initialize:', error);
      Alert.alert(
        t('error.title', 'Error'),
        t(
          'error.initializationFailed',
          'Failed to initialize stereo session screen'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultSession = async (): Promise<StereoSession | null> => {
    try {
      console.log('StereoSessionScreen: Creating default session');

      // Get existing statements from storage
      const allStatements = await storageService.loadStatements();
      console.log(
        'StereoSessionScreen: Found statements in storage:',
        allStatements.length
      );

      if (allStatements.length === 0) {
        console.log('StereoSessionScreen: No statements available in storage');
        return null;
      }

      // Get breathing statements for left channel (rational, no counting)
      const breathingStatements = allStatements.filter(s => 
        s.primaryTag === 'breathing' || s.tags.includes('breathing')
      );
      const leftChannelStatements = breathingStatements.filter(s => {
        // Check all languages in multiLanguageContent
        const allTexts = [
          s.text,
          ...Object.values(s.multiLanguageContent || {}).map(c => c.text)
        ].join(' ').toLowerCase();
        
        return !allTexts.includes('count') &&
               !allTexts.includes('one') &&
               !allTexts.includes('two') &&
               !allTexts.includes('three') &&
               !allTexts.includes('four') &&
               !allTexts.includes('five') &&
               !allTexts.includes('six') &&
               !allTexts.includes('seven') &&
               !allTexts.includes('eight') &&
               !allTexts.includes('nine') &&
               !allTexts.includes('ten') &&
               !allTexts.includes('eins') &&
               !allTexts.includes('zwei') &&
               !allTexts.includes('drei') &&
               !allTexts.includes('vier') &&
               !allTexts.includes('fünf');
      });
      const leftStatementIds = (leftChannelStatements.length >= 10 
        ? leftChannelStatements 
        : breathingStatements).slice(0, 10).map(s => s.id);

      // Get mindfulness statements for right channel (emotional/awareness)
      const mindfulnessStatements = allStatements.filter(s => 
        s.primaryTag === 'mindfulness' || s.tags.includes('mindfulness')
      );
      const rightChannelStatements = mindfulnessStatements.filter(s => {
        // Check all languages in multiLanguageContent
        const allTexts = [
          s.text,
          ...Object.values(s.multiLanguageContent || {}).map(c => c.text)
        ].join(' ').toLowerCase();
        
        return (
          allTexts.includes('feel') ||
          allTexts.includes('ich fühle') ||
          allTexts.includes('fühle') ||
          allTexts.includes('nimm wahr') ||
          allTexts.includes('wahrnehmen') ||
          allTexts.includes('sense') ||
          allTexts.includes('spüre') ||
          allTexts.includes('notice') ||
          allTexts.includes('bemerke') ||
          allTexts.includes('observe') ||
          allTexts.includes('beobachte')
        );
      });
      const rightStatementIds = (rightChannelStatements.length >= 10 
        ? rightChannelStatements 
        : mindfulnessStatements).slice(0, 10).map(s => s.id);

      console.log(
        'StereoSessionScreen: Found left channel statements:',
        leftStatementIds.length
      );
      console.log(
        'StereoSessionScreen: Found right channel statements:',
        rightStatementIds.length
      );

      return await stereoSessionService.createSession({
        name: 'Bilateral Relaxation', // Default English name
        description: 'A basic bilateral stimulation session for relaxation', // Default English description
        multiLanguageContent: {
          en: {
            name: 'Bilateral Relaxation',
            description: 'A basic bilateral stimulation session for relaxation',
          },
          de: {
            name: 'Bilaterale Entspannung',
            description:
              'Eine grundlegende bilaterale Stimulationssitzung zur Entspannung',
          },
          zh: {
            name: '双侧放松',
            description: '一个基本的双侧刺激放松会话',
          },
        },
        category: StereoSessionCategory.BILATERAL_STIMULATION,
        leftChannelStatementIds: leftStatementIds,
        rightChannelStatementIds: rightStatementIds,
        tags: ['relaxation', 'bilateral'],
        isTemplate: true,
      });
    } catch (error) {
      console.error(
        'StereoSessionScreen: Failed to create default session:',
        error
      );
      return null;
    }
  };

  const handleEditLeftStatements = () => {
    setShowEditLeft(true);
  };

  const handleEditRightStatements = () => {
    setShowEditRight(true);
  };

  const handleSaveLeftStatements = async (editedSession: any) => {
    console.log('StereoSessionScreen: handleSaveLeftStatements called');
    console.log('StereoSessionScreen: session exists:', !!session);
    console.log('StereoSessionScreen: editedSession:', editedSession);

    if (!session) {
      console.log('StereoSessionScreen: No session, returning early');
      return;
    }

    try {
      console.log('StereoSessionScreen: Starting save process...');
      console.log(
        'StereoSessionScreen: Statement IDs to save:',
        editedSession.statementIds
      );

      const updatedSession = await stereoSessionService.updateSession(
        session.id,
        {
          leftChannelStatementIds: editedSession.statementIds || [],
        }
      );

      console.log(
        'StereoSessionScreen: Update successful, updated session:',
        updatedSession
      );
      console.log(
        'StereoSessionScreen: Left channel count:',
        updatedSession.leftChannelStatementIds.length
      );

      console.log('StereoSessionScreen: Setting new session state...');
      setSession(updatedSession);

      console.log('StereoSessionScreen: Closing edit modal...');
      setShowEditLeft(false);

      console.log('StereoSessionScreen: Save process completed successfully');
    } catch (error) {
      console.error(
        'StereoSessionScreen: Failed to save left channel statements:',
        error
      );
      Alert.alert(
        t('error.title', 'Error'),
        t('error.saveFailed', 'Failed to save statements')
      );
    }
  };

  const handleSaveRightStatements = async (editedSession: any) => {
    if (!session) return;

    try {
      console.log(
        'StereoSessionScreen: Saving right channel statements:',
        editedSession
      );
      console.log(
        'StereoSessionScreen: Statement IDs to save:',
        editedSession.statementIds
      );

      const updatedSession = await stereoSessionService.updateSession(
        session.id,
        {
          rightChannelStatementIds: editedSession.statementIds || [],
        }
      );

      console.log('StereoSessionScreen: Updated session:', updatedSession);
      console.log(
        'StereoSessionScreen: Right channel count:',
        updatedSession.rightChannelStatementIds.length
      );

      setSession(updatedSession);
      setShowEditRight(false);
    } catch (error) {
      console.error('Failed to save right channel statements:', error);
      Alert.alert(
        t('error.title', 'Error'),
        t('error.saveFailed', 'Failed to save statements')
      );
    }
  };

  const handlePlay = async () => {
    if (!session) return;

    try {
      isStoppingRef.current = false;
      // Ensure clean state before starting new session
      await stereoPlayerService.stopPlayback();
      await stereoPlayerService.playSession(session, currentLanguage);
    } catch (error) {
      console.error('Failed to start playback:', error);
      Alert.alert(
        t('error.title', 'Error'),
        t('error.playbackFailed', 'Failed to start playback')
      );
    }
  };

  const _handlePause = async () => {
    try {
      await stereoPlayerService.pausePlayback();
    } catch (error) {
      console.error('Failed to pause playback:', error);
    }
  };

  const _handleResume = async () => {
    try {
      await stereoPlayerService.resumePlayback();
    } catch (error) {
      console.error('Failed to resume playback:', error);
    }
  };

  const handleStop = async () => {
    try {
      isStoppingRef.current = true;
      await stereoPlayerService.stopPlayback();
      // Immediately rewind to start after stopping
      setPlaybackState(null);
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const _getPlaybackStatusText = (): string => {
    if (!playbackState) return t('stereo.ready', 'Ready');

    switch (playbackState.status) {
      case StereoPlaybackStatus.LOADING:
        return t('stereo.loading', 'Loading...');
      case StereoPlaybackStatus.PLAYING:
        return t('stereo.playing', 'Playing');
      case StereoPlaybackStatus.PAUSED:
        return t('stereo.paused', 'Paused');
      case StereoPlaybackStatus.STOPPED:
        return t('stereo.stopped', 'Stopped');
      case StereoPlaybackStatus.COMPLETED:
        return t('stereo.completed', 'Completed');
      case StereoPlaybackStatus.ERROR:
        return t('stereo.error', 'Error');
      default:
        return t('stereo.ready', 'Ready');
    }
  };

  const getPlayButtonText = (): string => {
    if (!playbackState) return t('stereo.play', 'Play');

    // Hide pause/resume on all platforms for now to achieve stable performance
    return t('stereo.play', 'Play');
  };

  const handlePlayButtonPress = async () => {
    if (!playbackState) {
      await handlePlay();
    } else {
      // On all platforms, only allow play/stop (no pause/resume for now)
      if (playbackState.status === StereoPlaybackStatus.PLAYING) {
        await handleStop();
      } else {
        await handlePlay();
      }
    }
  };

  const handleRewind = async () => {
    if (!session) return;

    try {
      // Stop current playback
      await stereoPlayerService.stopPlayback();

      // Reset playback state to initial state
      setPlaybackState(null);
    } catch (error) {
      console.error('StereoSessionScreen: Failed to rewind session:', error);
    }
  };

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.container}>
        <StandardHeader
          title={t('stereo.title', 'Stereo Meditation')}
          onBack={handleBack}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>
            {t('stereo.initializing', 'Initializing...')}
          </Text>
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <StandardHeader
          title={t('stereo.title', 'Stereo Meditation')}
          onBack={handleBack}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('stereo.noSession', 'No stereo session available')}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← {t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StandardHeader
        title={t('stereo.title', 'Stereo Meditation')}
        onBack={handleBack}
        subtitle=""
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
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          {getStereoSessionName(session, currentLanguage)}
        </Text>
        {session.description && (
          <Text style={styles.descriptionSubtext}>
            {getStereoSessionDescription(session, currentLanguage)}
          </Text>
        )}
      </View>

      {/* Channel Controls */}
      <View style={styles.channelControlsContainer}>
        <View style={styles.channelControl}>
          <Text style={styles.channelTitle}>
            {t('stereo.leftChannel', 'Left Channel (Rational)')}
          </Text>
          <View style={styles.channelInfo}>
            <Text style={styles.channelStats}>
              {session.leftChannelStatementIds.length}{' '}
              {t('common.statements', 'statements')}
            </Text>
            {playbackState && (
              <Text style={styles.channelProgress}>
                {Math.min(
                  playbackState.leftChannelIndex + 1,
                  session.leftChannelStatementIds.length
                )}
                /{session.leftChannelStatementIds.length}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditLeftStatements}
          >
            <Text style={styles.editButtonText}>
              {t('common.edit', 'Bearbeiten')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.channelControl}>
          <Text style={styles.channelTitle}>
            {t('stereo.rightChannel', 'Right Channel (Emotional)')}
          </Text>
          <View style={styles.channelInfo}>
            <Text style={styles.channelStats}>
              {session.rightChannelStatementIds.length}{' '}
              {t('common.statements', 'statements')}
            </Text>
            {playbackState && (
              <Text style={styles.channelProgress}>
                {Math.min(
                  playbackState.rightChannelIndex + 1,
                  session.rightChannelStatementIds.length
                )}
                /{session.rightChannelStatementIds.length}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditRightStatements}
          >
            <Text style={styles.editButtonText}>
              {t('common.edit', 'Bearbeiten')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Player Container */}
      <View style={styles.playerContainer}>
        {/* Current Statements Display */}
        {playbackState &&
          (playbackState.currentLeftStatement ||
            playbackState.currentRightStatement) && (
            <View style={styles.currentStatementsContainer}>
              <Text style={styles.currentStatementsTitle}>
                {t('stereo.currentStatements', 'Currently Playing')}
              </Text>

              <View style={styles.currentStatementsRow}>
                {playbackState.currentLeftStatement && (
                  <View style={styles.currentStatementCard}>
                    <Text style={styles.currentStatementLabel}>
                      {t('stereo.left', 'Left')}:
                    </Text>
                    <Text style={styles.currentStatementText}>
                      {getStatementText(
                        playbackState.currentLeftStatement,
                        currentLanguage
                      )}
                    </Text>
                  </View>
                )}

                {playbackState.currentRightStatement && (
                  <View style={styles.currentStatementCard}>
                    <Text style={styles.currentStatementLabel}>
                      {t('stereo.right', 'Right')}:
                    </Text>
                    <Text style={styles.currentStatementText}>
                      {getStatementText(
                        playbackState.currentRightStatement,
                        currentLanguage
                      )}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
      </View>

      {/* Statements List Modal */}
      {showStatementsList && (
        <View style={styles.statementsListContainer}>
          <View style={styles.statementsListHeader}>
            <Text style={styles.statementsListTitle}>
              {t('stereo.statements', 'Statements')}
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
            <StatementsListContent session={session} />
          </ScrollView>
        </View>
      )}

      {/* Actions Container */}
      <View style={styles.actionsContainer}>
        {/* Hide pause button on all platforms when playing for stable performance */}
        {!(playbackState?.status === StereoPlaybackStatus.PLAYING) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={handlePlayButtonPress}
          >
            <Text style={styles.actionButtonText}>{getPlayButtonText()}</Text>
          </TouchableOpacity>
        )}

        {playbackState &&
          playbackState.status === StereoPlaybackStatus.PLAYING && (
            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={handleStop}
            >
              <Text style={styles.actionButtonText}>⏹ {t('common.stop')}</Text>
            </TouchableOpacity>
          )}
      </View>

      {/* Edit Left Statements Modal - Full Screen */}
      {showEditLeft && (
        <View style={styles.fullScreenModal}>
          <SessionEditScreen
            session={{
              id: 'temp_left',
              name: t('stereo.editLeft', 'Left Statements'),
              language: currentLanguage,
              category: 'custom' as any,
              statementIds: session.leftChannelStatementIds,
              isUserCreated: false,
              isActive: true,
              isTemplate: false,
              tags: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }}
            onSave={handleSaveLeftStatements}
            onCancel={() => setShowEditLeft(false)}
            isStereoMode={true}
          />
        </View>
      )}

      {/* Edit Right Statements Modal - Full Screen */}
      {showEditRight && (
        <View style={styles.fullScreenModal}>
          <SessionEditScreen
            session={{
              id: 'temp_right',
              name: t('stereo.editRight', 'Right Statements'),
              language: currentLanguage,
              category: 'custom' as any,
              statementIds: session.rightChannelStatementIds,
              isUserCreated: false,
              isActive: true,
              isTemplate: false,
              tags: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }}
            onSave={handleSaveRightStatements}
            onCancel={() => setShowEditRight(false)}
            isStereoMode={true}
          />
        </View>
      )}

      {/* Toast notifications */}
      <Toast />
    </View>
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
    marginTop: 10,
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
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  descriptionSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  channelControlsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  playerContainer: {
    flex: 1,
  },
  channelControl: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  channelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  channelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  channelStats: {
    fontSize: 14,
    color: '#666',
  },
  channelProgress: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  currentStatementsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  currentStatementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  currentStatementsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  currentStatementCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  currentStatementLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  currentStatementText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  statementsToggle: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  statementsToggleText: {
    fontSize: 16,
  },
  statementsListContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    bottom: 80,
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
  channelSection: {
    padding: 16,
  },
  channelSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  statementText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fullScreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5',
    zIndex: 1000,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
