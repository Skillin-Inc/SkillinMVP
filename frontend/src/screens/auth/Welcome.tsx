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
        <Text style={styles.welcomeText}>Welcome to Skillin</Text>
        <Text style={styles.title}>Learn a new hobby with a personal teacher</Text>
        <Text style={styles.subtitle}>Connect with experts and master new skills at your own pace</Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Personalized Learning</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👨‍🏫</Text>
            <Text style={styles.featureText}>Expert Teachers</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⏰</Text>
            <Text style={styles.featureText}>Learn at Your Pace</Text>
          </View>
        </View>

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
            onPress={() => navigation.navigate("StudentInfo")}
            accessibilityLabel="Sign up for Skillin"
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handlePaymentPress}>
            <Text style={styles.buttonText}>Handle payments</Text>
          </TouchableOpacity>

          {/* removing this feature till we have email situaton handled also till we know if more people want to be teachers. */}

          {/* <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate("TeacherNavigator", { screen: "TeacherStart" })}
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
    welcomeText: {
      color: COLORS.white,
      textAlign: "center",
      marginBottom: 8,
      fontSize: width > 400 ? 20 : 18,
      fontWeight: "600",
      opacity: 0.9,
      letterSpacing: 1,
    },
    title: {
      color: COLORS.white,
      textAlign: "center",
      marginBottom: 12,
      fontSize: width > 400 ? 32 : 28,
      fontWeight: "bold",
      letterSpacing: 0.5,
      lineHeight: width > 400 ? 38 : 34,
    },
    subtitle: {
      color: COLORS.lightGray,
      textAlign: "center",
      marginBottom: 40,
      fontSize: width > 400 ? 18 : 16,
      opacity: 0.9,
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    featuresContainer: {
      width: "100%",
      marginBottom: 40,
      paddingHorizontal: 20,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    featureIcon: {
      fontSize: 24,
      marginRight: 16,
    },
    featureText: {
      color: COLORS.white,
      fontSize: width > 400 ? 16 : 15,
      fontWeight: "500",
      opacity: 0.95,
    },
    buttonContainer: {
      width: "100%",
      maxWidth: 350,
      marginTop: 20,
    },
    button: {
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      marginBottom: 16,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    primaryButton: {
      backgroundColor: COLORS.green,
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderWidth: 2,
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
