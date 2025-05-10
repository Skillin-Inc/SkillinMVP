// // src/navigation/BottomTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@screens/home';
// import Search from '@screens/search';
// import MyLessons from '@screens/myLessons';
// import Message from '@screens/message';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#414288',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home-outline';

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Search':
              iconName = 'search-outline';
              break;
            case 'MyLessons':
              iconName = 'book-outline';
              break;
            case 'Message':
              iconName = 'chatbubble-outline';
              break;
          }

          return <Ionicons name="home-outline" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      {/* <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="MyLessons" component={MyLessons} />
      <Tab.Screen name="Message" component={Message} /> */}
    </Tab.Navigator>
  );
};

export default BottomTabs;
