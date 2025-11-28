import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { MeditationStatement, getStatementText } from '../types';
import { Tag, getTagColor, getTranslatedTag } from '../types/Tags';

interface StatementCardProps {
  statement: MeditationStatement;
  onPress?: (statement: MeditationStatement) => void;
  onLongPress?: (statement: MeditationStatement) => void;
  isSelected?: boolean;
  isPlaying?: boolean;
  showPrimaryTag?: boolean;
  showAdditionalTags?: boolean;
  compact?: boolean;
}

export const StatementCard: React.FC<StatementCardProps> = ({
  statement,
  onPress,
  onLongPress,
  isSelected = false,
  isPlaying = false,
  showPrimaryTag = true,
  showAdditionalTags = true,
  compact = false,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (onPress) {
      // Add subtle press animation
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: false, // Web compatibility
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false, // Web compatibility
        }),
      ]).start();

      onPress(statement);
    }
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleValue }] }]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.selectedCard,
          isPlaying && styles.playingCard,
          compact && styles.compactCard,
        ]}
        onPress={handlePress}
        onLongPress={() => onLongPress?.(statement)}
        activeOpacity={0.7}
      >
        {/* Header with primary tag */}
        <View style={styles.header}>
          {showPrimaryTag && statement.primaryTag && (
            <View
              style={[
                styles.primaryTagBadge,
                { backgroundColor: getTagColor(statement.primaryTag as Tag) },
              ]}
            >
              <Text style={styles.primaryTagText}>
                {getTranslatedTag(statement.primaryTag as Tag, t)}
              </Text>
            </View>
          )}

          <View style={styles.headerRight}>
            {isPlaying && (
              <View style={styles.playingIndicator}>
                <Text style={styles.playingText}>🔊</Text>
              </View>
            )}
          </View>
        </View>

        {/* Statement text */}
        <Text
          style={[styles.statementText, compact && styles.compactStatementText]}
          numberOfLines={compact ? 2 : 3}
        >
          {getStatementText(statement, currentLanguage)}
        </Text>

        {/* Footer with additional tags */}
        {showAdditionalTags && statement.tags && statement.tags.length > 1 && (
          <View style={styles.tagsContainer}>
            {statement.tags.slice(1).map((tag, index) => (
              <Text key={index} style={styles.tag}>
                #{getTranslatedTag(tag as Tag, t)}
              </Text>
            ))}
          </View>
        )}

        {/* User created indicator */}
        {statement.isUserCreated && (
          <View style={styles.userCreatedBadge}>
            <Text style={styles.userCreatedText}>✨</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: '#F3F9FF',
  },
  playingCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F1F8E9',
  },
  compactCard: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  playingIndicator: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  playingText: {
    fontSize: 10,
  },
  statementText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  compactStatementText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  moreTags: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  userCreatedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  userCreatedText: {
    fontSize: 16,
  },
});
