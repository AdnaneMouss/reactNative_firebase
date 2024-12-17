import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { UserProvider } from "./UserContext"; // Import the UserProvider

export default function Layout() {
  return (
    <UserProvider>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Welcome") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Products") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "Cart") {
              iconName = focused ? "cart" : "cart-outline";
            }
            else if (route.name === "Orders") {
              iconName = focused ? "order" : "order-outline";
            }
            else if (route.name === "UserProfile") {
              iconName = focused ? "Profile" : "order-outline";
            }
      

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#4CAF50",
          tabBarInactiveTintColor: "gray",
          headerShown: false, // Disable header for all screens in the tab navigator
        })}
      >
        {/* Main Tabs */}
        <Tabs.Screen name="Welcome" options={{ title: "Home" }} />
        <Tabs.Screen name="Products" options={{ title: "Products" }} />
        <Tabs.Screen name="Cart" options={{ title: "Cart" }} />
        <Tabs.Screen name="Orders" options={{ title: "Orders" }} />
       
        

        {/* Hide Bottom Tabs for Login and SignUp */}
        <Tabs.Screen
          name="Login"
          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }}
        />
                <Tabs.Screen
          name="UserProfile"
          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }}
        />
        <Tabs.Screen name="Dashboard"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />
        <Tabs.Screen name="DashboardUsers"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />
                  <Tabs.Screen name="DashboardProducts"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />
                            <Tabs.Screen name="DashboardPromoCodes"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />
                                     <Tabs.Screen name="WelcomeDelivery"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />
                                               <Tabs.Screen name="DeliveryMan"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />

<Tabs.Screen name="Settings"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />

<Tabs.Screen name="SettingsAdmin"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />

<Tabs.Screen name="SettingsDelivery"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />

        <Tabs.Screen
          name="SignUp"
          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }}
        />
        <Tabs.Screen name="Checkout"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />
                  <Tabs.Screen name="WelcomeAdmin"          options={{
            href: null, // Prevent from appearing in the bottom tabs
            tabBarStyle: { display: "none" },
            headerShown: false,
          }} />


          
      </Tabs>
    </UserProvider>
  );
}
