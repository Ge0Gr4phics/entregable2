import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppIcon } from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import { AboutScreen } from '../screens/AboutScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { EditEntryScreen } from '../screens/EditEntryScreen';
import { MyListScreen } from '../screens/MyListScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { colors } from '../theme';
import { MediaType } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
};

export interface MediaDetailParams {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
}

export type SearchStackParamList = {
  Search: undefined;
  Detail: MediaDetailParams;
};

export type MyListStackParamList = {
  MyList: undefined;
  Detail: MediaDetailParams;
  EditEntry: {
    itemId: string;
  };
};

export type AboutStackParamList = {
  About: undefined;
};

export type AppTabsParamList = {
  Inicio: undefined;
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
    <SearchStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <SearchStack.Screen name="Search" component={SearchScreen} options={{ title: 'Cinemateca' }} />
      <SearchStack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalle' }} />
    </SearchStack.Navigator>
  );
}

function MyListStackScreen(): React.ReactElement {
  return (
    <MyListStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.oliveDark },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.oliveDark },
      }}
    >
      <MyListStack.Screen name="MyList" component={MyListScreen} options={{ title: 'Mi lista' }} />
      <MyListStack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalle' }} />
      <MyListStack.Screen name="EditEntry" component={EditEntryScreen} options={{ title: 'Editar entrada' }} />
    </MyListStack.Navigator>
  );
}

function AboutStackScreen(): React.ReactElement {
  return (
    <AboutStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AboutStack.Screen name="About" component={AboutScreen} options={{ title: 'Acerca de' }} />
    </AboutStack.Navigator>
  );
}

function MainTabs(): React.ReactElement {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.surfaceRaised, height: 62, paddingTop: 7, paddingBottom: 7 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={SearchStackScreen}
        options={{ tabBarIcon: ({ color, size }) => <AppIcon name="home" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="MiLista"
        component={MyListStackScreen}
        options={{
          title: 'Mi lista',
          tabBarIcon: ({ color, size }) => <AppIcon name="ticket" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Acerca"
        component={AboutStackScreen}
        options={{
          title: 'Acerca de',
          tabBarIcon: ({ color, size }) => <AppIcon name="info" color={color} size={size} />,
        }}
      />
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
