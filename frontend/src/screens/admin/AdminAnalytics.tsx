import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../styles";
import { api, BackendUser, Course, Lesson } from "../../services/api/";
import { LoadingState, SectionHeader } from "../../components/common";

interface AnalyticsData {
  // User Analytics
  totalUsers: number;
  userBreakdown: {
    students: number;
    teachers: number;
    admins: number;
  };
  newUsers: number;
  activeUsers: number;

  // Content Analytics
  totalCourses: number;
  totalLessons: number;
  lessonsPerCourse: number;
  newCourses: number;
  newLessons: number;
  coursesPerTeacher: number;
  lessonsPerTeacher: number;
}

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, subtitle, icon, color, backgroundColor }) => {
  const styles = getStyles();

  return (
    <View style={[styles.analyticsCard, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );
};

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const styles = getStyles();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [users, courses, lessons] = await Promise.all([
        api.getAllUsers(),
        api.getAllCourses(),
        api.getAllLessons(),
      ]);

      const userBreakdown = users.reduce(
        (acc, user: BackendUser) => {
          const userType = user.user_type || "student";
          acc[userType as keyof typeof acc]++;
          return acc;
        },
        { students: 0, teachers: 0, admins: 0 }
      );

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newUsers = users.filter((user: BackendUser) => {
        const createdAt = new Date(user.created_at);
        return createdAt > oneWeekAgo;
      }).length;

      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      const activeUsers = users.filter((user: BackendUser) => {
        const createdAt = new Date(user.created_at);
        return createdAt > oneMonthAgo;
      }).length;

      const newCoursesThisWeek = courses.filter((course: Course) => {
        const createdAt = new Date(course.created_at);
        return createdAt > oneWeekAgo;
      }).length;

      const newLessonsThisWeek = lessons.filter((lesson: Lesson) => {
        const createdAt = new Date(lesson.created_at);
        return createdAt > oneWeekAgo;
      }).length;

      const teacherIds = new Set(courses.map((course: Course) => course.teacher_id));
      const coursesPerTeacher = teacherIds.size > 0 ? courses.length / teacherIds.size : 0;
      const lessonsPerTeacher = teacherIds.size > 0 ? lessons.length / teacherIds.size : 0;

      const lessonsPerCourse = courses.length > 0 ? lessons.length / courses.length : 0;

      const analytics: AnalyticsData = {
        totalUsers: users.length,
        userBreakdown,
        newUsers,
        activeUsers,
        totalCourses: courses.length,
        totalLessons: lessons.length,
        lessonsPerCourse: Math.round(lessonsPerCourse * 10) / 10,
        newCourses: newCoursesThisWeek,
        newLessons: newLessonsThisWeek,
        coursesPerTeacher: Math.round(coursesPerTeacher * 10) / 10,
        lessonsPerTeacher: Math.round(lessonsPerTeacher * 10) / 10,
      };

      setAnalyticsData(analytics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!analyticsData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Failed to load analytics</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchAnalyticsData()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purple} />}
    >
      <View style={styles.header}>
        <SectionHeader title="Platform Analytics" />
        <View style={styles.lastUpdated}>
          <Ionicons name="time-outline" size={16} color={COLORS.gray} />
          <Text style={styles.lastUpdatedText}>
            Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 User Analytics</Text>
        <View style={styles.cardGrid}>
          <AnalyticsCard
            title="Total Users"
            value={analyticsData.totalUsers}
            subtitle={`${analyticsData.userBreakdown.students} students, ${analyticsData.userBreakdown.teachers} teachers, ${analyticsData.userBreakdown.admins} admins`}
            icon="people"
            color={COLORS.purple}
            backgroundColor={COLORS.white}
          />
          <AnalyticsCard
            title="New Users"
            value={analyticsData.newUsers}
            subtitle="This week"
            icon="person-add"
            color={COLORS.green}
            backgroundColor={COLORS.white}
          />
        </View>
        <View style={styles.cardGrid}>
          <AnalyticsCard
            title="Active Users"
            value={analyticsData.activeUsers}
            subtitle="Last 30 days"
            icon="pulse"
            color={COLORS.blue}
            backgroundColor={COLORS.white}
          />
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>User Type Breakdown</Text>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: COLORS.blue }]} />
                <Text style={styles.breakdownText}>Students: {analyticsData.userBreakdown.students}</Text>
              </View>
              <Text style={styles.breakdownPercentage}>
                {analyticsData.totalUsers > 0
                  ? Math.round((analyticsData.userBreakdown.students / analyticsData.totalUsers) * 100)
                  : 0}
                %
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.breakdownText}>Teachers: {analyticsData.userBreakdown.teachers}</Text>
              </View>
              <Text style={styles.breakdownPercentage}>
                {analyticsData.totalUsers > 0
                  ? Math.round((analyticsData.userBreakdown.teachers / analyticsData.totalUsers) * 100)
                  : 0}
                %
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: COLORS.purple }]} />
                <Text style={styles.breakdownText}>Admins: {analyticsData.userBreakdown.admins}</Text>
              </View>
              <Text style={styles.breakdownPercentage}>
                {analyticsData.totalUsers > 0
                  ? Math.round((analyticsData.userBreakdown.admins / analyticsData.totalUsers) * 100)
                  : 0}
                %
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Content Analytics</Text>
        <View style={styles.cardGrid}>
          <AnalyticsCard
            title="Total Courses"
            value={analyticsData.totalCourses}
            icon="school"
            color={COLORS.purple}
            backgroundColor={COLORS.white}
          />
          <AnalyticsCard
            title="Total Lessons"
            value={analyticsData.totalLessons}
            icon="book"
            color={COLORS.blue}
            backgroundColor={COLORS.white}
          />
        </View>
        <View style={styles.cardGrid}>
          <AnalyticsCard
            title="Lessons per Course"
            value={analyticsData.lessonsPerCourse}
            subtitle="Average"
            icon="layers"
            color={COLORS.green}
            backgroundColor={COLORS.white}
          />
          <AnalyticsCard
            title="New Content"
            value={`${analyticsData.newCourses}c / ${analyticsData.newLessons}l`}
            subtitle="This week"
            icon="add-circle"
            color={COLORS.purple}
            backgroundColor={COLORS.white}
          />
        </View>
        <View style={styles.cardGrid}>
          <AnalyticsCard
            title="Courses per Teacher"
            value={analyticsData.coursesPerTeacher}
            subtitle="Average"
            icon="person"
            color={COLORS.blue}
            backgroundColor={COLORS.white}
          />
          <AnalyticsCard
            title="Lessons per Teacher"
            value={analyticsData.lessonsPerTeacher}
            subtitle="Average"
            icon="create"
            color={COLORS.green}
            backgroundColor={COLORS.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Engagement Analytics</Text>
        <View style={styles.comingSoonCard}>
          <Ionicons name="chatbubbles" size={48} color={COLORS.gray} />
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Message analytics including total messages, daily/weekly activity, and student vs teacher messaging patterns
            will be available once backend endpoints are implemented.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.lightGray,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    lastUpdated: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    lastUpdatedText: {
      fontSize: 12,
      color: COLORS.gray,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    cardGrid: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 12,
    },
    analyticsCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    cardValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 12,
      color: COLORS.gray,
    },
    breakdownCard: {
      flex: 1,
      backgroundColor: COLORS.white,
      padding: 16,
      borderRadius: 12,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    breakdownTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 12,
    },
    breakdownRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    breakdownItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    breakdownDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    breakdownText: {
      fontSize: 14,
      color: COLORS.black,
    },
    breakdownPercentage: {
      fontSize: 14,
      fontWeight: "600",
      color: COLORS.gray,
    },
    comingSoonCard: {
      backgroundColor: COLORS.white,
      margin: 16,
      padding: 24,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    comingSoonTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 12,
      marginBottom: 8,
    },
    comingSoonText: {
      fontSize: 14,
      color: COLORS.gray,
      textAlign: "center",
      lineHeight: 20,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    errorText: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.error,
      marginTop: 16,
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: COLORS.purple,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: COLORS.white,
      fontWeight: "600",
    },
  });
}
