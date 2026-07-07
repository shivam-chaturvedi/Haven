import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OnboardingStep1Screen from '../screens/OnboardingStep1Screen';
import OnboardingStep2Screen from '../screens/OnboardingStep2Screen';
import OnboardingStep3Screen from '../screens/OnboardingStep3Screen';
import HomeScreen from '../screens/HomeScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import CommentsScreen from '../screens/CommentsScreen';
import NewPostScreen from '../screens/NewPostScreen';
import FunActivitiesScreen from '../screens/FunActivitiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import SavedStoriesScreen from '../screens/SavedStoriesScreen';
import LikedStoriesScreen from '../screens/LikedStoriesScreen';
import { AppProvider, useAppContext } from '../context/AppContext';

export type RootStackParamList = {
  Onboarding: undefined;
  SignUp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  OnboardingStep3: undefined;
  Home: undefined;
  StoryDetail: { storyId: string };
  Comments: { storyId: string };
  NewPost: undefined;
  FunActivities: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Search: undefined;
  EditProfile: undefined;
  PrivacySecurity: undefined;
  HelpCenter: undefined;
  TermsOfService: undefined;
  SavedStories: undefined;
  LikedStories: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
            <Stack.Screen 
              name="Comments" 
              component={CommentsScreen} 
              options={{ presentation: 'transparentModal' }}
            />
            <Stack.Screen name="NewPost" component={NewPostScreen} />
            <Stack.Screen name="FunActivities" component={FunActivitiesScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            <Stack.Screen name="SavedStories" component={SavedStoriesScreen} />
            <Stack.Screen name="LikedStories" component={LikedStoriesScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Screen} />
            <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Screen} />
            <Stack.Screen name="OnboardingStep3" component={OnboardingStep3Screen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AppNavigation = () => {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
};

export default AppNavigation;
