import React from "react";
import { Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { COLORS } from "../../styles";
import { useScreenDimensions } from "../../hooks";
import { TeacherStackParamList } from "../../types";

type Props = StackScreenProps<TeacherStackParamList, "TeacherPayouts">;

const TeacherPayouts = ({ navigation }: Props) => {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How Do Payouts Work?</Text>

      <Text style={styles.sectionTitle}>💰 Payment Schedule</Text>
      <Text style={styles.paragraph}>
        Teachers are paid on a bi-weekly schedule. Every other Friday, all completed sessions and approved earnings from
        the previous two weeks are processed.
      </Text>

      <Text style={styles.sectionTitle}>📦 Payment Method</Text>
      <Text style={styles.paragraph}>
        Payments are sent via direct deposit to the bank account you provide during onboarding. You must complete your
        payout setup to begin receiving earnings.
      </Text>

      <Text style={styles.sectionTitle}>✅ Requirements for Payout</Text>
      <Text style={styles.paragraph}>To receive a payout, you must:</Text>
      <Text style={styles.listItem}>- Have a verified ID</Text>
      <Text style={styles.listItem}>- Complete at least one teaching session</Text>
      <Text style={styles.listItem}>- Ensure your bank info is up-to-date</Text>

      <Text style={styles.sectionTitle}>📊 Payout Breakdown</Text>
      <Text style={styles.paragraph}>
        Each payout includes a summary of your sessions, hours worked, and total earnings. You can view this breakdown
        in your dashboard.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Application</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      padding: width * 0.06,
      backgroundColor: COLORS.white,
    },
    title: {
      fontSize: width > 400 ? 26 : 22,
      marginTop: height * 0.03,
      fontWeight: "bold",
      color: COLORS.purple,
      marginBottom: height * 0.025,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: width > 400 ? 18 : 16,
      fontWeight: "600",
      marginTop: height * 0.025,
      marginBottom: 8,
      color: COLORS.purple,
    },
    paragraph: {
      fontSize: width > 400 ? 16 : 15,
      color: COLORS.black,
      lineHeight: 22,
    },
    listItem: {
      fontSize: width > 400 ? 16 : 15,
      color: COLORS.black,
      marginLeft: 10,
      marginBottom: 4,
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
      fontSize: width > 400 ? 16 : 15,
      fontWeight: "bold",
    },
  });

export default TeacherPayouts;
