import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AuthContext } from "../../hooks/AuthContext";
import { COLORS } from "../../styles";
import { useScreenDimensions } from "../../hooks";

export default function AdminHome() {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage all users, view profiles, and update user types",
      icon: "people-outline",
      color: COLORS.blue,
      onPress: () => Alert.alert("Coming Soon", "User Management feature will be available soon!"),
    },
    {
      title: "Content Moderation",
      description: "Review and moderate courses, lessons, and user content",
      icon: "shield-checkmark-outline",
      color: COLORS.green,
      onPress: () => Alert.alert("Coming Soon", "Content Moderation feature will be available soon!"),
    },
    {
      title: "Analytics Dashboard",
      description: "View platform statistics and user engagement metrics",
      icon: "analytics-outline",
      color: COLORS.purple,
      onPress: () => Alert.alert("Coming Soon", "Analytics Dashboard will be available soon!"),
    },
    {
      title: "System Settings",
      description: "Configure platform settings and manage system parameters",
      icon: "settings-outline",
      color: COLORS.darkGray,
      onPress: () => Alert.alert("Coming Soon", "System Settings will be available soon!"),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.adminName}>{user?.firstName || "Admin"}</Text>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-outline" size={16} color={COLORS.white} />
              <Text style={styles.adminBadgeText}>Administrator</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Platform Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color={COLORS.blue} />
            <Text style={styles.statNumber}>1,234</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="school-outline" size={24} color={COLORS.green} />
            <Text style={styles.statNumber}>89</Text>
            <Text style={styles.statLabel}>Teachers</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="book-outline" size={24} color={COLORS.purple} />
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="play-circle-outline" size={24} color={COLORS.darkGray} />
            <Text style={styles.statNumber}>892</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
        </View>
      </View>

      {/* Admin Features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Admin Tools</Text>
        {adminFeatures.map((feature, index) => (
          <TouchableOpacity key={index} style={styles.featureCard} onPress={feature.onPress}>
            <View style={styles.featureContent}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color + "20" }]}>
                <Ionicons name={feature.icon as any} size={24} color={feature.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <Ionicons name="person-add-outline" size={20} color={COLORS.green} />
            <Text style={styles.activityText}>New teacher registration: John Doe</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="book-outline" size={20} color={COLORS.blue} />
            <Text style={styles.activityText}>New course created: "Advanced Basketball"</Text>
            <Text style={styles.activityTime}>4 hours ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="warning-outline" size={20} color={COLORS.error} />
            <Text style={styles.activityText}>Content flagged for review</Text>
            <Text style={styles.activityTime}>6 hours ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function getStyles(width: number, height: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    header: {
      backgroundColor: COLORS.purple,
      paddingTop: height * 0.06,
      paddingBottom: 20,
      paddingHorizontal: 16,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    welcomeText: {
      color: COLORS.white,
      fontSize: 16,
      opacity: 0.8,
    },
    adminName: {
      color: COLORS.white,
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 4,
    },
    adminBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      marginTop: 8,
      alignSelf: "flex-start",
    },
    adminBadgeText: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    logoutText: {
      color: COLORS.white,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 5,
    },
    statsContainer: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.purple,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    statCard: {
      width: "48%",
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: "center",
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: COLORS.darkGray,
      marginTop: 4,
    },
    featuresContainer: {
      padding: 16,
    },
    featureCard: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
    },
    featureContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    featureIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    featureText: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 4,
    },
    featureDescription: {
      fontSize: 14,
      color: COLORS.darkGray,
      lineHeight: 20,
    },
    activityContainer: {
      padding: 16,
      paddingBottom: 32,
    },
    activityCard: {
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
      padding: 16,
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    activityText: {
      flex: 1,
      fontSize: 14,
      color: COLORS.black,
      marginLeft: 12,
    },
    activityTime: {
      fontSize: 12,
      color: COLORS.darkGray,
    },
  });
}
