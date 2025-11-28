import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
  embedded = false,
}) => {
  const {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    isDeviceLanguage,
  } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageSelect = async (languageCode: string) => {
    await changeLanguage(languageCode);
    if (!embedded) {
      onClose();
    }
  };

  const content = (
    <View style={embedded ? styles.embeddedContainer : styles.modal}>
      {!embedded && <Text style={styles.title}>{t('settings.language')}</Text>}

      {availableLanguages.map(language => (
        <TouchableOpacity
          key={language.code}
          style={[
            styles.languageOption,
            currentLanguage === language.code && styles.selectedOption,
          ]}
          onPress={() => handleLanguageSelect(language.code)}
        >
          <View style={styles.languageInfo}>
            <Text style={styles.languageName}>{language.nativeName}</Text>
            <Text style={styles.languageCode}>{language.name}</Text>
            {currentLanguage === language.code && isDeviceLanguage && (
              <Text style={styles.deviceLanguage}>Device Language</Text>
            )}
          </View>
          {currentLanguage === language.code && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}

      {!embedded && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (embedded) {
    return visible ? content : null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>{content}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  embeddedContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deviceLanguage: {
    fontSize: 12,
    color: '#2196f3',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
});
