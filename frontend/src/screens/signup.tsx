import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useScreenDimensions, formatDOB, formatPhoneNumber ,formatZipCode , isValidEmail } from '../hooks';
import { darkGray, white, purple, medGray, black } from '../styles';


const SignUpScreen = () => {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight); // << use this here!

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dOB, setDOB] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // will not save this 
  const [membershipTier, setMembershipTier] = useState(''); // invis to users till inside profile
  const [paymentInfo, setPaymentInfo] = useState<string[]>([]); // invis to users till inside profile

  // well need to edit this later 
  const handleSignUp = () => {
    console.log('Signing up with:', {
      firstName,
      lastName,
      dOB,
      zipCode,
      email,
      phoneNumber,
      password,
      confirmPassword,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
  
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor={black}
        value={firstName}
        onChangeText={setFirstName}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor={black}
        value={lastName}
        onChangeText={setLastName}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Date of Birth (MM/DD/YYYY)"
        placeholderTextColor={black}
        keyboardType="number-pad"
        value={dOB}
        onChangeText={(text) => setDOB(formatDOB(text))}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        placeholderTextColor={black}
        keyboardType="number-pad"
        value={zipCode}
        onChangeText={(text) => setZipCode(formatZipCode(text))}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={black}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor={black}
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={black}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={black}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
  
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}  
const getStyles = (width: number, height: number) =>
    StyleSheet.create({
      container: {
        flexGrow: 1,
        backgroundColor: white, // <- NO Colors.white
        justifyContent: 'center',
        alignItems: 'center',
        padding: width * 0.05,
        marginTop: height * 0.05,
      },
      title: {
        fontSize: width > 400 ? 36 : 32,
        fontWeight: 'bold',
        color: purple, // <- NO Colors.purple
        marginBottom: height * 0.04,
      },
      input: {
        width: '100%',
        height: height * 0.07,
        borderColor: darkGray, // <- Use darkGray directly
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: width > 400 ? 18 : 16,
        marginBottom: height * 0.025,
        color: darkGray,
      },
      button: {
        width: '100%',
        backgroundColor: purple,
        paddingVertical: height * 0.02,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: height * 0.02,
      },
      buttonText: {
        color: white,
        fontSize: width > 400 ? 20 : 18,
        fontWeight: 'bold',
      },
    });

export default SignUpScreen;  
