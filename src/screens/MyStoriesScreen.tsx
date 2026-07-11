import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Eye } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigation';
import { getAvatarById } from '../constants/avatars';
import { stripHTML } from '../lib/htmlUtils';

type Story = {
  id: string;
  title: string;
  text: string;
  scheduled_for: string | null;
  is_anonymous: boolean;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyStories'>;
  route: RouteProp<RootStackParamList, 'MyStories'>;
};

const MyStoriesScreen = ({ navigation, route }: Props) => {
  const { stories, avatarId, readerCounts } = route.params;
  const selectedAvatar = getAvatarById(avatarId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Stories</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>{stories.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {stories.map(story => {
          const isScheduled = story.scheduled_for && new Date(story.scheduled_for) > new Date();
          const readerCount = readerCounts[story.id] || 0;
          return (
            <TouchableOpacity
              key={story.id}
              style={styles.storyCard}
              onPress={() =>
                isScheduled
                  ? navigation.navigate('EditPost', { storyId: story.id })
                  : navigation.navigate('StoryDetail', { storyId: story.id })
              }
            >
              <View
                style={[
                  styles.storyAvatar,
                  {
                    backgroundColor: selectedAvatar ? selectedAvatar.bgColor : '#a7f3d0',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                {selectedAvatar && (
                  <selectedAvatar.icon color={selectedAvatar.color} size={24} />
                )}
              </View>
              <View style={styles.storyTextContainer}>
                <View style={styles.storyTitleRow}>
                  <Text style={styles.storyTitle} numberOfLines={1}>
                    {story.title}
                  </Text>
                  {isScheduled && (
                    <View style={styles.scheduledBadge}>
                      <Clock color="#7c3aed" size={11} />
                      <Text style={styles.scheduledBadgeText}>Scheduled</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.storyDesc} numberOfLines={2}>
                  {stripHTML(story.text)}
                </Text>
                {!isScheduled && (
                  <View style={styles.storyMetaRow}>
                    <Eye color="#94a3b8" size={12} />
                    <Text style={styles.storyMetaText}>
                      {readerCount > 0
                        ? `${readerCount} reader${readerCount === 1 ? '' : 's'}`
                        : 'No readers yet'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  headerRight: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  storyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  storyTitle: {
    flex: 1,
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
  storyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  storyMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  scheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  scheduledBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c3aed',
  },
});

export default MyStoriesScreen;
