import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, MessageCircle, UserPlus, Star } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

const NotificationsScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        <Text style={styles.sectionTitle}>Today</Text>

        <TouchableOpacity style={[styles.notificationCard, styles.unreadCard]}>
          <View style={styles.iconContainer}>
            <Heart color="#ef4444" size={20} />
          </View>
          <Text style={styles.notificationText}>
            Aanya liked your story 'Brave Little Lily'
          </Text>
          <Text style={styles.timeText}>2m</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.notificationCard, styles.unreadCard]}>
          <View style={styles.iconContainer}>
            <MessageCircle color="#0ea5e9" size={20} />
          </View>
          <Text style={styles.notificationText}>
            Marco commented: 'Loved this bedtime tale!'
          </Text>
          <Text style={styles.timeText}>1h</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.notificationCard}>
          <View style={styles.iconContainer}>
            <UserPlus color="#22c55e" size={20} />
          </View>
          <Text style={styles.notificationText}>
            Priya started following you
          </Text>
          <Text style={styles.timeText}>3h</Text>
        </TouchableOpacity>

        {/* Earlier Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Earlier</Text>

        <TouchableOpacity style={styles.notificationCard}>
          <View style={styles.iconContainer}>
            <Star color="#eab308" size={20} />
          </View>
          <Text style={styles.notificationText}>
            Your story made it to Trending Today 🎉
          </Text>
          <Text style={styles.timeText}>Yesterday</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.notificationCard}>
          <View style={styles.iconContainer}>
            <Heart color="#ef4444" size={20} />
          </View>
          <Text style={styles.notificationText}>
            12 readers liked 'Stella The Star'
          </Text>
          <Text style={styles.timeText}>2d</Text>
        </TouchableOpacity>

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    marginBottom: 8,
  },
  unreadCard: {
    backgroundColor: '#fefce8', // Pale yellow
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 12,
  },
});

export default NotificationsScreen;
