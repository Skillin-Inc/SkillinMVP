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
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.purple} />

      <View style={styles.logoContainer}>
        <Image source={SkillinLogo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.contentContainer}>
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
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate("StudentInfo")}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          {/*
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handlePaymentPress}>
            <Text style={styles.buttonText}>Handle payments</Text>
          </TouchableOpacity>*/}

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
      paddingTop: height * 0.05,
      paddingHorizontal: 20,
    },
    logoContainer: {
      alignItems: "center",
    },
    logo: {
      width: width * 0.6,
      height: width * 0.5,
      maxWidth: 220,
      maxHeight: 220,
    },
    contentContainer: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingBottom: 20,
    },
    welcomeText: {
      color: COLORS.white,
      textAlign: "center",
      marginBottom: 10,
      fontSize: width > 400 ? 24 : 22,
      fontWeight: "600",
      letterSpacing: 1,
    },
    title: {
      color: COLORS.white,
      textAlign: "center",
      marginBottom: 12,
      fontSize: width > 400 ? 30 : 25,
      fontWeight: "bold",
      letterSpacing: 0.5,
      lineHeight: width > 400 ? 42 : 36,
      paddingHorizontal: 10,
    },
    subtitle: {
      color: COLORS.lightGray,
      textAlign: "center",
      marginBottom: 30,
      fontSize: width > 400 ? 20 : 16,
      opacity: 0.9,
      lineHeight: 26,
      paddingHorizontal: 20,
    },
    featuresContainer: {
      width: "100%",
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    featureIcon: {
      fontSize: width > 400 ? 20 : 18,

      marginRight: 16,
    },
    featureText: {
      color: COLORS.white,
      fontSize: width > 400 ? 18 : 16,
      fontWeight: "500",
    },
    buttonContainer: {
      width: "100%",
      maxWidth: 350,
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
    buttonText: {
      color: COLORS.white,
      fontWeight: "bold" as TextStyle["fontWeight"],
      fontSize: width > 400 ? 20 : 18,
      letterSpacing: 0.5,
    },
  });
}
