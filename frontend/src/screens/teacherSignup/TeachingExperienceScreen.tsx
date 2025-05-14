//src/screens/teacherSignup/TeachingExperienceScreen';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useScreenDimensions } from '../../hooks';
import { Colors, Typography } from '../../styles';

const TeachingExperienceScreen = () => {
  const navigation = useNavigation();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [experienceList, setExperienceList] = useState([{ expertise: '', years: '' }]);
  const [certifications, setCertifications] = useState<string[]>(['']);
  const [portfolios, setPortfolios] = useState<string[]>(['']);

  const addExperienceField = () => {
    setExperienceList([...experienceList, { expertise: '', years: '' }]);
  };

  const handleChange = (index: number, key: 'expertise' | 'years', value: string) => {
    const updated = [...experienceList];
    updated[index][key] = value;
    setExperienceList(updated);
  };
const removeExperienceField = (index: number) => {
  if (experienceList.length > 1) {
    const updated = [...experienceList];
    updated.splice(index, 1);
    setExperienceList(updated);
  }
};
  const handleNext = () => {
    // navigation.navigate('NextStep');
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

      <TextInput
        style={styles.input}
        placeholder="Upload Certifications (link or title)"
        placeholderTextColor={Colors.darkGray}
        onChangeText={(text) => setCertifications([text])}
      />

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
