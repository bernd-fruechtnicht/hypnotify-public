/**
 * Language Flag Selector Component
 * Displays national flags in upper right corner for language selection
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Modal,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import CountryFlag from 'react-native-country-flag';

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
  countryCode: string;
}

const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
    countryCode: 'us',
  },
  {
    code: 'de',
    name: 'German',
    flag: '🇩🇪',
    nativeName: 'Deutsch',
    countryCode: 'de',
  },
  {
    code: 'zh',
    name: 'Chinese',
    flag: '🇨🇳',
    nativeName: '中文',
    countryCode: 'cn',
  },
];

export const LanguageFlagSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentLanguageData =
    LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  const handleLanguageSelect = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.flagButton}
        onPress={() => setIsModalVisible(true)}
        accessibilityLabel={t('common.languageSelector')}
        accessibilityHint={t('common.languageSelectorHint')}
      >
        <CountryFlag isoCode={currentLanguageData.countryCode} size={16} />
        <Text style={styles.flagFallback}>
          {currentLanguageData.code.toUpperCase()}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('common.selectLanguage')}</Text>
            <ScrollView style={styles.languageList}>
              {LANGUAGES.map(language => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    currentLanguage === language.code &&
                      styles.selectedLanguageItem,
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <CountryFlag isoCode={language.countryCode} size={20} />
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>
                      {language.nativeName}
                    </Text>
                    <Text style={styles.languageCode}>{language.name}</Text>
                  </View>
                  {currentLanguage === language.code && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  flagButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flagFallback: {
    fontSize: 8,
    color: '#666',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedLanguageItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  languageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  languageCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedIndicator: {
    fontSize: 18,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
