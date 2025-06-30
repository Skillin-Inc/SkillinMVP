import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { useScreenDimensions, formatPhoneNumber } from "../../hooks";
import { TeacherAuthStackParamList } from "../../types/navigation";
import { COLORS } from "../../styles";

type Props = StackScreenProps<TeacherAuthStackParamList, "TeacherInfo">;

const TeacherInfo = ({ navigation }: Props) => {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("We need permission to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    navigation.navigate("TeacherExperience", {
      firstName,
      lastName,
      email,
      phoneNumber,
      profileImage,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 1: Personal Info</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        placeholderTextColor={COLORS.darkGray}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        placeholderTextColor={COLORS.darkGray}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor={COLORS.darkGray}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number (Optional)"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
        keyboardType="phone-pad"
        placeholderTextColor={COLORS.darkGray}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>
          {profileImage ? "Change Profile Photo" : "Upload Profile Photo (optional)"}
        </Text>
      </TouchableOpacity>

      {profileImage && (
        <Image
          source={{ uri: profileImage }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            alignSelf: "center",
            marginBottom: 20,
          }}
        />
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TeacherInfo;

const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: COLORS.white,
      padding: width * 0.06,
      paddingTop: height * 0.08,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: height * 0.03,
    },
    headerTitle: {
      marginLeft: 15,
      fontSize: width > 400 ? 24 : 22,
      fontWeight: "bold",
      color: COLORS.purple,
    },
    input: {
      width: "100%",
      height: height * 0.07,
      borderColor: COLORS.darkGray,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: width > 400 ? 18 : 16,
      marginBottom: height * 0.025,
      color: COLORS.black,
    },
    uploadButton: {
      borderColor: COLORS.purple,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: "center",
      marginBottom: height * 0.02,
    },
    uploadButtonText: {
      color: COLORS.purple,
      fontSize: 16,
      fontWeight: "500",
    },
    nextButton: {
      backgroundColor: COLORS.green,
      paddingVertical: height * 0.02,
      borderRadius: 8,
      alignItems: "center",
    },
    nextButtonText: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: "bold",
    },
  });
