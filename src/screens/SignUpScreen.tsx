import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

const SignUpScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Logo Placeholder */}
          <View style={styles.logoContainer}>
            <View style={styles.logoOuterCircle}>
              <View style={styles.logoInnerCircle}>
                <Text style={styles.logoText}>HAVEN</Text>
                {/* Dove Icon placeholder */}
              </View>
            </View>
          </View>

          <Text style={styles.title}>SIGN UP</Text>

          <View style={styles.formContainer}>
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              placeholderTextColor="#94a3b8"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Email Address" 
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
            <TextInput 
              style={styles.input} 
              placeholder="Confirm Password" 
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OnboardingStep1')}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>ALready Have An Account?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoOuterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0ea5e9', // Blue ring
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fde047', // Yellow border
  },
  logoInnerCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#bae6fd', // Light blue inner
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#ec4899', // Pink text
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 40,
    letterSpacing: 2,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#facc15', // Yellow button
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '800',
  },
  loginLink: {
    color: '#0ea5e9', // Blue link
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 8,
  },
});

export default SignUpScreen;
