import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { AuthContext } from "../../hooks/AuthContext";
import { FormInput } from "../../components/forms";
import { LoadingState } from "../../components/common";
import { COLORS, SPACINGS } from "../../styles";
import { users, UpdateUserProfileData, transformBackendUserToUser } from "../../services/api";
import { StudentStackParamList, TeacherStackParamList } from "../../types/navigation";

type Props =
  | StackScreenProps<StudentStackParamList, "EditProfile">
  | StackScreenProps<TeacherStackParamList, "EditProfile">;

export default function EditProfile({ navigation }: Props) {
  const { user: currentUser, updateUser } = useContext(AuthContext);
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || "");
  const [username, setUsername] = useState(currentUser?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      firstName !== (currentUser?.firstName || "") ||
      lastName !== (currentUser?.lastName || "") ||
      phoneNumber !== (currentUser?.phoneNumber || "") ||
      username !== (currentUser?.username || "") ||
      currentPassword.trim() !== "" ||
      newPassword.trim() !== "" ||
      confirmPassword.trim() !== "";

    setHasChanges(changed);
  }, [firstName, lastName, phoneNumber, username, currentPassword, newPassword, confirmPassword, currentUser]);

  const checkUsernameAvailability = async () => {
    if (!username.trim() || username.trim() === currentUser?.username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const isAvailable = await users.checkUsernameAvailability(username.trim(), currentUser?.id);
      setUsernameAvailable(isAvailable);
    } catch (error) {
      console.error("Error checking username:", error);
      Alert.alert("Error", "Failed to check username availability");
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert("Error", "User not found");
      return;
    }

    if (!hasChanges) {
      Alert.alert("No Changes", "No changes detected to save.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Validation Error", "First name and last name are required.");
      return;
    }

    if (username.trim() !== (currentUser?.username || "") && usernameAvailable === false) {
      Alert.alert("Validation Error", "Please choose an available username or check username availability.");
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateUserProfileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        username: username.trim() !== (currentUser?.username || "") ? username.trim() : undefined,
      };

      const updatedBackendUser = await users.updateUserProfile(currentUser.id, updateData);
      const updatedUser = transformBackendUserToUser(updatedBackendUser);

      updateUser(updatedUser);

      Alert.alert("Success", "Profile updated successfully!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert("Unsaved Changes", "You have unsaved changes. Are you sure you want to go back?", [
        { text: "Stay", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.headerButton, !hasChanges && styles.disabledButton]}
          onPress={handleSave}
          disabled={!hasChanges}
        >
          <Text style={[styles.saveText, !hasChanges && styles.disabledText]}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.formGroup}>
              <FormInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                required
              />
            </View>

            <View style={styles.formGroup}>
              <FormInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                required
              />
            </View>

            <View style={styles.formGroup}>
              <FormInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.usernameContainer}>
                <View style={styles.usernameInputContainer}>
                  <FormInput
                    label="Username"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setUsernameAvailable(null);
                    }}
                    placeholder="Enter your username"
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.checkButton, checkingUsername && styles.checkButtonDisabled]}
                  onPress={checkUsernameAvailability}
                  disabled={checkingUsername || !username.trim() || username.trim() === currentUser?.username}
                >
                  <Text style={[styles.checkButtonText, checkingUsername && styles.checkButtonTextDisabled]}>
                    {checkingUsername ? "..." : "Check"}
                  </Text>
                </TouchableOpacity>
              </View>
              {usernameAvailable !== null && (
                <Text
                  style={[styles.availabilityText, usernameAvailable ? styles.availableText : styles.unavailableText]}
                >
                  {usernameAvailable ? "✓ Username is available" : "✗ Username is taken"}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <Text style={styles.sectionSubtitle}>Password change functionality coming soon</Text>

            <View style={styles.formGroup}>
              <FormInput
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter your current password"
                secureTextEntry
                editable={false}
              />
            </View>

            <View style={styles.formGroup}>
              <FormInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter your new password"
                secureTextEntry
                editable={false}
              />
            </View>

            <View style={styles.formGroup}>
              <FormInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your new password"
                secureTextEntry
                editable={false}
              />
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.blue} />
              <Text style={styles.infoText}>
                Your email cannot be changed. Contact support if you need to update this field. Date of birth is also
                not editable for security reasons.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACINGS.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerButton: {
    padding: SPACINGS.small,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.purple,
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.gray,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: SPACINGS.base,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SPACINGS.base,
  },
  formGroup: {
    marginBottom: SPACINGS.base,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: SPACINGS.smallest,
    paddingLeft: SPACINGS.small,
  },
  infoSection: {
    padding: SPACINGS.base,
    paddingTop: 0,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: SPACINGS.base,
    gap: SPACINGS.small,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACINGS.small,
  },
  usernameInputContainer: {
    flex: 1,
  },
  checkButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    marginBottom: 2,
  },
  checkButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  checkButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  checkButtonTextDisabled: {
    color: COLORS.lightGray,
  },
  availabilityText: {
    fontSize: 12,
    marginTop: SPACINGS.smallest,
    paddingLeft: SPACINGS.small,
  },
  availableText: {
    color: COLORS.green,
  },
  unavailableText: {
    color: COLORS.error,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SPACINGS.base,
    fontStyle: "italic",
  },
});
