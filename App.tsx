import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import AssetDetailScreen from './src/screens/AssetDetailScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <View testID="app-root" style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AssetDetail" component={AssetDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;