import { Cat, Dog, Bird, Smile, Sun, Star, Heart, Music, Zap, Ghost } from 'lucide-react-native';

export const DEFAULT_AVATARS = [
  { id: 'cat', icon: Cat, bgColor: '#ffedd5', color: '#f97316' },
  { id: 'dog', icon: Dog, bgColor: '#fef3c7', color: '#d97706' },
  { id: 'bird', icon: Bird, bgColor: '#e0f2fe', color: '#0ea5e9' },
  { id: 'smile', icon: Smile, bgColor: '#fef08a', color: '#eab308' },
  { id: 'sun', icon: Sun, bgColor: '#ffedd5', color: '#f59e0b' },
  { id: 'star', icon: Star, bgColor: '#f3e8ff', color: '#a855f7' },
  { id: 'heart', icon: Heart, bgColor: '#fee2e2', color: '#ef4444' },
  { id: 'music', icon: Music, bgColor: '#fce7f3', color: '#ec4899' },
  { id: 'zap', icon: Zap, bgColor: '#ccfbf1', color: '#14b8a6' },
];

// Default avatar shown for all anonymous posts
export const ANONYMOUS_AVATAR = { id: 'anonymous', icon: Ghost, bgColor: '#e2e8f0', color: '#64748b' };

export const getAvatarById = (id?: string) => {
  return DEFAULT_AVATARS.find(a => a.id === id) || null;
};

