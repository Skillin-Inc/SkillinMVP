import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import SkillinLogo from '@assets/icons/skillin-logo.png';
import { useScreenDimensions } from '../hooks';
import { Colors, Typography } from '../styles';

const Home = () => {
  const navigation = useNavigation();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  return (
    <View style={[styles.container, { height: screenHeight }]}>
      <Image
        source={SkillinLogo}
        style={[
          styles.logo,
          { width: screenWidth * 0.6, height: screenWidth * 0.6 },
        ]}
        resizeMode="contain"
      />

      <Text style={styles.title}>Learn a new hobby with a personal teacher</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          accessibilityLabel="Log in to your Skillin account"
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignUp')}
          accessibilityLabel="Sign up for Skillin"
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Preview')}
          accessibilityLabel="Preview Skillin without an account"
        >
          <Text style={styles.buttonText}>Preview Skillin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;
const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.purple,
      padding: 20,
    },
    logo: {
      marginBottom: 30,
    },
    title: {
      ...Typography.title,
      color: Colors.white,
      textAlign: 'center',
      marginBottom: 30,
      fontSize: width > 400 ? 26 : 22,
    },
    buttonContainer: {
      width: '100%',
      maxWidth: 400,
    },
    button: {
      backgroundColor: Colors.springGreen,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 15,
    },
    buttonText: {
      ...Typography.buttonText,
      fontSize: width > 400 ? 18 : 16,
      color: Colors.white,
    },
  });
