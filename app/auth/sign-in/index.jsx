import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ToastAndroid, Image } from 'react-native';
import { useNavigation } from 'expo-router';
import { Colors } from './../../../constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db } from '../../../Configs/FirebaseConfig';
import { StatusBar } from 'expo-status-bar';
import GoogleIcon from '../../../assets/images/icons8-google-logo-240.png'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import Loading from '../../../components/Loading';
import * as AuthSession from "expo-auth-session";
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../../utils/redux/authActions';

// google sign in

import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';





//621706144606-bd9vk977v90n22u5mjm4mgitbf0sfpnk.apps.googleusercontent.com

const SignIn = () => {


  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const router = useRouter();
  const navigation = useNavigation();








// google sign in

const [userDetails, setUserDetails] = useState(null);


  // Google Sign-In configuration
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "318451475423-oobp7eogkr3p2sob2vl7iqj6f4u95qc7.apps.googleusercontent.com",
      offlineAccess: true,
      // 318451475423-oobp7eogkr3p2sob2vl7iqj6f4u95qc7.apps.googleusercontent.com
      // 621706144606-nj62i2pgcvpu27nji0bds4js7or4352r.apps.googleusercontent.com
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
  
      await GoogleSignin.signOut();
      const response = await GoogleSignin.signIn();
  
      if (response) {

        // Get Google ID token
      const { idToken } = await GoogleSignin.getTokens();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      console.log("Firebase Sign-In Success:", userCredential.user);
  
      const { displayName, email, uid, photoURL } = userCredential.user;

      // Dispatch only the serializable data
      const userData = { displayName, email, uid, photoURL ,idToken};
      console.log("Prepared User Data:", userData);
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));

        router.replace('/home');
      } else {
        console.log("Sign-in was canceled or no user info returned.");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
  
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("Sign-in was canceled by the user.");
            break;
          case statusCodes.IN_PROGRESS:
            console.log("Sign-in is already in progress.");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("Google Play Services not available or outdated.");
            break;
          default:
            console.log("An unknown error occurred.");
        }
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };
  
  

  const storeUserData = async (user) => {
    try {
      const serializedUser = JSON.stringify(user);
      await AsyncStorage.setItem('currentUser', serializedUser);
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  const serializeUser = (firebaseUser) => {
    if (!firebaseUser) return null;
  
    return {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
    };
  };


  
  
  

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const onSignIn = async () => {
    if (!email || !password) {
        ToastAndroid.show('Enter Email & Password', ToastAndroid.SHORT);
        return;
    }

    try {


      if (email && password) {

        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Optionally process or serialize user data
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'N/A',
            photoURL: user.photoURL || null,
        };

        // Store or handle the user data (e.g., save to local storage or state)
        console.log('User signed in:', userData);

        // Navigate to the home screen
        router.replace('/home');

        ToastAndroid.show('Sign-in successful', ToastAndroid.SHORT);
      }
    } catch (error) {
        const errorCode = error.code;
        let errorMessage = 'An error occurred';

        // Handle specific errors
        if (errorCode === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
        } else if (errorCode === 'auth/user-not-found') {
            errorMessage = 'User not found';
        } else if (errorCode === 'auth/wrong-password') {
            errorMessage = 'Incorrect password';
        }

        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
        console.error('Sign-in error:', error);
    }
};



  // const SignInScreen = () => {
  //   const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  //     clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Your client ID
  //   });


  if (isSigningIn) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Loading size="large" color="#0000ff" />
      </View>
    );
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <StatusBar translucent backgroundColor="#FF854A" barStyle="light-content" />
      <View style={{ marginTop: 30, height: '100%', padding: 30, backgroundColor: Colors.white }}>
        {/* <Ionicons onPress={() => router.back()} name="arrow-back-circle-outline" size={30} color="black" /> */}
        <Text style={{ fontSize: 25, fontFamily: 'outfit-bold', paddingLeft: 20, textAlign: 'center', marginTop: 100, color: Colors.Primary }}>Login Here</Text>

        <Text style={{ fontSize: 14, fontFamily: 'outfit-medium', color: Colors.Gray, paddingLeft: 20, textAlign: 'center', marginTop: 10 }}>Welcome back you’ve been missed!</Text>

        <View style={{ marginTop: 20 }}>
          <TextInput
            onChangeText={(value) => setEmail(value)}
            style={styles.Input}
            placeholder='Email'
          />
        </View>

        <View>
          <TextInput
            onChangeText={(value) => setPassword(value)}
            secureTextEntry={true}
            style={styles.Input}
            placeholder='Password'
          />
        </View>

        <TouchableOpacity onPress={onSignIn} style={{ padding: 20, backgroundColor: '#FF671F', borderRadius: 10, marginTop: 25 }}>
          <Text style={{ color: Colors.white, fontFamily: 'outfit-medium', fontSize: 15, textAlign: 'center' }}>Sign In</Text>
        </TouchableOpacity>


        <Text style={styles.orText}> --------- or ----------</Text>

        <TouchableOpacity  onPress={() => signIn()} >
          <View style={styles.GoogleConatiner}>
            <Image style={styles.GoogleConatinerImage} source={GoogleIcon} />
            <Text style={styles.GoogleConatinerText}> Sign In With Google</Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => router.push('auth/sign-up')} style={{ padding: 20, marginTop: hp(18) }}>
          <Text style={{ fontFamily: 'outfit-medium', fontSize: 15, textAlign: 'center' }}>Didn't have an account? <Text style={{ color: 'blue' }}>Sign Up</Text></Text>
        </TouchableOpacity>

      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  Input: {
    padding: 15,
    borderWidth: 0.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    fontFamily: 'outfit-regular',
    marginTop: 20,
    display: "flex",
    justifyContent: 'center',
    alignItems: 'center'
  },

  GoogleConatiner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'black',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'black',
  },
  GoogleConatinerImage: {
    width: 30,
    height: 30,
  },
  GoogleConatinerText: {
    fontSize: 16,
    fontFamily: 'outfit-regular',
    color: 'white'
  },
  orText: {
    color: '#4B5563',
    textAlign: 'center',
    marginVertical: hp(2)
  },
});

export default SignIn;
