import React, { useState, useContext } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
import { useScreenDimensions, formatDOB, formatPhoneNumber, formatZipCode, isValidEmail } from "../../hooks";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../styles";
import { AuthContext } from "../../hooks/AuthContext";

export default function Register() {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);
  const navigation = useNavigation();
  const { register } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dOB, setDOB] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignUp() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dOB.trim() ||
      !zipCode.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !username.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }

    const postalCode = parseInt(zipCode.replace(/\D/g, ""), 10);
    if (isNaN(postalCode)) {
      Alert.alert("Invalid Zip Code", "Please enter a valid zip code.");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.replace(/\D/g, ""),
        username: username.trim(),
        password,
        postalCode,
      });

      Alert.alert("Success", "Account created successfully! You are now logged in.");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Ionicons name="person-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor={COLORS.gray}
              value={firstName}
              onChangeText={setFirstName}
              editable={!isLoading}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor={COLORS.gray}
              value={lastName}
              onChangeText={setLastName}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Date of Birth (MM/DD/YYYY)"
            placeholderTextColor={COLORS.gray}
            keyboardType="number-pad"
            value={dOB}
            onChangeText={(text) => setDOB(formatDOB(text))}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Zip Code"
            placeholderTextColor={COLORS.gray}
            keyboardType="number-pad"
            value={zipCode}
            onChangeText={(text) => setZipCode(formatZipCode(text))}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.gray}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={COLORS.gray}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={COLORS.gray}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.gray}
            secureTextEntry={hidePassword}
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.passwordToggle} onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={COLORS.gray}
            secureTextEntry={hideConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.passwordToggle} onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
            <Ionicons
              name={hideConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={COLORS.darkGray}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? "Creating Account..." : "Create Account"}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => !isLoading && navigation.navigate("Login" as never)}>
          <Text style={styles.loginText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
function getStyles(width: number, height: number) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: COLORS.white,
      padding: width * 0.06,
    },
    header: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: height * 0.05,
      marginBottom: height * 0.03,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    headerTitle: {
      fontSize: width > 400 ? 28 : 24,
      fontWeight: "bold",
      color: COLORS.purple,
      marginLeft: 10,
    },
    formContainer: {
      width: "100%",
      marginTop: height * 0.01,
    },
    inputRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: height * 0.015,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: height * 0.075,
      borderColor: COLORS.gray,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: height * 0.015,
      backgroundColor: COLORS.lightGray,
    },
    inputIcon: {
      marginRight: 10,
      padding: 5,
    },
    input: {
      flex: 1,
      fontSize: width > 400 ? 16 : 14,
      color: COLORS.black,
      height: "100%",
      paddingVertical: 10,
    },
    passwordToggle: {
      padding: 8,
      height: "100%",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    button: {
      width: "100%",
      backgroundColor: COLORS.green,
      paddingVertical: height * 0.02,
      borderRadius: 12,
      alignItems: "center",
      marginTop: height * 0.02,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonText: {
      color: COLORS.white,
      fontSize: width > 400 ? 18 : 16,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: height * 0.03,
      marginBottom: height * 0.02,
    },
    footerText: {
      color: COLORS.darkGray,
      fontSize: 14,
    },
    loginText: {
      color: COLORS.purple,
      fontSize: 14,
      fontWeight: "bold",
    },
    buttonDisabled: {
      backgroundColor: COLORS.gray,
    },
  });
}
