import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAppContext } from '../context/AppContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SavedStories'>;
};

const SavedStoriesScreen = ({ navigation }: Props) => {
  const { stories } = useAppContext();
  const savedStories = stories.filter(s => s.isBookmarked);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Stories</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <View style={styles.iconWrapper}>
            <Bookmark color="#f59e0b" size={32} />
          </View>
          <Text style={styles.pageDesc}>
            Stories you've saved to read later or keep forever. Only you can see this list.
          </Text>
        </View>

        {savedStories.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 20 }}>
            You haven't saved any stories yet.
          </Text>
        )}

        {savedStories.map(story => (
          <TouchableOpacity 
            key={story.id}
            style={styles.storyCard} 
            onPress={() => navigation.navigate('StoryDetail', { storyId: story.id })}
          >
            <View style={[styles.storyAvatar, { backgroundColor: '#fca5a5' }]} />
            <View style={styles.storyTextContainer}>
              <View style={styles.storyHeader}>
                <Text style={styles.storyAuthor}>{story.author}</Text>
                <Text style={styles.storyTime}>Saved</Text>
              </View>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyDesc} numberOfLines={2}>
                {story.text}
              </Text>
              <View style={styles.tagsContainer}>
                {/* Dummy tags for now */}
                <View style={styles.tag}><Text style={styles.tagText}>#story</Text></View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
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
  headerInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  storyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storyTextContainer: {
    flex: 1,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storyAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  storyTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  storyDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default SavedStoriesScreen;
