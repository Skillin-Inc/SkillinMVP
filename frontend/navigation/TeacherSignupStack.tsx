// navigation/const TeacherSignupStack.tsx
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../src/features/auth/AuthContext';

import ApplicationStartScreen from '../src/screens/teacherSignup/ApplicationStart';
import PersonalInfoScreen from '../src/screens/teacherSignup/PersonalInfo';
import TeachingExperienceScreen from '../src/screens/teacherSignup/TeachingExperienceScreen';
import VerificationScreen from '../src/screens/teacherSignup/Verification';
import ReviewSubmitScreen from '../src/screens/teacherSignup/ReviewAndSubmit';




const TeacherSignupStack = createStackNavigator();

export function TeacherNavigator() {
  return (
    <TeacherSignupStack.Navigator screenOptions={{ headerShown: false }}>
      <TeacherSignupStack.Screen name="ApplicationStart" component={ApplicationStartScreen} />
      <TeacherSignupStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <TeacherSignupStack.Screen name="TeachingExperience" component={TeachingExperienceScreen} />
      <TeacherSignupStack.Screen name="Verification" component={VerificationScreen} />
      <TeacherSignupStack.Screen name="ReviewSubmit" component={ReviewSubmitScreen} />

    </TeacherSignupStack.Navigator>
  );
}
