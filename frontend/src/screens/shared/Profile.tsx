import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { useScreenDimensions } from "../../hooks";
import Avatar_Placeholder from "../../../assets/icons/Avatar_Placeholder.png";
import { AuthContext } from "../../hooks/AuthContext";
import ImagePickerAvatar from "../../components/ImagePickerAvatar";
import { COLORS } from "../../styles";
import { StudentTabsParamList, StudentStackParamList, TeacherStackParamList } from "../../types/navigation";

const mockUser = {
  avatar: Avatar_Placeholder,
  paymentInfo: ["Visa •••• 4242", "Exp: 12/26"],
};

type Props = CompositeScreenProps<
  BottomTabScreenProps<StudentTabsParamList, "StudentProfile">,
  CompositeScreenProps<
    StackScreenProps<TeacherStackParamList, "StudentProfile">,
    StackScreenProps<StudentStackParamList, "StudentProfile">
  >
>;

export default function Profile({ navigation, route }: Props) {
  const { logout, user, switchMode } = useContext(AuthContext);
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [showSensitive, setShowSensitive] = useState(false);
  const [verifyStep, setVerifyStep] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [error, setError] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  const isFromTeacher = (route.params as any)?.from === "TeacherHome";
  console.log("Profile - route.params:", route.params);
  console.log("Profile - isFromTeacher:", isFromTeacher);
  console.log("Profile - user.isTeacher:", user?.isTeacher);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleSwitchMode = () => {
    switchMode();
  };

  // Helper component
  const InfoItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.infoItem}>
      <Ionicons name={icon as any} size={22} color={COLORS.purple} style={styles.infoIcon} />
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
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

          {/* ✨ Move this button inside infoBox for better visual grouping */}
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}></View>

        {/* <Text style={styles.sectionTitle}>Sensitive Information</Text>
        {!showSensitive ? (
          verifyStep ? (
            <View style={styles.verifyContainer}>
              <Text style={styles.verifyText}>Enter password to view sensitive information</Text>
              <View style={styles.passwordInputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry
                  value={enteredPassword}
                  onChangeText={setEnteredPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.verifyActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setVerifyStep(false);
                    setEnteredPassword("");
                    setError("");
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() => {
                    if (enteredPassword === user?.hashedPassword) {
                      setShowSensitive(true);
                      setError("");
                      setVerifyStep(false);
                      setEnteredPassword("");
                    } else {
                      setError("Incorrect password");
                    }
                  }}
                >
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.revealButton} onPress={() => setVerifyStep(true)}>
              <Ionicons name="eye-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
              <Text style={styles.revealText}>View Sensitive Info</Text>
            </TouchableOpacity>
          ) 
        ) : (
          <View style={styles.sensitiveInfoBox}>
            <InfoItem icon="key-outline" label="Password" value={user?.hashedPassword ?? "*****"} />
            <View style={styles.paymentSection}>
              <InfoItem icon="card-outline" label="Payment Information" value="" />
              {mockUser.paymentInfo.map((item, index) => (
                <Text key={index} style={styles.paymentDetail}>
                  {item}
                </Text>
              ))}
            </View>
            <TouchableOpacity style={styles.hideButton} onPress={() => setShowSensitive(false)}>
              <Ionicons name="eye-off-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
              <Text style={styles.hideButtonText}>Hide Sensitive Info</Text>
            </TouchableOpacity>
          </View>
        )*/}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, !user?.isTeacher && { backgroundColor: COLORS.gray }]}
            onPress={handleSwitchMode}
            disabled={!user?.isTeacher}
          >
            <Ionicons name="school-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>
              {user?.isTeacher
                ? isFromTeacher
                  ? "Switch to Student Mode"
                  : "Switch to Teacher Mode"
                : "Teacher Access Only"}
            </Text>
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
    backButton: {
      padding: 8,
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
    sensitiveInfoSection: {
      marginTop: 5,
    },
    revealButton: {
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
    revealText: {
      color: COLORS.white,
      fontWeight: "600",
      fontSize: 16,
    },
    sensitiveInfoBox: {
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
      padding: 15,
    },
    paymentSection: {
      marginTop: 5,
    },
    paymentInfoContainer: {
      flex: 1,
    },
    paymentDetail: {
      fontSize: 15,
      color: COLORS.black,
      marginTop: 2,
    },
    hideButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.darkGray,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginTop: 15,
      alignSelf: "center",
    },
    hideButtonText: {
      color: COLORS.white,
      fontWeight: "600",
      fontSize: 14,
    },
    verifyContainer: {
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
      padding: 15,
    },
    verifyText: {
      fontSize: 15,
      color: COLORS.black,
      marginBottom: 12,
      textAlign: "center",
    },
    passwordInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.white,
      borderRadius: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: COLORS.gray,
      height: 50,
    },
    inputIcon: {
      marginRight: 10,
    },
    passwordInput: {
      flex: 1,
      fontSize: 16,
      height: 50,
      color: COLORS.black,
    },
    verifyActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 15,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      marginRight: 10,
      borderWidth: 1,
      borderColor: COLORS.darkGray,
      borderRadius: 8,
    },
    cancelText: {
      color: COLORS.darkGray,
      fontSize: 16,
      fontWeight: "500",
    },
    verifyButton: {
      flex: 1,
      backgroundColor: COLORS.green,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 8,
    },
    verifyButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "500",
    },
    errorText: {
      color: COLORS.error,
      marginTop: 8,
      textAlign: "center",
      fontSize: 14,
    },
    actionsContainer: {
      marginTop: 1,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.blue,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginTop: 10,
    },
    actionButtonText: {
      color: COLORS.white,
      fontWeight: "600",
      fontSize: 16,
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
  });
}
