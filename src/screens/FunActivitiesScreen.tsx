import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Home, Share, PartyPopper, User, Mouse, Dices, Leaf, Microscope, BookOpen, Zap } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { db } from '../lib/db';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FunActivities'>;
};

type Activity = {
  id: string;
  title: string;
  description: string;
  link: string;
  icon_name: string;
  icon_color: string;
  icon_bg_color: string;
  section: string;
};

const IconMap: Record<string, any> = {
  Mouse, Dices, Leaf, Microscope, BookOpen, Zap
};

const FunActivitiesScreen = ({ navigation }: Props) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    const { data, error } = await db.from('fun_activities').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      setActivities(data);
    } else {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    // Safety net: never show skeleton for more than 8 seconds
    const guard = setTimeout(() => setLoading(false), 8000);
    fetchActivities().finally(() => clearTimeout(guard));
  }, []);

  const sections = Array.from(new Set(activities.map(a => a.section)));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fun Activities</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchActivities();
        }} />}
      >
        {loading ? (
          [1, 2, 3].map(key => (
            <View key={key} style={{ marginTop: 20 }}>
              <View style={{ width: 120, height: 20, backgroundColor: '#e2e8f0', borderRadius: 10, marginBottom: 16 }} />
              {[1, 2].map(itemKey => (
                <View key={itemKey} style={styles.activityItem}>
                  <View style={[styles.iconContainer, { backgroundColor: '#e2e8f0' }]} />
                  <View style={styles.activityTextContainer}>
                    <View style={{ width: 100, height: 16, backgroundColor: '#e2e8f0', borderRadius: 8, marginBottom: 8 }} />
                    <View style={{ width: '100%', height: 12, backgroundColor: '#e2e8f0', borderRadius: 6, marginBottom: 6 }} />
                    <View style={{ width: '80%', height: 12, backgroundColor: '#e2e8f0', borderRadius: 6 }} />
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : activities.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No activities available right now</Text>
            <Text style={styles.emptyText}>Once activities are added in Supabase, they will appear here automatically.</Text>
          </View>
        ) : (
          sections.map(section => (
            <View key={section}>
              <Text style={styles.sectionTitle}>{section}</Text>
              {activities.filter(a => a.section === section).map(activity => {
                const IconComponent = IconMap[activity.icon_name] || Zap;
                return (
                  <TouchableOpacity 
                    key={activity.id}
                    style={styles.activityItem} 
                    onPress={async () => {
                      const canOpen = await Linking.canOpenURL(activity.link);
                      if (!canOpen) {
                        Alert.alert('Invalid link', 'This activity link could not be opened.');
                        return;
                      }
                      await Linking.openURL(activity.link);
                    }}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: activity.icon_bg_color || '#f1f5f9' }]}>
                      <IconComponent color={activity.icon_color || '#64748b'} size={24} />
                    </View>
                    <View style={styles.activityTextContainer}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDesc}>{activity.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
        
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
  emptyWrap: {
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 24,
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
