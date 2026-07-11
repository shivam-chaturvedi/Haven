import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type Props = {
  size?: number;
  showShadow?: boolean;
};

const AppLogo = ({ size = 96, showShadow = false }: Props) => {
  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        showShadow && styles.shadow,
      ]}
    >
      <Image
        source={require('../assets/logo.jpeg')}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  image: {
    backgroundColor: '#FFFFFF',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default AppLogo;
