import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ttsService, audioService, storageService } from '../services';
// import { StatementCategory } from '../types';

interface ServiceTesterProps {
  visible: boolean;
  onClose: () => void;
}

export const ServiceTester: React.FC<ServiceTesterProps> = ({
  visible,
  onClose,
}) => {
  const { t: _t, i18n } = useTranslation();
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testTTS = async () => {
    try {
      addResult('Testing TTS Service...');

      const testText =
        Platform.OS === 'web'
          ? 'Hello, this is a TTS test in English.'
          : 'This is a test of the native TTS service.';

      // Add timeout to prevent hanging
      const speakPromise = ttsService.speak(testText, {
        language: i18n.language,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('TTS test timeout after 10 seconds')),
          10000
        );
      });

      await Promise.race([speakPromise, timeoutPromise]);
      addResult('✅ TTS Service: Speech completed successfully');
    } catch (error) {
      addResult(`❌ TTS Service: ${error}`);
    }
  };

  const testStorage = async () => {
    try {
      addResult('Testing Storage Service...');

      const testStatement = {
        id: `test-${Date.now()}`,
        text: 'This is a test statement',
        language: 'en',
        multiLanguageContent: {
          en: { text: 'This is a test statement' },
        },
        primaryTag: 'breathing',
        additionalTags: ['test'],
        tags: ['test'],
        isUserCreated: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await storageService.saveStatement(testStatement);
      addResult('✅ Storage Service: Statement saved successfully');

      const statements = await storageService.loadStatements();
      addResult(`✅ Storage Service: Loaded ${statements.length} statements`);
    } catch (error) {
      addResult(`❌ Storage Service: ${error}`);
    }
  };

  const testAudio = async () => {
    try {
      addResult('Testing Audio Service...');

      await audioService.playBackgroundMusic({
        enabled: true,
        musicPath: require('../../assets/desert-oasis-117544.mp3'),
        volume: 0.3,
        loop: false,
        fadeInDuration: 0.5,
        fadeOutDuration: 0.5,
      });
      addResult('✅ Audio Service: Background music started');

      // Stop after 3 seconds
      setTimeout(async () => {
        try {
          await audioService.stopBackgroundMusic();
          addResult('✅ Audio Service: Background music stopped');
        } catch (error) {
          addResult(`❌ Audio Service Stop: ${error}`);
        }
      }, 3000);
    } catch (error) {
      addResult(`❌ Audio Service: ${error}`);
    }
  };

  const testPlatformSpecific = async () => {
    if (Platform.OS === 'web') {
      addResult('Testing Web Speech API...');
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        addResult(`✅ Web Speech API: ${voices.length} voices available`);
      } else {
        addResult('❌ Web Speech API: Not available');
      }
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      addResult('Testing Native TTS...');
      try {
        const Speech = await import('expo-speech');
        const voices = await Speech.getAvailableVoicesAsync();
        addResult(`✅ Native TTS: ${voices.length} voices available`);

        // Test if TTS service is available
        const isAvailable = await ttsService.isAvailable();
        if (isAvailable) {
          addResult('✅ TTS Service: Available');
        } else {
          addResult('❌ TTS Service: Not available');
        }
      } catch (error) {
        addResult(`❌ Native TTS: ${error}`);
      }
    }
  };

  const runAllTests = async () => {
    if (isRunning) return;

    setIsRunning(true);
    clearResults();

    addResult('Starting comprehensive service tests...');
    addResult(`Platform: ${Platform.OS}`);
    addResult(`Language: ${i18n.language}`);

    try {
      await testStorage();
      await testTTS();
      await testAudio();
      await testPlatformSpecific();

      addResult('✅ All tests completed');
    } catch (error) {
      addResult(`❌ Test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Service Tester</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runAllTests}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={clearResults}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultsContainer}>
          {results.length === 0 ? (
            <Text style={styles.emptyText}>
              No test results yet. Tap "Run All Tests" to start.
            </Text>
          ) : (
            results.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
