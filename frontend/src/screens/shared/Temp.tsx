import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useScreenDimensions } from "../../hooks";
import { AuthContext } from "../../hooks/AuthContext";
import { apiService } from "../../services/api";
import { COLORS } from "../../styles";

export default function Temp() {
  const { screenWidth } = useScreenDimensions();
  const { user: currentUser, switchMode } = useContext(AuthContext);
  const styles = getStyles(screenWidth);

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

  const handleSwitchMode = () => {
    switchMode();
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
        </View>

        {/* Switch Mode Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Navigation</Text>

          <TouchableOpacity style={[styles.button, styles.switchModeButton]} onPress={handleSwitchMode}>
            <Ionicons name="school-outline" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>
              {currentUser?.userType === "teacher" ? "Switch to Student Mode" : "Teacher Access Only"}
            </Text>
          </TouchableOpacity>
        </View>

        {currentUser && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>
              Current User: {currentUser.firstName} {currentUser.lastName}
            </Text>
            <Text style={styles.userInfoText}>Mode: {currentUser.userType === "teacher" ? "Teacher" : "Student"}</Text>
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
      backgroundColor: "#007AFF",
    },
    teacherStackButton: {
      backgroundColor: "#34C759",
    },
    switchModeButton: {
      backgroundColor: "#007AFF",
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
