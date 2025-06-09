import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useScreenDimensions } from "../hooks";
import { AuthContext } from "../hooks/AuthContext";
import { apiService } from "../services/api";
import { COLORS } from "../styles";
import { RootStackParamList } from "../types";

type TempScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Temp() {
  const { screenWidth } = useScreenDimensions();
  const { user: currentUser } = useContext(AuthContext);
  const navigation = useNavigation<TempScreenNavigationProp>();
  const styles = getStyles(screenWidth);

  const handleSwitchToUserStack = () => {
    navigation.navigate("UserTabs");
    Alert.alert("Navigation", "Switched to User Stack");
  };

  const handleSwitchToTeacherStack = () => {
    navigation.navigate("TeacherTabs");
    Alert.alert("Navigation", "Switched to Teacher Stack");
  };

  const handleLogAllUsers = async () => {
    try {
      const users = await apiService.getAllUsers();
      console.log("All Users:", users);
      Alert.alert("Success", `Logged ${users.length} users to console`);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to fetch users");
    }
  };

  const handleLogCurrentUserMessages = async () => {
    try {
      if (!currentUser) {
        Alert.alert("Error", "No user logged in");
        return;
      }

      const conversations = await apiService.getConversationsForUser(currentUser.id);

      const detailedMessages = [];
      for (const conv of conversations) {
        try {
          const messages = await apiService.getMessagesBetweenUsers(currentUser.id, conv.other_user_id);
          detailedMessages.push(...messages);
        } catch (error) {
          console.error(`Error fetching messages with user ${conv.other_user_id}:`, error);
        }
      }

      console.log("Current User Messages:", detailedMessages);
      Alert.alert("Success", `Logged ${detailedMessages.length} messages for current user to console`);
    } catch (error) {
      console.error("Error fetching current user messages:", error);
      Alert.alert("Error", "Failed to fetch current user messages");
    }
  };

  const handleTestBackendConnection = async () => {
    try {
      const result = await apiService.checkBackendConnection();
      console.log("Backend Connection Test:", result);
      Alert.alert("Backend Connection", `Status: ${result.status}\n${result.message}`, [{ text: "OK" }]);
    } catch (error) {
      console.error("Backend connection test failed:", error);
      Alert.alert("Backend Connection Failed", error instanceof Error ? error.message : "Unknown error occurred", [
        { text: "OK" },
      ]);
    }
  };

  const handleTestDatabaseConnection = async () => {
    try {
      const result = await apiService.checkDatabaseConnection();
      console.log("Database Connection Test:", result);
      Alert.alert("Database Connection", `Status: ${result.status}\n${result.message}`, [{ text: "OK" }]);
    } catch (error) {
      console.error("Database connection test failed:", error);
      Alert.alert("Database Connection Failed", error instanceof Error ? error.message : "Unknown error occurred", [
        { text: "OK" },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Temp Screen</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          This screen contains buttons to log different data to the console, test system connections, and switch between
          navigation stacks.
        </Text>

        {/* Navigation Stack Switcher Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Navigation Stack Switcher</Text>

          <TouchableOpacity style={[styles.button, styles.userStackButton]} onPress={handleSwitchToUserStack}>
            <Ionicons name="person-outline" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>Switch to User Stack</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.teacherStackButton]} onPress={handleSwitchToTeacherStack}>
            <Ionicons name="school-outline" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>Switch to Teacher Stack</Text>
          </TouchableOpacity>
        </View>

        {/* Debugging Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Debug Tools</Text>

          <TouchableOpacity style={styles.button} onPress={handleLogAllUsers}>
            <Ionicons name="people-outline" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>Log All Users</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogCurrentUserMessages}>
            <Ionicons name="person-circle-outline" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>Log Current User Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleTestBackendConnection}>
            <Ionicons name="server-outline" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>Test Backend Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleTestDatabaseConnection}>
            <Ionicons name="disc-outline" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>Test Database Connection</Text>
          </TouchableOpacity>
        </View>

        {currentUser && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>
              Current User: {currentUser.firstName} {currentUser.lastName}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function getStyles(screenWidth: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    header: {
      padding: 20,
      backgroundColor: COLORS.purple,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: screenWidth > 400 ? 24 : 20,
      fontWeight: "bold",
      color: COLORS.white,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    description: {
      fontSize: screenWidth > 400 ? 16 : 14,
      color: COLORS.gray,
      textAlign: "center",
      marginBottom: 30,
      lineHeight: 22,
    },
    sectionContainer: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: screenWidth > 400 ? 18 : 16,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 15,
      textAlign: "center",
    },
    button: {
      backgroundColor: COLORS.purple,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    userStackButton: {
      backgroundColor: "#007AFF", // Blue for user stack
    },
    teacherStackButton: {
      backgroundColor: "#34C759", // Green for teacher stack
    },
    buttonText: {
      color: COLORS.white,
      fontSize: screenWidth > 400 ? 18 : 16,
      fontWeight: "600",
      marginLeft: 12,
    },
    userInfo: {
      marginTop: 20,
      padding: 16,
      backgroundColor: COLORS.lightGray,
      borderRadius: 8,
      alignItems: "center",
    },
    userInfoText: {
      fontSize: screenWidth > 400 ? 16 : 14,
      color: COLORS.black,
      fontWeight: "500",
    },
  });
}
