import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useScreenDimensions } from '../hooks';
import { Colors, Typography } from '../styles';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '@components/Avatar';
import Avatar_Placeholder from '../../assets/icons/Avatar_Placeholder.jpg';
import { AuthContext } from '../../src/features/auth/AuthContext'; 

const mockUser = {
  avatar: Avatar_Placeholder,
  firstName: 'Sho',
  lastName: 'Vang',
  dOB: '01/15/2000',
  zipCode: '80204',
  email: 'sho@example.com',
  phoneNumber: '(123) 456-7890',
  password: 'YourStrongPassword',
  membershipTier: 'Premium',
  paymentInfo: ['Visa •••• 4242', 'Exp: 12/26'],
};

const ViewUserProfileScreen = () => {
  const { logout } = useContext(AuthContext); 
  const navigation = useNavigation();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const handleLogout = async () => {
    try {
      await logout(); 
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <View style={styles.container}>
<View style={styles.header}>
<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
  <Ionicons name="arrow-back" size={28} color={Colors.purple} />
</TouchableOpacity>

<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
  <Text style={styles.logoutText}>Log Out</Text>
</TouchableOpacity>
</View>
      <Avatar
        avatar={mockUser.avatar}
        width={screenWidth * 0.4}
        height={screenWidth * 0.4}
        style={styles.avatar}
      />
      <Text style={styles.name}>{`${mockUser.firstName} ${mockUser.lastName}`}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>DOB: {mockUser.dOB}</Text>
        <Text style={styles.label}>Zip Code: {mockUser.zipCode}</Text>
        <Text style={styles.label}>Email: {mockUser.email}</Text>
        <Text style={styles.label}>Phone: {mockUser.phoneNumber}</Text>
        <Text style={styles.label}>Password: {mockUser.password}</Text>
        <Text style={styles.label}>Membership: {mockUser.membershipTier}</Text>
        <Text style={styles.label}>Payment Info:</Text>
        {mockUser.paymentInfo.map((item, index) => (
          <Text key={index} style={styles.subLabel}>• {item}</Text>
        ))}
      </View>
    </View>
  );
};

export default ViewUserProfileScreen;

const getStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
      alignItems: 'center',
      // paddingTop: height * 0.12, // give space for header
      paddingHorizontal: width * 0.05,
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: height * 0.05,
      marginBottom: height * 0.03,
    },
    backButton: {
      position: 'absolute',
      top: height * 0.05,
      left: 20,
      zIndex: 10,
    },
    
    logoutButton: {
      position: 'absolute',
      top: height * 0.05,
      right: 20,
      backgroundColor: Colors.purple,
      paddingVertical: 6,
      paddingHorizontal: 15,
      borderRadius: 6,
      zIndex: 10,
    },
    
    logoutText: {
      color: Colors.white,
      fontSize: width > 400 ? 16 : 14,
      fontWeight: '600',
    },
    
    avatar: {
      borderRadius: 100,
      marginBottom: height * 0.02,
      marginTop :height * 0.04,
    },
    name: {
      fontSize: width > 400 ? 28 : 24,
      fontWeight: 'bold',
      color: Colors.purple,
      marginBottom: height * 0.03,
    },
    infoBox: {
      width: '100%',
    },
    label: {
      ...Typography.inputText,
      marginBottom: height * 0.015,
      color: Colors.darkGray,
      fontSize: width > 400 ? 18 : 16,
    },
    subLabel: {
      marginLeft: 10,
      marginBottom: height * 0.01,
      color: Colors.darkGray,
      fontSize: width > 400 ? 16 : 14,
    },
    button: {
      backgroundColor: '#6a1b9a',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
