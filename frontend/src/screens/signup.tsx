import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Colors from "../styles/colors";

const SignUpScreen = () => {
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
        placeholderTextColor={Colors.medGray}
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor={Colors.medGray}
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (MM/DD/YYYY)"
        placeholderTextColor={Colors.medGray}
        value={dOB}
        onChangeText={setDOB}
      />

      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        placeholderTextColor={Colors.medGray}
        keyboardType="number-pad"
        value={zipCode}
        onChangeText={setZipCode}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.medGray}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor={Colors.medGray}
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.medGray}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={Colors.medGray}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.purple,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: Colors.purple,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    color: Colors.black,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.purple,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
