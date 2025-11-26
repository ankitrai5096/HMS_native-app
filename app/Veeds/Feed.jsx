import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Video } from 'expo-av';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { fireStorage } from '../../Configs/FirebaseConfig';

const { height, width } = Dimensions.get('window');

const Feed = () => {
  const navigation = useNavigation();
  const currentUser = useSelector((state) => state.auth.user);
  const [videoList, setVideoList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [batch, setBatch] = useState(0);
  const videoRefs = useRef([]);
  const currentIndexRef = useRef(0);

  const showToast = (message) => {
    if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
    else alert(message);
  };

  // ✅ Fetch up to 100 random videos (10 at a time)
  const fetchVideos = useCallback(async (batchNumber = 0) => {
    try {
      if (batchNumber === 0) setLoading(true);
      else setFetchingMore(true);

      const folderRef = fireStorage.ref('content/main/vids');
      const listResult = await folderRef.listAll();
      const allItems = listResult.items;

      if (allItems.length === 0) {
        showToast('No videos found in bucket.');
        setLoading(false);
        return;
      }

      // Randomize and take 100 max
      const shuffled = allItems.sort(() => 0.5 - Math.random()).slice(0, 100);

      // Get 10 videos per batch for lazy loading
      const batchStart = batchNumber * 10;
      const batchEnd = batchStart + 10;
      const currentBatch = shuffled.slice(batchStart, batchEnd);

      const urls = await Promise.all(
        currentBatch.map(async (item) => {
          try {
            const url = await item.getDownloadURL();
            if (!url.includes('alt=media')) return null; // skip invalid
            return { id: item.name, url };
          } catch (err) {
            console.warn('Failed to get URL for', item.name);
            return null;
          }
        })
      );

      const validUrls = urls.filter(Boolean);
      setVideoList((prev) => [...prev, ...validUrls]);
      setBatch((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching videos:', error);
      showToast('Failed to fetch videos.');
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(0);
  }, [fetchVideos]);

  // ✅ Load next 10 videos when scrolling near end
  const handleScrollEnd = () => {
    if (!fetchingMore && batch < 10) {
      fetchVideos(batch);
    }
  };

  // ✅ Focus/Unfocus: control play state
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
      const playCurrentVideo = async () => {
        const video = videoRefs.current[currentIndexRef.current];
        if (video) await video.playAsync();
      };
      playCurrentVideo();

      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
        videoRefs.current.forEach(async (v) => v && (await v.pauseAsync()));
      };
    }, [])
  );

  // ✅ Toggle play/pause on tap
  const togglePlayPause = async (index) => {
    const video = videoRefs.current[index];
    if (video) {
      const status = await video.getStatusAsync();
      if (status.isPlaying) {
        await video.pauseAsync();
        setIsPlaying(false);
      } else {
        await video.playAsync();
        setIsPlaying(true);
      }
      setShowPlayPauseIcon(true);
      setTimeout(() => setShowPlayPauseIcon(false), 700);
    }
  };

  // ✅ Each video card
  const renderItem = ({ item, index }) => (
    <TouchableWithoutFeedback onPress={() => togglePlayPause(index)}>
      <View style={styles.videoContainer}>
        <Video
          ref={(ref) => (videoRefs.current[index] = ref)}
          source={{ uri: item.url }}
          style={styles.video}
          resizeMode="cover"
          isLooping
          shouldPlay={index === currentIndexRef.current}
          onError={(e) => console.warn('Video load error:', e)}
        />

        {/* Play/Pause icon */}
        {showPlayPauseIcon && currentIndexRef.current === index && (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={70}
            color="white"
            style={styles.playPauseIcon}
          />
        )}

        {/* 🔹 User Info */}
        <View style={styles.secondContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              style={{ width: 30, height: 30, marginHorizontal: 8 }}
              source={require('../../assets/images/profile-picture-4.png')}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.fullName}>{currentUser?.displayName || 'Unknown User'}</Text>
            <Text style={styles.Disc}>Last Seen: Today</Text>
          </View>
        </View>

        {/* 🔹 Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <MaterialIcons name="bookmark-border" size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <FontAwesome name="share" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading videos...</Text>
      </View>
    );
  }

  // ✅ FlatList
  return (
    <FlatList
      data={videoList}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      onMomentumScrollEnd={(event) => {
        const index = Math.round(event.nativeEvent.contentOffset.y / height);
        currentIndexRef.current = index;
        if (index === videoList.length - 2) handleScrollEnd(); // Load next 10
      }}
      contentContainerStyle={styles.contentContainer}
      ListFooterComponent={
        fetchingMore && (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="small" color="#00ffcc" />
          </View>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    height: hp(100),
    width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  video: {
    height: hp(100),
    width,
    position: 'relative',
  },
  playPauseIcon: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -35,
    zIndex: 100,
  },
  Disc: {
    color: 'white',
    fontSize: 10,
  },
  secondContainer: {
    position: 'absolute',
    top: hp(8),
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  fullName: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: hp(10),
    right: wp(5),
    alignItems: 'center',
  },
  button: {
    marginVertical: 10,
  },
  contentContainer: {
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Feed;
