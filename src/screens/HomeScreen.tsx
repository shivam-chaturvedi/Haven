import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Bell, Home, Share, PartyPopper, User } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAppContext } from '../context/AppContext';
import { getAvatarById, ANONYMOUS_AVATAR } from '../constants/avatars';
import { stripHTML } from '../lib/htmlUtils';
import { MediaCarousel } from '../components/MediaCarousel';
import AppLogo from '../components/AppLogo';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen = ({ navigation }: Props) => {
  const { stories, unreadNotifCount, fetchStories } = useAppContext();
  const [revealedSensitiveIds, setRevealedSensitiveIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchStories();
    }, [fetchStories])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <AppLogo size={56} showShadow />
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')}>
            <Search color="#1e293b" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.bellWrapper}>
              <Bell color="#1e293b" size={24} />
              {unreadNotifCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadNotifCount > 9 ? '9+' : String(unreadNotifCount)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        {stories.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedTitle}>No stories yet</Text>
            <Text style={styles.emptyFeedText}>Be the first to share something with the community.</Text>
          </View>
        ) : (
          stories.map(post => {
            const authorAvatar = post.isAnonymous ? ANONYMOUS_AVATAR : (getAvatarById(post.avatar_url) ?? ANONYMOUS_AVATAR);
            const isSensitiveHidden = post.isSensitive && !revealedSensitiveIds.includes(post.id);
            return (
              <TouchableOpacity 
                key={post.id} 
                style={styles.post} 
                onPress={() => navigation.navigate('StoryDetail', { storyId: post.id })}
              >
                <View style={styles.postHeader}>
                  <View style={[styles.avatarPlaceholder, { backgroundColor: authorAvatar.bgColor, justifyContent: 'center', alignItems: 'center' }]}>
                    <authorAvatar.icon color={authorAvatar.color} size={24} />
                  </View>
                  <View style={styles.postMeta}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postLocation}>
                      {post.author}
                      {!post.isAnonymous && post.location ? ` · ${post.location}` : ''}
                    </Text>
                  </View>
                </View>
                {isSensitiveHidden ? (
                  <TouchableOpacity
                    style={styles.sensitiveCard}
                    onPress={() => setRevealedSensitiveIds(prev => [...prev, post.id])}
                  >
                    <Text style={styles.sensitiveTitle}>Sensitive content</Text>
                    <Text style={styles.sensitiveText}>Tap to reveal this post preview.</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.postText}>
                    {stripHTML(post.text).length > 200 ? stripHTML(post.text).substring(0, 200) + '...' : stripHTML(post.text)}
                  </Text>
                )}
                <MediaCarousel 
                  imageUrl={post.imageUrl}
                  isSensitive={post.isSensitive}
                  isSensitiveHidden={isSensitiveHidden}
                  onRevealSensitive={() => setRevealedSensitiveIds(prev => [...prev, post.id])}
                />
              </TouchableOpacity>
            );
          })
        )}
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
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyFeed: {
    padding: 32,
    alignItems: 'center',
  },
  emptyFeedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyFeedText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
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
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  blurredImage: {
    opacity: 0.35,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(226, 232, 240, 0.45)',
    borderRadius: 16,
  },
  sensitiveCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  sensitiveTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  sensitiveText: {
    fontSize: 14,
    color: '#1e40af',
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
  bellWrapper: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default HomeScreen;
