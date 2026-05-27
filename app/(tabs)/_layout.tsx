import { Tabs } from "expo-router";
import { View, Image } from "react-native";
import { clsx } from "clsx";
import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from '@clerk/expo'
import { Redirect, Stack } from 'expo-router'

const tabBar = components.tabBar;

const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
        <View className="tabs-icon">
            <View className={clsx("tabs-pill", focused && "tabs-active")}>
                <Image
                    resizeMode="contain"
                    source={icon}
                    className="tabs-glyph"
                />
            </View>
        </View>
    );
};

const TabLayout = () => {

    const { isSignedIn, isLoaded } = useAuth()
    const insets = useSafeAreaInsets();
    
    // if (!isLoaded) {
    //     return (
    //         <View
    //             style={{
    //                 flex: 1,
    //                 justifyContent: "center",
    //                 alignItems: "center",
    //             }}
    //         >
    //         </View>
    //     );
    // }

    // if (!isSignedIn) {
    //     console.log("isLoaded:", isLoaded);
    //     console.log("isSignedIn:", isSignedIn);
    //     return <Redirect href="/(auth)/sign-in" />
    // }

    if (!isLoaded) return null;

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return (   // ✅ Missing return
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: "absolute",
                    bottom: Math.max(insets.bottom, tabBar.horizontalInset),
                    height: tabBar.height,
                    marginHorizontal: tabBar.horizontalInset,
                    borderRadius: tabBar.radius,
                    backgroundColor: colors.primary,
                    borderTopWidth: 0,
                    elevation: 0,
                },
                tabBarItemStyle: {
                    paddingVertical:
                        tabBar.height / 2 - tabBar.iconFrame / 1.6,
                },
                tabBarIconStyle: {
                    width: tabBar.iconFrame,
                    height: tabBar.iconFrame,
                    alignItems: "center",
                },
            }}
        >
            {tabs.map((tab:any) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon   // ✅ Missing return
                                focused={focused}
                                icon={tab.icon}
                            />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
};

export default TabLayout;
