import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Share, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, EyeOff, Tag, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { db } from '../lib/db';
import { useAppContext } from '../context/AppContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PrivacySecurity'>;
};

type UserSettings = {
  private_account: boolean;
  show_activity_status: boolean;
  allow_tagging: boolean;
  strict_content_filter: boolean;
};

const defaultSettings: UserSettings = {
  private_account: false,
  show_activity_status: true,
  allow_tagging: true,
  strict_content_filter: true,
};

const PrivacySecurityScreen = ({ navigation }: Props) => {
  const { user, userProfile, stories } = useAppContext();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<keyof UserSettings | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await db
      .from('user_settings')
      .select('private_account, show_activity_status, allow_tagging, strict_content_filter')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user settings:', error);
      setSettings(defaultSettings);
    } else if (data) {
      setSettings(data);
    } else {
      const { error: insertError } = await db.from('user_settings').insert({ user_id: user.id });
      if (insertError) {
        console.error('Error creating default user settings:', insertError);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    if (!user) {
      return;
    }

    const nextSettings = { ...settings, [key]: value };
    const previous = settings;

    setSettings(nextSettings);
    setUpdatingKey(key);

    const { error } = await db.from('user_settings').upsert({
      user_id: user.id,
      ...nextSettings,
    });

    if (error) {
      console.error(`Error updating ${key}:`, error);
      setSettings(previous);
      Alert.alert('Update failed', 'We could not save that setting. Please try again.');
    }

    setUpdatingKey(null);
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handleUpdatePasswordSubmit = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      Alert.alert('Required Fields', 'Please enter both your current and new password.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Invalid Password', 'New password must be at least 6 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // Re-authenticate user to verify current password
      const { error: authError } = await db.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (authError) {
        Alert.alert('Verification Failed', 'Incorrect current password. Please try again.');
        setIsUpdatingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await db.auth.updateUser({ password: newPassword });

      if (updateError) {
        Alert.alert('Update Failed', updateError.message);
      } else {
        Alert.alert('Success', 'Your password has been changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setIsPasswordModalOpen(false);
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.warn('Change password exception:', e);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDownloadData = async () => {
    if (!user) {
      return;
    }

    const [profileRes, storyRes, commentRes, bookmarkRes, likeRes, settingsRes] = await Promise.all([
      db.from('profiles').select('*').eq('id', user.id).single(),
      db.from('stories').select('*').eq('author_id', user.id).order('created_at', { ascending: false }),
      db.from('comments').select('*').eq('author_id', user.id).order('created_at', { ascending: false }),
      db.from('story_bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      db.from('story_likes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      db.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      email: user.email,
      profile: profileRes.data || null,
      settings: settingsRes.data || null,
      stories: storyRes.data || [],
      comments: commentRes.data || [],
      bookmarks: bookmarkRes.data || [],
      likes: likeRes.data || [],
    };

    await Share.share({
      title: 'Haven account data',
      message: JSON.stringify(payload, null, 2),
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to permanently delete your account? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await db.rpc('delete_user');
          if (error) {
            Alert.alert('Delete failed', error.message);
            return;
          }

          await db.auth.signOut();
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color="#0f766e" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {userProfile?.full_name ? (
          <Text style={styles.helperBanner}>
            Settings are saved to your Haven account and sync with your live profile.
          </Text>
        ) : null}

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
            <Switch
              value={settings.private_account}
              onValueChange={value => updateSetting('private_account', value)}
              disabled={updatingKey === 'private_account'}
              trackColor={{ false: '#e2e8f0', true: '#facc15' }}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <EyeOff color="#1e293b" size={20} />
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Activity Status</Text>
                <Text style={styles.rowDesc}>Let others see when you are online</Text>
              </View>
            </View>
            <Switch
              value={settings.show_activity_status}
              onValueChange={value => updateSetting('show_activity_status', value)}
              disabled={updatingKey === 'show_activity_status'}
              trackColor={{ false: '#e2e8f0', true: '#facc15' }}
            />
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
            <Switch
              value={settings.allow_tagging}
              onValueChange={value => updateSetting('allow_tagging', value)}
              disabled={updatingKey === 'allow_tagging'}
              trackColor={{ false: '#e2e8f0', true: '#facc15' }}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <ShieldCheck color="#1e293b" size={20} />
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Strict Content Filter</Text>
                <Text style={styles.rowDesc}>Automatically hide potentially sensitive posts</Text>
              </View>
            </View>
            <Switch
              value={settings.strict_content_filter}
              onValueChange={value => updateSetting('strict_content_filter', value)}
              disabled={updatingKey === 'strict_content_filter'}
              trackColor={{ false: '#e2e8f0', true: '#facc15' }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>DATA & SECURITY</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.actionRow, styles.borderBottom]} onPress={handleChangePassword}>
            <Text style={styles.actionText}>Change Password</Text>
            <ArrowLeft color="#94a3b8" size={16} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, styles.borderBottom]} onPress={handleDownloadData}>
            <View>
              <Text style={styles.actionText}>Download Account Data</Text>
              <Text style={styles.actionSubtext}>{stories.length} stories currently synced</Text>
            </View>
            <ArrowLeft color="#94a3b8" size={16} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount}>
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete Account</Text>
            <AlertCircle color="#ef4444" size={16} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={isPasswordModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPasswordModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalSubtitle}>Verify your current password to set a new one.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry={true}
                placeholder="Enter current password"
                placeholderTextColor="#94a3b8"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry={true}
                placeholder="Enter new password (min 6 chars)"
                placeholderTextColor="#94a3b8"
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => {
                  setIsPasswordModalOpen(false);
                  setCurrentPassword('');
                  setNewPassword('');
                }}
                disabled={isUpdatingPassword}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitButton} 
                onPress={handleUpdatePasswordSubmit}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  helperBanner: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    backgroundColor: '#ecfeff',
    borderColor: '#a5f3fc',
    borderWidth: 1,
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
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
  actionSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
  modalSubmitButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PrivacySecurityScreen;
