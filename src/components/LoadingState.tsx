import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface LoadingStateProps {
  type: 'loading' | 'empty' | 'error';
  message?: string;
  subMessage?: string;
  showSpinner?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  message,
  subMessage,
  showSpinner = true,
}) => {
  const { t } = useTranslation();

  const getDefaultMessage = () => {
    switch (type) {
      case 'loading':
        return message || t('common.loading');
      case 'empty':
        return message || t('common.noData');
      case 'error':
        return message || t('common.error');
      default:
        return '';
    }
  };

  const getDefaultSubMessage = () => {
    switch (type) {
      case 'empty':
        return subMessage || t('common.noDataSubtext');
      case 'error':
        return subMessage || t('common.errorSubtext');
      default:
        return subMessage;
    }
  };

  return (
    <View style={styles.container}>
      {type === 'loading' && showSpinner && (
        <ActivityIndicator
          size="large"
          color="#2196F3"
          style={styles.spinner}
        />
      )}

      <Text style={[styles.message, type === 'error' && styles.errorMessage]}>
        {getDefaultMessage()}
      </Text>

      {getDefaultSubMessage() && (
        <Text style={styles.subMessage}>{getDefaultSubMessage()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#F44336',
  },
  subMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
