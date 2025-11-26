import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  PanResponder, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Speech from 'expo-speech';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ReadingSpace = () => {
  const item = useLocalSearchParams();
  const bookContent = typeof item.bookContent === 'string' ? item.bookContent : '';

  const [currentPage, setCurrentPage] = useState(0);
  const currentPageRef = useRef(currentPage);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const sentences = bookContent.match(/[^\.!\?]+[\.!\?]+/g) || [bookContent];
  const sentencesPerPage = 5; 
  const totalPages = Math.ceil(sentences.length / sentencesPerPage);

  useEffect(() => {
    currentPageRef.current = currentPage;
    Speech.stop();
    setIsSpeaking(false);
  }, [currentPage]);

  // Pick best available English voice
  useEffect(() => {
    const fetchVoices = async () => {
      const voices = await Speech.getAvailableVoicesAsync();
      console.log("Available voices:", voices);

      // Try to find US Enhanced voice first
      const usEnhanced = voices.find(v => v.identifier === "hi-in-x-hic-local");
      if (usEnhanced) {
        setSelectedVoice(usEnhanced.identifier);
        return;
      }

      // Otherwise fallback to en-IN or en-US
      const fallback = voices.find(v => v.language === "en-IN") || voices.find(v => v.language === "en-US");
      if (fallback) {
        setSelectedVoice(fallback.identifier);
      }
    };
    fetchVoices();
  }, []);

  const getPageContent = () => {
    const start = currentPage * sentencesPerPage;
    const end = start + sentencesPerPage;
    return sentences.slice(start, end).join(' ') || 'No content available';
  };

  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));

  const detectLanguage = (text) => {
    return /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
  };

const toggleSpeech = () => {
  if (isSpeaking) {
    Speech.stop();
    setIsSpeaking(false);
  } else {
    let pageIndex = currentPage;
    let sentenceIndex = 0;

    setIsSpeaking(true);

    const speakNext = () => {
      const pageSentences = sentences.slice(
        pageIndex * sentencesPerPage,
        (pageIndex + 1) * sentencesPerPage
      );

      if (sentenceIndex < pageSentences.length) {
        const text = pageSentences[sentenceIndex];
        const lang = detectLanguage(text);

        Speech.speak(text, {
          language: lang,
          voice: lang.startsWith("en") && selectedVoice ? selectedVoice : undefined,
          pitch: 1,
          rate: 1.2,
          onDone: () => {
            sentenceIndex++;
            setTimeout(speakNext, 5);
          },
          onStopped: () => setIsSpeaking(false),
        });
      } else {
        // End of current page, check if more pages exist
        if (pageIndex < totalPages - 1) {
          pageIndex++;
          setCurrentPage(pageIndex); // update UI
          sentenceIndex = 0;
          setTimeout(speakNext, 5);
        } else {
          setIsSpeaking(false); // finished all pages
        }
      }
    };

    speakNext();
  }
};


  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -30 && currentPageRef.current < totalPages - 1) goToNextPage();
        else if (gestureState.dx > 30 && currentPageRef.current > 0) goToPreviousPage();
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container} {...panResponder.panHandlers}>
        
        {/* Main Reading Area */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.textContainer}>
          <Text style={styles.content}>{getPageContent()}</Text>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
            onPress={goToPreviousPage}
            disabled={currentPage === 0}
          >
            <MaterialIcons name="keyboard-arrow-left" size={wp(9)} color={currentPage === 0 ? '#ccc' : '#fff'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.voiceButton} onPress={toggleSpeech}>
            <AntDesign name={isSpeaking ? "pausecircle" : "sound"} size={wp(9)} color={'#fff'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentPage >= totalPages - 1 && styles.disabledButton]}
            onPress={goToNextPage}
            disabled={currentPage >= totalPages - 1}
          >
            <MaterialIcons name="keyboard-arrow-right" size={wp(9)} color={currentPage >= totalPages - 1 ? '#ccc' : '#fff'} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar + Numbers */}
        <View style={styles.progressWrapper}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${((currentPage + 1) / totalPages) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Page {currentPage + 1} of {totalPages}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReadingSpace;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(7),
    paddingBottom: hp(2),
  },
  textContainer: {
    flex: 1,
    marginBottom: hp(2),
  },
  content: {
    fontSize: wp(4.8),
    lineHeight: wp(7),
    textAlign: 'justify',
    color: '#222',
    fontWeight: '400',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  navButton: {
    borderRadius: wp(20),
    backgroundColor: '#FF671F',
    padding: wp(2),
  },
  disabledButton: {
    backgroundColor: '#ffb896',
  },
  voiceButton: {
    borderRadius: wp(20),
    backgroundColor: '#FF671F',
    padding: wp(2.5),
  },
  progressWrapper: {
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#FF671F',
  },
  progressText: {
    marginTop: hp(0.8),
    fontSize: wp(3.8),
    color: '#555',
    fontWeight: '500',
  },
});
