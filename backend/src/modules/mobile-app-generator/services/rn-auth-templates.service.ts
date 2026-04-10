import { Injectable } from '@nestjs/common';
import { MobileAppConfig, GeneratedFile } from '../interfaces/types';

@Injectable()
export class RNAuthTemplatesService {
  /**
   * Generate all auth screen files
   */
  generateAuthScreens(config: MobileAppConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Auth Context (store)
    files.push(this.generateAuthContext(config));

    // Login Screen
    files.push(this.generateLoginScreen(config));

    // Signup Screen
    files.push(this.generateSignupScreen(config));

    // Forgot Password Screen
    files.push(this.generateForgotPasswordScreen(config));

    // Reset Password Screen
    files.push(this.generateResetPasswordScreen(config));

    // Onboarding Screen (if enabled)
    if (config.onboarding.enabled) {
      files.push(this.generateOnboardingScreen(config));
    }

    // Splash Screen
    files.push(this.generateSplashScreen(config));

    return files;
  }

  /**
   * Generate Auth Context / Store
   */
  private generateAuthContext(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/store/AuthContext.tsx',
      type: 'screen',
      content: `import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@api/auth';
import { TOKEN_KEY, USER_KEY } from '@api/client';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          const storedUser = await authApi.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
          // Optionally refresh user data from server
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token might be expired, will be handled by interceptor
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    const updatedUser = await authApi.updateProfile(data);
    setUser(updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
`,
    };
  }

  /**
   * Generate Login Screen
   */
  private generateLoginScreen(config: MobileAppConfig): GeneratedFile {
    const { theme } = config;

    return {
      path: 'src/screens/auth/LoginScreen.tsx',
      type: 'screen',
      content: `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useAuth } from '@store/AuthContext';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const styles = useStyles((t) => ({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: t.spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: t.spacing.xxl,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: t.spacing.md,
    },
    title: {
      fontSize: t.typography.fontSize.xxl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      textAlign: 'center',
      marginTop: t.spacing.xs,
    },
    form: {
      marginBottom: t.spacing.lg,
    },
    inputContainer: {
      marginBottom: t.spacing.md,
    },
    label: {
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.medium,
      color: t.colors.text,
      marginBottom: t.spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.input,
      borderRadius: t.borderRadius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingHorizontal: t.spacing.md,
    },
    inputWrapperError: {
      borderColor: t.colors.error,
    },
    inputWrapperFocused: {
      borderColor: t.colors.primary,
    },
    input: {
      flex: 1,
      paddingVertical: t.spacing.md,
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.text,
    },
    inputIcon: {
      marginRight: t.spacing.sm,
    },
    eyeButton: {
      padding: t.spacing.xs,
    },
    errorText: {
      fontSize: t.typography.fontSize.xs,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.error,
      marginTop: t.spacing.xs,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: t.spacing.xs,
      marginBottom: t.spacing.lg,
    },
    forgotPasswordText: {
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.medium,
      color: t.colors.primary,
    },
    loginButton: {
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius.md,
      paddingVertical: t.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...t.shadows.sm,
    },
    loginButtonDisabled: {
      opacity: 0.7,
    },
    loginButtonText: {
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: t.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: t.colors.border,
    },
    dividerText: {
      marginHorizontal: t.spacing.md,
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: t.spacing.md,
    },
    socialButton: {
      width: 50,
      height: 50,
      borderRadius: t.borderRadius.md,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: t.spacing.xl,
    },
    signupText: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
    },
    signupLink: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.semiBold,
      color: t.colors.primary,
    },
  }));

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\\S+@\\S+\\.\\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'You have successfully logged in.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Please check your credentials and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Title */}
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: theme.colors.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }]}>
              <Icon name="shopping-bag" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>${config.appName}</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                <Icon name="mail" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.placeholder}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                <Icon name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.placeholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="smartphone" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
`,
    };
  }

  /**
   * Generate Signup Screen
   */
  private generateSignupScreen(config: MobileAppConfig): GeneratedFile {
    const { theme } = config;

    return {
      path: 'src/screens/auth/SignupScreen.tsx',
      type: 'screen',
      content: `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useAuth } from '@store/AuthContext';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { register } = useAuth();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const styles = useStyles((t) => ({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: t.spacing.lg,
    },
    header: {
      marginBottom: t.spacing.xl,
      marginTop: t.spacing.lg,
    },
    backButton: {
      marginBottom: t.spacing.md,
    },
    title: {
      fontSize: t.typography.fontSize.xxl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
    },
    subtitle: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      marginTop: t.spacing.xs,
    },
    form: {
      marginBottom: t.spacing.lg,
    },
    inputContainer: {
      marginBottom: t.spacing.md,
    },
    label: {
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.medium,
      color: t.colors.text,
      marginBottom: t.spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.input,
      borderRadius: t.borderRadius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingHorizontal: t.spacing.md,
    },
    inputWrapperError: {
      borderColor: t.colors.error,
    },
    input: {
      flex: 1,
      paddingVertical: t.spacing.md,
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.text,
    },
    inputIcon: {
      marginRight: t.spacing.sm,
    },
    eyeButton: {
      padding: t.spacing.xs,
    },
    errorText: {
      fontSize: t.typography.fontSize.xs,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.error,
      marginTop: t.spacing.xs,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: t.spacing.lg,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: t.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: t.spacing.sm,
    },
    checkboxChecked: {
      backgroundColor: t.colors.primary,
      borderColor: t.colors.primary,
    },
    termsText: {
      flex: 1,
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
    },
    termsLink: {
      color: t.colors.primary,
      fontFamily: t.typography.fontFamily.medium,
    },
    signupButton: {
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius.md,
      paddingVertical: t.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.sm,
    },
    signupButtonDisabled: {
      opacity: 0.7,
    },
    signupButtonText: {
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: t.spacing.xl,
    },
    loginText: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
    },
    loginLink: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.semiBold,
      color: t.colors.primary,
    },
  }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\\S+@\\S+\\.\\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({ email, password, name, phone });
      Toast.show({
        type: 'success',
        text1: 'Account Created!',
        text2: 'Welcome to ${config.appName}!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputWrapperError]}>
                <Icon name="user" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.placeholder}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  autoComplete="name"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                <Icon name="mail" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.placeholder}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Icon name="phone" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.colors.placeholder}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                <Icon name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={theme.colors.placeholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
                <Icon name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.colors.placeholder}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  secureTextEntry={!showPassword}
                />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <Icon name="check" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={[styles.errorText, { marginTop: -12, marginBottom: 16 }]}>{errors.terms}</Text>}

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
`,
    };
  }

  /**
   * Generate Forgot Password Screen
   */
  private generateForgotPasswordScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/auth/ForgotPasswordScreen.tsx',
      type: 'screen',
      content: `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { authApi } from '@api/auth';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const styles = useStyles((t) => ({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    content: {
      flex: 1,
      padding: t.spacing.lg,
    },
    header: {
      marginBottom: t.spacing.xxl,
      marginTop: t.spacing.lg,
    },
    backButton: {
      marginBottom: t.spacing.md,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: t.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.lg,
    },
    title: {
      fontSize: t.typography.fontSize.xxl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
    },
    subtitle: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      marginTop: t.spacing.sm,
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: t.spacing.lg,
    },
    label: {
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.medium,
      color: t.colors.text,
      marginBottom: t.spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.input,
      borderRadius: t.borderRadius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingHorizontal: t.spacing.md,
    },
    inputWrapperError: {
      borderColor: t.colors.error,
    },
    input: {
      flex: 1,
      paddingVertical: t.spacing.md,
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.text,
    },
    inputIcon: {
      marginRight: t.spacing.sm,
    },
    errorText: {
      fontSize: t.typography.fontSize.xs,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.error,
      marginTop: t.spacing.xs,
    },
    submitButton: {
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius.md,
      paddingVertical: t.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.sm,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: {
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
    successContainer: {
      alignItems: 'center',
      paddingVertical: t.spacing.xl,
    },
    successIcon: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.colors.success + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.lg,
    },
    successTitle: {
      fontSize: t.typography.fontSize.xl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
      textAlign: 'center',
    },
    successText: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      textAlign: 'center',
      marginTop: t.spacing.sm,
      marginBottom: t.spacing.xl,
    },
    backToLoginButton: {
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius.md,
      paddingVertical: t.spacing.md,
      paddingHorizontal: t.spacing.xl,
    },
    backToLoginText: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
  }));

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\\S+@\\S+\\.\\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(email);
      setIsSent(true);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to send reset email. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Icon name="mail" size={40} color={theme.colors.success} />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              We've sent password reset instructions to{' '}
              <Text style={{ fontWeight: 'bold' }}>{email}</Text>
            </Text>
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <Icon name="key" size={36} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
              <Icon name="mail" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.placeholder}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
`,
    };
  }

  /**
   * Generate Reset Password Screen
   */
  private generateResetPasswordScreen(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/screens/auth/ResetPasswordScreen.tsx',
      type: 'screen',
      content: `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { authApi } from '@api/auth';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const token = route.params?.token;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const styles = useStyles((t) => ({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    content: {
      flex: 1,
      padding: t.spacing.lg,
    },
    header: {
      marginBottom: t.spacing.xxl,
      marginTop: t.spacing.lg,
    },
    backButton: {
      marginBottom: t.spacing.md,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: t.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.lg,
    },
    title: {
      fontSize: t.typography.fontSize.xxl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
    },
    subtitle: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      marginTop: t.spacing.sm,
    },
    inputContainer: {
      marginBottom: t.spacing.md,
    },
    label: {
      fontSize: t.typography.fontSize.sm,
      fontFamily: t.typography.fontFamily.medium,
      color: t.colors.text,
      marginBottom: t.spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.input,
      borderRadius: t.borderRadius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingHorizontal: t.spacing.md,
    },
    inputWrapperError: {
      borderColor: t.colors.error,
    },
    input: {
      flex: 1,
      paddingVertical: t.spacing.md,
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.text,
    },
    inputIcon: {
      marginRight: t.spacing.sm,
    },
    eyeButton: {
      padding: t.spacing.xs,
    },
    errorText: {
      fontSize: t.typography.fontSize.xs,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.error,
      marginTop: t.spacing.xs,
    },
    submitButton: {
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius.md,
      paddingVertical: t.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: t.spacing.lg,
      ...t.shadows.sm,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: {
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
    successContainer: {
      alignItems: 'center',
      paddingVertical: t.spacing.xl,
    },
    successIcon: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.colors.success + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.lg,
    },
    successTitle: {
      fontSize: t.typography.fontSize.xl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
      textAlign: 'center',
    },
    successText: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      textAlign: 'center',
      marginTop: t.spacing.sm,
      marginBottom: t.spacing.xl,
    },
    backToLoginButton: {
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius.md,
      paddingVertical: t.spacing.md,
      paddingHorizontal: t.spacing.xl,
    },
    backToLoginText: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
  }));

  const validate = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setIsSuccess(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Icon name="check" size={50} color={theme.colors.success} />
            </View>
            <Text style={styles.successTitle}>Password Reset!</Text>
            <Text style={styles.successText}>
              Your password has been reset successfully. You can now log in with your new password.
            </Text>
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backToLoginText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <Icon name="lock" size={36} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Create a new password for your account</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
              <Icon name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={theme.colors.placeholder}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
              <Icon name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={theme.colors.placeholder}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                secureTextEntry={!showPassword}
              />
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
`,
    };
  }

  /**
   * Generate Onboarding Screen
   */
  private generateOnboardingScreen(config: MobileAppConfig): GeneratedFile {
    const { onboarding, theme } = config;

    return {
      path: 'src/screens/auth/OnboardingScreen.tsx',
      type: 'screen',
      content: `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = '@onboarding_completed';

const slides = ${JSON.stringify(onboarding.slides, null, 2)};

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const styles = useStyles((t) => ({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    skipButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      padding: t.spacing.sm,
    },
    skipText: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.medium,
      color: t.colors.textSecondary,
    },
    slide: {
      width,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: t.spacing.xl,
    },
    imageContainer: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: t.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.xxl,
    },
    title: {
      fontSize: t.typography.fontSize.xxl,
      fontFamily: t.typography.fontFamily.bold,
      color: t.colors.text,
      textAlign: 'center',
      marginBottom: t.spacing.md,
    },
    description: {
      fontSize: t.typography.fontSize.md,
      fontFamily: t.typography.fontFamily.regular,
      color: t.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.xl,
    },
    pagination: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: t.colors.border,
      marginHorizontal: 4,
    },
    dotActive: {
      backgroundColor: t.colors.primary,
      width: 24,
    },
    nextButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.md,
    },
    getStartedButton: {
      backgroundColor: t.colors.primary,
      borderRadius: t.borderRadius.md,
      paddingVertical: t.spacing.md,
      paddingHorizontal: t.spacing.xl,
      ...t.shadows.sm,
    },
    getStartedText: {
      fontSize: t.typography.fontSize.lg,
      fontFamily: t.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
  }));

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.replace('Login');
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={[styles.slide, item.backgroundColor && { backgroundColor: item.backgroundColor }]}>
      <View style={styles.imageContainer}>
        <Icon name="shopping-bag" size={80} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      ${onboarding.skipButton ? `
      <TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      ` : ''}

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        ${onboarding.showDots ? `
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>
        ` : '<View />'}

        {currentIndex === slides.length - 1 ? (
          <TouchableOpacity style={styles.getStartedButton} onPress={completeOnboarding}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
            <Icon name="arrow-right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

// Helper to check if onboarding is completed
export const checkOnboardingCompleted = async (): Promise<boolean> => {
  const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
  return completed === 'true';
};
`,
    };
  }

  /**
   * Generate Splash Screen
   */
  private generateSplashScreen(config: MobileAppConfig): GeneratedFile {
    const { splashScreen, theme } = config;

    return {
      path: 'src/screens/auth/SplashScreen.tsx',
      type: 'screen',
      content: `import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '@store/AuthContext';
import { checkOnboardingCompleted } from './OnboardingScreen';

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after splash duration
    const timer = setTimeout(async () => {
      if (isLoading) return; // Wait for auth check

      if (isAuthenticated) {
        navigation.replace('Main');
      } else {
        ${config.onboarding.enabled ? `
        const onboardingCompleted = await checkOnboardingCompleted();
        if (onboardingCompleted) {
          navigation.replace('Login');
        } else {
          navigation.replace('Onboarding');
        }
        ` : `navigation.replace('Login');`}
      }
    }, ${splashScreen.duration});

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logo}>
          <Icon name="shopping-bag" size={60} color="#FFFFFF" />
        </View>
        <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
          ${config.appName}
        </Animated.Text>
        ${config.appSlogan ? `
        <Animated.Text style={[styles.slogan, { opacity: fadeAnim }]}>
          ${config.appSlogan}
        </Animated.Text>
        ` : ''}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '${splashScreen.backgroundColor}',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default SplashScreen;
`,
    };
  }
}
