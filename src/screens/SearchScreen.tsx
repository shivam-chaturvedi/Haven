import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { db } from '../lib/db';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Search'>;
};

type SearchResult = {
  id: string;
  title: string;
  author_name: string | null;
  location: string | null;
  like_count: number | null;
};

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'into', 'your', 'this', 'that', 'story', 'stories', 'about', 'little',
]);

const SearchScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchTrendingTopics = async () => {
    const { data, error } = await db
      .from('stories_with_stats')
      .select('title, text, like_count')
      .order('like_count', { ascending: false })
      .limit(20);

    if (error || !data) {
      console.error('Error fetching trending topics:', error);
      setTrendingTopics([]);
      return;
    }

    const words = data
      .flatMap(item => `${item.title || ''} ${item.text || ''}`.split(/[^a-zA-Z]+/))
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 3 && !STOP_WORDS.has(word));

    const frequency = words.reduce<Record<string, number>>((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const topics = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

    setTrendingTopics(topics);
  };

  const runSearch = async (value: string) => {
    setSearching(true);

    const trimmed = value.trim();
    let queryBuilder = db
      .from('stories_with_stats')
      .select('id, title, author_name, location, like_count')
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    if (trimmed) {
      queryBuilder = queryBuilder.or(`title.ilike.%${trimmed}%,author_name.ilike.%${trimmed}%,text.ilike.%${trimmed}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error searching stories:', error);
      setResults([]);
    } else {
      setResults(data || []);
    }

    setSearching(false);
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      setLoading(true);
      await Promise.all([fetchTrendingTopics(), runSearch('')]);
      if (active) {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSearch(query);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const emptyText = useMemo(() => {
    if (query.trim()) {
      return 'No matching stories or authors found yet.';
    }
    return 'No stories are available to search right now.';
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Search color="#94a3b8" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories, authors..."
            placeholderTextColor="#94a3b8"
            autoFocus
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Trending</Text>

        <View style={styles.tagsContainer}>
          {trendingTopics.length > 0 ? trendingTopics.map(topic => (
            <TouchableOpacity key={topic} style={styles.tagBtn} onPress={() => setQuery(topic)}>
              <Text style={styles.tagText}>{topic}</Text>
            </TouchableOpacity>
          )) : (
            <Text style={styles.helperText}>Trending topics will appear as stories pick up activity.</Text>
          )}
        </View>

        <View style={styles.resultsList}>
          {loading || searching ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color="#0f766e" />
            </View>
          ) : results.length === 0 ? (
            <Text style={styles.emptyText}>{emptyText}</Text>
          ) : (
            results.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.resultItem, index === results.length - 1 && styles.lastResultItem]}
                onPress={() => navigation.navigate('StoryDetail', { storyId: item.id })}
              >
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{(item.author_name || item.title).charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultMeta}>
                    {item.author_name || 'Unknown author'}
                    {item.location ? ` · ${item.location}` : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconButton: {
    marginRight: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tagBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  helperText: {
    fontSize: 14,
    color: '#64748b',
  },
  resultsList: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  loaderWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    color: '#64748b',
    fontSize: 15,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastResultItem: {
    borderBottomWidth: 0,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#475569',
  },
  resultTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default SearchScreen;
