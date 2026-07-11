import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Heart, MessageCircle, Share2, Pencil, Trash2, Eye } from 'lucide-react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAppContext } from '../context/AppContext';
import { getAvatarById, ANONYMOUS_AVATAR } from '../constants/avatars';
import { parseHTML, stripHTML } from '../lib/htmlUtils';
import { MediaCarousel } from '../components/MediaCarousel';

type Props = {
  navigation: any; // Using any for brevity or proper navigation prop if desired
  route: RouteProp<RootStackParamList, 'StoryDetail'>;
};

const StoryDetailScreen = ({ navigation, route }: Props) => {
  const { storyId } = route.params;
  const { user, stories, toggleLikeStory, toggleBookmarkStory, deleteStory, recordStoryRead } = useAppContext();
  const story = stories.find(s => s.id === storyId);
  const [isSensitiveRevealed, setIsSensitiveRevealed] = useState(!story?.isSensitive);

  useEffect(() => {
    if (storyId) {
      recordStoryRead(storyId);
    }
  }, [storyId, recordStoryRead]);

  if (!story) return null; // Or a fallback UI

  const isAuthor = user && story.author_id === user.id;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this story: ${story.title} by ${story.author}!\n\n${stripHTML(story.text).substring(0, 100)}...`,
      });
    } catch (error) {
      console.log('Error sharing story', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Story',
      'Are you sure you want to permanently delete this story? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const didDelete = await deleteStory(story.id);
            if (didDelete) {
              Alert.alert('Success', 'Story deleted successfully.');
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Failed to delete story. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditPost', { storyId: story.id });
  };

  const authorAvatar = story.isAnonymous ? ANONYMOUS_AVATAR : (getAvatarById(story.avatar_url) ?? ANONYMOUS_AVATAR);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isAuthor && (
            <>
              <TouchableOpacity onPress={handleEdit} style={[styles.iconButton, { marginRight: 16 }]}>
                <Pencil color="#0f766e" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, { marginRight: 16 }]}>
                <Trash2 color="#be123c" size={20} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.iconButton} onPress={() => toggleBookmarkStory(story.id)}>
            <Bookmark 
              color="#1e293b" 
              size={24} 
              fill={story.isBookmarked ? "#1e293b" : "none"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Author Info */}
        <View style={styles.authorSection}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: authorAvatar.bgColor, justifyContent: 'center', alignItems: 'center' }]}>
            <authorAvatar.icon color={authorAvatar.color} size={24} />
          </View>
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{story.author}</Text>
            {story.isAnonymous ? (
              <Text style={styles.authorLocation}>Anonymous post</Text>
            ) : null}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{story.title}</Text>

        {isAuthor && (
          <View style={styles.readerBadge}>
            <Eye color="#64748b" size={14} />
            <Text style={styles.readerBadgeText}>
              {story.readerCount > 0 ? `${story.readerCount} reader${story.readerCount === 1 ? '' : 's'}` : 'No readers yet'}
            </Text>
          </View>
        )}

        {/* Media Carousel */}
        <MediaCarousel 
          imageUrl={story.imageUrl}
          isSensitive={story.isSensitive}
          isSensitiveHidden={!isSensitiveRevealed}
          onRevealSensitive={() => setIsSensitiveRevealed(true)}
        />

        {/* Story Text */}
        {story.isSensitive && !isSensitiveRevealed ? null : parseHTML(story.text)}
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
        <TouchableOpacity
          style={[styles.actionButton, !story.allowComments && styles.actionButtonDisabled]}
          onPress={() => story.allowComments && navigation.navigate('Comments', { storyId: story.id })}
          disabled={!story.allowComments}
        >
          <MessageCircle color="#1e293b" size={20} />
          <Text style={styles.actionText}>{story.allowComments ? (story.commentCount > 0 ? story.commentCount : 'Comment') : 'Comments off'}</Text>
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
    marginBottom: 12,
    lineHeight: 34,
  },
  readerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  readerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  mainImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 20,
  },
  mainImageHidden: {
    opacity: 0.3,
  },
  sensitiveGate: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sensitiveGateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  sensitiveGateText: {
    fontSize: 14,
    color: '#1e40af',
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
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default StoryDetailScreen;
