import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAppContext } from '../context/AppContext';
import { getAvatarById } from '../constants/avatars';

type Props = {
  navigation: any; // Using any for brevity or proper navigation prop if desired
  route: RouteProp<RootStackParamList, 'StoryDetail'>;
};

const StoryDetailScreen = ({ navigation, route }: Props) => {
  const { storyId } = route.params;
  const { stories, toggleLikeStory, toggleBookmarkStory } = useAppContext();
  const story = stories.find(s => s.id === storyId);

  if (!story) return null; // Or a fallback UI

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this story: ${story.title} by ${story.author}!\n\n${story.text.substring(0, 100)}...`,
      });
    } catch (error) {
      console.log('Error sharing story', error);
    }
  };

  const authorAvatar = getAvatarById(story.avatar_url);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => toggleBookmarkStory(story.id)}>
          <Bookmark 
            color="#1e293b" 
            size={24} 
            fill={story.isBookmarked ? "#1e293b" : "none"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Author Info */}
        <View style={styles.authorSection}>
          <View style={[styles.avatarPlaceholder, authorAvatar ? { backgroundColor: authorAvatar.bgColor, justifyContent: 'center', alignItems: 'center' } : {}]}>
            {authorAvatar && <authorAvatar.icon color={authorAvatar.color} size={24} />}
          </View>
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{story.author}</Text>
            <Text style={styles.authorLocation}>{story.location}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{story.title}</Text>

        {/* Main Image */}
        <View style={styles.mainImagePlaceholder}>
          <Text style={styles.placeholderText}>Girl with face paint</Text>
        </View>

        {/* Story Text */}
        <Text style={styles.storyText}>{story.text}</Text>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionButton} onPress={() => toggleLikeStory(story.id)}>
          <Heart 
            color={story.isLiked ? "#ef4444" : "#1e293b"} 
            fill={story.isLiked ? "#ef4444" : "none"} 
            size={20} 
          />
          <Text style={styles.actionText}>{story.likeCount > 0 ? story.likeCount : 'Like'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Comments', { storyId: story.id })}>
          <MessageCircle color="#1e293b" size={20} />
          <Text style={styles.actionText}>{story.commentCount > 0 ? story.commentCount : 'Comment'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 color="#1e293b" size={20} />
          <Text style={styles.actionText}>Share</Text>
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
  iconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fca5a5',
    marginRight: 12,
  },
  authorMeta: {
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  authorLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 20,
    lineHeight: 34,
  },
  mainImagePlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#94a3b8',
  },
  storyText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default StoryDetailScreen;
