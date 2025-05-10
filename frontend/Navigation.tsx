// src/Navigation.tsx
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from './src/features/auth/AuthContext';

import Welcome from './src/screens/welcome';  
import TeacherSignUpScreen from '@screens/teacherSignUp';
import SignUpScreen from './src/screens/signup';
import LoginScreen from '@screens/login';
import ViewUserProfileScreen from '@screens/viewUserProfile';
import HomeScreen from '@screens/home';
import BottomTabs from '../frontend/bottomTabs'; // ✅ import your tab navigator


const Stack = createStackNavigator();

export default function Navigation() {
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) return null; // ✅ Don't show navigation stack while loading

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
{isLoggedIn ? (
  <>
    <Stack.Screen name="Main" component={BottomTabs} />
    <Stack.Screen name="ViewUserProfile" component={ViewUserProfileScreen} />
  </>
) : (
  <>
    <Stack.Screen name="Welcome" component={Welcome} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="TeacherSignUp" component={TeacherSignUpScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </>
)}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
