import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, EyeOff, Calendar } from 'lucide-react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { RichText, Toolbar, useEditorBridge, TenTapStartKit, PlaceholderBridge } from '@10play/tentap-editor';
import DatePicker from 'react-native-date-picker';
import { useAppContext } from '../context/AppContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditPost'>;
  route: RouteProp<RootStackParamList, 'EditPost'>;
};

const EditPostScreen = ({ navigation, route }: Props) => {
  const { storyId } = route.params;
  const { stories, editStory } = useAppContext();
  const story = stories.find(s => s.id === storyId);

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: story?.text || '',
    bridgeExtensions: [
      ...TenTapStartKit.filter(e => e.name !== 'placeholder'),
      PlaceholderBridge.configureExtension({ placeholder: "Share what is on your mind..." })
    ],
  });

  const [titleInput, setTitleInput] = useState(story?.title || '');
  const [postAnonymously, setPostAnonymously] = useState(story?.isAnonymous || false);
  const [allowComments, setAllowComments] = useState(story?.allowComments !== false);
  const [sensitiveContent, setSensitiveContent] = useState(!!story?.isSensitive);
  
  const [scheduledDate, setScheduledDate] = useState<Date | null>(
    story?.scheduledFor ? new Date(story.scheduledFor) : null
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!story) {
      Alert.alert('Error', 'Story not found.');
      navigation.goBack();
    }
  }, [story, navigation]);

  if (!story) {
    return null;
  }

  const handleSave = async () => {
    let content = '';
    if (editor) {
      try {
        content = await editor.getHTML();
      } catch (e) {
        console.warn("Could not get text from editor:", e);
      }
    }
    
    if (titleInput.trim().length === 0) {
      Alert.alert('Empty Title', 'Please enter a title for your story.');
      return;
    }

    if (content.trim().length === 0) {
      Alert.alert('Empty Content', 'Please enter some content for your story.');
      return;
    }

    const didUpdate = await editStory(story.id, {
      title: titleInput,
      text: content,
      isAnonymous: postAnonymously,
      allowComments,
      isSensitive: sensitiveContent,
      scheduledFor: scheduledDate ? scheduledDate.toISOString() : null,
    });

    if (!didUpdate) {
      Alert.alert('Update failed', 'We could not update your story. Please try again.');
      return;
    }

    Alert.alert('Success', 'Story updated successfully!');
    navigation.goBack();
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
            <Text style={styles.headerTitle}>Edit story</Text>
          </View>
          <TouchableOpacity style={styles.postButton} onPress={handleSave}>
            <Text style={styles.postButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
          {/* Title Input */}
          <TextInput
            style={styles.titleInput}
            placeholder="Story Title"
            placeholderTextColor="#94a3b8"
            value={titleInput}
            onChangeText={setTitleInput}
            maxLength={100}
          />

          {/* Rich Text Editor */}
          <View style={styles.editorContainer}>
            <View style={styles.editor}>
              <RichText editor={editor} showsVerticalScrollIndicator={true} />
            </View>
            <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
              <Toolbar editor={editor} />
            </View>
          </View>

          {/* Settings / Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Audience</Text>
            
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Post anonymously</Text>
                <Text style={styles.optionDesc}>Hide your identity from others.</Text>
              </View>
              <Switch
                value={postAnonymously}
                onValueChange={setPostAnonymously}
                trackColor={{ false: '#e2e8f0', true: '#facc15' }}
              />
            </View>

            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Allow comments</Text>
                <Text style={styles.optionDesc}>Others can leave comments on your story.</Text>
              </View>
              <Switch
                value={allowComments}
                onValueChange={setAllowComments}
                trackColor={{ false: '#e2e8f0', true: '#facc15' }}
              />
            </View>

            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <EyeOff color="#ef4444" size={16} />
                  <Text style={styles.optionLabel}>Sensitive content</Text>
                </View>
                <Text style={styles.optionDesc}>Add a blur warning to this post.</Text>
              </View>
              <Switch
                value={sensitiveContent}
                onValueChange={setSensitiveContent}
                trackColor={{ false: '#e2e8f0', true: '#facc15' }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Publish Schedule</Text>
            <TouchableOpacity 
              style={styles.scheduleButton}
              onPress={() => setIsDatePickerOpen(true)}
            >
              <Calendar color="#64748b" size={20} />
              <Text style={styles.scheduleText}>
                {scheduledDate ? `Scheduled: ${formatDate(scheduledDate)}` : 'Publish immediately'}
              </Text>
              {scheduledDate && (
                <TouchableOpacity onPress={(e) => {
                  e.stopPropagation();
                  setScheduledDate(null);
                }}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <DatePicker
          modal
          open={isDatePickerOpen}
          date={scheduledDate || new Date()}
          minimumDate={new Date()}
          onConfirm={(date) => {
            setIsDatePickerOpen(false);
            setScheduledDate(date);
          }}
          onCancel={() => {
            setIsDatePickerOpen(false);
          }}
        />
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
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  iconButton: {
    padding: 4,
  },
  postButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    marginBottom: 24,
  },
  editor: {
    height: 200,
    padding: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionInfo: {
    flex: 1,
    paddingRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
  },
  scheduleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
});

export default EditPostScreen;
