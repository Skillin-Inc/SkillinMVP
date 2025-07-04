import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { useScreenDimensions } from "../../hooks";
import { AuthContext } from "../../hooks/AuthContext";
import { COLORS } from "../../styles";
import { AuthStackParamList } from "../../types";

type Props = StackScreenProps<AuthStackParamList, "ForgotPassword">;

export default function ForgotPassword({ navigation }: Props) {
  const { forgotPassword } = useContext(AuthContext);
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address to reset your password.");
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email.trim());
      Alert.alert(
        "Reset Email Sent",
        "A password reset email has been sent to your email address. Please check your inbox and follow the instructions to reset your password.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("ResetPassword", { email: email.trim() }),
          },
        ]
      );
    } catch (error: any) {
      console.error("Forgot password error:", error);
      if (error.code === "UserNotFoundException") {
        Alert.alert("Email Not Found", "No account found with this email address.");
      } else if (error.code === "LimitExceededException") {
        Alert.alert("Too Many Requests", "Too many password reset attempts. Please try again later.");
      } else {
        Alert.alert("Error", "Failed to send reset email. Please try again.");
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
        <Text style={styles.title}>Forgot Password</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-open-outline" size={80} color={COLORS.purple} />
        </View>

        <Text style={styles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.gray}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleForgotPassword}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? "Sending..." : "Send Reset Email"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.goBack()} disabled={isLoading}>
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
      marginBottom: height * 0.04,
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
    button: {
      width: "100%",
      backgroundColor: COLORS.green,
      paddingVertical: height * 0.02,
      borderRadius: 12,
      alignItems: "center",
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
