import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGGED_IN_KEY = 'haven_is_logged_in';
const USER_ID_KEY = 'haven_user_id';

export type CachedAuthStatus = {
  isLoggedIn: boolean;
  userId: string | null;
};

export const getCachedAuthStatus = async (): Promise<CachedAuthStatus> => {
  try {
    const [[, isLoggedIn], [, userId]] = await AsyncStorage.multiGet([LOGGED_IN_KEY, USER_ID_KEY]);
    return {
      isLoggedIn: isLoggedIn === 'true',
      userId: userId || null,
    };
  } catch (error) {
    console.warn('[authStorage] Failed to read cached auth status:', error);
    return { isLoggedIn: false, userId: null };
  }
};

export const setCachedAuthStatus = async (userId: string) => {
  try {
    await AsyncStorage.multiSet([
      [LOGGED_IN_KEY, 'true'],
      [USER_ID_KEY, userId],
    ]);
  } catch (error) {
    console.warn('[authStorage] Failed to save cached auth status:', error);
  }
};

export const clearCachedAuthStatus = async () => {
  try {
    await AsyncStorage.multiRemove([LOGGED_IN_KEY, USER_ID_KEY]);
  } catch (error) {
    console.warn('[authStorage] Failed to clear cached auth status:', error);
  }
};
