// src/Navigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignUpScreen from './src/screens/signup' // adjust path if needed
import Home from './src/screens/home'

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />

 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
