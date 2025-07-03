import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { useScreenDimensions } from "../../hooks";
import { AuthContext } from "../../hooks/AuthContext";
import { COLORS } from "../../styles";
import { AuthStackParamList } from "../../types";

type Props = StackScreenProps<AuthStackParamList, "EmailConfirmation">;

export default function EmailConfirmation({ navigation, route }: Props) {
  const { confirmSignUp } = useContext(AuthContext);
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const email = route.params?.email || "";

  const handleConfirmSignUp = async () => {
    if (!confirmationCode.trim()) {
      Alert.alert("Missing Code", "Please enter the confirmation code sent to your email.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmSignUp(email, confirmationCode.trim());
      Alert.alert("Account Confirmed", "Your account has been successfully confirmed! Please complete your payment.", [
        { text: "OK", onPress: () => navigation.navigate("RegisterPayment", { email }) }, // Why is this red and it works
      ]);
    } catch (error: any) {
      console.error("Confirmation error:", error);

      if (error.code === "CodeMismatchException") {
        Alert.alert("Invalid Code", "The confirmation code you entered is incorrect. Please try again.");
      } else if (error.code === "ExpiredCodeException") {
        Alert.alert("Code Expired", "The confirmation code has expired. Please request a new one.");
      } else {
        Alert.alert("Confirmation Failed", error.message || "An error occurred during confirmation. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // You'll need to implement resend confirmation in AuthContext
      Alert.alert("Code Resent", "A new confirmation code has been sent to your email address.");
    } catch (error) {
      Alert.alert("Error", "Failed to resend confirmation code. Please try again.");
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Email</Text>
      </View>

      <View style={styles.content}>
        <Ionicons name="checkmark-circle-outline" size={80} color={COLORS.purple} style={styles.icon} />

        <Text style={styles.description}>We've sent a confirmation code to:</Text>
        <Text style={styles.email}>{email}</Text>

        <Text style={styles.instruction}>Please enter the 6-digit code from your email to confirm your account.</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={22} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter confirmation code"
            placeholderTextColor={COLORS.gray}
            value={confirmationCode}
            onChangeText={setConfirmationCode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleConfirmSignUp}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? "Confirming..." : "Confirm Account"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
          <Text style={styles.resendText}>Didn't receive the code? Resend</Text>
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
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: width * 0.04,
    },
    icon: {
      marginBottom: height * 0.04,
    },
    description: {
      fontSize: 16,
      color: COLORS.darkGray,
      textAlign: "center",
      marginBottom: height * 0.01,
    },
    email: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.purple,
      textAlign: "center",
      marginBottom: height * 0.03,
    },
    instruction: {
      fontSize: 14,
      color: COLORS.gray,
      textAlign: "center",
      marginBottom: height * 0.04,
      lineHeight: 20,
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
      fontSize: width > 400 ? 18 : 16,
      color: COLORS.black,
      height: "100%",
      paddingVertical: 10,
      textAlign: "center",
      letterSpacing: 2,
    },
    button: {
      width: "100%",
      height: height * 0.075,
      backgroundColor: COLORS.purple,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: height * 0.03,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: COLORS.white,
      fontSize: width > 400 ? 18 : 16,
      fontWeight: "600",
    },
    resendButton: {
      paddingVertical: 10,
    },
    resendText: {
      color: COLORS.purple,
      fontSize: 14,
      fontWeight: "500",
    },
  });
}
