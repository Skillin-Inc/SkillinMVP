import React from "react";
import { Text, TouchableOpacity, StyleSheet, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";

import { useScreenDimensions } from "../../hooks";
import { COLORS } from "../../styles";
import { TeacherTabsParamList, TeacherStackParamList } from "../../types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TeacherTabsParamList, "TeacherHome">,
  StackScreenProps<TeacherStackParamList>
>;

export default function TeacherHome({ navigation }: Props) {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const handleViewProfile = () => {
    navigation.navigate("TeacherHome");
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
        <TouchableOpacity style={styles.smallCard} onPress={() => navigation.navigate("TeacherCreateCourse")}>
          <Text style={styles.smallCardText}>➕ Create Course</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallCard}>
          <Text style={styles.smallCardText}>📅 Schedule</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardText}>📆 Upcoming Sessions</Text>
        <ScrollView style={styles.scrollList} nestedScrollEnabled>
          {[
            { title: "1-on-1 with John", time: "2:00 PM" },
            { title: "Group Training", time: "4:30 PM" },
            { title: "Math Review with Sarah", time: "6:00 PM" },
            { title: "Office Hours", time: "7:15 PM" },
          ].map((session, index) => (
            <TouchableOpacity
              key={index}
              style={styles.sessionItem}
              onPress={() => {
                console.log("Tapped:", session.title);
              }}
            >
              <Text style={styles.cardSubText}>
                {session.title} — {session.time}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      margin: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold" as const,
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
    scrollList: {
      maxHeight: height * 0.2,
      marginTop: 10,
    },
    sessionItem: {
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: COLORS.purple,
      borderRadius: 10,
      marginBottom: 10,
    },

    cardSubText: {
      fontSize: width > 400 ? 16 : 15,
      color: COLORS.white,
      fontWeight: "500",
      marginTop: 5,
    },

    card: {
      backgroundColor: "rgba(22, 180, 164, 0.7)",
      padding: 20,
      borderRadius: 16,
      alignItems: "flex-start",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },

    cardText: {
      fontSize: width > 400 ? 18 : 16,
      color: COLORS.black,
      fontWeight: "600",
    },
  });
