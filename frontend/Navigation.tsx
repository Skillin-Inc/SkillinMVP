// src/Navigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './src/screens/home'
import SignUpScreen from './src/screens/signup' 
import LoginScreen from '@screens/login';
import ViewUserProfileScreen from '@screens/viewUserProfile';


const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ViewUserProfile" component={ViewUserProfileScreen} />

 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
