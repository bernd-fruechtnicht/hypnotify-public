import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { StatementCard } from '../components/StatementCard';
import { StandardHeader } from '../components/StandardHeader';
import { TagFilter } from '../components/TagFilter';
import { storageService } from '../services';
import { MeditationStatement, getStatementText } from '../types';
import { Tag, AVAILABLE_TAGS } from '../types/Tags';

interface LibraryScreenProps {
  onStatementSelect?: (statement: MeditationStatement) => void;
  onStatementEdit?: (statement: MeditationStatement) => void;
  onStatementDelete?: (statement: MeditationStatement) => void;
  showSelectionMode?: boolean;
  selectedStatements?: MeditationStatement[];
  onSelectionChange?: (statements: MeditationStatement[]) => void;
  onBack?: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onStatementSelect,
  onStatementEdit,
  onStatementDelete,
  showSelectionMode = false,
  selectedStatements = [],
  onSelectionChange,
  onBack,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [statements, setStatements] = useState<MeditationStatement[]>([]);
  const [filteredStatements, setFilteredStatements] = useState<
    MeditationStatement[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadStatements();
  }, []);

  useEffect(() => {
    filterStatements();
  }, [statements, searchQuery, selectedTag]);

  const loadStatements = async () => {
    try {
      setIsLoading(true);
      const loadedStatements = await storageService.loadStatements();
      setStatements(loadedStatements);
    } catch (error) {
      console.error('Failed to load statements:', error);
      Alert.alert(t('common.error'), t('library.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStatements();
    setIsRefreshing(false);
  };

  const filterStatements = () => {
    let filtered = statements;

    // Filter by tag (primary or additional)
    if (selectedTag) {
      filtered = filtered.filter(
        statement =>
          statement.primaryTag === selectedTag ||
          statement.tags.includes(selectedTag)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        statement =>
          getStatementText(statement, currentLanguage)
            .toLowerCase()
            .includes(query) ||
          statement.primaryTag?.toLowerCase().includes(query) ||
          statement.tags.some((tag: string) =>
            tag.toLowerCase().includes(query)
          )
      );
    }

    setFilteredStatements(filtered);
  };

  const handleStatementPress = (statement: MeditationStatement) => {
    if (showSelectionMode) {
      handleStatementToggle(statement);
    } else {
      onStatementSelect?.(statement);
    }
  };

  const handleStatementToggle = (statement: MeditationStatement) => {
    const isSelected = selectedStatements.some(s => s.id === statement.id);
    let newSelection: MeditationStatement[];

    if (isSelected) {
      newSelection = selectedStatements.filter(s => s.id !== statement.id);
    } else {
      newSelection = [...selectedStatements, statement];
    }

    onSelectionChange?.(newSelection);
  };

  const handleStatementLongPress = (statement: MeditationStatement) => {
    if (onStatementEdit || onStatementDelete) {
      Alert.alert(
        statement.text.substring(0, 50) + '...',
        t('library.statementActions'),
        [
          ...(onStatementEdit
            ? [
                {
                  text: t('common.edit'),
                  onPress: () => onStatementEdit(statement),
                },
              ]
            : []),
          ...(onStatementDelete
            ? [
                {
                  text: t('common.delete'),
                  style: 'destructive' as const,
                  onPress: () => handleDeleteStatement(statement),
                },
              ]
            : []),
          {
            text: t('common.cancel'),
            style: 'cancel' as const,
          },
        ]
      );
    }
  };

  const handleDeleteStatement = (statement: MeditationStatement) => {
    Alert.alert(t('common.confirm'), t('library.deleteConfirm'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await storageService.deleteStatement(statement.id);
            await loadStatements();
            onStatementDelete?.(statement);
          } catch (error) {
            console.error('Failed to delete statement:', error);
            Alert.alert(t('common.error'), t('library.deleteFailed'));
          }
        },
      },
    ]);
  };

  const getAvailableTags = (): string[] => {
    const tags = new Set<string>();
    statements.forEach(statement => {
      if (statement.primaryTag) tags.add(statement.primaryTag);
      statement.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).filter(tag => AVAILABLE_TAGS.includes(tag as Tag));
  };

  const getTagCounts = (): Record<string, number> => {
    const counts: Record<string, number> = { '': statements.length }; // All count
    statements.forEach(statement => {
      if (statement.primaryTag) {
        counts[statement.primaryTag] = (counts[statement.primaryTag] || 0) + 1;
      }
      statement.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StandardHeader
        title={t('library.title')}
        onBack={onBack}
        rightElement={
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Text style={styles.viewModeText}>
              {viewMode === 'grid' ? '☰' : '⊞'}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('library.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {/* Tag Filter */}
      <TagFilter
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        availableTags={getAvailableTags()}
        showCounts={true}
        counts={getTagCounts()}
      />

      {/* Results Summary */}
      <View style={styles.resultsSummary}>
        <Text style={styles.resultsText}>
          {t('library.resultsCount', { count: filteredStatements.length })}
        </Text>
        {showSelectionMode && (
          <Text style={styles.selectionText}>
            {t('library.selectedCount', { count: selectedStatements.length })}
          </Text>
        )}
      </View>

      {/* Statements List */}
      <ScrollView
        style={styles.statementsList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredStatements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedTag
                ? t('library.noResults')
                : t('library.emptyLibrary')}
            </Text>
          </View>
        ) : (
          filteredStatements.map(statement => {
            const isSelected = selectedStatements.some(
              s => s.id === statement.id
            );
            return (
              <StatementCard
                key={statement.id}
                statement={statement}
                onPress={() => handleStatementPress(statement)}
                onLongPress={() => handleStatementLongPress(statement)}
                isSelected={isSelected}
                showPrimaryTag={true}
                showAdditionalTags={true}
                compact={viewMode === 'grid'}
              />
            );
          })
        )}
      </ScrollView>
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
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  viewModeText: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
    marginHorizontal: 4,
  },
  selectedFilterButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedFilterButtonText: {
    color: '#FFFFFF',
  },
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  selectionText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  statementsList: {
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
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
