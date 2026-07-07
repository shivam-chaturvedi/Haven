import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TermsOfService'>;
};

const TermsOfServiceScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        <View style={styles.documentContainer}>
          <Text style={styles.lastUpdated}>Last Updated: October 12, 2026</Text>
          
          <Text style={styles.h1}>Welcome to Haven</Text>
          <Text style={styles.paragraph}>
            These Terms of Service ("Terms") govern your use of the Haven application and services. By accessing or using our platform, you agree to be bound by these Terms and our Privacy Policy.
          </Text>

          <Text style={styles.h2}>1. Using Haven</Text>
          <Text style={styles.paragraph}>
            Haven is a safe space for storytelling and connection. You must be at least 13 years old to use the Service. You are responsible for any activity that occurs under your screen name.
          </Text>

          <Text style={styles.h2}>2. Your Content</Text>
          <Text style={styles.paragraph}>
            You retain your rights to any content you submit, post or display on or through the Services. What's yours is yours — you own your content. However, by posting content, you grant us a non-exclusive, royalty-free license to use, copy, reproduce, and process it to provide the service.
          </Text>

          <Text style={styles.h2}>3. Acceptable Use</Text>
          <Text style={styles.paragraph}>
            We prioritize safety and empathy. You agree not to use Haven to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Harass, abuse, or harm another person.</Text>
            <Text style={styles.bulletItem}>• Share explicitly violent or adult content.</Text>
            <Text style={styles.bulletItem}>• Post private information of others without consent.</Text>
            <Text style={styles.bulletItem}>• Spam, scam, or distribute malware.</Text>
          </View>

          <Text style={styles.h2}>4. Moderation</Text>
          <Text style={styles.paragraph}>
            We reserve the right to remove any content or suspend accounts that violate these Terms, our Community Guidelines, or that we otherwise reasonably determine to be harmful to the platform or our users.
          </Text>

          <Text style={styles.h2}>5. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may revise these Terms from time to time. The changes will not be retroactive, and the most current version of the Terms will always be on this page. If we make a change that, in our sole discretion, is material, we will notify you via the app.
          </Text>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  documentContainer: {
    padding: 24,
  },
  lastUpdated: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
  },
  h2: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  bulletList: {
    marginTop: 8,
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 8,
    paddingLeft: 8,
  },
});

export default TermsOfServiceScreen;
