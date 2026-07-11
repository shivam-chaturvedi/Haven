import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { db } from '../lib/db';
import { clearCachedAuthStatus, getCachedAuthStatus, setCachedAuthStatus } from '../lib/authStorage';

export type Comment = {
  id: string;
  storyId: string;
  author: string;
  time: string;
  text: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  imageUri?: string;
  author_id?: string;
  avatar_url?: string;
};

export type Story = {
  id: string;
  title: string;
  author: string;
  author_id?: string;
  location?: string;
  text: string;
  imageUrl?: string;
  isAnonymous: boolean;
  allowComments: boolean;
  isSensitive: boolean;
  scheduledFor?: string | null;
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  commentCount: number;
  readerCount: number;
  avatar_url?: string;
};

type AddStoryInput = {
  title: string;
  text: string;
  imageUrl?: string;
  isAnonymous?: boolean;
  allowComments?: boolean;
  isSensitive?: boolean;
  scheduledFor?: string | null;
};

type UserProfile = {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
};

type AppContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  cachedIsLoggedIn: boolean;
  stories: Story[];
  comments: Comment[];
  unreadNotifCount: number;
  fetchStories: () => Promise<void>;
  fetchComments: (storyId: string) => Promise<void>;
  toggleLikeStory: (id: string) => Promise<void>;
  toggleBookmarkStory: (id: string) => Promise<void>;
  addComment: (storyId: string, text: string, replyToId?: string, imageUri?: string) => Promise<void>;
  addStory: (input: AddStoryInput) => Promise<boolean>;
  toggleLikeComment: (commentId: string) => Promise<void>;
  updateUserAvatar: (uri: string) => Promise<void>;
  updateProfileDetails: (name: string, bio: string) => Promise<void>;
  editStory: (id: string, input: Partial<AddStoryInput>) => Promise<boolean>;
  deleteStory: (id: string) => Promise<boolean>;
  recordStoryRead: (storyId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [cachedIsLoggedIn, setCachedIsLoggedIn] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Keep user ID in ref to prevent useCallback recreation loop
  const userRef = React.useRef<User | null>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const storiesRef = React.useRef<Story[]>(stories);
  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  const fetchStories = useCallback(async (activeUserId?: string) => {
    const currentUserId = activeUserId || userRef.current?.id;
    console.log('[fetchStories] start, user:', currentUserId);
    try {
      // Primary: stats view (has like/comment/reader counts + author info)
      let storiesData: any[] = [];
      const { data: statsData, error: statsError } = await db
        .from('stories_with_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (!statsError && statsData) {
        storiesData = statsData;
        console.log('[fetchStories] stories_with_stats returned', statsData.length, 'rows');
      } else {
        console.warn('[fetchStories] stories_with_stats error:', statsError?.message, '— falling back');
        // Fallback: plain stories table + manual profile join
        const { data: rawStories, error: rawError } = await db
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false });

        if (rawError || !rawStories) {
          console.warn('[fetchStories] stories table error:', rawError?.message);
          return;
        }

        const authorIds = Array.from(
          new Set((rawStories as any[]).map((s: any) => s.author_id).filter(Boolean))
        );
        const profilesById = new Map<string, any>();
        if (authorIds.length > 0) {
          const { data: profiles } = await db
            .from('profiles')
            .select('id, full_name, avatar_url, location')
            .in('id', authorIds);
          (profiles || []).forEach((p: any) => profilesById.set(p.id, p));
        }
        storiesData = rawStories.map((s: any) => {
          const p = s.author_id ? profilesById.get(s.author_id) : null;
          return {
            ...s,
            author_name: p?.full_name || null,
            author_avatar: p?.avatar_url || null,
            author_location: p?.location || null,
            like_count: 0,
            comment_count: 0,
            reader_count: 0,
          };
        });
        console.log('[fetchStories] fallback returned', storiesData.length, 'rows');
      }

      // Fetch per-user liked/bookmarked sets
      const likedSet = new Set<string>();
      const bookmarkedSet = new Set<string>();
      if (currentUserId) {
        const [likesRes, bookmarksRes] = await Promise.all([
          db.from('story_likes').select('story_id').eq('user_id', currentUserId),
          db.from('story_bookmarks').select('story_id').eq('user_id', currentUserId),
        ]);
        (likesRes.data || []).forEach((l: any) => likedSet.add(l.story_id));
        (bookmarksRes.data || []).forEach((b: any) => bookmarkedSet.add(b.story_id));
      }

      const now = new Date();
      const formatted: Story[] = (storiesData || [])
        .filter((s: any) => !s.scheduled_for || new Date(s.scheduled_for) <= now)
        .map((s: any) => ({
          id: s.id,
          title: s.title,
          author: s.is_anonymous ? 'Anonymous User' : (s.author_name || 'Unknown'),
          author_id: s.author_id || undefined,
          location: s.author_location || s.location || undefined,
          text: s.text,
          imageUrl: s.image_url,
          isAnonymous: !!s.is_anonymous,
          allowComments: s.allow_comments !== false,
          isSensitive: !!s.is_sensitive,
          scheduledFor: s.scheduled_for || null,
          isLiked: likedSet.has(s.id),
          isBookmarked: bookmarkedSet.has(s.id),
          likeCount: s.like_count || 0,
          commentCount: s.comment_count || 0,
          readerCount: s.reader_count || 0,
          avatar_url: s.is_anonymous ? undefined : (s.author_avatar || undefined),
        }));
      console.log('[fetchStories] done, formatted:', formatted.length, 'stories');
      setStories(formatted);
    } catch (err) {
      console.warn('[fetchStories] exception:', err);
    }
  }, []);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await db.from('profiles').select('*').eq('id', userId).single();
      if (error) console.warn('[loadUserData] error:', error.message);
      if (data) setUserProfile(data);
    } catch (err) {
      console.warn('[loadUserData] exception:', err);
    }
  }, []);

  // Keep refs to latest callbacks so the stable auth effect can call them
  const fetchStoriesRef = React.useRef(fetchStories);
  const loadUserDataRef = React.useRef(loadUserData);
  useEffect(() => {
    fetchStoriesRef.current = fetchStories;
    loadUserDataRef.current = loadUserData;
  }, [fetchStories, loadUserData]);

  useEffect(() => {
    let authResolved = false;
    const markReady = () => {
      if (authResolved) return;
      authResolved = true;
      setIsAuthReady(true);
    };

    // Failsafe: mark ready after 3s even if INITIAL_SESSION never fires
    const fallback = setTimeout(() => {
      console.warn('[auth] fallback timeout triggered');
      markReady();
    }, 3000);

    // Read cached login state for instant routing (fire-and-forget, no blocking)
    getCachedAuthStatus().then((c) => {
      if (c.isLoggedIn) setCachedIsLoggedIn(true);
    }).catch(() => {});

    const { data: { subscription } } = db.auth.onAuthStateChange(async (event, session) => {
      console.log('[auth] event:', event, 'user:', session?.user?.id ?? 'none');
      const authUser = session?.user ?? null;

      if (event === 'INITIAL_SESSION') {
        clearTimeout(fallback);
        if (authUser) {
          // Set user immediately so navigation switches to app stack
          setUser(authUser);
          setCachedIsLoggedIn(true);
          // Persist cache & load data — don't await so markReady isn't delayed
          setCachedAuthStatus(authUser.id).catch(() => {});
          loadUserDataRef.current(authUser.id);
          fetchStoriesRef.current(authUser.id);
        } else {
          setUser(null);
          setCachedIsLoggedIn(false);
          clearCachedAuthStatus().catch(() => {});
        }
        markReady();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (authUser) {
          setUser(authUser);
          setCachedIsLoggedIn(true);
          setCachedAuthStatus(authUser.id).catch(() => {});
          loadUserDataRef.current(authUser.id);
          fetchStoriesRef.current(authUser.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setStories([]);
        setCachedIsLoggedIn(false);
        clearCachedAuthStatus().catch(() => {});
      }
    });

    return () => {
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, []);

  // Helper: insert a notification row — never throws
  const insertNotification = async (
    recipientId: string,
    type: string,
    message: string,
    storyId?: string,
    commentId?: string
  ) => {
    try {
      await db.from('notifications').insert({
        user_id: recipientId,
        actor_id: user?.id || null,
        type,
        story_id: storyId || null,
        comment_id: commentId || null,
        message,
        is_read: false,
      });
    } catch (e) {
      console.warn('[insertNotification] Failed:', e);
    }
  };

  const fetchUnreadCount = useCallback(async (userId: string) => {
    const { count } = await db
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    setUnreadNotifCount(count || 0);
  }, []);

  const markAllNotificationsRead = async () => {
    if (!user) return;
    await db.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setUnreadNotifCount(0);
  };

  const addStory = async ({ title, text, imageUrl, isAnonymous, allowComments, isSensitive, scheduledFor }: AddStoryInput) => {
    if (!user) return false;
    const normalizedScheduledFor = scheduledFor && scheduledFor.trim().length > 0 ? scheduledFor : null;
    const { error } = await db.from('stories').insert({
      title,
      text,
      image_url: imageUrl,
      author_id: user.id,
      is_anonymous: !!isAnonymous,
      allow_comments: allowComments !== false,
      is_sensitive: !!isSensitive,
      scheduled_for: normalizedScheduledFor,
    });
    if (error) {
      console.warn('Error creating story:', error);
      return false;
    }

    // Notify author that their story was published
    await insertNotification(
      user.id,
      'published',
      `Your story "${title}" was published!`,
      undefined,
    );

    await fetchStories();
    return true;
  };

  const editStory = async (id: string, { title, text, imageUrl, isAnonymous, allowComments, isSensitive, scheduledFor }: Partial<AddStoryInput>) => {
    if (!user) return false;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (text !== undefined) updateData.text = text;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (isAnonymous !== undefined) updateData.is_anonymous = isAnonymous;
    if (allowComments !== undefined) updateData.allow_comments = allowComments;
    if (isSensitive !== undefined) updateData.is_sensitive = isSensitive;
    if (scheduledFor !== undefined) updateData.scheduled_for = scheduledFor;

    const { error } = await db.from('stories').update(updateData).eq('id', id).eq('author_id', user.id);
    if (error) {
      console.warn('Error updating story:', error);
      return false;
    }

    await fetchStories();
    return true;
  };

  const deleteStory = async (id: string) => {
    if (!user) return false;
    try {
      // Capture title before delete for notification message
      const storyToDelete = stories.find(s => s.id === id);
      const deletedTitle = storyToDelete?.title || 'your story';

      await db.from('story_likes').delete().eq('story_id', id);
      await db.from('story_bookmarks').delete().eq('story_id', id);
      await db.from('story_reads').delete().eq('story_id', id);
      await db.from('comments').delete().eq('story_id', id);

      const { error } = await db.from('stories').delete().eq('id', id).eq('author_id', user.id);
      if (error) {
        console.warn('Error deleting story:', error);
        return false;
      }

      // Notify author that their story was deleted
      await insertNotification(
        user.id,
        'deleted',
        `Your story "${deletedTitle}" has been deleted.`,
      );

      await fetchStories();
      return true;
    } catch (e) {
      console.warn('Exception during deleteStory:', e);
      return false;
    }
  };

  const recordStoryRead = useCallback(async (storyId: string) => {
    const currentUser = userRef.current;
    if (!currentUser) return;

    try {
      // Always fetch author_id from DB — don't rely on cache which may be empty
      // (e.g. if the user deep-links into a story before stories load)
      const { data: storyRow } = await db
        .from('stories')
        .select('author_id')
        .eq('id', storyId)
        .single();

      // Never count the author reading their own story
      if (storyRow?.author_id === currentUser.id) return;

      const { error } = await db.from('story_reads').insert({
        story_id: storyId,
        user_id: currentUser.id,
      });

      if (error) {
        // 23505 = unique violation: user already read this story — ignore silently
        if (error.code === '23505') return;
        console.warn('[recordStoryRead] insert failed:', error.message);
        return;
      }

      // Update local reader count immediately so the UI reflects it without a refetch
      setStories(prev => prev.map(s =>
        s.id === storyId ? { ...s, readerCount: s.readerCount + 1 } : s
      ));
    } catch (e) {
      console.warn('[recordStoryRead] exception:', e);
    }
  }, []);

  const fetchComments = async (storyId: string) => {
    const story = stories.find(item => item.id === storyId);
    if (story && !story.allowComments) {
      setComments([]);
      return;
    }

    const { data, error } = await db
      .from('comments')
      .select('*, profiles!comments_author_id_fkey(full_name, avatar_url)')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      const formattedComments: Comment[] = data.map(c => ({
        id: c.id,
        storyId: c.story_id,
        author: c.profiles?.full_name || 'Unknown',
        time: new Date(c.created_at).toLocaleDateString(),
        text: c.text,
        likes: 0,
        isLiked: false,
        replies: [],
        imageUri: c.image_url,
        author_id: c.author_id,
        avatar_url: c.profiles?.avatar_url,
      }));

      const commentsById = new Map<string, Comment>();
      formattedComments.forEach(comment => commentsById.set(comment.id, { ...comment, replies: [] }));

      const topLevelComments: Comment[] = [];
      data.forEach(rawComment => {
        const current = commentsById.get(rawComment.id);
        if (!current) return;

        if (rawComment.parent_id) {
          const parent = commentsById.get(rawComment.parent_id);
          if (parent) {
            parent.replies.push(current);
            return;
          }
        }

        topLevelComments.push(current);
      });

      setComments(topLevelComments);
    }
  };

  const updateUserAvatar = async (avatarUrl: string) => {
    if (!user) return;
    const { error } = await db.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
    if (!error) {
      setUserProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      await fetchStories();
      // comments are fetched per-story, so no global refresh needed here
    }
  };

  const updateProfileDetails = async (name: string, bio: string) => {
    if (!user) return;
    const { error } = await db.from('profiles').update({ full_name: name, bio }).eq('id', user.id);
    if (!error) {
      setUserProfile(prev => prev ? { ...prev, full_name: name, bio } : null);
      await fetchStories();
    }
  };

  const toggleLikeStory = async (id: string) => {
    if (!user) return;
    const story = stories.find(s => s.id === id);
    if (!story) return;

    const wasLiked = story.isLiked;
    setStories(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isLiked: !s.isLiked, likeCount: s.isLiked ? s.likeCount - 1 : s.likeCount + 1 };
      }
      return s;
    }));

    if (wasLiked) {
      await db.from('story_likes').delete().match({ story_id: id, user_id: user.id });
    } else {
      await db.from('story_likes').insert({ story_id: id, user_id: user.id });
      // Notify the story author (not self)
      if (story.author_id && story.author_id !== user.id) {
        const actorName = userProfile?.full_name || 'Someone';
        await insertNotification(
          story.author_id,
          'like',
          `${actorName} liked your story "${story.title}"`,
          id
        );
      }
    }
  };

  const toggleBookmarkStory = async (id: string) => {
    if (!user) return;
    const story = stories.find(s => s.id === id);
    if (!story) return;

    const wasBookmarked = story.isBookmarked;
    setStories(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isBookmarked: !s.isBookmarked };
      }
      return s;
    }));

    if (wasBookmarked) {
      await db.from('story_bookmarks').delete().match({ story_id: id, user_id: user.id });
    } else {
      await db.from('story_bookmarks').insert({ story_id: id, user_id: user.id });
      // Notify the story author (not self)
      if (story.author_id && story.author_id !== user.id) {
        const actorName = userProfile?.full_name || 'Someone';
        await insertNotification(
          story.author_id,
          'bookmark',
          `${actorName} saved your story "${story.title}"`,
          id
        );
      }
    }
  };

  const toggleLikeCommentRecursive = (commentsList: Comment[], commentId: string): Comment[] => {
    return commentsList.map(c => {
      if (c.id === commentId) {
        return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
      }
      if (c.replies.length > 0) {
        return { ...c, replies: toggleLikeCommentRecursive(c.replies, commentId) };
      }
      return c;
    });
  };

  const toggleLikeComment = async (commentId: string) => {
    if (!user) return;
    setComments(prev => toggleLikeCommentRecursive(prev, commentId));
    // Implementation for DB like/unlike can be added similarly
  };

  const addCommentRecursive = (commentsList: Comment[], replyToId: string, newComment: Comment): Comment[] => {
    return commentsList.map(c => {
      if (c.id === replyToId) {
        return { ...c, replies: [...c.replies, newComment] };
      }
      if (c.replies.length > 0) {
        return { ...c, replies: addCommentRecursive(c.replies, replyToId, newComment) };
      }
      return c;
    });
  };

  const addComment = async (storyId: string, text: string, replyToId?: string, imageUri?: string) => {
    if (!user) return;
    const story = stories.find(item => item.id === storyId);
    if (story && !story.allowComments) {
      return;
    }
    
    const { data, error } = await db.from('comments').insert({
      story_id: storyId,
      author_id: user.id,
      parent_id: replyToId || null,
      text,
      image_url: imageUri
    }).select().single();

    if (!error && data) {
      const newComment: Comment = {
        id: data.id,
        storyId,
        author: 'You',
        time: 'now',
        text,
        likes: 0,
        isLiked: false,
        replies: [],
        imageUri
      };

      if (replyToId) {
        setComments(prev => addCommentRecursive(prev, replyToId, newComment));

        // Notify the parent comment author (if not self)
        try {
          const { data: parentCommentData } = await db
            .from('comments')
            .select('author_id')
            .eq('id', replyToId)
            .single();
          if (parentCommentData?.author_id && parentCommentData.author_id !== user.id) {
            const actorName = userProfile?.full_name || 'Someone';
            await insertNotification(
              parentCommentData.author_id,
              'reply',
              `${actorName} replied to your comment: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`,
              storyId,
              replyToId
            );
          }
        } catch (e) {
          console.warn('[addComment] Could not send reply notification:', e);
        }
      } else {
        setComments(prev => [newComment, ...prev]);
      }

      // Notify the story author (if not self)
      if (story?.author_id && story.author_id !== user.id) {
        const actorName = userProfile?.full_name || 'Someone';
        await insertNotification(
          story.author_id,
          'comment',
          `${actorName} commented on "${story.title}": "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`,
          storyId,
          data.id
        );
      }

      setStories(prev => prev.map(s => {
        if (s.id === storyId) {
          return { ...s, commentCount: s.commentCount + 1 };
        }
        return s;
      }));
    }
  };

  // Fetch unread count whenever user changes
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount(user.id);
    } else {
      setUnreadNotifCount(0);
    }
  }, [user?.id, fetchUnreadCount]);

  return (
    <AppContext.Provider value={{ 
      user, 
      userProfile,
      isAuthReady,
      cachedIsLoggedIn,
      stories, 
      comments,
      unreadNotifCount,
      fetchStories, 
      fetchComments, 
      toggleLikeStory, 
      toggleBookmarkStory, 
      addComment, 
      addStory,
      toggleLikeComment, 
      updateUserAvatar,
      updateProfileDetails,
      editStory,
      deleteStory,
      recordStoryRead,
      markAllNotificationsRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
