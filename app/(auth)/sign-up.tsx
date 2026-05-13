import { Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from 'nativewind'
const SafeAreaView = styled(RNSafeAreaView)

const SignUp = () => {
  return (
    <SafeAreaView>
      <Text>SignUp</Text>
      <Link href="/(auth)/sign-in">Sign In</Link>
      <Link href="/">Go to home screen</Link>
    </SafeAreaView>
  )
}

export default SignUp