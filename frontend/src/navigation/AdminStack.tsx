import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import AdminTabs from "./AdminTabs";
import Chat from "../screens/shared/Chat";
import { AdminStackParamList } from "../types/navigation";

const Stack = createStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}
