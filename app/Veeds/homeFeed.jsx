import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, AppState, TouchableWithoutFeedback, Text, TouchableOpacity, Image } from 'react-native';
import { Directions, FlatList } from 'react-native-gesture-handler';
import { Video } from 'expo-av';
import UserAvatar from 'react-native-user-avatar';
import { useSelector } from 'react-redux';
const { height, width } = Dimensions.get('window');
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';

const videoData = [
  { id: 1, url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 2, url: 'https://www.w3schools.com/html/movie.mp4' },
  { id: 3, url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
];

const Homefeed = () => {
// hello words
  const currentUser = useSelector((state) => state.auth.user);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);
  const appState = useRef(AppState.currentState);

  // useEffect(() => {
  //   const handleAppStateChange = (nextAppState) => {
  //     if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
  //       videoRefs.current.forEach(async (ref) => {
  //         if (ref) {
  //           try {
  //             await ref.pauseAsync();
  //           } catch (error) {
  //             console.error('Error pausing video on app state change:', error);
  //           }
  //         }
  //       });
  //     }
  //     appState.current = nextAppState;
  //   };

  //   const subscription = AppState.addEventListener('change', handleAppStateChange);
  //   return () => subscription.remove();
  // }, []);

  useEffect(() => {
    return () => {
      videoRefs.current.forEach(async (ref) => {
        if (ref) {
          try {
            await ref.stopAsync();
            await ref.unloadAsync();
          } catch (error) {
            console.error('Error stopping or unloading video:', error);
          }
        }
      });
    };
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);

      // Pause all videos and play the visible one
      videoRefs.current.forEach((ref, i) => {
        if (ref) {
          if (i === index) {
            ref.playAsync();
          } else {
            ref.pauseAsync();
          }
        }
      });
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const togglePlayPause = async (index) => {
    const video = videoRefs.current[index];
    if (video) {
      const status = await video.getStatusAsync();
      if (status.isPlaying) {
        await video.pauseAsync();
      } else {
        await video.playAsync();
      }
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableWithoutFeedback onPress={() => togglePlayPause(index)}>
      <View style={styles.videoContainer}>
        <View style={styles.secondConatiner}>
           <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image style={{ width: 30, height: 30, marginHorizontal: 8 }} source={require('../../assets/images/profile-pic.png')} />
            </TouchableOpacity>
          {/* <Text style={styles.fullName}>{currentUser.displayName || "NA"}</Text> */}
        </View>

        <Video
          ref={(ref) => (videoRefs.current[index] = ref)}
          source={{ uri: item.url }}
          style={styles.video}
          resizeMode="cover"
          isLooping
          shouldPlay={index === currentIndex}
          isMuted={false}
        />

        <View style={styles.actionContainer}>
          <TouchableWithoutFeedback onPress={() => console.log('Liked video', item.id)}>
            <View style={styles.actionButton}>
              <Entypo name="heart-outlined" size={34} color='rgba(255, 103, 31, 0.9)' />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => console.log('Shared video', item.id)}>
            <View style={styles.actionButton}>
              <Ionicons name="share-social" size={34} color='rgba(255, 103, 31, 0.9)' />
            </View>
          </TouchableWithoutFeedback>
        </View>


      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <FlatList
      data={videoData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    height: 550,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  video: {
    height: 550,
    width: '100%',
  },
  secondConatiner: {
    position: 'absolute',
    top: 20,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    marginRight: 10,
  },
  fullName: {
    color: 'white',
    fontWeight: "bold"
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    marginTop: -55,


  },
  actionButton: {
    marginBottom: 50,
    marginRight: 8,
    marginTop: 5,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Homefeed;
