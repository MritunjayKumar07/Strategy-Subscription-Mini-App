import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StrategyListScreen } from './src/screens/StrategyListScreen';
import { StrategyDetailScreen } from './src/screens/StrategyDetailScreen';

type RootStackParamList = {
  StrategyList: undefined;
  StrategyDetail: { strategyId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="StrategyList"
        screenOptions={{
          headerStyle: { backgroundColor: '#0066cc' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="StrategyList" 
          component={StrategyListScreen} 
          options={{ title: 'Strategies' }} 
        />
        <Stack.Screen 
          name="StrategyDetail" 
          component={StrategyDetailScreen} 
          options={{ title: 'Subscribe' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
