import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { TeacherTabsParamList, TeacherStackParamList } from "../../types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TeacherTabsParamList, "TeacherHome">,
  StackScreenProps<TeacherStackParamList>
>;

const upcomingSessions = [
  { title: "1-on-1 with John", time: "2:00 PM", type: "private" },
  { title: "Group Training", time: "4:30 PM", type: "group" },
  { title: "Math Review with Sarah", time: "6:00 PM", type: "private" },
  { title: "Office Hours", time: "7:15 PM", type: "office" },
];

export default function TeacherHome({ navigation }: Props) {
  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const styles = getStyles();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate loading
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleViewProfile = () => {
    navigation.navigate("TeacherProfile");
  };

  const handleSessionPress = (session: { title: string; time: string; type: string }) => {
    console.log("Tapped:", session.title);
    // TODO: Navigate to session details
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "private":
        return "person-outline";
      case "group":
        return "people-outline";
      case "office":
        return "time-outline";
      default:
        return "calendar-outline";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerSpacer} />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Welcome, Teacher!</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleViewProfile}>
            <Ionicons name="person-circle-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Welcome, Teacher!</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleViewProfile}>
          <Ionicons name="person-circle-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Teacher Header */}
        <View style={styles.teacherHeader}>
          <View style={styles.teacherIcon}>
            <Ionicons name="school" size={32} color={COLORS.purple} />
          </View>
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherTitle}>Ready to Teach!</Text>
            <Text style={styles.teacherSubtitle}>Manage your courses and connect with students</Text>
            <View style={styles.teacherStats}>
              <View style={styles.statItem}>
                <Ionicons name="book-outline" size={16} color={COLORS.gray} />
                <Text style={styles.statText}>My Courses</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={16} color={COLORS.gray} />
                <Text style={styles.statText}>Students</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate("TeacherCoursesList")}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="library-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionTitle}>My Courses</Text>
              <Text style={styles.quickActionSubtitle}>View and manage courses</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate("TeacherCreateCourse")}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="add-circle-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionTitle}>Create Course</Text>
              <Text style={styles.quickActionSubtitle}>Add new course content</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionTitle}>Schedule</Text>
              <Text style={styles.quickActionSubtitle}>Manage your timetable</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="stats-chart-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionTitle}>Analytics</Text>
              <Text style={styles.quickActionSubtitle}>View performance stats</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <Text style={styles.sectionSubtitle}>
              {upcomingSessions.length} {upcomingSessions.length === 1 ? "session" : "sessions"} today
            </Text>
          </View>

          {upcomingSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>No Sessions Today</Text>
              <Text style={styles.emptyText}>Your schedule is clear. Take some time to prepare new content!</Text>
            </View>
          ) : (
            <View style={styles.sessionsContainer}>
              {upcomingSessions.map((session, index) => (
                <TouchableOpacity key={index} style={styles.sessionCard} onPress={() => handleSessionPress(session)}>
                  <View style={styles.sessionIcon}>
                    <Ionicons name={getSessionIcon(session.type)} size={20} color={COLORS.purple} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <Text style={styles.sessionTime}>{session.time}</Text>
                  </View>
                  <View style={styles.sessionActions}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="trending-up" size={24} color={COLORS.purple} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Great Progress!</Text>
              <Text style={styles.activityDescription}>
                Your courses have received positive feedback from students this week.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    scrollView: {
      flex: 1,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    headerSpacer: {
      width: 40,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 16,
    },
    headerTitleText: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.black,
    },
    profileButton: {
      padding: 8,
      borderRadius: 8,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      color: COLORS.gray,
      marginTop: 16,
    },
    teacherHeader: {
      flexDirection: "row",
      padding: 20,
      backgroundColor: COLORS.lightGray,
    },
    teacherIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: COLORS.white,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    teacherInfo: {
      flex: 1,
    },
    teacherTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 8,
    },
    teacherSubtitle: {
      fontSize: 16,
      color: COLORS.gray,
      marginBottom: 12,
      lineHeight: 24,
    },
    teacherStats: {
      flexDirection: "row",
      gap: 16,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statText: {
      fontSize: 14,
      color: COLORS.gray,
      marginLeft: 6,
    },
    section: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.black,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: COLORS.gray,
    },
    quickActions: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.lightGray,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    quickActionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 4,
    },
    quickActionSubtitle: {
      fontSize: 14,
      color: COLORS.gray,
      lineHeight: 20,
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: COLORS.gray,
      textAlign: "center",
      lineHeight: 24,
    },
    sessionsContainer: {
      gap: 12,
    },
    sessionCard: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    sessionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.lightGray,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    sessionInfo: {
      flex: 1,
    },
    sessionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 4,
    },
    sessionTime: {
      fontSize: 14,
      color: COLORS.gray,
    },
    sessionActions: {
      padding: 4,
    },
    activityCard: {
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    activityIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.white,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    activityInfo: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 4,
    },
    activityDescription: {
      fontSize: 14,
      color: COLORS.gray,
      lineHeight: 20,
    },
  });
}
