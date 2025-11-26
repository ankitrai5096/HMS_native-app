import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, ActivityIndicator, Text } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';

const Arti = ({ videoId, toggleModal }) => {
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);

  const router = useRouter();

  return (
    <TouchableWithoutFeedback onPress={toggleModal}>
      <View style={styles.container}>
        <View style={styles.videoContainer}>
          {!ready && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}

          <YoutubeIframe
            height={hp(30)}
            width={wp(90)}
            play={playing}
            videoId={videoId}
            onError={(error) => console.log('YouTube Error:', error)}
            onReady={() => setReady(true)}
            initialPlayerParams={{
              controls: false,
              modestbranding: true,
              rel: false,
              iv_load_policy: 3,
              fs: false,
            }}
          />

          <View style={styles.touchBlocker} pointerEvents="auto" />
        </View>

        {/* Buttons Container */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setPlaying(!playing)}
          >
            <Icon name={playing ? 'pause' : 'play'} size={wp(8)} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => router.push('/')}
          >
            <Icon name="home-outline" size={wp(8)} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  videoContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    width: wp(90),
    height: hp(24.5),
    backgroundColor: 'black',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    zIndex: 1,
  },
  touchBlocker: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: hp(2),
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(4), // spacing between buttons
  },
  controlButton: {
    padding: hp(1.5),
    backgroundColor: 'black',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Arti;
