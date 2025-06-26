// src/screens/teacherSignup/TeacherExperience.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";

import { useScreenDimensions } from "../../hooks";
import { TeacherAuthStackParamList } from "../../types/navigation";
import { COLORS } from "../../styles";

type Props = StackScreenProps<TeacherAuthStackParamList, "TeacherExperience">;

const TeacherExperience = ({ navigation, route }: Props) => {
  console.log("📦 Received from TeacherInfo:", route.params);

  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [experienceList, setExperienceList] = useState([{ expertise: "", years: "" }]);
  const [certificationImage, setCertificationImage] = useState<string | null>(null);
  const [portfolios, setPortfolios] = useState<string[]>([""]);
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);

  const addExperienceField = () => {
    setExperienceList([...experienceList, { expertise: "", years: "" }]);
  };

  const removeExperienceField = (index: number) => {
    if (experienceList.length > 1) {
      const updated = [...experienceList];
      updated.splice(index, 1);
      setExperienceList(updated);
    }
  };

  const handleChange = (index: number, key: "expertise" | "years", value: string) => {
    const updated = [...experienceList];
    updated[index][key] = value;
    setExperienceList(updated);
  };

  const pickCertificationImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("We need permission to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setCertificationImage(result.assets[0].uri);
    }
  };

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

  const handleNext = () => {
    navigation.navigate("TeacherSubmit", {
      ...route.params,
      experienceList,
      certifications: certificationImage ? [certificationImage] : [],
      portfolios,
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
        <Text style={styles.headerTitle}>Step 2: Experience & Verification</Text>
      </View>

      <Text style={styles.sectionTitle}>Teaching Experience</Text>

      {experienceList.map((item, index) => (
        <View key={index} style={styles.rowGroup}>
          <View style={styles.experienceRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Area of Expertise"
              value={item.expertise}
              onChangeText={(text) => handleChange(index, "expertise", text)}
              placeholderTextColor={COLORS.darkGray}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Years"
              value={item.years}
              onChangeText={(text) => handleChange(index, "years", text)}
              keyboardType="number-pad"
              placeholderTextColor={COLORS.darkGray}
            />
            {experienceList.length > 1 && (
              <TouchableOpacity onPress={() => removeExperienceField(index)} style={{ marginLeft: 8 }}>
                <Ionicons name="remove-circle-outline" size={28} color={COLORS.purple} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      <TouchableOpacity onPress={addExperienceField}>
        <Text style={styles.addField}>+ Add Another Expertise</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadButton} onPress={pickCertificationImage}>
        <Text style={styles.uploadButtonText}>
          {certificationImage ? "Change Certification Image" : "Upload Your Certification"}
        </Text>
      </TouchableOpacity>

      {certificationImage && (
        <Image
          source={{ uri: certificationImage }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 8,
            marginBottom: 20,
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Portfolio Link / Sample Work"
        placeholderTextColor={COLORS.darkGray}
        onChangeText={(text) => setPortfolios([text])}
      />

      <Text style={styles.sectionTitle}>Identity Verification</Text>

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

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Continue to Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TeacherExperience;

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
    sectionTitle: {
      fontSize: width > 400 ? 20 : 18,
      fontWeight: "bold",
      color: COLORS.purple,
      marginTop: height * 0.03,
      marginBottom: height * 0.02,
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
    experienceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    rowGroup: {
      marginBottom: 10,
    },
    addField: {
      color: COLORS.purple,
      fontWeight: "600",
      marginBottom: height * 0.04,
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
