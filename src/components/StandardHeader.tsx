import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LanguageFlagSelector } from './LanguageFlagSelector';

interface StandardHeaderProps {
  title: string;
  onBack?: () => void;
  showLanguageSelector?: boolean;
  rightElement?: React.ReactNode;
  subtitle?: string;
  subtitleElement?: React.ReactNode;
  actionButton?: {
    text: string;
    onPress: () => void;
    style?: 'primary' | 'secondary';
  };
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  onBack,
  showLanguageSelector = true,
  rightElement,
  subtitle,
  subtitleElement,
  actionButton,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {/* Top row: Back button, Title, Language selector or right element */}
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← {t('common.back')}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.headerRight}>
          {rightElement}
          {showLanguageSelector && <LanguageFlagSelector />}
        </View>
      </View>

      {/* Bottom row: Subtitle and action button */}
      {(subtitle || subtitleElement || actionButton) && (
        <View style={styles.headerBottom}>
          <View style={styles.subtitleContainer}>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {subtitleElement}
          </View>

          {actionButton && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                actionButton.style === 'secondary' &&
                  styles.actionButtonSecondary,
              ]}
              onPress={actionButton.onPress}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  actionButton.style === 'secondary' &&
                    styles.actionButtonTextSecondary,
                ]}
              >
                {actionButton.text}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  subtitleContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButtonTextSecondary: {
    color: '#FFFFFF',
  },
});
