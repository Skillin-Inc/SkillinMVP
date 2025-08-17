import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

import { AdminTabsParamList } from "../types/navigation";
import AdminHome from "../screens/admin/AdminHome";
import AdminAnalytics from "../screens/admin/AdminAnalytics";
import Messages from "../screens/shared/Messages";
import { COLORS } from "../styles";

const AdminTab = createBottomTabNavigator<AdminTabsParamList>();

export default function AdminTabs() {
  return (
    <AdminTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "AdminHome") {
            iconName = focused ? "shield" : "shield-outline";
          } else if (route.name === "Analytics") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else if (route.name === "Messages") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
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
        name="Analytics"
        component={AdminAnalytics}
        options={{
          tabBarLabel: "Analytics",
          title: "Platform Analytics",
        }}
      />
      <AdminTab.Screen name="Messages" component={Messages} />
    </AdminTab.Navigator>
  );
}
