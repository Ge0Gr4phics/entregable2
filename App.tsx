import React from 'react';
import { StatusBar } from 'expo-status-bar';

import './src/config/firebase';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App(): React.ReactElement {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AppProvider>
  );
}
