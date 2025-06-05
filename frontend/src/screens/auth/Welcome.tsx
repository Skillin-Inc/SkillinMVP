import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, TextStyle, StatusBar, Linking } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";

import SkillinLogo from "../../../assets/icons/skillin-logo.png";
import { useScreenDimensions } from "../../hooks";
import { COLORS } from "../../styles";
import { AuthStackParamList } from "../../types";

type Props = StackScreenProps<AuthStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);
  const handlePaymentPress = () => {
    Linking.openURL("https://buy.stripe.com/9AQ03wbg7ayg7SM288");
    // Don't auto-navigate to Welcome unless you really want to
  };

  return (
    <View style={[styles.container, { height: screenHeight }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.purple} />

      <View style={styles.logoContainer}>
        <Image source={SkillinLogo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Learn a new hobby with a personal teacher</Text>
        <Text style={styles.subtitle}>Connect with experts and master new skills at your own pace</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate("Login")}
            accessibilityLabel="Log in to your Skillin account"
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate("Register")}
            accessibilityLabel="Sign up for Skillin"
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handlePaymentPress}>
            <Text style={styles.buttonText}>Handle payments</Text>
          </TouchableOpacity>

          {/* removing this feature till we have email situaton handled also till we know if more people want to be teachers. */}
          {/* 
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate("TeacherNavigator", { screen: "ApplicationStart" })}
            accessibilityLabel="Teacher sign up for Skillin"
          >
            <Text style={styles.secondaryButtonText}>Sign up to be a teacher</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
}

function getStyles(width: number, height: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.purple,
      padding: 20,
      justifyContent: "space-between",
    },
    logoContainer: {
      alignItems: "center",
      marginTop: height * 0.08,
    },
    logo: {
      width: width * 0.6,
      height: width * 0.6,
      maxWidth: 220,
      maxHeight: 220,
    },
    contentContainer: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      width: "100%",
      marginBottom: height * 0.05,
    },
    title: {
      color: COLORS.white,
      textAlign: "center",
      marginBottom: 12,
      fontSize: width > 400 ? 28 : 24,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    subtitle: {
      color: COLORS.lightGray,
      textAlign: "center",
      marginBottom: 40,
      fontSize: width > 400 ? 16 : 14,
      opacity: 0.9,
    },
    buttonContainer: {
      width: "100%",
      maxWidth: 350,
      marginTop: 20,
    },
    button: {
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 15,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    primaryButton: {
      backgroundColor: COLORS.green,
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: COLORS.white,
      marginTop: 5,
    },
    buttonText: {
      color: COLORS.white,
      fontWeight: "bold" as TextStyle["fontWeight"],
      fontSize: width > 400 ? 18 : 16,
      letterSpacing: 0.5,
    },
    secondaryButtonText: {
      color: COLORS.white,
      fontWeight: "600" as TextStyle["fontWeight"],
      fontSize: width > 400 ? 17 : 15,
      letterSpacing: 0.5,
    },
  });
}
