import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StandardHeader } from '../components/StandardHeader';
import { logger } from '../utils/logger';

interface LegalScreenProps {
  onBack?: () => void;
}

export const LegalScreen: React.FC<LegalScreenProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleEmailPress = () => {
    const email = 'info@hypnohh.online';
    const subject = encodeURIComponent(
      t('legal.contactSubject', 'Contact Hypnotify')
    );
    const body = encodeURIComponent(t('legal.contactBody', 'Hello,\n\n'));
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.openURL(mailtoLink).catch(err => {
      logger.error('Failed to open email:', err);
    });
  };

  return (
    <View style={styles.container}>
      <StandardHeader
        title={t('legal.title', 'Legal Information')}
        onBack={onBack}
        showLanguageSelector={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Impressum */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('legal.imprint', 'Impressum')}
          </Text>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>{t('legal.operator', 'Operator')}:</Text>
            <Text style={styles.value}>Bernd Früchtnicht</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>{t('legal.address', 'Address')}:</Text>
            <Text style={styles.value}>Hamburg / Deutschland</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>{t('legal.email', 'E-Mail')}:</Text>
            <Text
              style={[styles.value, styles.link]}
              onPress={handleEmailPress}
            >
              info@hypnohh.online
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('legal.disclaimer', 'Disclaimer / Haftungsausschluss')}
          </Text>

          <Text style={styles.paragraph}>
            {t(
              'legal.disclaimerText',
              'The use of this app is at your own risk. The app is provided "as is" without any warranties or guarantees.'
            )}
          </Text>

          <Text style={styles.paragraph}>
            {t(
              'legal.noMedicalAdvice',
              'This app does not provide medical advice, diagnosis, or treatment. The meditation and hypnosis content is for relaxation and personal development purposes only.'
            )}
          </Text>

          <Text style={styles.paragraph}>
            {t(
              'legal.noDriving',
              '⚠️ IMPORTANT: Do not use this app while driving, operating machinery, or performing any activity that requires your full attention. Use only in a safe environment where you can relax without distractions.'
            )}
          </Text>

          <Text style={styles.paragraph}>
            {t(
              'legal.noLiability',
              'The operator assumes no liability for any damages, injuries, or losses resulting from the use or inability to use this app.'
            )}
          </Text>

          <Text style={styles.paragraph}>
            {t(
              'legal.contentAccuracy',
              'While we strive to provide accurate information, we make no representations or warranties about the accuracy, completeness, or suitability of the content for any particular purpose.'
            )}
          </Text>
        </View>

        {/* Data Protection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('legal.dataProtection', 'Data Protection')}
          </Text>

          <Text style={styles.paragraph}>
            {t(
              'legal.dataProtectionText',
              'This app processes data locally on your device. We do not collect, store, or transmit personal data to external servers, except for the Text-to-Speech synthesis service which processes your meditation statements to generate audio.'
            )}
          </Text>

          <Text style={styles.paragraph}>
            {t(
              'legal.ttsService',
              'The TTS service may process your statements temporarily to generate audio. No personal data is stored permanently by the TTS service.'
            )}
          </Text>
        </View>

        {/* Version Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('legal.version', 'Version Information')}
          </Text>
          <Text style={styles.paragraph}>
            {t('legal.appVersion', 'App Version')}: 1.0.0
          </Text>
          <Text style={styles.paragraph}>
            {t('legal.lastUpdated', 'Last Updated')}:{' '}
            {new Date().toLocaleDateString(currentLanguage)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoBlock: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
});
