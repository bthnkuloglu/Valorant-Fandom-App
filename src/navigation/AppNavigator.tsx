import React from 'react';
import { NavigationContainer, NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Pressable } from 'react-native';

import Home from '../screens/Home';
import Agents from '../screens/Agents';
import Maps from '../screens/Maps';
import Weapons from '../screens/Weapons';
import GameModes from '../screens/GameModes'
import Esports from '../screens/Esports'
import AgentsDetail from '../screens/AgentsDetail';
import GameModesDetails from '../screens/GameModesDetails';
import WeaponDetails from '../screens/WeaponDetails';

export type RootStackParamList = {
  Home: undefined;
  Agents: undefined;
  Maps: undefined;
  Weapons: undefined;
  GameModes: undefined;  
  Esports: undefined;    
  AgentsDetail: { id: string };
  GameModesDetails: {modeId:string};
  WeaponDetails: { uuid: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();


export const goHomeHard = (navigation: NavigationProp<RootStackParamList>) => {
  navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });
};

function HeaderTitle({ navigation }: { navigation: NavigationProp<RootStackParamList> }) {
  return (
    <Pressable
      onPress={() => goHomeHard(navigation)}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
      android_ripple={{ color: '#ddd', borderless: true }}
    >
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Ana Sayfa</Text>
    </Pressable>
  );
}


export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, 
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Agents" component={Agents} />
        <Stack.Screen name="Maps" component={Maps} />
        <Stack.Screen name="Weapons" component={Weapons} />
        <Stack.Screen name="GameModes" component={GameModes} />
        <Stack.Screen name="Esports" component={Esports} />
        <Stack.Screen name="AgentsDetail" component={AgentsDetail} />
        <Stack.Screen name="GameModesDetails" component={GameModesDetails}/>
        <Stack.Screen name="WeaponDetails" component={WeaponDetails}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}