import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { StandardHeader } from './StandardHeader';
import { StandardButton } from './StandardButton';
import { StatementCard } from './StatementCard';
import { TagFilter } from './TagFilter';
import { MeditationStatement, getStatementText } from '../types';
import { Tag, AVAILABLE_TAGS } from '../types/Tags';

interface StatementSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (statements: MeditationStatement[]) => void;
  availableStatements: MeditationStatement[];
  selectedStatements: string[]; // IDs of already selected statements
}

export const StatementSelector: React.FC<StatementSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  availableStatements,
  selectedStatements,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Get all unique tags from available statements
  const getAvailableTags = (): string[] => {
    const tags = new Set<string>();
    availableStatements.forEach(statement => {
      // Add all tags from the tags array
      if (statement.tags) {
        statement.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).filter(tag => AVAILABLE_TAGS.includes(tag as Tag));
  };

  const availableTags = getAvailableTags();

  // Filter and sort statements based on search, tag, and exclude already selected ones
  const filteredStatements = availableStatements
    .filter(statement => {
      const isNotSelected = !selectedStatements.includes(statement.id);
      const matchesSearch =
        searchQuery === '' ||
        getStatementText(statement, currentLanguage)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesTag =
        selectedTag === '' ||
        statement.primaryTag === selectedTag ||
        (statement.tags && statement.tags.includes(selectedTag));
      return isNotSelected && matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      // If no tag is selected, maintain original order
      if (selectedTag === '') return 0;

      // Prioritize exact primaryTag matches over tag matches
      const aIsPrimaryMatch = a.primaryTag === selectedTag;
      const bIsPrimaryMatch = b.primaryTag === selectedTag;

      if (aIsPrimaryMatch && !bIsPrimaryMatch) return -1;
      if (!aIsPrimaryMatch && bIsPrimaryMatch) return 1;

      // If both or neither are primaryTag matches, check tags
      const aHasTag = a.tags && a.tags.includes(selectedTag);
      const bHasTag = b.tags && b.tags.includes(selectedTag);

      if (aHasTag && !bHasTag) return -1;
      if (!aHasTag && bHasTag) return 1;

      // If both have same match level, maintain original order
      return 0;
    });

  const handleToggleSelection = (statementId: string) => {
    setSelectedIds(prev =>
      prev.includes(statementId)
        ? prev.filter(id => id !== statementId)
        : [...prev, statementId]
    );
  };

  const handleConfirm = () => {
    const selectedStatements = availableStatements.filter(stmt =>
      selectedIds.includes(stmt.id)
    );
    onSelect(selectedStatements);
    setSelectedIds([]);
    setSearchQuery('');
  };

  const handleCancel = () => {
    setSelectedIds([]);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StandardHeader
          title={t('sessionEdit.addStatements')}
          onBack={handleCancel}
          inModal={true}
        />

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('library.search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {availableTags.length > 0 && (
            <TagFilter
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
              availableTags={availableTags}
              showCounts={false}
            />
          )}
        </View>

        <ScrollView
          style={styles.content}
          contentInsetAdjustmentBehavior={
            Platform.OS === 'ios' ? 'automatic' : undefined
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredStatements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? t('library.noResults')
                  : t('sessionEdit.noAvailableStatements')}
              </Text>
            </View>
          ) : (
            filteredStatements.map(statement => (
              <TouchableOpacity
                key={statement.id}
                style={[
                  styles.statementItem,
                  selectedIds.includes(statement.id) &&
                    styles.selectedStatementItem,
                ]}
                onPress={() => handleToggleSelection(statement.id)}
              >
                <View style={styles.statementContent}>
                  <StatementCard
                    statement={statement}
                    compact={true}
                    showPrimaryTag={true}
                    showAdditionalTags={true}
                  />
                </View>
                <View style={styles.selectionIndicator}>
                  {selectedIds.includes(statement.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {selectedIds.length > 0 && (
          <View style={styles.bottomBar}>
            <Text style={styles.selectionCount}>
              {selectedIds.length} {t('common.selected')}
            </Text>
            <StandardButton
              title={t('common.add')}
              onPress={handleConfirm}
              variant="success"
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedStatementItem: {
    backgroundColor: '#E3F2FD',
  },
  statementContent: {
    flex: 1,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmark: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  selectionCount: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
