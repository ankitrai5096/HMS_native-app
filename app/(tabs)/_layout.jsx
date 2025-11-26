import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from './../../constants/Colors'
import Entypo from '@expo/vector-icons/Entypo';

const tabLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.Primary, swipeEnabled: true,   tabBarStyle: {
      height: 70, 
      paddingBottom: 15, 
      paddingTop: 15, 
    }, }}>
      <Tabs.Screen name="home"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
        }} />


      <Tabs.Screen name="Books"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />
        }} />


      <Tabs.Screen name="Veeds"  
        options={{
          tabBarIcon: ({ color }) => <Entypo name="folder-video" size={24} color={color} />
        }} />


      <Tabs.Screen name="Profile" 
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={24} color={color} />
        }} />





    </Tabs>
  )
}

export default tabLayout

const styles = StyleSheet.create({})