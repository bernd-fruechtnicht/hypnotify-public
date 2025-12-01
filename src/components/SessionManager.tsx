import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { logger } from '../utils/logger';
import { storageService } from '../services';
import {
  MeditationSession,
  getSessionName,
  // getSessionDescription: _getSessionDescription,
} from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { StandardHeader } from './StandardHeader';

interface SessionManagerProps {
  visible: boolean;
  onClose: () => void;
  onSessionSelect: (session: MeditationSession) => void;
  onSessionDelete?: (sessionId: string) => void;
  onSessionEdit?: (session: MeditationSession) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  visible,
  onClose,
  onSessionSelect,
  onSessionDelete,
  onSessionEdit,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSessions();
    }
  }, [visible]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const loadedSessions = await storageService.loadSessions();

      // Ensure all sessions have valid dates
      const validSessions = loadedSessions.map(session => ({
        ...session,
        createdAt:
          session.createdAt instanceof Date
            ? session.createdAt
            : new Date(session.createdAt || Date.now()),
        updatedAt:
          session.updatedAt instanceof Date
            ? session.updatedAt
            : new Date(session.updatedAt || Date.now()),
      }));

      setSessions(validSessions);
    } catch (error) {
      logger.error('Failed to load sessions:', error);
      Alert.alert(
        t('sessionManager.loadFailed'),
        t(
          'sessionManager.loadFailedMessage',
          'Failed to load sessions. Please try again.'
        )
      );
      setSessions([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionSelect = (session: MeditationSession) => {
    onSessionSelect(session);
    onClose();
  };

  const handleSessionDelete = (session: MeditationSession) => {
    const deleteSession = async () => {
      try {
        await storageService.deleteSession(session.id);
        setSessions(prev => prev.filter(s => s.id !== session.id));
        onSessionDelete?.(session.id);
        Alert.alert(
          t('sessionManager.deleteSuccess'),
          t(
            'sessionManager.deleteSuccessMessage',
            'Session deleted successfully.'
          )
        );
      } catch (error) {
        logger.error('Failed to delete session:', error);
        Alert.alert(
          t('sessionManager.deleteFailed'),
          t(
            'sessionManager.deleteFailedMessage',
            'Failed to delete session. Please try again.'
          )
        );
      }
    };

    // Use platform-specific confirmation
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      // Web/Electron
      const confirmed = window.confirm(
        `${t('sessionManager.deleteConfirm')}\n\n${t('sessionManager.deleteConfirmMessage', { name: session.name })}`
      );
      if (confirmed) {
        deleteSession();
      }
    } else {
      // Mobile
      Alert.alert(
        t('sessionManager.deleteConfirm'),
        t('sessionManager.deleteConfirmMessage', { name: session.name }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: deleteSession,
          },
        ]
      );
    }
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Unknown date';
      }

      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(dateObj);
    } catch (error) {
      logger.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StandardHeader
          title={t('sessionManager.title')}
          onBack={onClose}
          inModal={true}
        />

        {/* Sessions List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('sessionManager.noSessions')}
              </Text>
              <Text style={styles.emptySubtext}>
                {t('sessionManager.createFirstSession')}
              </Text>
            </View>
          ) : (
            sessions.map(session => (
              <View key={session.id} style={styles.sessionItem}>
                <TouchableOpacity
                  style={styles.sessionContent}
                  onPress={() => handleSessionSelect(session)}
                >
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionName} numberOfLines={2}>
                      {getSessionName(session, currentLanguage)}
                    </Text>
                    <Text style={styles.sessionMeta}>
                      {session.statementIds.length} {t('common.statements')}
                    </Text>
                    <Text style={styles.sessionDate}>
                      {t('sessionManager.created')}{' '}
                      {formatDate(session.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.sessionActions}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={e => {
                        e.stopPropagation();
                        handleSessionSelect(session);
                      }}
                    >
                      <Text style={styles.playButtonText}>▶</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={e => {
                        e.stopPropagation();
                        logger.debug(
                          'Edit button clicked for session:',
                          session.name
                        );
                        onSessionEdit?.(session);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={e => {
                        e.stopPropagation();
                        handleSessionDelete(session);
                      }}
                    >
                      <Text style={styles.deleteButtonText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
  },
  sessionItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: '#999',
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
