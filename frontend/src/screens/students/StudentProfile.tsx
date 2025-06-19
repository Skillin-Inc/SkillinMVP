import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useScreenDimensions } from "../../hooks";
import { AuthContext } from "../../hooks/AuthContext";
import ImagePickerAvatar from "../../components/ImagePickerAvatar";
import { COLORS } from "../../styles";

export default function StudentProfile() {
  const { logout, user } = useContext(AuthContext);
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const InfoItem = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) => (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={22} color={COLORS.purple} style={styles.infoIcon} />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <ImagePickerAvatar initialUri={avatarUri} onChange={setAvatarUri} size={120} />
        <Text style={styles.name}>{user?.username ?? ""}</Text>
        <View style={styles.membershipBadge}>
          <Ionicons name="star" size={14} color={COLORS.white} />
          <Text style={styles.membershipText}>{user?.membershipTier ?? "bronze"}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoBox}>
          <InfoItem icon="calendar-outline" label="Date of Birth" value={user?.dOB ?? "Not provided"} />
          <InfoItem icon="location-outline" label="Zip Code" value={user?.postalCode?.toString() ?? "Not provided"} />
          <InfoItem icon="mail-outline" label="Email" value={user?.email ?? ""} />
          <InfoItem icon="call-outline" label="Phone Number" value={user?.phoneNumber ?? ""} />

          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function getStyles(width: number, height: number) {
  return StyleSheet.create({
    scrollContainer: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    scrollContent: {
      paddingBottom: 30,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 16,
      paddingTop: height * 0.06,
      paddingBottom: 10,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.purple,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.purple,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    logoutText: {
      color: COLORS.white,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 5,
    },
    profileHeader: {
      alignItems: "center",
      paddingVertical: 20,
      backgroundColor: COLORS.white,
      borderBottomWidth: 8,
      borderBottomColor: COLORS.lightGray,
    },
    name: {
      fontSize: width > 400 ? 26 : 22,
      fontWeight: "bold",
      color: COLORS.purple,
      marginTop: 12,
    },
    membershipBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.green,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 20,
      marginTop: 8,
    },
    membershipText: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },
    infoContainer: {
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.purple,
      marginTop: 20,
      marginBottom: 10,
    },
    infoBox: {
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
      padding: 10,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    infoIcon: {
      marginRight: 12,
    },
    infoLabel: {
      fontSize: 13,
      color: COLORS.darkGray,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 16,
      color: COLORS.black,
      fontWeight: "500",
    },
    editProfileButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.purple,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginTop: 10,
    },
    buttonIcon: {
      marginRight: 8,
    },
    actionButtonText: {
      color: COLORS.white,
      fontWeight: "600",
      fontSize: 16,
    },
  });
}
