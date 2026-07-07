import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Home, Share, PartyPopper, User, Mouse, Dices, Leaf, Microscope, BookOpen } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FunActivities'>;
};

const FunActivitiesScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fun Activities</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trending Today */}
        <Text style={styles.sectionTitle}>Trending Today</Text>
        
        <TouchableOpacity 
          style={styles.activityItem} 
          onPress={() => Linking.openURL('https://www.abcmouse.com/')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
            <Mouse color="#d97706" size={24} />
          </View>
          <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>ABCmouse</Text>
            <Text style={styles.activityDesc}>
              Interactive games, books, and activities covering subjects like math, science, and art.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.activityItem} 
          onPress={() => Linking.openURL('https://www.prodigygame.com/')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
            <Dices color="#dc2626" size={24} />
          </View>
          <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>Prodigy</Text>
            <Text style={styles.activityDesc}>
              A math-based RPG game where kids can practice math skills by solving problems and defeating in-game creatures.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Top games this month */}
        <Text style={styles.sectionTitle}>Top games this month</Text>

        <TouchableOpacity 
          style={styles.activityItem}
          onPress={() => Linking.openURL('https://geoknights.com/')} // Replace with actual URL if known
        >
          <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
            <Leaf color="#16a34a" size={24} />
          </View>
          <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>Geoknights</Text>
            <Text style={styles.activityDesc}>
              Nature, conservation, and the environment through interactive games. Become eco-warriors and protect our world's natural treasures!
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.activityItem}
          onPress={() => Linking.openURL('https://sciencesleuths.org/')} // Replace with actual URL if known
        >
          <View style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}>
            <Microscope color="#0284c7" size={24} />
          </View>
          <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>Science Sleuths</Text>
            <Text style={styles.activityDesc}>
              Become a detective of the natural world with Science Sleuths.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Continue Playing */}
        <Text style={styles.sectionTitle}>Continue Playing</Text>

        <TouchableOpacity 
          style={styles.activityItem}
          onPress={() => Linking.openURL('https://storycraft.com/')} // Replace with actual URL if known
        >
          <View style={[styles.iconContainer, { backgroundColor: '#ede9fe' }]}>
            <BookOpen color="#7c3aed" size={24} />
          </View>
          <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>StoryCraft Kingdom</Text>
            <Text style={styles.activityDesc}>
              Create your own stories, characters, and worlds, all while developing writing skills and having a blast. The ultimate storytelling adventure!
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Extra padding at bottom for scroll space */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Home color="#64748b" size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NewPost')}>
          <Share color="#64748b" size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('FunActivities')}>
          <PartyPopper color="#1e293b" size={28} />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
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

export default FunActivitiesScreen;
