// src/screens/teacherSignup/VerificationScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useScreenDimensions } from "../../hooks";
import { TeacherStackParamList } from "../../types/navigation";
import { COLORS } from "../../styles";

const VerificationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<TeacherStackParamList>>();
  const route = useRoute<RouteProp<TeacherStackParamList, "Verification">>();
  console.log("📦 Received from TeachingExperienceScreen:", route.params);

  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);

  const pickImage = async (setState: React.Dispatch<React.SetStateAction<string | null>>) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("We need permission to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setState(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    navigation.navigate("ReviewSubmit", {
      ...route.params,
      idFront: idFrontImage,
      idBack: idBackImage,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 2.5: Verification</Text>
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setIdFrontImage)}>
        <Text style={styles.uploadButtonText}>{idFrontImage ? "Change ID Front" : "Upload ID Front"}</Text>
      </TouchableOpacity>

      {idFrontImage && (
        <Image
          source={{ uri: idFrontImage }}
          style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setIdBackImage)}>
        <Text style={styles.uploadButtonText}>{idBackImage ? "Change ID Back" : "Upload ID Back"}</Text>
      </TouchableOpacity>

      {idBackImage && (
        <Image
          source={{ uri: idBackImage }}
          style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
        <Text style={styles.nextButtonText}>Continue to Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default VerificationScreen;

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
