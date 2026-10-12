import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAppContext } from '../context/AppContext';
import { AboutScreen } from '../screens/AboutScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { EditEntryScreen } from '../screens/EditEntryScreen';
import { MyListScreen } from '../screens/MyListScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { MediaType } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
};

export type SearchStackParamList = {
  Search: undefined;
  Detail: {
    mediaType: MediaType;
    tmdbId: number;
    title: string;
  };
};

export type MyListStackParamList = {
  MyList: undefined;
  EditEntry: {
    itemId: string;
  };
};

export type AboutStackParamList = {
  About: undefined;
};

export type AppTabsParamList = {
  Buscar: undefined;
  MiLista: undefined;
  Acerca: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const MyListStack = createNativeStackNavigator<MyListStackParamList>();
const AboutStack = createNativeStackNavigator<AboutStackParamList>();
const Tab = createBottomTabNavigator<AppTabsParamList>();

function SearchStackScreen(): React.ReactElement {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
      <SearchStack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalle' }} />
    </SearchStack.Navigator>
  );
}

function MyListStackScreen(): React.ReactElement {
  return (
    <MyListStack.Navigator>
      <MyListStack.Screen name="MyList" component={MyListScreen} options={{ title: 'Mi lista' }} />
      <MyListStack.Screen name="EditEntry" component={EditEntryScreen} options={{ title: 'Editar entrada' }} />
    </MyListStack.Navigator>
  );
}

function AboutStackScreen(): React.ReactElement {
  return (
    <AboutStack.Navigator>
      <AboutStack.Screen name="About" component={AboutScreen} options={{ title: 'Acerca de' }} />
    </AboutStack.Navigator>
  );
}

function MainTabs(): React.ReactElement {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Buscar" component={SearchStackScreen} />
      <Tab.Screen name="MiLista" component={MyListStackScreen} options={{ title: 'Mi lista' }} />
      <Tab.Screen name="Acerca" component={AboutStackScreen} options={{ title: 'Acerca de' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator(): React.ReactElement {
  const { user, authReady } = useAppContext();

  if (!authReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainTabs />
      ) : (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Auth" component={AuthScreen} />
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
}
