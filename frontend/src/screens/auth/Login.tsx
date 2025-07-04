import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { useScreenDimensions } from "../../hooks";
import { AuthContext } from "../../hooks/AuthContext";
import { COLORS } from "../../styles";
import { AuthStackParamList } from "../../types";

type Props = StackScreenProps<AuthStackParamList, "Login">;

export default function Login({ navigation }: Props) {
  const { login, forgotPassword, resendConfirmationCode } = useContext(AuthContext);
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!emailOrPhone.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        emailOrPhone: emailOrPhone.trim(),
        password,
      });

      // Show success message based on user type
      const userType = response.userType;
      let message = "";
      const title = "Login Successful";

      switch (userType) {
        case "admin":
          message = "Welcome Administrator! You have been logged into the admin dashboard.";
          break;
        case "teacher":
          message = "Welcome Teacher! You have been logged into the teacher dashboard.";
          break;
        case "student":
        default:
          message = "Welcome! You have been logged into the student dashboard.";
          break;
      }

      Alert.alert(title, message, [{ text: "OK" }]);
    } catch (error: any) {
      console.error("Login error", error);

      // Handle specific Cognito errors
      if (error.code === "UserNotConfirmedException") {
        Alert.alert("Email Not Confirmed", "Please check your email and confirm your account before signing in.", [
          { text: "OK" },
          {
            text: "Resend Confirmation",
            onPress: () => handleResendConfirmation(emailOrPhone.trim()),
          },
        ]);
      } else if (error.code === "NotAuthorizedException") {
        Alert.alert("Login Failed", "Invalid email or password. Please try again.");
      } else if (error.code === "UserNotFoundException") {
        Alert.alert("Login Failed", "No account found with this email address.");
      } else if (error.code === "TooManyRequestsException") {
        Alert.alert("Too Many Attempts", "Too many failed login attempts. Please try again later.");
      } else {
        Alert.alert("Login Failed", error.message || "An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendConfirmation = async (email: string) => {
    try {
      await resendConfirmationCode(email);
      navigation.navigate("EmailConfirmation", { email });
    } catch (error) {
      Alert.alert("Error", "Failed to resend confirmation email. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.title}>Log In</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.gray}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color={COLORS.darkGray} style={styles.inputIcon} />
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
            <Ionicons name={hidePassword ? "eye-outline" : "eye-off-outline"} size={22} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => !isLoading && navigation.navigate("StudentInfo")}>
          <Text style={styles.signupText}>Sign Up</Text>
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
      marginTop: height * 0.06,
      marginBottom: height * 0.04,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    title: {
      fontSize: width > 400 ? 32 : 28,
      fontWeight: "bold",
      color: COLORS.purple,
      marginTop: height * 0.02,
      marginBottom: height * 0.02,
    },
    formContainer: {
      width: "100%",
      marginTop: height * 0.02,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      height: height * 0.075,
      borderColor: COLORS.gray,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: height * 0.025,
      backgroundColor: COLORS.lightGray,
    },
    inputIcon: {
      marginRight: 10,
      padding: 5,
    },
    input: {
      flex: 1,
      fontSize: width > 400 ? 16 : 15,
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
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: height * 0.02,
    },
    forgotText: {
      color: COLORS.purple,
      fontSize: 14,
      fontWeight: "500",
    },
    button: {
      width: "100%",
      backgroundColor: COLORS.green,
      paddingVertical: height * 0.02,
      borderRadius: 12,
      alignItems: "center",
      marginTop: height * 0.04,
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
      marginTop: height * 0.04,
    },
    footerText: {
      color: COLORS.darkGray,
      fontSize: 14,
    },
    signupText: {
      color: COLORS.purple,
      fontSize: 14,
      fontWeight: "bold",
    },
    buttonDisabled: {
      backgroundColor: COLORS.gray,
    },
  });
}
