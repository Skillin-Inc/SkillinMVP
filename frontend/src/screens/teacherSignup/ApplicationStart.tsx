// fix how do pay outs work? pop up modle?
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { useScreenDimensions } from "../../hooks";
import { COLORS } from "../../styles";

type TeacherStackParamList = {
  ApplicationStart: undefined;
  PersonalInfo: undefined;
  PayoutsInfo: undefined; // ← THIS LINE IS PROBABLY MISSING
};

const ApplicationStartScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<TeacherStackParamList>>();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const handleStart = () => {
    navigation.navigate("PersonalInfo");
  };

  const handlePaymentInfo = () => {
    navigation.navigate("PayoutsInfo");
  };
  const steps = [
    "Personal Info",
    "Experience",
    "Curriculum",
    "Verification",
    "Review & Submit",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Skillin Instructor</Text>
      </View>
      <Text style={styles.subtext}>
        As an early ambassador of Skillin, you’ll get white-glove support to
        help set up your teaching profile and curriculum.
      </Text>

      <Text style={styles.sectionHeader}>Application Steps:</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <View style={styles.bullet} />
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Start Application</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handlePaymentInfo}>
        <Text style={styles.buttonText}>How do payouts work?</Text>{" "}
        {/* need to route this to the payouts page */}
      </TouchableOpacity>
    </View>
  );
};

export default ApplicationStartScreen;

const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
      padding: width * 0.06,
      paddingTop: height * 0.1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: height * 0.03,
    },
    headerTitle: {
      marginLeft: 15,
      fontSize: width > 400 ? 24 : 22,
      fontWeight: "bold",
      color: COLORS.purple,
    },
    title: {
      fontSize: width > 400 ? 28 : 24,
      fontWeight: "bold",
      color: COLORS.purple,
      marginBottom: height * 0.02,
    },
    subtext: {
      fontSize: 16,
      color: COLORS.darkGray,
      marginBottom: height * 0.04,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: height * 0.02,
      color: COLORS.black,
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: height * 0.015,
    },
    bullet: {
      width: 8,
      height: 8,
      backgroundColor: COLORS.purple,
      borderRadius: 4,
      marginRight: 10,
    },
    stepText: {
      fontSize: 16,
      color: COLORS.darkGray,
    },
    button: {
      marginTop: height * 0.05,
      backgroundColor: COLORS.green,
      paddingVertical: height * 0.018,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: "bold",
    },
  });
