import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAppContext } from '../context/AppContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LikedStories'>;
};

const LikedStoriesScreen = ({ navigation }: Props) => {
  const { stories } = useAppContext();
  const likedStories = stories.filter(s => s.isLiked);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liked Stories</Text>
      </View>

      <View style={styles.content}>
        {likedStories.length === 0 ? (
          <Text style={styles.placeholderText}>You haven't liked any stories yet.</Text>
        ) : (
          likedStories.map(story => (
            <TouchableOpacity 
              key={story.id}
              style={styles.storyItem}
              onPress={() => navigation.navigate('StoryDetail', { storyId: story.id })}
            >
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyAuthor}>by {story.author}</Text>
            </TouchableOpacity>
          ))
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
  },
  storyItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  storyAuthor: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});

export default LikedStoriesScreen;
