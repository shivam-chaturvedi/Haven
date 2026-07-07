import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, Bell, Moon, Lock, Globe, User, Shield, HelpCircle, FileText, Home, Share, PartyPopper } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

const SettingsScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Banner */}
        <TouchableOpacity style={styles.userBanner} onPress={() => navigation.navigate('EditProfile')}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>William Jones</Text>
            <Text style={styles.userSub}>View and edit your profile</Text>
          </View>
          <ChevronRight color="#94a3b8" size={20} />
        </TouchableOpacity>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom]}>
            <View style={styles.rowLeft}>
              <Bell color="#1e293b" size={20} />
              <Text style={styles.rowText}>Push notifications</Text>
            </View>
            <Switch value={true} onValueChange={() => {}} trackColor={{ false: '#e2e8f0', true: '#facc15' }} />
          </View>
        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.rowLeft}>
              <User color="#1e293b" size={20} />
              <Text style={styles.rowText}>Edit profile</Text>
            </View>
            <ChevronRight color="#94a3b8" size={16} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('PrivacySecurity')}>
            <View style={styles.rowLeft}>
              <Shield color="#1e293b" size={20} />
              <Text style={styles.rowText}>Privacy & security</Text>
            </View>
            <ChevronRight color="#94a3b8" size={16} />
          </TouchableOpacity>
        </View>

        {/* SUPPORT */}
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => navigation.navigate('HelpCenter')}>
            <View style={styles.rowLeft}>
              <HelpCircle color="#1e293b" size={20} />
              <Text style={styles.rowText}>Help center</Text>
            </View>
            <ChevronRight color="#94a3b8" size={16} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('TermsOfService')}>
            <View style={styles.rowLeft}>
              <FileText color="#1e293b" size={20} />
              <Text style={styles.rowText}>Terms of service</Text>
            </View>
            <ChevronRight color="#94a3b8" size={16} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Home color="#64748b" size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NewPost')}>
          <Share color="#64748b" size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('FunActivities')}>
          <PartyPopper color="#64748b" size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <User color="#1e293b" size={28} />
        </TouchableOpacity>
      </View>
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
  },
  iconButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a7f3d0',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  userSub: {
    fontSize: 14,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    marginBottom: 24,
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
    gap: 12,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: '#64748b',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SettingsScreen;
