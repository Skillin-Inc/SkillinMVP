import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useScreenDimensions } from "../../hooks";
import { COLORS } from "../../styles";
import { SectionHeader } from "../../components/common";
import { StatsCard } from "../../components/cards";

export default function TeacherStats() {
  const { screenWidth } = useScreenDimensions();
  const styles = getStyles(screenWidth);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionHeader title="📊 Teacher Stats" />

      <View style={styles.statsGrid}>
        <StatsCard icon="people-outline" label="Total Students" value="45" color={COLORS.purple} />
        <StatsCard icon="book-outline" label="Courses Taught" value="8" color={COLORS.green} />
      </View>

      <View style={styles.statsGrid}>
        <StatsCard icon="time-outline" label="1-on-1 Sessions" value="23" color={COLORS.blue} />
        <StatsCard icon="star-outline" label="Average Rating" value="4.8 ⭐" color="#FFD700" />
      </View>
    </ScrollView>
  );
}

const getStyles = (width: number) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: "#fff",
      padding: width * 0.06,
      alignItems: "center",
    },
    statsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 16,
      gap: 8,
    },
    header: {
      fontSize: 32,
      fontWeight: "bold" as const,
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
