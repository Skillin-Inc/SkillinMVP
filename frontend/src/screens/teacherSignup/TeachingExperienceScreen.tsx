// src/screens/teacherSignup/TeachingExperienceScreen.tsx
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

const TeachingExperienceScreen = () => {
  const route = useRoute<RouteProp<TeacherStackParamList, 'TeachingExperience'>>();
  console.log('📦 Received from PersonalInfoScreen:', route.params);
  
  const navigation = useNavigation<StackNavigationProp<TeacherStackParamList>>();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [experienceList, setExperienceList] = useState([{ expertise: '', years: '' }]);
  const [certificationImage, setCertificationImage] = useState<string | null>(null);
  const [portfolios, setPortfolios] = useState<string[]>(['']);

  const addExperienceField = () => {
    setExperienceList([...experienceList, { expertise: '', years: '' }]);
  };

  const removeExperienceField = (index: number) => {
    if (experienceList.length > 1) {
      const updated = [...experienceList];
      updated.splice(index, 1);
      setExperienceList(updated);
    }
  };

  const handleChange = (index: number, key: 'expertise' | 'years', value: string) => {
    const updated = [...experienceList];
    updated[index][key] = value;
    setExperienceList(updated);
  };

  const pickCertificationImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('We need permission to access your photos!');
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

  const handleNext = () => {
    navigation.navigate('Verification', {
      ...route.params, // personal info
      experienceList,
      certifications: certificationImage ? [certificationImage] : [],
      portfolios,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 2: Teaching Experience</Text>
      </View>

      {experienceList.map((item, index) => (
        <View key={index} style={styles.rowGroup}>
          <View style={styles.experienceRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Area of Expertise"
              value={item.expertise}
              onChangeText={(text) => handleChange(index, 'expertise', text)}
              placeholderTextColor={Colors.darkGray}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Years"
              value={item.years}
              onChangeText={(text) => handleChange(index, 'years', text)}
              keyboardType="number-pad"
              placeholderTextColor={Colors.darkGray}
            />
            {experienceList.length > 1 && (
              <TouchableOpacity onPress={() => removeExperienceField(index)} style={{ marginLeft: 8 }}>
                <Ionicons name="remove-circle-outline" size={28} color={Colors.purple} />
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
          {certificationImage ? 'Change Certification Image' : 'Upload Your Certification'}
        </Text>
      </TouchableOpacity>

      {certificationImage && (
        <Image
          source={{ uri: certificationImage }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 20,
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Portfolio Link / Sample Work"
        placeholderTextColor={Colors.darkGray}
        onChangeText={(text) => setPortfolios([text])}
      />

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TeachingExperienceScreen;

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
    experienceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    rowGroup: {
      marginBottom: 10,
    },
    addField: {
      color: Colors.purple,
      fontWeight: '600',
      marginBottom: height * 0.04,
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