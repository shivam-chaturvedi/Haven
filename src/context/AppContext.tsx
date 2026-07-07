import React, { createContext, useState, useContext, ReactNode } from 'react';

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
};

export type Story = {
  id: string;
  title: string;
  author: string;
  location: string;
  text: string;
  imageUrl?: string;
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  commentCount: number;
};

type AppContextType = {
  stories: Story[];
  comments: Comment[];
  toggleLikeStory: (id: string) => void;
  toggleBookmarkStory: (id: string) => void;
  addComment: (storyId: string, text: string, replyToId?: string, imageUri?: string) => void;
  toggleLikeComment: (commentId: string) => void;
};

const defaultStories: Story[] = [
  {
    id: 's1',
    title: 'Brave Little Lily: A Story of Courage',
    author: 'Aanya R.',
    location: 'New Delhi, India',
    text: 'Once upon a time, in a quiet little village, there lived a brave and curious little girl named Lily. Lily had big, bright eyes and a smile that could light up the darkest of rooms. She loved playing in the meadows, picking wildflowers, and chasing butterflies.\n\nBut one summer, the village stream began to dry up. The animals were thirsty. The flowers drooped.',
    isLiked: false,
    isBookmarked: false,
    likeCount: 24,
    commentCount: 4,
  },
  {
    id: 's2',
    title: 'Stella The Star',
    author: 'Aanya R.',
    location: 'Lisbon, Portugal',
    text: 'Once upon a time, in a tiny, faraway galaxy, there lived a little star named Stella. Stella was a bright and shining star during the day, but at night, when the sky was dark, she would twinkle with a secret sadness. You see, Stella was facing a big problem. She lived',
    isLiked: false,
    isBookmarked: false,
    likeCount: 12,
    commentCount: 2,
  }
];

const defaultComments: Comment[] = [
  {
    id: 'c1',
    storyId: 's1',
    author: 'Maya S.',
    time: '2h',
    text: 'This made my morning 🌸 such a sweet story!',
    likes: 12,
    isLiked: false,
    replies: []
  },
  {
    id: 'c2',
    storyId: 's1',
    author: 'Rohan K.',
    time: '5h',
    text: 'Read this to my little sister, she loved it ❤️',
    likes: 4,
    isLiked: true,
    replies: []
  },
  {
    id: 'c3',
    storyId: 's1',
    author: 'Aanya R.',
    time: '1d',
    text: 'More stories like this please 🙏',
    likes: 28,
    isLiked: false,
    replies: []
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [stories, setStories] = useState<Story[]>(defaultStories);
  const [comments, setComments] = useState<Comment[]>(defaultComments);

  const toggleLikeStory = (id: string) => {
    setStories(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isLiked: !s.isLiked, likeCount: s.isLiked ? s.likeCount - 1 : s.likeCount + 1 };
      }
      return s;
    }));
  };

  const toggleBookmarkStory = (id: string) => {
    setStories(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isBookmarked: !s.isBookmarked };
      }
      return s;
    }));
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

  const toggleLikeComment = (commentId: string) => {
    setComments(prev => toggleLikeCommentRecursive(prev, commentId));
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

  const addComment = (storyId: string, text: string, replyToId?: string, imageUri?: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
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

    // Increment story comment count
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        return { ...s, commentCount: s.commentCount + 1 };
      }
      return s;
    }));
  };

  return (
    <AppContext.Provider value={{ stories, comments, toggleLikeStory, toggleBookmarkStory, addComment, toggleLikeComment }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
