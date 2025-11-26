import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useRef } from 'react';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Login = () => {
    const currentUser = useSelector((state) => state.auth.user);
    const router = useRouter();
    const videoRef = useRef(null);
    const isFocused = useIsFocused();

    const handleGetStarted = async () => {
        if (videoRef.current) {
            await videoRef.current.stopAsync();
        }
        router.push('auth/sign-in');
    };

    React.useEffect(() => {
        const manageVideoPlayback = async () => {
            if (videoRef.current) {
                if (isFocused) {
                    await videoRef.current.playAsync();
                } else {
                    await videoRef.current.pauseAsync();
                }
            }
        };
        manageVideoPlayback();


        return () => {
            if (videoRef.current) {
                videoRef.current.stopAsync();
            }
        };
    }, [isFocused]);




    return (
        <View style={{ backgroundColor: Colors.white }}>

            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />


            <Video
                ref={videoRef}
                source={require('./../assets/images/mahadev-intro.mp4')}
                resizeMode="cover"
                isLooping
                shouldPlay={isFocused}
                style={{
                    width: '100%',
                    height: 550,
                }}
            />

            <View style={styles.container}>
                <View style={{ width: '100%', alignItems: 'center', marginTop: 0 }}>
                    <Text style={{ fontSize: 25, fontFamily: 'outfit-medium', textAlign: 'center', width: '100%' }}>
                        Join Our Community
                    </Text>

                    <Text style={{ fontSize: 14, fontFamily: 'outfit-regular', textAlign: 'center', width: '90%', color: Colors.Gray, marginTop: 10 }}>
                        “पर्वत पर उन्होंने कई भागों में मानव अंगों को जन्म दिया, परंतु वह पर्वत उनके भार को सहन नहीं कर सका और उसने उन्हें गंगाजी में गिरा दिया। गंगाजी ने उन्हें जोड़ दिया पर वे उस बालक के तेज को सहन नहीं कर सकीं और उसे अपनी तरंगों में बहाकर सरकंडे के वन के निकट छोड़ दिया।”
                    </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        marginTop: -40,
        padding: 30,
        height: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    button: {
        width: wp('60%'),       // responsive width
        marginTop: hp('2%'),    // responsive margin
        paddingVertical: hp('1.8%'),  // responsive padding
        backgroundColor: '#FF671F',
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.white,
        fontFamily: 'outfit-regular',
        fontSize: hp('2%'),     // responsive font size
        textAlign: 'center',
    },
});