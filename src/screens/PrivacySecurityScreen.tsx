import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, EyeOff, Tag, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PrivacySecurity'>;
};

const PrivacySecurityScreen = ({ navigation }: Props) => {
  const [privateAccount, setPrivateAccount] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);
  const [allowTagging, setAllowTagging] = useState(true);
  const [contentFilter, setContentFilter] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>ACCOUNT PRIVACY</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom]}>
            <View style={styles.rowLeft}>
              <Lock color="#1e293b" size={20} />
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Private Account</Text>
                <Text style={styles.rowDesc}>Only approved followers can see your stories</Text>
              </View>
            </View>
            <Switch value={privateAccount} onValueChange={setPrivateAccount} trackColor={{ false: '#e2e8f0', true: '#facc15' }} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <EyeOff color="#1e293b" size={20} />
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Activity Status</Text>
                <Text style={styles.rowDesc}>Let others see when you are online</Text>
              </View>
            </View>
            <Switch value={activityStatus} onValueChange={setActivityStatus} trackColor={{ false: '#e2e8f0', true: '#facc15' }} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>INTERACTIONS</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom]}>
            <View style={styles.rowLeft}>
              <Tag color="#1e293b" size={20} />
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Allow Tagging</Text>
                <Text style={styles.rowDesc}>Let others tag you in their stories</Text>
              </View>
            </View>
            <Switch value={allowTagging} onValueChange={setAllowTagging} trackColor={{ false: '#e2e8f0', true: '#facc15' }} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <ShieldCheck color="#1e293b" size={20} />
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Strict Content Filter</Text>
                <Text style={styles.rowDesc}>Automatically hide potentially sensitive posts</Text>
              </View>
            </View>
            <Switch value={contentFilter} onValueChange={setContentFilter} trackColor={{ false: '#e2e8f0', true: '#facc15' }} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>DATA & SECURITY</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.actionRow, styles.borderBottom]}>
            <Text style={styles.actionText}>Change Password</Text>
            <ArrowLeft color="#94a3b8" size={16} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, styles.borderBottom]}>
            <Text style={styles.actionText}>Download Account Data</Text>
            <ArrowLeft color="#94a3b8" size={16} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow}>
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete Account</Text>
            <AlertCircle color="#ef4444" size={16} />
          </TouchableOpacity>
        </View>

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
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default PrivacySecurityScreen;
