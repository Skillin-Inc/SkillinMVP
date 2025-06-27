import React, { useState, useContext } from "react";
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

import { AuthContext } from "../../hooks/AuthContext";

import { COLORS } from "../../styles";
import { TeacherTabsParamList, TeacherStackParamList } from "../../types/navigation";
import { QuickActionCard } from "../../components/cards";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TeacherTabsParamList, "TeacherHome">,
  StackScreenProps<TeacherStackParamList>
>;

export default function TeacherHome({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const styles = getStyles();

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleViewProfile = () => {
    navigation.navigate("TeacherProfile", { userId: user?.id });
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickActionCard
              icon="library-outline"
              title="My Courses"
              subtitle="View and manage courses"
              onPress={() => navigation.navigate("TeacherCoursesList")}
            />

            <QuickActionCard
              icon="add-circle-outline"
              title="Create Course"
              subtitle="Add new course content"
              onPress={() => navigation.navigate("TeacherCreateCourse")}
            />
          </View>

          <QuickActionCard
            icon="calendar-outline"
            title="Schedule"
            subtitle="Manage your timetable"
            onPress={() => {}}
          />

          <QuickActionCard
            icon="stats-chart-outline"
            title="Analytics"
            subtitle="View performance stats"
            onPress={() => {}}
          />
        </View>

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
