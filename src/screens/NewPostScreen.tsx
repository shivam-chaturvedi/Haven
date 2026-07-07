import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Image as ImageIcon, Video, Hash, EyeOff, Home, Share, PartyPopper, User, Users, MessageCircle, AlertTriangle, Calendar, X } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { launchImageLibrary } from 'react-native-image-picker';
import { RichText, Toolbar, useEditorBridge, TenTapStartKit, PlaceholderBridge } from '@10play/tentap-editor';
import DatePicker from 'react-native-date-picker';
import { useAppContext } from '../context/AppContext';
import { getAvatarById } from '../constants/avatars';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewPost'>;
};

const NewPostScreen = ({ navigation }: Props) => {
  const { userProfile } = useAppContext();
  const currentUserAvatar = getAvatarById(userProfile?.avatar_url);

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: '',
    bridgeExtensions: [
      ...TenTapStartKit.filter(e => e.name !== 'placeholder'),
      PlaceholderBridge.configureExtension({ placeholder: "Share what is on your mind..." })
    ],
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [sensitiveContent, setSensitiveContent] = useState(false);
  
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handlePost = async () => {
    let content = '';
    if (editor) {
      try {
        content = await editor.getHTML();
      } catch (e) {
        console.log("Could not get text", e);
      }
    }
    
    if (content.trim().length === 0 && !selectedImage && !selectedVideo) {
      Alert.alert('Empty Post', 'Please enter some content or select an image/video to post.');
      return;
    }
    // Simulate posting action
    navigation.navigate('Home');
  };

  const handlePickPhoto = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri || null);
      }
    } catch (err) {
      console.log('Error picking photo', err);
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'video' });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        setSelectedVideo(result.assets[0].uri || null);
      }
    } catch (err) {
      console.log('Error picking video', err);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, ''); // Remove # if user typed it
    if (trimmed.length > 0 && !tags.includes(`#${trimmed}`)) {
      setTags([...tags, `#${trimmed}`]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New post</Text>
          </View>
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={[styles.avatarPlaceholder, currentUserAvatar && !postAnonymously ? { backgroundColor: currentUserAvatar.bgColor, justifyContent: 'center', alignItems: 'center' } : {}]}>
              {currentUserAvatar && !postAnonymously && <currentUserAvatar.icon color={currentUserAvatar.color} size={24} />}
            </View>
            <View>
              <Text style={styles.userName}>{postAnonymously ? 'Anonymous User' : (userProfile?.full_name || 'Anonymous User')}</Text>
              <View style={styles.privacyDropdown}>
                <Users color="#475569" size={12} />
                <Text style={styles.privacyText}>Friends</Text>
              </View>
            </View>
          </View>

          {/* Rich Text Editor */}
          <View style={styles.editorContainer}>
            <View style={styles.editor}>
              <RichText editor={editor} showsVerticalScrollIndicator={true} />
            </View>

            <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
              <Toolbar editor={editor} />
            </View>
          </View>

          {/* Media Previews */}
          {(selectedImage || selectedVideo) && (
            <View style={styles.mediaPreviewsContainer}>
              {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
                    <X color="#FFF" size={16} />
                  </TouchableOpacity>
                </View>
              )}
              {selectedVideo && (
                <View style={styles.imagePreviewContainer}>
                  {/* Just showing a video placeholder icon over a dark box since rendering actual video needs another library */}
                  <View style={[styles.imagePreview, { backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' }]}>
                    <Video color="#FFF" size={32} />
                    <Text style={{ color: '#FFF', marginTop: 8, fontWeight: '700' }}>Video Attached</Text>
                  </View>
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedVideo(null)}>
                    <X color="#FFF" size={16} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Attachment Options */}
          <View style={styles.attachmentsRow}>
            <TouchableOpacity style={styles.attachmentBtn} onPress={handlePickPhoto}>
              <ImageIcon color="#475569" size={16} />
              <Text style={styles.attachmentText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentBtn} onPress={handlePickVideo}>
              <Video color="#475569" size={16} />
              <Text style={styles.attachmentText}>Video</Text>
            </TouchableOpacity>
          </View>

          {/* Custom Tags Section */}
          <Text style={styles.sectionTitle}>TAGS</Text>
          <View style={styles.tagInputWrapper}>
            <Hash color="#94a3b8" size={18} />
            <TextInput
              style={styles.tagInput}
              placeholder="Add a tag..."
              placeholderTextColor="#94a3b8"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
              <Text style={styles.addTagBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {tags.length > 0 && (
            <View style={styles.pillsContainer}>
              {tags.map((tag, idx) => (
                <TouchableOpacity key={idx} style={styles.pill} onPress={() => removeTag(tag)}>
                  <Text style={styles.pillText}>{tag}</Text>
                  <X color="#475569" size={14} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Settings Card */}
          <View style={styles.settingsCard}>
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingIcon}>
                <EyeOff color="#475569" size={20} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Post anonymously</Text>
                <Text style={styles.settingDesc}>Hide your name and avatar</Text>
              </View>
              <Switch 
                value={postAnonymously} 
                onValueChange={setPostAnonymously} 
                trackColor={{ false: '#e2e8f0', true: '#facc15' }} 
              />
            </View>
            
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingIcon}>
                <MessageCircle color="#475569" size={20} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Allow comments</Text>
                <Text style={styles.settingDesc}>Let others reply to your post</Text>
              </View>
              <Switch 
                value={allowComments} 
                onValueChange={setAllowComments} 
                trackColor={{ false: '#e2e8f0', true: '#facc15' }} 
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <AlertTriangle color="#475569" size={20} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Sensitive content</Text>
                <Text style={styles.settingDesc}>Blur preview until tapped</Text>
              </View>
              <Switch 
                value={sensitiveContent} 
                onValueChange={setSensitiveContent} 
                trackColor={{ false: '#e2e8f0', true: '#facc15' }} 
              />
            </View>
          </View>

          {/* Schedule Post Card */}
          <TouchableOpacity style={styles.scheduleCard} onPress={() => setIsDatePickerOpen(true)}>
            <View style={styles.settingIcon}>
              <Calendar color="#475569" size={20} />
            </View>
            <View style={styles.scheduleTextContainer}>
              <Text style={styles.settingTitle}>Schedule post</Text>
              <Text style={styles.settingDesc}>Optional — publish later</Text>
            </View>
            <View style={styles.scheduleInputContainer}>
              <Text style={styles.scheduleInputText}>
                {scheduledDate ? formatDate(scheduledDate) : 'dd/mm/yyyy, --:-- --'}
              </Text>
              <Calendar color="#1e293b" size={16} style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
          
          <DatePicker
            modal
            open={isDatePickerOpen}
            date={scheduledDate || new Date()}
            onConfirm={(date) => {
              setIsDatePickerOpen(false);
              setScheduledDate(date);
            }}
            onCancel={() => {
              setIsDatePickerOpen(false);
            }}
          />
          
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
            <Home color="#64748b" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NewPost')}>
            <Share color="#1e293b" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('FunActivities')}>
            <PartyPopper color="#64748b" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
            <User color="#64748b" size={28} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  postButton: {
    backgroundColor: '#fef08a', // Light yellow
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a7f3d0',
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  privacyDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  editor: {
    height: 250,
    padding: 16,
    backgroundColor: 'white',
  },
  mediaPreviewsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 100,
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  attachmentsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  attachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  attachmentText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tagInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  tagInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#1e293b',
  },
  addTagBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addTagBtnText: {
    fontWeight: '700',
    color: '#475569',
    fontSize: 12,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#facc15',
    backgroundColor: '#fef08a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillText: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 14,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  scheduleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  scheduleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleInputText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
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

export default NewPostScreen;
