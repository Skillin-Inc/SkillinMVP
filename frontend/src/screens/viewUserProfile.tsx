import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useScreenDimensions } from "../hooks";
import { Colors, Typography } from "../styles";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@components/Avatar";
import Avatar_Placeholder from "../../assets/icons/Avatar_Placeholder.jpg";
import { AuthContext } from "../../src/features/auth/AuthContext";
import { ImagePickerAvatar } from "../components";

const mockUser = {
  avatar: Avatar_Placeholder,
  firstName: "Sho",
  lastName: "Vang",
  dOB: "01/15/2000",
  zipCode: "80204",
  email: "sho@example.com",
  phoneNumber: "(123) 456-7890",
  password: "YourStrongPassword",
  membershipTier: "Premium",
  paymentInfo: ["Visa •••• 4242", "Exp: 12/26"],
};

export default function ViewUserProfileScreen() {
  const { logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [showSensitive, setShowSensitive] = useState(false);
  const [verifyStep, setVerifyStep] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color={Colors.purple} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <ImagePickerAvatar
        initialUri={null} // or a URI string if you have one
        onChange={(uri) => console.log("New avatar URI:", uri)}
        size={140}
      />
      {/* Avatar and Info
      <Avatar
        avatar={mockUser.avatar}
        width={screenWidth * 0.4}
        height={screenWidth * 0.4}
        style={styles.avatar}
      /> */}
      <Text
        style={styles.name}
      >{`${mockUser.firstName} ${mockUser.lastName}`}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>DOB: {mockUser.dOB}</Text>
        <Text style={styles.label}>Zip Code: {mockUser.zipCode}</Text>
        <Text style={styles.label}>Email: {mockUser.email}</Text>
        <Text style={styles.label}>Phone: {mockUser.phoneNumber}</Text>

        {!showSensitive ? (
          <>
            {verifyStep ? (
              <>
                <Text style={styles.label}>Enter password to reveal:</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={enteredPassword}
                  onChangeText={setEnteredPassword}
                  placeholder="Password"
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity
                  style={styles.revealButton}
                  onPress={() => {
                    if (enteredPassword === mockUser.password) {
                      setShowSensitive(true);
                      setError("");
                      setVerifyStep(false);
                    } else {
                      setError("Incorrect password");
                    }
                  }}
                >
                  <Text style={styles.revealText}>Verify</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.revealButton}
                onPress={() => setVerifyStep(true)}
              >
                <Text style={styles.revealText}>Reveal Sensitive Info</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <Text style={styles.label}>Password: {mockUser.password}</Text>
            <Text style={styles.label}>
              Membership: {mockUser.membershipTier}
            </Text>
            <Text style={styles.label}>Payment Info:</Text>
            {mockUser.paymentInfo.map((item, index) => (
              <Text key={index} style={styles.subLabel}>
                • {item}
              </Text>
            ))}
          </>
        )}
      </View>
      {/* when button clicked it switches to teacher homescreen*/}
      <TouchableOpacity style={styles.revealButton} onPress={logout}>
        <Text style={styles.revealText}>Switch to instructor</Text>
      </TouchableOpacity>
    </View>
  );
}

function getStyles(width: number, height: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
      alignItems: "center",
      paddingHorizontal: width * 0.05,
      paddingTop: height * 0.12,
    },
    backButton: {
      position: "absolute",
      top: height * 0.05,
      left: 20,
      zIndex: 10,
    },
    logoutButton: {
      position: "absolute",
      top: height * 0.05,
      right: 20,
      backgroundColor: Colors.purple,
      paddingVertical: 6,
      paddingHorizontal: 15,
      borderRadius: 6,
      zIndex: 10,
    },
    logoutText: {
      color: Colors.white,
      fontSize: width > 400 ? 16 : 14,
      fontWeight: "600",
    },
    avatar: {
      borderRadius: 100,
      marginBottom: height * 0.02,
    },
    name: {
      fontSize: width > 400 ? 28 : 24,
      fontWeight: "bold",
      color: Colors.purple,
      marginBottom: height * 0.03,
    },
    infoBox: {
      width: "100%",
    },
    label: {
      ...Typography.inputText,
      marginBottom: height * 0.015,
      color: Colors.darkGray,
      fontSize: width > 400 ? 18 : 16,
    },
    subLabel: {
      marginLeft: 10,
      marginBottom: height * 0.01,
      color: Colors.darkGray,
      fontSize: width > 400 ? 16 : 14,
    },
    input: {
      width: "100%",
      height: height * 0.06,
      borderColor: Colors.darkGray,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: height * 0.015,
      fontSize: 16,
    },
    revealButton: {
      backgroundColor: Colors.purple,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 6,
      marginBottom: height * 0.02,
    },
    revealText: {
      color: Colors.white,
      fontWeight: "600",
      textAlign: "center",
    },
    errorText: {
      color: "red",
      marginBottom: height * 0.01,
    },
  });
}
