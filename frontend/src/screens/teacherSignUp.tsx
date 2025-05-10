import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useScreenDimensions, formatDOB, formatPhoneNumber ,formatZipCode , isValidEmail } from '../hooks';
import { Colors, ButtonStyles, Typography } from '../styles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';





const TeacherSignUpScreen = () => {
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

    const navigation = useNavigation();
  

  // well need to edit this later 
  const handleSignUp = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dOB.trim() ||
      !zipCode.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      alert('Please fill out all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    // You could add more validation here (e.g., email format, password length, etc.)
  
    console.log('Signing up with:', {
      firstName,
      lastName,
      dOB,
      zipCode,
      email,
      phoneNumber,
      password,
    });
  };
  

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={28} color={Colors.purple} />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Teacher Sign Up</Text>
</View>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor={Colors.black}
        value={firstName}
        onChangeText={setFirstName}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor={Colors.black}
        value={lastName}
        onChangeText={setLastName}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Date of Birth (MM/DD/YYYY)"
        placeholderTextColor={Colors.black}
        keyboardType="number-pad"
        value={dOB}
        onChangeText={(text) => setDOB(formatDOB(text))}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        placeholderTextColor={Colors.black}
        keyboardType="number-pad"
        value={zipCode}
        onChangeText={(text) => setZipCode(formatZipCode(text))}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.black}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor={Colors.black}
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.black}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
  
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={Colors.black}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
  
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      </KeyboardAwareScrollView>
  );
}  
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
      header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.04,
        marginTop: height * 0.02,
      },
      
      headerTitle: {
        fontSize: width > 400 ? 32 : 28,
        fontWeight: 'bold',
        color: Colors.purple,
        marginLeft: 15,
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
        backgroundColor: Colors.springGreen,
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
  
  
export default TeacherSignUpScreen;  
