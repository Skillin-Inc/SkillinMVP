import React from "react";
import { Text, TouchableOpacity, StyleSheet, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useScreenDimensions } from "../hooks";
import { COLORS, TYPOGRAPHY } from "../styles";
import { RootStackParamList } from "../types";
type NavigationProp = StackNavigationProp<RootStackParamList, "Profile">;

export default function TeacherHome() {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);
  const navigation = useNavigation<NavigationProp>();

  const handleViewProfile = () => {
    navigation.navigate("Profile", { from: "TeacherHome" }); // or "Home"
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, Teacher!</Text>
        <TouchableOpacity onPress={handleViewProfile} style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={36} color={COLORS.purple} />
        </TouchableOpacity>
      </View>

      <View style={styles.rowCards}>
        <TouchableOpacity style={styles.smallCard}>
          <Text style={styles.smallCardText}>📚 My Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallCard}>
          <Text style={styles.smallCardText}>➕ Create Course</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallCard}>
          <Text style={styles.smallCardText}>📅 Schedule</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>📤 Upload Video</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (width, height) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: "#fff",
      padding: width * 0.06,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      margin: 20,
    },
    title: {
      ...TYPOGRAPHY.title,
      color: COLORS.purple,
    },
    profileIcon: {
      padding: 5,
    },
    rowCards: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    smallCard: {
      backgroundColor: COLORS.purple,
      padding: 15,
      borderRadius: 8,
      flex: 1,
      alignItems: "center",
      marginHorizontal: 5,
    },
    smallCardText: {
      fontSize: width > 400 ? 14 : 13,
      color: COLORS.white,
      fontWeight: "600",
      textAlign: "center",
    },
    card: {
      backgroundColor: COLORS.purple,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    cardText: {
      fontSize: width > 400 ? 18 : 16,
      color: COLORS.white,
      fontWeight: "600",
    },
  });
