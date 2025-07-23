import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { useScreenDimensions, formatDateOfBirth, formatPhoneNumber, isValidEmail } from "../../hooks";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { COLORS } from "../../styles";
import { AuthStackParamList } from "../../types";
import { SectionHeader } from "../../components/common";
import collegeData from "../../../assets/us_institutions.json";

type Props = StackScreenProps<AuthStackParamList, "StudentInfo">;

export default function StudentInfo({ navigation }: Props) {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);
  const collegeList = collegeData.map((c) => c.institution);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [collegeValue, setcollegeValue] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);
  const filtered = collegeList.filter((name) => name.toLowerCase().includes(collegeValue.toLowerCase())).slice(0, 5);
  // Add 'Other' if not already present
  const showOther = !filtered.some((name) => name.toLowerCase() === "other");
  const suggestions = showOther ? [...filtered, "Other"] : filtered;

  const [phoneNumber, setPhoneNumber] = useState("");

  const handleNext = () => {
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth.trim() || !email.trim() || !collegeValue.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    navigation.navigate("StudentAccount", {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      date_of_birth: dateOfBirth.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim() || undefined,
      college: collegeValue.trim(),
    });
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
        <SectionHeader title="Personal Information" />
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
            value={dateOfBirth}
            onChangeText={(text) => setDateOfBirth(formatDateOfBirth(text))}
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
            onChangeText={(text) => setEmail(text.toLowerCase())}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What college do you attend"
            value={collegeValue}
            onChangeText={setcollegeValue}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
        </View>
        {showSuggestions && suggestions.length > 0 && (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              elevation: 2,
              position: "absolute",
              left: 24,
              right: 24,
              zIndex: 10,
            }}
          >
            {suggestions.map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => {
                  setcollegeValue(name);
                  setShowSuggestions(false);
                }}
                style={{ padding: 12 }}
              >
                <Text>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number (Optional)"
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
