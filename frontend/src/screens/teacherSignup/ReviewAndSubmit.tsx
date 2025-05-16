// src/screens/teacherSignup/ReviewSubmitScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TeacherStackParamList } from '../../types/TeacherStackParamList';
import { Colors } from '../../styles';

const ReviewSubmitScreen = () => {
  const navigation = useNavigation<StackNavigationProp<TeacherStackParamList>>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'ReviewSubmit'>>();

  const {
    firstName, lastName, email, phoneNumber, zipCode, profileImage,
    experienceList, certifications, portfolios,
    idImage, verificationLink, videoIntro,
  } = route.params;

const handleEdit = (screenName: keyof TeacherStackParamList) => {
  navigation.navigate(screenName as any); // or 'as never' if strict
};

  const handleSubmit = () => {
    // submit logic here
    navigation.navigate('ApplicationStart'); // placeholder success route
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Review Your Application</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal Info</Text>
        <Text>First Name: {firstName}</Text>
        <Text>Last Name: {lastName}</Text>
        <Text>Email: {email}</Text>
        <Text>Phone: {phoneNumber}</Text>
        <Text>Zip Code: {zipCode}</Text>
        {profileImage && <Image source={{ uri: profileImage }} style={styles.image} />}
        <TouchableOpacity onPress={() => handleEdit('PersonalInfo')}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Teaching Experience</Text>
        {experienceList.map((exp, index) => (
          <Text key={index}>• {exp.expertise} ({exp.years} yrs)</Text>
        ))}
        <Text>Certifications: {certifications.join(', ')}</Text>
        <Text>Portfolios: {portfolios.join(', ')}</Text>
        <TouchableOpacity onPress={() => handleEdit('TeachingExperience')}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Verification</Text>
        {idImage && <Image source={{ uri: idImage }} style={styles.image} />}
        {verificationLink ? <Text>Verification Link: {verificationLink}</Text> : null}
        {videoIntro ? <Text>Video Intro: {videoIntro.split('/').pop()}</Text> : null}
        <TouchableOpacity onPress={() => handleEdit('Verification')}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Application</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.purple,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  editLink: {
    color: Colors.purple,
    marginTop: 4,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.springGreen,
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewSubmitScreen;
