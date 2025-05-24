import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Messages from "../screens/messages/Messages";
import Chat from "../screens/messages/Chat";
import { MessagesStackParamList } from "../types";

const Stack = createStackNavigator<MessagesStackParamList>();

export default function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Messages" component={Messages} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}
