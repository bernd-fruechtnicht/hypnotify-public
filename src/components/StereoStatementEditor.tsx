/**
 * Stereo Statement Editor
 *
 * Custom editor for stereo session statements that works directly with MeditationStatement objects
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { logger } from '../utils/logger';
import { useLanguage } from '../contexts/LanguageContext';
import { StandardHeader } from './StandardHeader';
import { StatementCard } from './StatementCard';
import { StandardButton } from './StandardButton';
import { storageService } from '../services';
import { MeditationStatement } from '../types';

interface StereoStatementEditorProps {
  title: string;
  statements: MeditationStatement[];
  onSave: (statements: MeditationStatement[]) => void;
  onCancel: () => void;
}

export const StereoStatementEditor: React.FC<StereoStatementEditorProps> = ({
  title,
  statements,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { currentLanguage: _currentLanguage } = useLanguage();
  const [editedStatements, setEditedStatements] =
    useState<MeditationStatement[]>(statements);
  const [allStatements, setAllStatements] = useState<MeditationStatement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatementSelector, setShowStatementSelector] = useState(false);

  useEffect(() => {
    loadAllStatements();
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      handleCancel();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, []);

  const loadAllStatements = async () => {
    try {
      setIsLoading(true);
      const statements = await storageService.loadStatements();
      setAllStatements(statements);
    } catch (error) {
      logger.error('Failed to load statements:', error);
      Alert.alert(t('common.error'), 'Failed to load statements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    onSave(editedStatements);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleAddStatement = (statement: MeditationStatement) => {
    setEditedStatements(prev => [...prev, statement]);
    setShowStatementSelector(false);
  };

  const handleRemoveStatement = (index: number) => {
    Alert.alert(t('common.confirm'), t('common.confirmRemove'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: () => {
          setEditedStatements(prev => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      setEditedStatements(prev => {
        const newStatements = [...prev];
        [newStatements[index - 1], newStatements[index]] = [
          newStatements[index],
          newStatements[index - 1],
        ];
        return newStatements;
      });
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < editedStatements.length - 1) {
      setEditedStatements(prev => {
        const newStatements = [...prev];
        [newStatements[index], newStatements[index + 1]] = [
          newStatements[index + 1],
          newStatements[index],
        ];
        return newStatements;
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StandardHeader title={title} onBack={handleCancel} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StandardHeader
        title={title}
        onBack={handleCancel}
        subtitle={`${editedStatements.length} ${t('common.statements')}`}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Statement Button */}
        <View style={styles.addButtonContainer}>
          <StandardButton
            title={`+ ${t('common.addStatement')}`}
            onPress={() => setShowStatementSelector(true)}
            style={styles.addButton}
          />
        </View>

        {/* Statements List */}
        {editedStatements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {t('common.noStatementsAdded')}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {t('common.tapAddToGetStarted')}
            </Text>
          </View>
        ) : (
          editedStatements.map((statement, index) => (
            <View key={`${statement.id}_${index}`} style={styles.statementItem}>
              <View style={styles.statementHeader}>
                <View style={styles.statementNumber}>
                  <Text style={styles.statementNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.statementActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      index === 0 && styles.disabledButton,
                    ]}
                    onPress={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <Text style={styles.actionButtonText}>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      index === editedStatements.length - 1 &&
                        styles.disabledButton,
                    ]}
                    onPress={() => handleMoveDown(index)}
                    disabled={index === editedStatements.length - 1}
                  >
                    <Text style={styles.actionButtonText}>↓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveStatement(index)}
                  >
                    <Text style={styles.actionButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <StatementCard
                statement={statement}
                compact={true}
                showPrimaryTag={true}
                showAdditionalTags={false}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <StandardButton
          title={t('common.cancel')}
          onPress={handleCancel}
          style={styles.cancelButton}
        />
        <StandardButton
          title={t('common.save')}
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>

      {/* Statement Selector Modal */}
      {showStatementSelector && (
        <View style={styles.selectorModal}>
          <View style={styles.selectorHeader}>
            <Text style={styles.selectorTitle}>
              {t('common.selectStatement')}
            </Text>
            <TouchableOpacity
              style={styles.closeSelectorButton}
              onPress={() => setShowStatementSelector(false)}
            >
              <Text style={styles.closeSelectorButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.selectorContent}>
            {allStatements
              .filter(
                stmt => !editedStatements.some(edited => edited.id === stmt.id)
              )
              .map(statement => (
                <TouchableOpacity
                  key={statement.id}
                  style={styles.selectorItem}
                  onPress={() => handleAddStatement(statement)}
                >
                  <StatementCard
                    statement={statement}
                    compact={true}
                    showPrimaryTag={true}
                    showAdditionalTags={false}
                  />
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addButtonContainer: {
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  statementItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statementNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statementNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  removeButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#CCCCCC',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  selectorModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '90%',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeSelectorButton: {
    padding: 8,
  },
  closeSelectorButtonText: {
    fontSize: 16,
    color: '#F44336',
  },
  selectorContent: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    maxHeight: '70%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  selectorItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
});
