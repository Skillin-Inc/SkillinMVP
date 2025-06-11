// src/Navigation.tsx
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../hooks/AuthContext";

import AuthStack from "./AuthStack";
import TabNavigator from "./TabNavigator";
import TeacherTabNavigator from "./TeacherTabNavigator"; // adjust the path as needed
import UpgradeScreen from "../screens/UpgradeScreen"; // remind to pay
import TeacherHome from "../screens/TeacherHome"; // adjust path if needed
import Profile from "../screens/Profile"; // adjust path if needed
import { RootStackParamList } from "src/types";

const RootStack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoggedIn, isPaid, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
  <NavigationContainer>
    { !isLoggedIn ? (
      // 1. not logged in，go to AuthStack
      <AuthStack />
    ) : !isPaid ? (
      // 2. logged in but did not pay，go to payment reminder page
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen 
          name="Upgrade" 
          component={UpgradeScreen} 
          options={{ title: "Activate Membership" }}
        />
      </RootStack.Navigator>
    ) : (
      // 3. paid and logged in，follow the original path
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="UserTabs"    component={TabNavigator} />
        {/* <RootStack.Screen name="TeacherHome" component={TeacherHome} /> */}
        <RootStack.Screen name="TeacherTabs" component={TeacherTabNavigator} />
        <RootStack.Screen name="Profile"     component={Profile} />
      </RootStack.Navigator>
    )}
  </NavigationContainer>
);

}
