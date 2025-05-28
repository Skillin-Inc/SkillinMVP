import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useScreenDimensions } from "../hooks";
import { COLORS, TYPOGRAPHY } from "../styles";

export default function StatsScreen() {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📊 Teacher Stats</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Total Students:</Text>
        <Text style={styles.value}>45</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Courses Taught:</Text>
        <Text style={styles.value}>8</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>1-on-1 Sessions:</Text>
        <Text style={styles.value}>23</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Average Rating:</Text>
        <Text style={styles.value}>4.8 ⭐</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: "#fff",
      padding: width * 0.06,
      alignItems: "center",
    },
    header: {
      ...TYPOGRAPHY.title,
      color: COLORS.purple,
      margin: 20,
    },
    card: {
      backgroundColor: COLORS.purple,
      width: "100%",
      padding: 20,
      borderRadius: 12,
      marginBottom: 16,
      alignItems: "center",
    },
    label: {
      fontSize: 16,
      color: COLORS.white,
      fontWeight: "500",
    },
    value: {
      fontSize: 22,
      color: COLORS.white,
      fontWeight: "700",
      marginTop: 8,
    },
  });
