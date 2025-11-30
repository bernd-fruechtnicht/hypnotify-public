import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { logger } from '../utils/logger';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ttsService,
  storageService,
  backgroundMusicService,
} from '../services';
// import * as Speech from 'expo-speech'; // Removed - using unified TTS service
import {
  MeditationStatement,
  TTSPlaybackConfig,
  TTSPlaybackState,
  getStatementText,
} from '../types';

interface AudioPlayerProps {
  statements: MeditationStatement[];
  onSessionComplete?: () => void;
  onSessionPause?: () => void;
  onSessionResume?: () => void;
  onSessionStop?: () => void;
  autoPlay?: boolean;
  compact?: boolean;
}

export interface AudioPlayerRef {
  stop: () => Promise<void>;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  (
    {
      statements,
      onSessionComplete,
      onSessionPause,
      onSessionResume,
      onSessionStop: _onSessionStop,
      autoPlay = false,
      compact = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [supportsPauseResume, setSupportsPauseResume] = useState(true);
    const [statementDelay, setStatementDelay] = useState(2.0); // Default delay in seconds
    const [isInDelay, setIsInDelay] = useState(false);
    const [delayCountdown, setDelayCountdown] = useState(0);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [fadeoutCountdown, setFadeoutCountdown] = useState(0);
    const delayIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const statementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const nextStatementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fadeoutIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const pulseAnimation = useRef(new Animated.Value(1)).current;
    const currentIndexRef = useRef(0);
    const isCompletingRef = useRef(false);
    const currentTTSListenerRef = useRef<
      ((state: TTSPlaybackState) => void) | null
    >(null);
    const currentStatementIdRef = useRef<string | null>(null);
    const currentLanguageRef = useRef(currentLanguage);

    // Expose stop method to parent component
    useImperativeHandle(ref, () => ({
      stop: handleStop,
    }));

    const currentStatement = statements[currentIndex];

    // Function to start delay countdown
    const startDelayCountdown = async (delaySeconds: number) => {
      // Load current settings to get the most up-to-date delay
      try {
        const settings = await storageService.loadSettings();
        const currentDelay =
          settings?.tts?.defaultPauseBetweenStatements || delaySeconds;

        // Clear any existing countdown
        if (delayIntervalRef.current) {
          clearInterval(delayIntervalRef.current);
          delayIntervalRef.current = null;
        }

        setIsInDelay(true);
        setDelayCountdown(currentDelay);

        delayIntervalRef.current = setInterval(() => {
          setDelayCountdown(prev => {
            if (prev <= 1) {
              if (delayIntervalRef.current) {
                clearInterval(delayIntervalRef.current);
                delayIntervalRef.current = null;
              }
              setIsInDelay(false);
              // Trigger the next statement when countdown reaches 0
              isCompletingRef.current = false; // Reset flag before starting next
              playCurrentStatement();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Return the actual delay used for the timeout
        return currentDelay;
      } catch (error) {
        logger.error('AudioPlayer: Failed to load delay setting:', error);
        // Fallback to the passed delay
        setIsInDelay(true);
        setDelayCountdown(delaySeconds);
        return delaySeconds;
      }
    };

    // Keep ref in sync with state
    useEffect(() => {
      currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
      if (autoPlay && statements.length > 0) {
        startSession();
      }
    }, [autoPlay, statements]);

    // Check pause/resume support on mount
    useEffect(() => {
      const checkPauseResumeSupport = () => {
        const supported = ttsService.isPauseResumeSupported();
        setSupportsPauseResume(supported);
      };

      checkPauseResumeSupport();
    }, []);

    // Load statement delay setting on mount
    useEffect(() => {
      const loadDelaySetting = async () => {
        try {
          const settings = await storageService.loadSettings();
          if (settings) {
            setStatementDelay(settings.tts.defaultPauseBetweenStatements);
          }
        } catch (error) {
          logger.error('AudioPlayer: Failed to load delay setting:', error);
        }
      };

      loadDelaySetting();
    }, []);

    // Cleanup effect to stop TTS when component unmounts
    useEffect(() => {
      return () => {
        // Stop TTS when component unmounts
        ttsService.stop().catch(error => {
          logger.debug('Failed to stop TTS on unmount:', error);
        });
      };
    }, []);

    // Update language ref when language changes
    useEffect(() => {
      currentLanguageRef.current = currentLanguage;
    }, [currentLanguage]);

    // Note: Language changes during playback will take effect from the next statement
    // This provides a smoother user experience without interrupting the current statement

    // Listen to TTS state changes for pause/resume/stop
    useEffect(() => {
      const handleTTSStateChange = (state: TTSPlaybackState) => {
        // Handle state changes from TTS service
        if (state.status === 'paused') {
          setIsPlaying(false);
          setIsPaused(true);
        } else if (state.status === 'playing') {
          setIsPlaying(true);
          setIsPaused(false);
        } else if (state.status === 'stopped') {
          setIsPlaying(false);
          setIsPaused(false);
          setIsLoading(false);
        }
      };

      ttsService.addStateChangeListener(handleTTSStateChange);

      return () => {
        ttsService.removeStateChangeListener(handleTTSStateChange);
      };
    }, []);

    useEffect(() => {
      // Pulse animation when playing
      if (isPlaying) {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: false, // Web compatibility
            }),
            Animated.timing(pulseAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false, // Web compatibility
            }),
          ])
        );
        pulse.start();
        return () => pulse.stop();
      } else {
        pulseAnimation.setValue(1);
      }
    }, [isPlaying]);

    const startSession = async () => {
      if (statements.length === 0) return;

      setIsLoading(true);
      try {
        // Check if background music is enabled and start it
        const settings = await storageService.loadSettings();
        if (
          settings?.audio?.backgroundMusic?.enabled &&
          (await backgroundMusicService.isBackgroundMusicAvailableAsync())
        ) {
          try {
            await backgroundMusicService.setVolume(
              settings.audio.backgroundMusic.volume
            );
            await backgroundMusicService.play();
          } catch (error) {
            logger.warn(
              'AudioPlayer: Failed to start background music:',
              error
            );
          }
        }

        setCurrentIndex(0);
        currentIndexRef.current = 0;
        setIsPlaying(true);
        setIsPaused(false);
        // Start playing without waiting for completion
        playCurrentStatement();
      } catch (error) {
        logger.error('Failed to start session:', error);
        setIsLoading(false);
      }
      // Don't set isLoading to false here - let playCurrentStatement handle it
    };

    const playCurrentStatement = async () => {
      const index = currentIndexRef.current;
      const statement = statements[index];

      if (!statement) return;

      // Generate unique ID for this statement
      const statementId = `${index}_${Date.now()}`;
      currentStatementIdRef.current = statementId;

      // Stop any currently playing TTS
      try {
        await ttsService.stop();
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch {
        // Ignore stop errors
      }

      // Remove any existing listener to prevent race conditions
      if (currentTTSListenerRef.current) {
        ttsService.removeStateChangeListener(currentTTSListenerRef.current);
        currentTTSListenerRef.current = null;
      }

      const ttsConfig: Partial<TTSPlaybackConfig> = {
        language: currentLanguageRef.current,
        // Don't override user's custom rate, pitch, volume settings
        // These will be loaded from user settings in the TTS service
      };

      // Set up TTS state listener for this specific statement
      const handleTTSStateChange = (state: TTSPlaybackState) => {
        // Only process events for the currently active statement
        if (currentStatementIdRef.current !== statementId) {
          return;
        }

        // Ignore state changes if we're completing
        if (isCompletingRef.current) {
          return;
        }

        if (state.status === 'completed') {
          // TTS completed - move to next statement
          // Remove listener to prevent multiple calls
          if (currentTTSListenerRef.current) {
            ttsService.removeStateChangeListener(currentTTSListenerRef.current);
            currentTTSListenerRef.current = null;
          }
          // Move to next statement and start countdown
          handleStatementComplete();
        }
      };

      // Store the listener reference and add it
      currentTTSListenerRef.current = handleTTSStateChange;
      ttsService.addStateChangeListener(handleTTSStateChange);

      try {
        // Clear loading state once TTS starts
        setIsLoading(false);

        // Start TTS playback and wait for completion
        const statementText = getStatementText(
          statement,
          currentLanguageRef.current
        );
        await ttsService.speak(statementText, ttsConfig);
      } catch (error) {
        logger.error('Failed to play statement:', error);
        setIsLoading(false);
        // Clean up listener on error
        if (currentTTSListenerRef.current) {
          ttsService.removeStateChangeListener(currentTTSListenerRef.current);
          currentTTSListenerRef.current = null;
        }
        // On error, still move to next statement after a delay
        fallbackTimeoutRef.current = setTimeout(() => {
          handleStatementComplete();
        }, 2000); // 2 second fallback
      }
    };

    const handleStatementComplete = async () => {
      // Prevent multiple simultaneous completions
      if (isCompletingRef.current) {
        return;
      }

      isCompletingRef.current = true;
      const index = currentIndexRef.current;

      // Stop current TTS before moving to next statement
      try {
        await ttsService.stop();
      } catch (error) {
        logger.debug(
          'Stop error in handleStatementComplete (ignoring):',
          error
        );
      }

      // Clean up listener
      if (currentTTSListenerRef.current) {
        ttsService.removeStateChangeListener(currentTTSListenerRef.current);
        currentTTSListenerRef.current = null;
      }

      if (index < statements.length - 1) {
        const nextIndex = index + 1;
        setCurrentIndex(nextIndex);
        currentIndexRef.current = nextIndex;

        // Start countdown before playing next statement
        startDelayCountdown(statementDelay).then(_actualDelay => {
          // The countdown will automatically trigger the next statement when it reaches 0
          // No additional timeout needed
        });
      } else {
        // Session complete - start fadeout while keeping session "playing"
        isCompletingRef.current = false; // Reset flag
        setIsFadingOut(true);
        setFadeoutCountdown(10); // Start 10 second countdown

        // Start fadeout countdown
        fadeoutIntervalRef.current = setInterval(() => {
          setFadeoutCountdown(prev => {
            if (prev <= 1) {
              if (fadeoutIntervalRef.current) {
                clearInterval(fadeoutIntervalRef.current);
                fadeoutIntervalRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Fade out background music when session ends naturally
        // Keep session in "playing" state during fadeout
        try {
          await backgroundMusicService.fadeOut(10); // 10 second fadeout
        } catch (error) {
          logger.warn(
            'AudioPlayer: Failed to fade out background music on completion:',
            error
          );
        }

        // After fadeout completes, stop the session
        setIsFadingOut(false);
        setFadeoutCountdown(0);
        setIsPlaying(false);
        setIsPaused(false);
        onSessionComplete?.();
      }
    };

    const handlePlayPause = async () => {
      if (isLoading) return;

      // Disable pause during fadeout - user should use stop button instead
      if (isFadingOut) {
        return;
      }

      try {
        if (isPlaying) {
          // If we're in a delay countdown, pause the countdown
          if (isInDelay) {
            // Clear the countdown interval
            if (delayIntervalRef.current) {
              clearInterval(delayIntervalRef.current);
              delayIntervalRef.current = null;
            }
            // Clear any pending timeouts
            if (statementTimeoutRef.current) {
              clearTimeout(statementTimeoutRef.current);
              statementTimeoutRef.current = null;
            }
            if (nextStatementTimeoutRef.current) {
              clearTimeout(nextStatementTimeoutRef.current);
              nextStatementTimeoutRef.current = null;
            }
            setIsInDelay(false);
            setIsPlaying(false);
            setIsPaused(true);

            // Pause background music during countdown pause
            try {
              await backgroundMusicService.pause();
            } catch (error) {
              logger.warn(
                'AudioPlayer: Failed to pause background music during countdown:',
                error
              );
            }

            onSessionPause?.();
            return;
          }

          // Normal TTS pause
          if (supportsPauseResume) {
            await ttsService.pause();
          } else {
            // For platforms without pause support, stop and mark as paused
            await ttsService.stop();
            setIsPaused(true);
            setIsPlaying(false);
          }

          // Pause background music
          try {
            await backgroundMusicService.pause();
          } catch (error) {
            logger.warn(
              'AudioPlayer: Failed to pause background music:',
              error
            );
          }

          onSessionPause?.();
        } else if (isPaused) {
          // If we were paused during countdown, resume the countdown
          if (delayCountdown > 0) {
            // Resume the countdown from where we left off
            const _remainingTime = delayCountdown;

            setIsInDelay(true);
            setIsPlaying(true);
            setIsPaused(false);

            // Resume background music immediately when resuming from countdown
            try {
              await backgroundMusicService.resume();
            } catch (error) {
              logger.warn(
                'AudioPlayer: Failed to resume background music on countdown resume:',
                error
              );
            }

            // Resume the countdown interval
            delayIntervalRef.current = setInterval(() => {
              setDelayCountdown(prev => {
                if (prev <= 1) {
                  if (delayIntervalRef.current) {
                    clearInterval(delayIntervalRef.current);
                    delayIntervalRef.current = null;
                  }
                  setIsInDelay(false);
                  // Start the next statement immediately when countdown reaches 0
                  isCompletingRef.current = false;
                  playCurrentStatement();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);

            onSessionResume?.();
            return;
          }

          // Normal TTS resume
          if (supportsPauseResume) {
            await ttsService.resume();
          } else {
            // For platforms without resume support, restart current statement
            await playCurrentStatement();
          }

          // Resume background music
          try {
            await backgroundMusicService.resume();
          } catch (error) {
            logger.warn(
              'AudioPlayer: Failed to resume background music:',
              error
            );
          }

          onSessionResume?.();
        } else {
          await startSession();
        }
      } catch (error) {
        logger.error('Failed to control playback:', error);
        // If pause/resume fails, fall back to stop/start
        if (isPlaying || isPaused) {
          await handleStop();
        }
      }
    };

    const handleStop = async () => {
      try {
        await ttsService.stop();

        // Clean up listener
        if (currentTTSListenerRef.current) {
          ttsService.removeStateChangeListener(currentTTSListenerRef.current);
          currentTTSListenerRef.current = null;
        }

        // Reset all state variables
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
        setCurrentIndex(0);
        isCompletingRef.current = false;
        currentIndexRef.current = 0;
        currentStatementIdRef.current = null;

        // Clear all timeouts and intervals
        if (delayIntervalRef.current) {
          clearInterval(delayIntervalRef.current);
          delayIntervalRef.current = null;
        }
        if (statementTimeoutRef.current) {
          clearTimeout(statementTimeoutRef.current);
          statementTimeoutRef.current = null;
        }
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
        if (nextStatementTimeoutRef.current) {
          clearTimeout(nextStatementTimeoutRef.current);
          nextStatementTimeoutRef.current = null;
        }
        if (fadeoutIntervalRef.current) {
          clearInterval(fadeoutIntervalRef.current);
          fadeoutIntervalRef.current = null;
        }
        setIsInDelay(false);
        setDelayCountdown(0);
        setIsFadingOut(false);
        setFadeoutCountdown(0);

        // Reset animation
        pulseAnimation.setValue(1);

        // Stop background music
        try {
          await backgroundMusicService.stop();
        } catch (error) {
          logger.warn('AudioPlayer: Failed to stop background music:', error);
        }

        // Don't call onSessionStop here - this is just a rewind/stop, not a session close
      } catch (error) {
        logger.error('AudioPlayer: Error stopping:', error);
      }
    };

    if (statements.length === 0) {
      return (
        <View style={[styles.container, compact && styles.compactContainer]}>
          <Text style={styles.emptyText}>{t('player.noStatements')}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        {/* Current Statement Info - Always show when there's a current statement */}
        {currentStatement ? (
          <View style={styles.statementInfo}>
            <Text
              style={[
                styles.statementText,
                compact && styles.compactStatementText,
              ]}
            >
              {getStatementText(currentStatement, currentLanguage)}
            </Text>
            <Text style={styles.statementCounter}>
              {currentIndex + 1} / {statements.length}
            </Text>
          </View>
        ) : null}

        {/* Controls */}
        <View style={[styles.controls, compact && styles.compactControls]}>
          <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
            <TouchableOpacity
              style={[
                styles.playButton,
                isPlaying && styles.playingButton,
                isLoading && styles.loadingButton,
                isFadingOut && styles.disabledButton,
              ]}
              onPress={handlePlayPause}
              disabled={isLoading || isFadingOut}
            >
              <Text style={styles.playButtonText}>
                {isLoading ? '⏳' : isPlaying ? '⏸' : isPaused ? '▶️' : '▶️'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStop}
          >
            <Text style={styles.controlButtonText}>⏹</Text>
          </TouchableOpacity>
        </View>

        {/* Countdown */}
        <View style={styles.countdownContainer}>
          {isInDelay && (
            <Text style={styles.countdownText}>
              {t('player.statementBeginsIn')} {delayCountdown}{' '}
              {delayCountdown === 1 ? t('player.second') : t('player.seconds')}
            </Text>
          )}
          {isFadingOut && fadeoutCountdown > 0 && (
            <Text style={styles.countdownText}>
              {t('player.sessionEndingIn')} {fadeoutCountdown}{' '}
              {fadeoutCountdown === 1
                ? t('player.second')
                : t('player.seconds')}
            </Text>
          )}
        </View>
      </View>
    );
  }
);

const { width: _width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  compactContainer: {
    padding: 12,
    margin: 8,
  },
  statementInfo: {
    marginBottom: 16,
  },
  statementText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
  },
  compactStatementText: {
    fontSize: 14,
    lineHeight: 18,
  },
  statementCounter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactControls: {
    marginBottom: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playingButton: {
    backgroundColor: '#FF9800',
  },
  loadingButton: {
    backgroundColor: '#9E9E9E',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    opacity: 0.5,
  },
  controlButtonText: {
    fontSize: 18,
  },
  playButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  countdownContainer: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  countdownText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});
