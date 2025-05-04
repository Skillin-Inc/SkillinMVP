import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useScreenDimensions } from '../hooks';
import { Colors, Typography } from '../styles';

const LoginScreen = () => {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // add logic to make sure the username witch is the email or phone number matches what in the db
    // sends a request out to postgres then a get and saves it so whatever user dose it is with with that account / memberid
    if (!userName.trim() || !password.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    console.log('Logging in with:', { userName, password });
    // Add authentication logic here
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email or Phone number"
        placeholderTextColor={Colors.darkGray}
        value={userName}
        onChangeText={setUserName}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.darkGray}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
};

export default LoginScreen;

const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: Colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      padding: width * 0.05,
      marginTop: height * 0.05,
      marginBottom: height * 0.05,
    },
    title: {
      fontSize: width > 400 ? 36 : 32,
      fontWeight: 'bold',
      color: Colors.purple,
      marginBottom: height * 0.04,
    },
    input: {
      width: '100%',
      height: height * 0.07,
      borderColor: Colors.darkGray,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: width > 400 ? 18 : 16,
      marginBottom: height * 0.025,
      color: Colors.darkGray,
    },
    button: {
      width: '100%',
      backgroundColor: Colors.purple,
      paddingVertical: height * 0.02,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: height * 0.02,
    },
    buttonText: {
      color: Colors.white,
      fontSize: width > 400 ? 20 : 18,
      fontWeight: 'bold',
    },
  });
