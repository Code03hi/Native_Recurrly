import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from 'nativewind'
const SafeAreaView = styled(RNSafeAreaView)

export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background p-5">
      <Text className="text-green-600 font-bold text-sucess">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">
      Go to onboardind</Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">
        Go to sign in</Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">
        Go to sign up</Link>
      <Link href="/subscriptions" className="mt-4 rounded bg-primary text-white p-4">
        Go to sign up</Link>
      <Link href={{
        pathname: "/subscriptions/[id]",
        params: { id: "123" },
      }} className="mt-4 rounded bg-primary text-white p-4">
        Go to Max Subscription</Link>
    </SafeAreaView>
  );
}