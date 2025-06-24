import React, { useState, useContext } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
import { useScreenDimensions } from "../../hooks";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { COLORS } from "../../styles";
import { AuthContext } from "../../hooks/AuthContext";
import { AuthStackParamList } from "../../types";
import { SectionHeader } from "../../components/common";

type Props = StackScreenProps<AuthStackParamList, "StudentAccount">;

export default function StudentAccount({ navigation, route }: Props) {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);
  const { register } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { firstName, lastName, email, phoneNumber, postalCode } = route.params;

  async function handleSignUp() {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
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

    setIsLoading(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        phoneNumber,
        username: username.trim(),
        password,
        postalCode,
      });

      Alert.alert("Success", "Account created successfully! You are now logged in.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("RegisterPayment"),
        },
      ]);
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
        <SectionHeader title="Create Account" />
      </View>

      <View style={styles.formContainer}>
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
        <TouchableOpacity onPress={() => !isLoading && navigation.navigate("Login")}>
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
