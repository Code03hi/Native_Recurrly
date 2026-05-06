import { Text } from 'react-native'
import React from 'react'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from 'nativewind'
const SafeAreaView = styled(RNSafeAreaView)

const settings = () => {
  return (
    <SafeAreaView>
      <Text>settings</Text>
    </SafeAreaView>
  )
}

export default settings