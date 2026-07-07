import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Search'>;
};

const SearchScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Search Bar */}
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
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Trending</Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {['Bedtime tales', 'Brave girls', 'Space stories', 'Forest', 'Yoga'].map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tagBtn}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results List */}
        <View style={styles.resultsList}>
          {/* Item 1 */}
          <TouchableOpacity style={styles.resultItem} onPress={() => navigation.navigate('StoryDetail')}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#fca5a5' }]} />
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultTitle}>Brave Little Lily: A Story of Courage</Text>
              <Text style={styles.resultMeta}>Aanya R. · New Delhi, India</Text>
            </View>
          </TouchableOpacity>

          {/* Item 2 */}
          <TouchableOpacity style={styles.resultItem} onPress={() => navigation.navigate('StoryDetail')}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#fef08a' }]} />
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultTitle}>Stella The Star</Text>
              <Text style={styles.resultMeta}>Marco V. · Lisbon, Portugal</Text>
            </View>
          </TouchableOpacity>

          {/* Item 3 */}
          <TouchableOpacity style={[styles.resultItem, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('StoryDetail')}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#a7f3d0' }]} />
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultTitle}>The Whispering Forest</Text>
              <Text style={styles.resultMeta}>Priya K. · Bengaluru, India</Text>
            </View>
          </TouchableOpacity>
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
  resultsList: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
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
