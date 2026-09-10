import React, { useEffect, useState } from 'react';
import BootSplash from 'react-native-bootsplash';

import SplashScreen from './src/screens/SplashScreen';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // const timer = setTimeout(() => {
    //   setShowSplash(false);
    // }, 3000);

    // return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <SplashScreen />
    // Your actual application
    // NavigationContainer, etc.
    // null
  );
};

export default App;
