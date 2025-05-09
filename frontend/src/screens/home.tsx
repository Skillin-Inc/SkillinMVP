// src/screens/Home.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { useScreenDimensions } from '../hooks';
import { AuthContext } from '../../src/features/auth/AuthContext'; 

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { logout } = useContext(AuthContext); 
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const handleLogout = async () => {
    try {
      await logout(); 
    } catch (e) {
      console.error('Logout error:', e);
    }
  };
  const handleViewProfile = () => {
    navigation.navigate('ViewUserProfile');
  };

  return (
    <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleViewProfile}>
        <Text style={styles.buttonText}>View Profile</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Welcome to the Home Page!</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
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
    title: {
      fontSize: width > 400 ? 28 : 24,
      fontWeight: '600',
      marginBottom: 30,
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#6a1b9a',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
