import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const [logoOpacity] = useState(new Animated.Value(0)); // Initial opacity for the logo
  const [progress] = useState(new Animated.Value(0)); // Initial width for the progress bar

  useEffect(() => {
    // Animate the logo fade-in
    Animated.timing(logoOpacity, {
      toValue: 1, // Fully visible
      duration: 1500, // 1.5 seconds
      useNativeDriver: true,
    }).start();

    // Animate the progress bar
    Animated.timing(progress, {
      toValue: 100, // Represents 100% width
      duration: 3000, // 3 seconds
      useNativeDriver: false,
    }).start();

    // Navigate to the Login page after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/Login');
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [logoOpacity, progress, router]);

  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Animated.Image
        source={{
          uri: 'https://i.imgur.com/SUJsGzT.png', // Replace with your app logo
        }}
        style={[styles.logo, { opacity: logoOpacity }]}
      />


      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            { width: progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', 
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green', 
    marginBottom: 50,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#E0E0E0', // Light gray background for progress bar
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'green', 
  },
});
