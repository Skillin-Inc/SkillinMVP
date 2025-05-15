import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { TeacherStackParamList } from '../../types/TeacherStackParamList';


import {
  useScreenDimensions,
  formatPhoneNumber,
  formatZipCode,
} from '../../hooks';
import { Colors, Typography } from '../../styles';
import { AuthContext } from '../../features/auth/AuthContext';


const PersonalInfoScreen = () => {
  const navigation = useNavigation<StackNavigationProp<TeacherStackParamList>>();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);


  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('We need permission to access your photos!');
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
  navigation.navigate('TeachingExperience', {
    firstName,
    lastName,
    email,
    phoneNumber,
    zipCode,
    profileImage,
  });
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 1: Personal Info</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        placeholderTextColor={Colors.darkGray}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        placeholderTextColor={Colors.darkGray}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor={Colors.darkGray}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
        keyboardType="phone-pad"
        placeholderTextColor={Colors.darkGray}
      />
      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        value={zipCode}
        onChangeText={(text) => setZipCode(formatZipCode(text))}
        keyboardType="number-pad"
        placeholderTextColor={Colors.darkGray}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>
          {profileImage ? 'Change Profile Photo' : 'Upload Profile Photo (optional)'}
        </Text>
      </TouchableOpacity>

      {profileImage && (
        <Image
          source={{ uri: profileImage }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            alignSelf: 'center',
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

export default PersonalInfoScreen;

const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: Colors.white,
      padding: width * 0.06,
      paddingTop: height * 0.08,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: height * 0.03,
    },
    headerTitle: {
      marginLeft: 15,
      fontSize: width > 400 ? 24 : 22,
      fontWeight: 'bold',
      color: Colors.purple,
    },
    input: {
      width: '100%',
      height: height * 0.07,
      borderColor: Colors.darkGray,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: width > 400 ? 18 : 16,
      marginBottom: height * 0.025,
      color: Colors.black,
    },
    uploadButton: {
      borderColor: Colors.purple,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      marginBottom: height * 0.02,
    },
    uploadButtonText: {
      color: Colors.purple,
      fontSize: 16,
      fontWeight: '500',
    },
    nextButton: {
      backgroundColor: Colors.springGreen,
      paddingVertical: height * 0.02,
      borderRadius: 8,
      alignItems: 'center',
    },
    nextButtonText: {
      color: Colors.white,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
