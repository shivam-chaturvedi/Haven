import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare, BookOpen, ShieldQuestion, Mail } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HelpCenter'>;
};

const HelpCenterScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heroTitle}>How can we help you today?</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem}>
            <View style={[styles.iconWrapper, { backgroundColor: '#dbeafe' }]}>
              <BookOpen color="#3b82f6" size={24} />
            </View>
            <Text style={styles.gridItemTitle}>Getting Started</Text>
            <Text style={styles.gridItemDesc}>Basics of using Haven</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <View style={[styles.iconWrapper, { backgroundColor: '#fef3c7' }]}>
              <ShieldQuestion color="#d97706" size={24} />
            </View>
            <Text style={styles.gridItemTitle}>Account & Safety</Text>
            <Text style={styles.gridItemDesc}>Privacy and security</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqCard}>
          <TouchableOpacity style={[styles.faqRow, styles.borderBottom]}>
            <Text style={styles.faqQuestion}>How do I change my avatar?</Text>
            <ArrowLeft color="#94a3b8" size={16} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.faqRow, styles.borderBottom]}>
            <Text style={styles.faqQuestion}>Can I post completely anonymously?</Text>
            <ArrowLeft color="#94a3b8" size={16} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.faqRow, styles.borderBottom]}>
            <Text style={styles.faqQuestion}>How do I delete a story?</Text>
            <ArrowLeft color="#94a3b8" size={16} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.faqRow}>
            <Text style={styles.faqQuestion}>Who can see my saved stories?</Text>
            <ArrowLeft color="#94a3b8" size={16} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>STILL NEED HELP?</Text>
        <TouchableOpacity style={styles.contactBtn}>
          <Mail color="#FFFFFF" size={20} />
          <Text style={styles.contactBtnText}>Contact Support</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    paddingHorizontal: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  gridItemDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  faqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    paddingRight: 16,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 12,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HelpCenterScreen;
