// src/screens/Home.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenDimensions } from '../hooks';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const handleViewProfile = () => {
    navigation.navigate('ViewUserProfile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleViewProfile}>
          <Ionicons name="person-circle-outline" size={40} color="#6a1b9a" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Welcome to the Home Page!</Text>
    </View>
  );
};

export default HomeScreen;

const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9f9f9',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    header: {
      width: '100%',
      position: 'absolute',
      top: height * 0.06,
      right: 20,
      alignItems: 'flex-end',
      zIndex: 1,
    },
    title: {
      fontSize: width > 400 ? 28 : 24,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
