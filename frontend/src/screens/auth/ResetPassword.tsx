import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { useScreenDimensions } from "../../hooks";
import { AuthContext } from "../../hooks/AuthContext";
import { COLORS } from "../../styles";
import { AuthStackParamList } from "../../types";

type Props = StackScreenProps<AuthStackParamList, "ResetPassword">;

export default function ResetPassword({ navigation, route }: Props) {
  const { confirmForgotPassword } = useContext(AuthContext);
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const { email } = route.params;
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Please make sure your passwords match.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Password Too Short", "Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmForgotPassword(email, code.trim(), newPassword);
      Alert.alert(
        "Password Reset Successful",
        "Your password has been reset successfully. You can now log in with your new password.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "CodeMismatchException") {
          Alert.alert("Invalid Code", "The confirmation code is incorrect. Please check your email and try again.");
        } else if (error.code === "ExpiredCodeException") {
          Alert.alert("Code Expired", "The confirmation code has expired. Please request a new one.");
        } else if (error.code === "InvalidPasswordException") {
          Alert.alert("Invalid Password", "Password does not meet requirements. Please choose a stronger password.");
        } else {
          Alert.alert("Error", "Failed to reset password. Please try again.");
        }
      } else {
        Alert.alert("Error", "Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="key-outline" size={80} color={COLORS.purple} />
        </View>

        <Text style={styles.description}>Enter the confirmation code from your email and create a new password.</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmation Code"
            placeholderTextColor={COLORS.gray}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            keyboardType="number-pad"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor={COLORS.gray}
            secureTextEntry={hidePassword}
            value={newPassword}
            onChangeText={setNewPassword}
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.passwordToggle} onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? "eye-outline" : "eye-off-outline"} size={22} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor={COLORS.gray}
            secureTextEntry={hideConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.passwordToggle} onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
            <Ionicons
              name={hideConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={COLORS.darkGray}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? "Resetting..." : "Reset Password"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.navigate("Login")} disabled={isLoading}>
          <Text style={styles.backToLoginText}>Back to Login</Text>
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
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: width * 0.04,
    },
    iconContainer: {
      marginBottom: height * 0.04,
    },
    description: {
      fontSize: width > 400 ? 16 : 15,
      color: COLORS.darkGray,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: height * 0.06,
      paddingHorizontal: width * 0.02,
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
    button: {
      width: "100%",
      backgroundColor: COLORS.green,
      paddingVertical: height * 0.02,
      borderRadius: 12,
      alignItems: "center",
      marginTop: height * 0.04,
      marginBottom: height * 0.04,
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
    buttonDisabled: {
      backgroundColor: COLORS.gray,
    },
    backToLogin: {
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
    },
    backToLoginText: {
      color: COLORS.purple,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
