import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

import AdminHome from "../screens/adminScreensOnly/AdminHome";
import { COLORS } from "../styles";

const AdminTab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <AdminTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "AdminHome") {
            iconName = focused ? "shield" : "shield-outline";
          } else if (route.name === "UserManagement") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "ContentModeration") {
            iconName = focused ? "checkmark-circle" : "checkmark-circle-outline";
          } else if (route.name === "Analytics") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else {
            iconName = "shield-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.purple,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === "ios" ? 90 : 70,
          paddingHorizontal: 10,
          elevation: 8,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <AdminTab.Screen
        name="AdminHome"
        component={AdminHome}
        options={{
          tabBarLabel: "Dashboard",
          title: "Admin Dashboard",
        }}
      />
      <AdminTab.Screen
        name="UserManagement"
        component={AdminHome} // Placeholder - replace with actual component
        options={{
          tabBarLabel: "Users",
          title: "User Management",
        }}
      />

      <AdminTab.Screen
        name="Analytics"
        component={AdminHome} // Placeholder - replace with actual component
        options={{
          tabBarLabel: "Analytics",
          title: "Analytics",
        }}
      />
    </AdminTab.Navigator>
  );
}
