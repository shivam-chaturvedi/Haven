import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { db } from '../lib/db';

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
  text: string;
  imageUrl?: string;
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  commentCount: number;
  avatar_url?: string;
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
  isLoading: boolean;
  stories: Story[];
  isLoadingStories: boolean;
  comments: Comment[];
  fetchStories: () => Promise<void>;
  fetchComments: (storyId: string) => Promise<void>;
  toggleLikeStory: (id: string) => Promise<void>;
  toggleBookmarkStory: (id: string) => Promise<void>;
  addComment: (storyId: string, text: string, replyToId?: string, imageUri?: string) => Promise<void>;
  addStory: (title: string, text: string, imageUrl?: string) => Promise<void>;
  toggleLikeComment: (commentId: string) => Promise<void>;
  updateUserAvatar: (uri: string) => Promise<void>;
  updateProfileDetails: (name: string, bio: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await db.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await db.from('profiles').select('*').eq('id', user.id).single();
        if (data) setUserProfile(data);
      }
      setIsLoading(false);
    };
    fetchUser();

    const { data: { subscription } } = db.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await db.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setUserProfile(data);
        fetchStories();
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchStories = async () => {
    setIsLoadingStories(true);
    const { data: storiesData, error } = await db.from('stories_with_stats').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      setIsLoadingStories(false);
      return;
    }
    
    let likedSet = new Set<string>();
    let bookmarkedSet = new Set<string>();

    if (user) {
      const [{ data: likes }, { data: bookmarks }] = await Promise.all([
        db.from('story_likes').select('story_id').eq('user_id', user.id),
        db.from('story_bookmarks').select('story_id').eq('user_id', user.id)
      ]);
      if (likes) likes.forEach(l => likedSet.add(l.story_id));
      if (bookmarks) bookmarks.forEach(b => bookmarkedSet.add(b.story_id));
    }

    const formattedStories: Story[] = storiesData.map(s => ({
      id: s.id,
      title: s.title,
      author: s.author_name || 'Unknown',
      text: s.text,
      imageUrl: s.image_url,
      isLiked: likedSet.has(s.id),
      isBookmarked: bookmarkedSet.has(s.id),
      likeCount: s.like_count || 0,
      commentCount: s.comment_count || 0,
      avatar_url: s.author_avatar,
    }));
    setStories(formattedStories);
    setIsLoadingStories(false);
  };

  const addStory = async (title: string, text: string, imageUrl?: string) => {
    if (!user) return;
    const { error } = await db.from('stories').insert({ title, text, image_url: imageUrl, author_id: user.id });
    if (!error) {
      await fetchStories();
    }
  };

  const fetchComments = async (storyId: string) => {
    const { data, error } = await db.from('comments').select('*, profiles!comments_author_id_fkey(full_name, avatar_url)').eq('story_id', storyId);
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
      setComments(formattedComments);
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

    setStories(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isLiked: !s.isLiked, likeCount: s.isLiked ? s.likeCount - 1 : s.likeCount + 1 };
      }
      return s;
    }));

    if (story.isLiked) {
      await db.from('story_likes').delete().match({ story_id: id, user_id: user.id });
    } else {
      await db.from('story_likes').insert({ story_id: id, user_id: user.id });
    }
  };

  const toggleBookmarkStory = async (id: string) => {
    if (!user) return;
    const story = stories.find(s => s.id === id);
    if (!story) return;

    setStories(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isBookmarked: !s.isBookmarked };
      }
      return s;
    }));

    if (story.isBookmarked) {
      await db.from('story_bookmarks').delete().match({ story_id: id, user_id: user.id });
    } else {
      await db.from('story_bookmarks').insert({ story_id: id, user_id: user.id });
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
      } else {
        setComments(prev => [newComment, ...prev]);
      }

      setStories(prev => prev.map(s => {
        if (s.id === storyId) {
          return { ...s, commentCount: s.commentCount + 1 };
        }
        return s;
      }));
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      userProfile,
      isLoading,
      stories, 
      isLoadingStories,
      comments, 
      fetchStories, 
      fetchComments, 
      toggleLikeStory, 
      toggleBookmarkStory, 
      addComment, 
      addStory,
      toggleLikeComment, 
      updateUserAvatar,
      updateProfileDetails
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
