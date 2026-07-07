import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, Home, Share, PartyPopper, User } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAppContext } from '../context/AppContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen = ({ navigation }: Props) => {
  const { stories } = useAppContext();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>Haven</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')}>
            <Search color="#1e293b" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Bell color="#1e293b" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        {stories.map(post => (
          <TouchableOpacity 
            key={post.id} 
            style={styles.post} 
            onPress={() => navigation.navigate('StoryDetail', { storyId: post.id })}
          >
            <View style={styles.postHeader}>
              <View style={styles.avatarPlaceholder}>
                {/* Avatar Image Placeholder */}
              </View>
              <View style={styles.postMeta}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postLocation}>{post.location}</Text>
              </View>
            </View>
            <Text style={styles.postText}>
              {post.text.length > 200 ? post.text.substring(0, 200) + '...' : post.text}
            </Text>
            {/* If you wanted an image rendering based on post.id, you could add it here */}
            {post.id === 's1' && (
              <View style={styles.postImagePlaceholder}>
                <Text style={styles.placeholderText}>Image Placeholder: Girl with face paint</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Home color="#1e293b" size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NewPost')}>
          <Share color="#64748b" size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('FunActivities')}>
          <PartyPopper color="#64748b" size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <User color="#64748b" size={28} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLogo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#facc15',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  feed: {
    flex: 1,
  },
  post: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  postMeta: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  postLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  postText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#94a3b8',
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

export default HomeScreen;
