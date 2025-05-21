import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TeacherStackParamList } from "../../types/TeacherStackParamList";
import { Colors } from "../../styles";
import { useScreenDimensions } from "../../hooks";

const ReviewSubmitScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<TeacherStackParamList>>();
  const route = useRoute<RouteProp<TeacherStackParamList, "ReviewSubmit">>();
  const { screenWidth, screenHeight } = useScreenDimensions();

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    zipCode,
    profileImage,
    experienceList,
    certifications,
    portfolios,
    idFront,
    idBack,
  } = route.params;

  const handleEdit = (screen: keyof TeacherStackParamList) => {
    navigation.navigate(screen as any);
  };

  const handleSubmit = () => {
    navigation.navigate("ApplicationStart");
  };

  const styles = getStyles(screenWidth, screenHeight);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Review Your Application</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>👤 Personal Info</Text>
        <Text style={styles.label}>
          First Name: <Text style={styles.value}>{firstName}</Text>
        </Text>
        <Text style={styles.label}>
          Last Name: <Text style={styles.value}>{lastName}</Text>
        </Text>
        <Text style={styles.label}>
          Email: <Text style={styles.value}>{email}</Text>
        </Text>
        <Text style={styles.label}>
          Phone: <Text style={styles.value}>{phoneNumber}</Text>
        </Text>
        <Text style={styles.label}>
          Zip Code: <Text style={styles.value}>{zipCode}</Text>
        </Text>
        {profileImage && (
          <Image source={{ uri: profileImage }} style={styles.image} />
        )}
        <TouchableOpacity onPress={() => handleEdit("PersonalInfo")}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📚 Teaching Experience</Text>
        {experienceList.map((exp, idx) => (
          <Text key={idx} style={styles.value}>
            • {exp.expertise} ({exp.years} yrs)
          </Text>
        ))}
        {certifications.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: 10 }]}>
              Certifications:
            </Text>
            {certifications.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.image} />
            ))}
          </>
        )}
        {portfolios.length > 0 && (
          <>
            <Text style={styles.label}>Portfolio:</Text>
            {portfolios.map((link, idx) => (
              <Text key={idx} style={styles.value}>
                • {link}
              </Text>
            ))}
          </>
        )}
        <TouchableOpacity onPress={() => handleEdit("TeachingExperience")}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>✅ Verification</Text>
        {idFront && <Image source={{ uri: idFront }} style={styles.image} />}
        {idBack && <Image source={{ uri: idBack }} style={styles.image} />}
        <TouchableOpacity onPress={() => handleEdit("Verification")}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Application</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ReviewSubmitScreen;
const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      padding: width * 0.05,
      backgroundColor: Colors.white,
    },
    header: {
      fontSize: width > 400 ? 26 : 22,
      fontWeight: "bold",
      marginBottom: height * 0.03,
      color: Colors.purple,
      textAlign: "center",
      marginTop: height * 0.05,
    },
    card: {
      backgroundColor: "#edebeb",
      borderRadius: 12,
      padding: width * 0.04,
      marginBottom: height * 0.035,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: width > 400 ? 18 : 16,
      fontWeight: "700",
      color: Colors.purple,
      marginBottom: height * 0.015,
    },
    label: {
      fontWeight: "600",
      color: Colors.purple,
      marginBottom: 4,
    },
    value: {
      fontWeight: "600", // make it slightly bolder
      color: Colors.black, // ensure it's true black
      fontSize: width > 400 ? 16 : 15, // slightly larger
      marginBottom: 6, // spacing between items
    },

    image: {
      width: "100%",
      height: height * 0.25,
      borderRadius: 10,
      marginTop: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    editLink: {
      color: Colors.purple,
      fontWeight: "500",
      marginTop: height * 0.01,
    },
    submitButton: {
      backgroundColor: Colors.springGreen,
      paddingVertical: height * 0.025,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 10,
    },
    submitText: {
      color: "#fff",
      fontSize: width > 400 ? 17 : 15,
      fontWeight: "bold",
    },
  });
