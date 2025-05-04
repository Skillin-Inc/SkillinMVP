import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useScreenDimensions } from '../hooks';
import { Colors, Typography } from '../styles';
import Avatar from '@components/Avatar';
import Avatar_Placeholder from '../../assets/icons/Avatar_Placeholder.jpg';

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
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  return (
    <View style={styles.container}>
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
      flexGrow: 1,
      backgroundColor: Colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      padding: width * 0.05,
      marginTop: height * 0.05,
      marginBottom: height * 0.05,
    },
    avatar: {
      borderRadius: 100,
      marginBottom: height * 0.03,
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
  });
