import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { auth, fireDB } from '../../Configs/FirebaseConfig';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../../components/Loading';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Colors } from '../../constants/Colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Profile = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [user, setUser] = useState(null);

  const router = useRouter();

  const translateY = useSharedValue(50); 
  const opacity = useSharedValue(0.5); 

  useEffect(() => {
    triggerAnimation(); 
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      if (currentUser) {
        const userDocRef = fireDB.collection('users').doc(currentUser.uid);
        const documentSnapshot = await userDocRef.get();

        if (documentSnapshot.exists) {
          setUser(documentSnapshot.data());
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const triggerAnimation = () => {
    translateY.value = 50; 
    opacity.value = 0.5;
    translateY.value = withSpring(0, { damping: 12, stiffness: 100 }); 
    opacity.value = withTiming(1, { duration: 500 });
  };

  const logout = async () => {
    try {
      await auth().signOut(); 
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      triggerAnimation();
    }, [])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!currentUser) {
    return <Loading size="large" />;
  }

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <Image
          style={styles.avatar}
          source={require('../../assets/images/profile-picture-4.png')}
        />
        <Text style={styles.fullName}>{currentUser.displayName}</Text>
        <Text style={styles.email}>{currentUser.email}</Text>
      </View>

      {/* Bottom Section */}
      <Animated.View style={[styles.bottomSection, animatedStyle]}>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.primaryButton} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('verify/GetVerify')}
          >
            <Text style={styles.buttonText}>Get Verified</Text>
          </TouchableOpacity>

          {user && user.isAdmin && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('verify/AdminPanel')}
            >
              <Text style={styles.buttonText}>Admin Panel</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Primary,
  },
  topSection: {
    height: hp('45%'),
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp('5%'),
  },
  avatar: {
    width: wp('28%'),
    height: wp('28%'),
    borderRadius: wp('14%'),
    marginBottom: hp('2%'),
    borderWidth: 2,
    borderColor: '#fff',
  },
  fullName: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#fff',
    marginBottom: hp('0.5%'),
  },
  email: {
    fontSize: wp('4%'),
    color: '#f1f1f1',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: wp('8%'),
    borderTopRightRadius: wp('8%'),
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('3%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGroup: {
    width: '100%',
    marginTop: hp('2%'),
    gap: hp('2%'),
  },
  primaryButton: {
    backgroundColor: '#FF671F',
    paddingVertical: hp('2%'),
    borderRadius: wp('4%'),
  },
  secondaryButton: {
    backgroundColor: Colors.Primary,
    paddingVertical: hp('2%'),
    borderRadius: wp('4%'),
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Profile;
