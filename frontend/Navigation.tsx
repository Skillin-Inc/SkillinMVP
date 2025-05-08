// src/Navigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Welcome from './src/screens/welcome'
import SignUpScreen from './src/screens/signup' 
import LoginScreen from '@screens/login';
import ViewUserProfileScreen from '@screens/viewUserProfile';
import HomeScreen from '@screens/home';


const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ViewUserProfile" component={ViewUserProfileScreen} />

 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
