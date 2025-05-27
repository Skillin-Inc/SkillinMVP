// src/Navigation.tsx
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../hooks/AuthContext";

import AuthStack from "./AuthStack";
import TabNavigator from "./TabNavigator";
import TeacherTabNavigator from "./TeacherTabNavigator"; // adjust the path as needed

import TeacherHome from "../screens/TeacherHome"; // adjust path if needed
import Profile from "../screens/Profile"; // adjust path if needed
import { RootStackParamList } from "src/types";

const RootStack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="UserTabs" component={TabNavigator} />
          {/* <RootStack.Screen name="TeacherHome" component={TeacherHome} /> */}
          <RootStack.Screen name="TeacherTabs" component={TeacherTabNavigator} />
          <RootStack.Screen name="Profile" component={Profile} />
        </RootStack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
