import React, { useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useScreenDimensions } from "../hooks";
import { Colors, Typography } from "../styles";
import { AuthContext } from "../../src/features/auth/AuthContext"; // ✅ import your context

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext); // ✅ hook is inside the component
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (!userName.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    console.log("Logging in with:", { userName, password });

    try {
      await login(); // ✅ triggers login from context, which updates state
    } catch (e) {
      console.error("Login error", e);
      Alert.alert("Login Failed", "Something went wrong. Please try again.");
    }
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={{ width: "100%", position: "absolute", top: 50, left: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.purple} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email or Phone number"
        placeholderTextColor={Colors.darkGray}
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.darkGray}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

function getStyles(width: number, height: number) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: Colors.white,
      justifyContent: "center",
      alignItems: "center",
      padding: width * 0.05,
      marginTop: height * 0.05,
      marginBottom: height * 0.05,
    },
    title: {
      fontSize: width > 400 ? 36 : 32,
      fontWeight: "bold",
      color: Colors.purple,
      marginBottom: height * 0.04,
    },
    input: {
      width: "100%",
      height: height * 0.07,
      borderColor: Colors.darkGray,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: width > 400 ? 18 : 16,
      marginBottom: height * 0.025,
      color: Colors.darkGray,
    },
    button: {
      width: "100%",
      backgroundColor: Colors.springGreen,
      paddingVertical: height * 0.02,
      borderRadius: 8,
      alignItems: "center",
      marginTop: height * 0.02,
    },
    buttonText: {
      color: Colors.white,
      fontSize: width > 400 ? 20 : 18,
      fontWeight: "bold",
    },
  });
}
