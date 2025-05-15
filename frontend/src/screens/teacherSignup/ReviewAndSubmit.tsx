// import React, { useContext } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../features/auth/AuthContext';
// import { Colors, Typography } from '../../styles';

// const ReviewSubmitScreen = () => {
//     const route = useRoute<RouteProp<TeacherStackParamList, 'ReviewSubmit'>>();
// const {
//   fullName, email, phoneNumber, zipCode, profileImage,
//   experienceList, certifications, portfolios,
// } = route.params;

//   const navigation = useNavigation();
//   //const { teacherFormData, submitTeacherApplication } = useContext(AuthContext); // Adjust to your actual context
//   const submitTeacherApplication = 
//   const handleEdit = (screenName: string) => {
//     navigation.navigate(screenName as never);
//   };

//   const handleSubmit = async () => {
//     await submitTeacherApplication();
//     // Navigate to success screen or confirmation
//     navigation.navigate('ApplicationSuccess' as never); // create this screen if needed
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Review Your Application</Text>

//       <View style={styles.section}>
//         <Text style={styles.sectionHeader}>Personal Information</Text>
//         <Text>Name: {teacherFormData.fullName}</Text>
//         <Text>Email: {teacherFormData.email}</Text>
//         <Text>Date of Birth: {teacherFormData.dateOB}</Text>
//         <Text>Zip Code: {teacherFormData.zipCode}</Text>
//         <TouchableOpacity onPress={() => handleEdit('PersonalInfo')}>
//           <Text style={styles.editLink}>Edit</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.sectionHeader}>Teaching Experience</Text>
//         {teacherFormData.experienceList.map((item, idx) => (
//           <Text key={idx}>• {item.expertise}, {item.years} years</Text>
//         ))}
//         <Text>Certifications: {teacherFormData.certifications.join(', ')}</Text>
//         <Text>Portfolios: {teacherFormData.portfolios.join(', ')}</Text>
//         <TouchableOpacity onPress={() => handleEdit('TeachingExperience')}>
//           <Text style={styles.editLink}>Edit</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//         <Text style={styles.submitText}>Submit Application</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: Colors.primary,
//   },
//   section: {
//     marginBottom: 30,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   editLink: {
//     color: Colors.link,
//     marginTop: 4,
//   },
//   submitButton: {
//     backgroundColor: Colors.primary,
//     padding: 16,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   submitText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default ReviewSubmitScreen;
