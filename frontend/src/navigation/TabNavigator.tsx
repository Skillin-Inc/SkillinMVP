// // src/navigation/BottomTabs.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Home from "../screens/Home";
import Profile from "../screens/Profile";
import { TabNavigatorParamList } from "../types";

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#414288",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName = "home-outline";

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            // case "Search":
            //   iconName = "search-outline";
            //   break;
            // case "MyLessons":
            //   iconName = "book-outline";
            //   break;
            // case "Message":
            //   iconName = "chatbubble-outline";
            //   break;
            case "Profile":
              iconName = "person-outline";
              break;
          }

          return <Ionicons name="home-outline" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
