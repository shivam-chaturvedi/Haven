import os

screens_to_create = [
    ("EditProfileScreen", "Edit Profile"),
    ("PrivacySecurityScreen", "Privacy & Security"),
    ("NotificationPreferencesScreen", "Notification Preferences"),
    ("HelpCenterScreen", "Help Center"),
    ("TermsOfServiceScreen", "Terms of Service"),
    ("SavedStoriesScreen", "Saved Stories"),
]

template = """import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, '{screenName}'>;
};

const {screenName} = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholderText}>This is the {title} screen.</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default {screenName};
"""

screens_dir = 'src/screens'

for screenName, title in screens_to_create:
    filepath = os.path.join(screens_dir, f"{screenName}.tsx")
    content = template.replace('{screenName}', screenName).replace('{title}', title)
    with open(filepath, 'w') as f:
        f.write(content)

print('Created screens.')
