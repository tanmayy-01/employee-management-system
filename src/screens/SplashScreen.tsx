import { View, Text, Image } from 'react-native'
import React from 'react'

const SplashScreen = () => {
  return (
    <View style={{
        flex:1,
        backgroundColor:"white",
        alignItems:'center',
        justifyContent:'center'
    }}>
        <Image
  source={require('../assets/splash-image-1')}
  style={{
    height:100,
    width:100
  }}
  resizeMode="contain"
/>
      <Text>SplashScreen</Text>
    </View>
  )
}

export default SplashScreen