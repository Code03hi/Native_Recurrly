import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from 'nativewind'
const SafeAreaView = styled(RNSafeAreaView)

const insignts = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text>insignts</Text>
    </SafeAreaView>
  )
}

export default insignts