import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Tag,
  AVAILABLE_TAGS,
  getTagColor,
  getTranslatedTag,
} from '../types/Tags';

interface TagFilterProps {
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  availableTags: string[];
  showCounts?: boolean;
  counts?: Record<string, number>;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  selectedTag,
  onTagSelect,
  availableTags,
  showCounts = false,
  counts = {},
}) => {
  const { t } = useTranslation();

  // Filter available tags to only show valid tags from our fixed set
  const validTags = availableTags.filter(tag =>
    AVAILABLE_TAGS.includes(tag as Tag)
  );

  return (
    <View style={styles.container}>
      <View style={styles.tagsWrapper}>
        <TouchableOpacity
          style={[
            styles.tagButton,
            selectedTag === '' && styles.selectedTagButton,
          ]}
          onPress={() => onTagSelect('')}
        >
          <Text
            style={[
              styles.tagButtonText,
              selectedTag === '' && styles.selectedTagButtonText,
            ]}
          >
            {t('common.all')}
            {showCounts && counts[''] && ` (${counts['']})`}
          </Text>
        </TouchableOpacity>

        {validTags.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagButton,
              { backgroundColor: getTagColor(tag as Tag) },
              selectedTag === tag && styles.selectedTagButton,
            ]}
            onPress={() => onTagSelect(tag)}
          >
            <Text
              style={[
                styles.tagButtonText,
                selectedTag === tag && styles.selectedTagButtonText,
              ]}
            >
              {getTranslatedTag(tag as Tag, t)}
              {showCounts && counts[tag] && ` (${counts[tag]})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
  },
  tagButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  selectedTagButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  tagButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedTagButtonText: {
    color: '#FFFFFF',
  },
});
