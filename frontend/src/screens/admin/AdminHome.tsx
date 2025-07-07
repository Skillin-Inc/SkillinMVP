import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../../hooks/AuthContext";
import { COLORS } from "../../styles";
import { useScreenDimensions } from "../../hooks";
import { users as usersApi } from "../../services/api";
import { SectionHeader } from "../../components/common";

export default function AdminHome() {
  const { user, logout } = useContext(AuthContext);
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [updateEmail, setUpdateEmail] = useState("");
  const [selectedType, setSelectedType] = useState<"student" | "teacher" | "admin">("student");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

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

  const handleDeleteUser = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter an email to delete.");
      return;
    }
    setLoading(true);
    try {
      const res = await usersApi.deleteUser(email);
      Alert.alert("Success", res.message || "User deleted successfully.");
      setEmail("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserType = async () => {
    if (!updateEmail || !selectedType) {
      Alert.alert("Error", "Both email and user type are required.");
      return;
    }
    setUpdateLoading(true);
    try {
      const res = await usersApi.updateUserType(updateEmail, selectedType);
      Alert.alert("Success", res.message || "User type updated successfully.");
      setUpdateEmail("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user type.";
      Alert.alert("Error", errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

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

      <View style={styles.card}>
        <SectionHeader title="Delete User by Email" />
        <TextInput
          style={styles.input}
          placeholder="Enter user email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity
          style={[styles.deleteButton, loading && { opacity: 0.6 }]}
          onPress={handleDeleteUser}
          disabled={loading}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.white} />
          <Text style={styles.deleteButtonText}>{loading ? "Deleting..." : "Delete User"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <SectionHeader title="Update User Type by Email" />
        <TextInput
          style={styles.input}
          placeholder="Enter user email"
          value={updateEmail}
          onChangeText={setUpdateEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.selectorButton} onPress={() => setTypeModalVisible(true)}>
          <Text style={styles.selectorText}>Type: {selectedType}</Text>
          <Ionicons name="chevron-down" size={18} color="#555" />
        </TouchableOpacity>

        {typeModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select User Type</Text>
              {["student", "teacher", "admin"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedType(type as typeof selectedType);
                    setTypeModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{type}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setTypeModalVisible(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.updateButton, updateLoading && { opacity: 0.6 }]}
          onPress={handleUpdateUserType}
          disabled={updateLoading}
        >
          <Ionicons name="sync-outline" size={20} color={COLORS.white} />
          <Text style={styles.updateButtonText}>{updateLoading ? "Updating..." : "Update User Type"}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    card: {
      marginTop: 40,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.purple,
      marginBottom: 16,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: COLORS.gray,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 16,
      backgroundColor: "#f9f9f9",
      color: "#333",
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.error,
      paddingVertical: 12,
      borderRadius: 8,
    },
    deleteButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
    selectorButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: COLORS.gray,
      borderRadius: 8,
      padding: 12,
      backgroundColor: "#f0f0f0",
      marginBottom: 16,
    },
    selectorText: {
      fontSize: 16,
      color: "#333",
    },
    updateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.blue,
      paddingVertical: 12,
      borderRadius: 8,
    },
    updateButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 100,
    },
    modalContent: {
      width: "80%",
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      elevation: 5,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
      color: "#333",
    },
    modalOption: {
      paddingVertical: 10,
      width: "100%",
      alignItems: "center",
    },
    modalOptionText: {
      fontSize: 16,
      color: "#414288",
    },
    modalCancel: {
      marginTop: 12,
    },
    modalCancelText: {
      color: "#999",
      fontSize: 14,
    },
  });
}
