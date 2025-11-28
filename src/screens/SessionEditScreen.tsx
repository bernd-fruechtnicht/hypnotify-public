import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { StandardHeader } from '../components/StandardHeader';
import { StatementSelector } from '../components/StatementSelector';
// import { StandardButton } from '../components/StandardButton';
import { storageService } from '../services';
import {
  MeditationSession,
  MeditationStatement,
  getSessionName,
  getSessionDescription,
  getStatementText,
} from '../types';

interface SessionEditScreenProps {
  session: MeditationSession | null;
  onSave: (session: MeditationSession) => void;
  onCancel: () => void;
  isStereoMode?: boolean; // New prop to distinguish stereo vs regular editing
}

export const SessionEditScreen: React.FC<SessionEditScreenProps> = ({
  session,
  onSave,
  onCancel,
  isStereoMode = false,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [editedSession, setEditedSession] = useState<MeditationSession | null>(
    session
  );
  const [statements, setStatements] = useState<MeditationStatement[]>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [showStatementSelector, setShowStatementSelector] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);

  console.log(
    'SessionEditScreen rendered with session:',
    session?.name || 'null'
  );

  useEffect(() => {
    if (session) {
      loadStatements();
    }
  }, [session]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      onCancel();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [onCancel]);

  const loadStatements = async () => {
    try {
      setIsLoading(true);
      const allStatements = await storageService.loadStatements();

      // Use all statements - they are now multi-language
      setStatements(allStatements);
    } catch (error) {
      console.error('Failed to load statements:', error);
      Alert.alert(t('common.error'), t('sessionEdit.loadStatementsFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (editedSession) {
      onSave(editedSession);
    }
  };

  const handleAddStatements = (position?: number) => {
    setInsertPosition(position ?? null);
    setShowStatementSelector(true);
  };

  const handleStatementSelect = (selectedStatements: MeditationStatement[]) => {
    if (!editedSession) return;

    const newStatementIds = selectedStatements.map(stmt => stmt.id);
    let updatedStatementIds: string[];

    if (insertPosition !== null) {
      // Insert at specific position
      updatedStatementIds = [
        ...editedSession.statementIds.slice(0, insertPosition),
        ...newStatementIds,
        ...editedSession.statementIds.slice(insertPosition),
      ];
    } else {
      // Add to end
      updatedStatementIds = [...editedSession.statementIds, ...newStatementIds];
    }

    setEditedSession({
      ...editedSession,
      statementIds: updatedStatementIds,
      updatedAt: new Date(),
    });

    setShowStatementSelector(false);
    setInsertPosition(null);
  };

  const handleNameChange = (text: string) => {
    if (!editedSession) return;

    setEditedSession({
      ...editedSession,
      multiLanguageContent: {
        ...editedSession.multiLanguageContent,
        [currentLanguage]: {
          name: text,
          description:
            editedSession.multiLanguageContent?.[currentLanguage]?.description,
        },
      },
      updatedAt: new Date(),
    });
  };

  const handleDescriptionChange = (text: string) => {
    if (!editedSession) return;

    setEditedSession({
      ...editedSession,
      multiLanguageContent: {
        ...editedSession.multiLanguageContent,
        [currentLanguage]: {
          name:
            editedSession.multiLanguageContent?.[currentLanguage]?.name ||
            editedSession.name,
          description: text,
        },
      },
      updatedAt: new Date(),
    });
  };

  const _handleAddStatement = (statement: MeditationStatement) => {
    setEditedSession(prev =>
      prev
        ? {
            ...prev,
            statementIds: [...prev.statementIds, statement.id],
            updatedAt: new Date(),
          }
        : null
    );
  };

  const handleRemoveStatement = (statementId: string) => {
    setEditedSession(prev =>
      prev
        ? {
            ...prev,
            statementIds: prev.statementIds.filter(id => id !== statementId),
            updatedAt: new Date(),
          }
        : null
    );
  };

  const handleMoveStatement = (fromIndex: number, toIndex: number) => {
    setEditedSession(prev => {
      if (!prev) return null;
      const newStatementIds = [...prev.statementIds];
      const [movedId] = newStatementIds.splice(fromIndex, 1);
      newStatementIds.splice(toIndex, 0, movedId);

      return {
        ...prev,
        statementIds: newStatementIds,
        updatedAt: new Date(),
      };
    });
  };

  const getSessionStatements = (): MeditationStatement[] => {
    if (!editedSession) return [];

    console.log('SessionEditScreen: Getting session statements');
    console.log(
      'SessionEditScreen: editedSession.statementIds:',
      editedSession.statementIds
    );
    console.log('SessionEditScreen: statements.length:', statements.length);
    console.log(
      'SessionEditScreen: statements IDs:',
      statements.map(s => s.id)
    );

    const sessionStatements = editedSession.statementIds
      .map(id => {
        const found = statements.find(stmt => stmt.id === id);
        console.log(
          `SessionEditScreen: Looking for ID ${id}, found:`,
          found ? 'YES' : 'NO'
        );
        return found;
      })
      .filter((stmt): stmt is MeditationStatement => stmt !== undefined);

    console.log(
      'SessionEditScreen: Final session statements:',
      sessionStatements.length
    );
    return sessionStatements;
  };

  const _getAvailableStatements = (): MeditationStatement[] => {
    if (!editedSession) return statements;
    return statements.filter(
      stmt => !editedSession.statementIds.includes(stmt.id)
    );
  };

  // Don't render content if no session is being edited
  if (!session || !editedSession) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StandardHeader
        title={getSessionName(editedSession, currentLanguage)}
        subtitle={`${editedSession.statementIds.length} ${t('common.statements')}`}
        onBack={onCancel}
        actionButton={{
          text: t('common.save'),
          onPress: handleSave,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session Name Editing - Only for regular sessions, not stereo mode */}
        {!isStereoMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('sessionEdit.sessionName')}
            </Text>
            <TextInput
              style={styles.nameInput}
              value={getSessionName(editedSession, currentLanguage)}
              onChangeText={text => handleNameChange(text)}
              placeholder={t('sessionEdit.sessionNamePlaceholder')}
              multiline={false}
            />
            {getSessionDescription(editedSession, currentLanguage) && (
              <TextInput
                style={styles.descriptionInput}
                value={getSessionDescription(editedSession, currentLanguage)}
                onChangeText={text => handleDescriptionChange(text)}
                placeholder={t('sessionEdit.sessionDescriptionPlaceholder')}
                multiline={true}
                numberOfLines={3}
              />
            )}
          </View>
        )}

        {/* Statements List */}
        <View style={styles.section}>
          {getSessionStatements().length === 0 ? (
            <Text style={styles.emptyText}>
              {t('sessionEdit.noStatements')}
            </Text>
          ) : (
            getSessionStatements().map((statement, index) => (
              <View key={statement.id}>
                {/* Insert button before each statement */}
                <TouchableOpacity
                  style={styles.insertButton}
                  onPress={() => handleAddStatements(index)}
                >
                  <Text style={styles.insertButtonText}>
                    + {t('sessionEdit.insertHere')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.statementItem}>
                  <View style={styles.statementInfo}>
                    <Text style={styles.statementText} numberOfLines={2}>
                      {getStatementText(statement, currentLanguage)}
                    </Text>
                    <Text style={styles.statementCategory}>
                      {statement.primaryTag}
                    </Text>
                  </View>
                  <View style={styles.statementActions}>
                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => handleMoveStatement(index, index - 1)}
                      >
                        <Text style={styles.moveButtonText}>↑</Text>
                      </TouchableOpacity>
                    )}
                    {index < getSessionStatements().length - 1 && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => handleMoveStatement(index, index + 1)}
                      >
                        <Text style={styles.moveButtonText}>↓</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveStatement(statement.id)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Insert button at the end - always show */}
          <TouchableOpacity
            style={styles.insertButton}
            onPress={() => handleAddStatements(getSessionStatements().length)}
          >
            <Text style={styles.insertButtonText}>
              + {t('sessionEdit.insertHere')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Statement Selector Modal */}
      <StatementSelector
        visible={showStatementSelector}
        onClose={() => {
          setShowStatementSelector(false);
          setInsertPosition(null);
        }}
        onSelect={handleStatementSelect}
        availableStatements={statements}
        selectedStatements={editedSession.statementIds}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sessionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 4,
  },
  insertButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderStyle: 'dashed',
  },
  insertButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
    textAlignVertical: 'top',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  availableStatementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    marginBottom: 8,
  },
  statementInfo: {
    flex: 1,
  },
  statementText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  statementCategory: {
    fontSize: 12,
    color: '#666',
  },
  statementActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  moveButtonText: {
    fontSize: 16,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#F44336',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
