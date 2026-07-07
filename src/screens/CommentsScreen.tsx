import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Heart, Smile, Image as ImageIcon, Send } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAppContext, Comment } from '../context/AppContext';
import { launchImageLibrary } from 'react-native-image-picker';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Comments'>;
  route: RouteProp<RootStackParamList, 'Comments'>;
};

const CommentsScreen = ({ navigation, route }: Props) => {
  const { storyId } = route.params;
  const { comments, addComment, toggleLikeComment } = useAppContext();
  
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<{id: string, author: string} | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const storyComments = comments.filter(c => c.storyId === storyId);

  const handleSend = () => {
    if (inputText.trim() || selectedImage) {
      addComment(storyId, inputText.trim(), replyTo?.id, selectedImage || undefined);
      setInputText('');
      setReplyTo(null);
      setSelectedImage(null);
    }
  };

  const handleImagePick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.5 });
    if (result.assets && result.assets[0].uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => (
    <View style={{ ...styles.commentItem, marginLeft: depth * 32 }}>
      <View style={styles.avatarPlaceholder} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{comment.author}</Text>
          <Text style={styles.commentTime}>{comment.time}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        {comment.imageUri && (
          <Image source={{ uri: comment.imageUri }} style={styles.commentImage} />
        )}
        <TouchableOpacity onPress={() => setReplyTo({ id: comment.id, author: comment.author })}>
          <Text style={styles.replyText}>Reply</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.likeContainer}>
        <TouchableOpacity onPress={() => toggleLikeComment(comment.id)}>
          <Heart color={comment.isLiked ? "#ef4444" : "#94a3b8"} fill={comment.isLiked ? "#ef4444" : "none"} size={16} />
        </TouchableOpacity>
        <Text style={styles.likeCount}>{comment.likes > 0 ? comment.likes : 0}</Text>
      </View>
    </View>
  );

  const renderComments = (commentsList: Comment[], depth = 0) => {
    return commentsList.map(c => (
      <View key={c.id}>
        <CommentItem comment={c} depth={depth} />
        {c.replies && c.replies.length > 0 && renderComments(c.replies, depth + 1)}
      </View>
    ));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => navigation.goBack()} />

      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comments · {storyComments.length}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X color="#1e293b" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
          {renderComments(storyComments)}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          {replyTo && (
            <View style={styles.replyingToContainer}>
              <Text style={styles.replyingToText}>Replying to {replyTo.author}</Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <X color="#64748b" size={16} />
              </TouchableOpacity>
            </View>
          )}
          {selectedImage && (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
                <X color="#ffffff" size={16} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputActions}>
            <TouchableOpacity onPress={handleImagePick}><ImageIcon color="#64748b" size={24} /></TouchableOpacity>
          </View>
          
          <View style={styles.inputContainerRow}>
            <View style={styles.inputAvatarPlaceholder} />
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.textInput} 
                placeholder="Add a comment..." 
                placeholderTextColor="#94a3b8"
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Send color="#facc15" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  commentsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fca5a5',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  commentText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 20,
  },
  commentImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  replyText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  likeContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  likeCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  inputActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  selectedImageContainer: {
    marginBottom: 8,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  selectedImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  inputContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fca5a5',
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  sendButton: {
    padding: 8,
  },
});

export default CommentsScreen;
