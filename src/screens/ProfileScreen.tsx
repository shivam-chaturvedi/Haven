import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Bookmark, Home, Share, PartyPopper, User, Heart, Pencil, LogOut, X, Trash2 } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAppContext } from '../context/AppContext';
import { DEFAULT_AVATARS, getAvatarById } from '../constants/avatars';
import { db } from '../lib/db';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const screenWidth = Dimensions.get('window').width;

const ProfileScreen = ({ navigation }: Props) => {
  const { userProfile, stories, updateUserAvatar } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectAvatar = async (avatar: any) => {
    await updateUserAvatar(avatar.id);
    setIsModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => {
        await db.auth.signOut();
        navigation.replace('Login');
      }}
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to permanently delete your account? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await db.rpc('delete_user');
        await db.auth.signOut();
        navigation.replace('Login');
      }}
    ]);
  };

  const myStories = stories.filter(s => s.author === userProfile?.full_name);
  const selectedAvatar = getAvatarById(userProfile?.avatar_url);

  // No local loading state needed, handled by RootNavigator in AppNavigation

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
          <Settings color="#475569" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            {selectedAvatar ? (
              <View style={[styles.avatarPlaceholder, { backgroundColor: selectedAvatar.bgColor, justifyContent: 'center', alignItems: 'center' }]}>
                <selectedAvatar.icon color={selectedAvatar.color} size={48} />
              </View>
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            
            <TouchableOpacity style={styles.editAvatarBtn} onPress={() => setIsModalVisible(true)}>
              <Pencil color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{userProfile?.full_name || 'Anonymous'}</Text>
          {userProfile?.bio ? (
            <Text style={styles.profileBio}>{userProfile.bio}</Text>
          ) : null}
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myStories.length}</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Readers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myStories.reduce((acc, curr) => acc + curr.likeCount, 0)}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.writeButton} onPress={() => navigation.navigate('NewPost')}>
          <Text style={styles.writeButtonText}>+ Write a new story</Text>
        </TouchableOpacity>

        {myStories.length > 0 && <Text style={styles.sectionTitle}>My Stories</Text>}

        {myStories.map(story => (
          <TouchableOpacity key={story.id} style={styles.storyCard} onPress={() => navigation.navigate('StoryDetail', { storyId: story.id })}>
            <View style={[styles.storyAvatar, { backgroundColor: selectedAvatar ? selectedAvatar.bgColor : '#fca5a5', justifyContent: 'center', alignItems: 'center' }]}>
              {selectedAvatar && <selectedAvatar.icon color={selectedAvatar.color} size={24} />}
            </View>
            <View style={styles.storyTextContainer}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyDesc} numberOfLines={2}>{story.text}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.settingsMenuCard}>
          <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={() => navigation.navigate('SavedStories')}>
            <Bookmark color="#1e293b" size={20} />
            <Text style={styles.menuText}>Saved stories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={() => navigation.navigate('LikedStories')}>
            <Heart color="#1e293b" size={20} />
            <Text style={styles.menuText}>Liked</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={() => navigation.navigate('EditProfile')}>
            <Pencil color="#1e293b" size={20} />
            <Text style={styles.menuText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={handleLogout}>
            <LogOut color="#ef4444" size={20} />
            <Text style={[styles.menuText, { color: '#ef4444' }]}>Log out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={handleDeleteAccount}>
            <Trash2 color="#dc2626" size={20} />
            <Text style={[styles.menuText, { color: '#dc2626' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 20 }} />
      </ScrollView>

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                <X color="#1e293b" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarGrid}>
              {DEFAULT_AVATARS.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.avatarOption, { backgroundColor: item.bgColor }]} 
                  onPress={() => handleSelectAvatar(item)}
                >
                  <item.icon color={item.color} size={36} />
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
  },
  iconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef08a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#a7f3d0',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1e293b',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: '#1e293b',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingVertical: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  writeButton: {
    backgroundColor: '#facc15',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  writeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
  },
  storyCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  storyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  storyTextContainer: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  storyDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  settingsMenuCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    marginTop: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  avatarOption: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
