import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { useScreenDimensions, formatDOB, formatPhoneNumber, formatZipCode, isValidEmail } from "../../hooks";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { COLORS } from "../../styles";
import { AuthStackParamList } from "../../types";

type Props = StackScreenProps<AuthStackParamList, "StudentInfo">;

export default function StudentInfo({ navigation }: Props) {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dOB, setDOB] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleNext = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dOB.trim() ||
      !zipCode.trim() ||
      !email.trim() ||
      !phoneNumber.trim()
    ) {
      alert("Please fill out all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const postalCode = parseInt(zipCode.replace(/\D/g, ""), 10);
    if (isNaN(postalCode)) {
      alert("Please enter a valid zip code.");
      return;
    }

    navigation.navigate("StudentAccount", {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dOB: dOB.trim(),
      zipCode: zipCode.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.replace(/\D/g, ""),
      postalCode,
    });
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Ionicons name="person-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor={COLORS.gray}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor={COLORS.gray}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Date of Birth (MM/DD/YYYY)"
            placeholderTextColor={COLORS.gray}
            keyboardType="number-pad"
            value={dOB}
            onChangeText={(text) => setDOB(formatDOB(text))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Zip Code"
            placeholderTextColor={COLORS.gray}
            keyboardType="number-pad"
            value={zipCode}
            onChangeText={(text) => setZipCode(formatZipCode(text))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.gray}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={COLORS.gray}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

function getStyles(width: number, height: number) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: COLORS.white,
      padding: width * 0.06,
    },
    header: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: height * 0.05,
      marginBottom: height * 0.03,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    headerTitle: {
      fontSize: width > 400 ? 28 : 24,
      fontWeight: "bold",
      color: COLORS.purple,
      marginLeft: 10,
    },
    formContainer: {
      width: "100%",
      marginTop: height * 0.01,
    },
    inputRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: height * 0.015,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: height * 0.075,
      borderColor: COLORS.gray,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: height * 0.015,
      backgroundColor: COLORS.lightGray,
    },
    inputIcon: {
      marginRight: 10,
      padding: 5,
    },
    input: {
      flex: 1,
      fontSize: width > 400 ? 16 : 14,
      color: COLORS.black,
      height: "100%",
      paddingVertical: 10,
    },
    button: {
      width: "100%",
      backgroundColor: COLORS.green,
      paddingVertical: height * 0.02,
      borderRadius: 12,
      alignItems: "center",
      marginTop: height * 0.02,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonText: {
      color: COLORS.white,
      fontSize: width > 400 ? 18 : 16,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: height * 0.03,
      marginBottom: height * 0.02,
    },
    footerText: {
      color: COLORS.darkGray,
      fontSize: 14,
    },
    loginText: {
      color: COLORS.purple,
      fontSize: 14,
      fontWeight: "bold",
    },
  });
}
