import React, { useContext } from "react";
import { Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from "react-native";

import { useScreenDimensions } from "../../hooks";
import { AuthContext } from "../../hooks/AuthContext";
import { api } from "../../services/api/";
import { COLORS } from "../../styles";

export default function Temp() {
  const { screenWidth } = useScreenDimensions();
  const styles = getStyles(screenWidth);
  const { user: currentUser } = useContext(AuthContext);

  const handleLogAllUsers = async () => {
    try {
      const users = await api.getAllUsers();
      console.log("All Users:", users);
      Alert.alert("Success", `Logged ${users.length} users to console`);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to fetch users");
    }
  };

  const handleLogAllMessages = async () => {
    if (!currentUser) {
      Alert.alert("Error", "No user logged in");
      return;
    }

    try {
      const conversations = await api.getConversationsForUser(currentUser.id);

      const detailedMessages = [];
      for (const conv of conversations) {
        try {
          const messages = await api.getMessagesBetweenUsers(currentUser.id, conv.other_user_id);
          detailedMessages.push(...messages);
        } catch (error) {
          console.error(`Error fetching messages for conversation ${conv.other_user_id}:`, error);
        }
      }

      console.log("All Messages:", detailedMessages);
      Alert.alert("Success", `Logged ${detailedMessages.length} messages to console`);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to fetch messages");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Debug Tools</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogAllUsers}>
        <Text style={styles.buttonText}>Log All Users</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogAllMessages}>
        <Text style={styles.buttonText}>Log All Messages</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getStyles(screenWidth: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
      padding: 20,
    },
    title: {
      fontSize: screenWidth > 400 ? 24 : 20,
      fontWeight: "bold",
      color: COLORS.black,
      textAlign: "center",
      marginBottom: 20,
    },
    button: {
      backgroundColor: COLORS.purple,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    buttonText: {
      color: COLORS.white,
      fontSize: screenWidth > 400 ? 18 : 16,
      fontWeight: "600",
    },
  });
}
