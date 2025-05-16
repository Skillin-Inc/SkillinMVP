// src/screens/teacherSignup/VerificationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { useScreenDimensions } from '../../hooks';
import { Colors } from '../../styles';
import { TeacherStackParamList } from '../../types/TeacherStackParamList';
import { StackNavigationProp } from '@react-navigation/stack';

const VerificationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<TeacherStackParamList>>();
const route = useRoute<RouteProp<TeacherStackParamList, 'Verification'>>();
console.log('📦 Received from TeachingExperienceScreen:', route.params);

  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [idImage, setIdImage] = useState<string | null>(null);
  const [verificationLink, setVerificationLink] = useState('');
  const [videoIntro, setVideoIntro] = useState<string | null>(null);

  const pickMedia = async (setState: React.Dispatch<React.SetStateAction<string | null>>, type: 'image' | 'video') => {
    const permission =
      type === 'image'
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestCameraPermissionsAsync();

    if (permission.status !== 'granted') {
      alert(`Permission to access ${type === 'image' ? 'photos' : 'camera'} is required.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'image'
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setState(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    navigation.navigate('ReviewSubmit', {
      ...route.params,
      idImage,
      verificationLink,
      videoIntro,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 2.5: Verification</Text>
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={() => pickMedia(setIdImage, 'image')}>
        <Text style={styles.uploadButtonText}>
          {idImage ? 'Change Uploaded ID' : 'Upload Government ID Photo'}
        </Text>
      </TouchableOpacity>

      {idImage && (
        <Image
          source={{ uri: idImage }}
          style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 20 }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Or paste a link to your verification/background check"
        value={verificationLink}
        onChangeText={setVerificationLink}
        placeholderTextColor={Colors.darkGray}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={() => pickMedia(setVideoIntro, 'video')}>
        <Text style={styles.uploadButtonText}>
          {videoIntro ? 'Change Video Intro' : 'Upload Optional Video Introduction'}
        </Text>
      </TouchableOpacity>

      {videoIntro && (
        <Text style={styles.infoText}>
          Video selected: {videoIntro.split('/').pop()}
        </Text>
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
    infoText: {
      color: Colors.darkGray,
      marginBottom: height * 0.025,
      fontStyle: 'italic',
    },
  });