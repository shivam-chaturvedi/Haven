import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Star,
  Bookmark,
  Reply,
  CheckCheck,
  BellOff,
  Trash2,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { db } from '../lib/db';
import { useAppContext } from '../context/AppContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

type NotificationType = 'like' | 'comment' | 'reply' | 'bookmark' | 'published' | 'deleted';

type NotificationItem = {
  id: string;
  storyId?: string;
  commentId?: string;
  createdAt: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actorName?: string;
  actorAvatarUrl?: string;
};

const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Yesterday';
  }

  return `${diffDays}d ago`;
};

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case 'comment':
      return <MessageCircle color="#0ea5e9" size={20} />;
    case 'reply':
      return <Reply color="#7c3aed" size={20} />;
    case 'bookmark':
      return <Bookmark color="#8b5cf6" size={20} />;
    case 'published':
      return <Star color="#eab308" size={20} />;
    case 'deleted':
      return <Trash2 color="#ef4444" size={20} />;
    case 'like':
    default:
      return <Heart color="#ef4444" size={20} />;
  }
};

const NotificationIconBg: Record<NotificationType, string> = {
  comment: '#e0f2fe',
  reply: '#ede9fe',
  bookmark: '#f3e8ff',
  published: '#fef9c3',
  deleted: '#fee2e2',
  like: '#fee2e2',
};

const NotificationsScreen = ({ navigation }: Props) => {
  const { user, markAllNotificationsRead } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data, error } = await db
      .from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(full_name, avatar_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) {
      console.warn('[NotificationsScreen] Error fetching notifications:', error);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const items: NotificationItem[] = (data || []).map(n => {
      const actor = Array.isArray(n.actor) ? n.actor[0] : n.actor;
      return {
        id: n.id,
        storyId: n.story_id || undefined,
        commentId: n.comment_id || undefined,
        createdAt: n.created_at,
        message: n.message,
        type: n.type as NotificationType,
        isRead: n.is_read,
        actorName: actor?.full_name || undefined,
        actorAvatarUrl: actor?.avatar_url || undefined,
      };
    });

    setNotifications(items);
    setLoading(false);
    setRefreshing(false);
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark all as read when screen is opened
  useEffect(() => {
    if (user?.id) {
      markAllNotificationsRead();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const todayItems = useMemo(
    () => notifications.filter(item => new Date(item.createdAt).toDateString() === new Date().toDateString()),
    [notifications],
  );
  const earlierItems = useMemo(
    () => notifications.filter(item => new Date(item.createdAt).toDateString() !== new Date().toDateString()),
    [notifications],
  );

  const handleTap = async (item: NotificationItem) => {
    // Mark this individual item as read locally
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    // Update DB
    await db.from('notifications').update({ is_read: true }).eq('id', item.id);
    // Navigate to linked story if available
    if (item.storyId) {
      navigation.navigate('StoryDetail', { storyId: item.storyId });
    }
  };

  const renderNotificationCard = (item: NotificationItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => handleTap(item)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconContainer, { backgroundColor: NotificationIconBg[item.type] ?? '#f1f5f9' }]}>
        <NotificationIcon type={item.type} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.notificationText} numberOfLines={3}>
          {item.message}
        </Text>
        <Text style={styles.timeText}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: NotificationItem[]) => {
    if (items.length === 0) return null;
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map(renderNotificationCard)}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.some(n => n.isRead) && (
          <View style={styles.allReadBadge}>
            <CheckCheck color="#0f766e" size={16} />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNotifications();
            }}
            tintColor="#0f766e"
          />
        }
      >
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color="#0f766e" size="large" />
            <Text style={styles.loaderText}>Loading notifications…</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyWrap}>
            <BellOff color="#cbd5e1" size={52} />
            <Text style={styles.emptyTitle}>All quiet here</Text>
            <Text style={styles.emptyText}>
              When people like, comment, or interact with your stories, you'll see it here.
            </Text>
          </View>
        ) : (
          <>
            {renderSection('Today', todayItems)}
            {renderSection('Earlier', earlierItems)}
          </>
        )}
        <View style={{ height: 40 }} />
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
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  allReadBadge: {
    padding: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loaderWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748b',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  unreadCard: {
    backgroundColor: '#fefce8',
    borderColor: '#fde68a',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0f766e',
    flexShrink: 0,
  },
});

export default NotificationsScreen;
