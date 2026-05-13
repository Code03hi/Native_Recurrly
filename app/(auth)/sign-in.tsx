import { View, Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from 'nativewind'
const SafeAreaView = styled(RNSafeAreaView)


export default function SignIn() {
  return (
    <SafeAreaView>
      <Text>Sign In</Text>
      <Link href="/sign-up">Create an Account</Link>
      <Link href="/">Go to home screen</Link>
    </SafeAreaView>
  );
}